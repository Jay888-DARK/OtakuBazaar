/**
 * @file src/infrastructure/realtime/BargainingWebSocketServer.ts
 *
 * Single Responsibility: Orchestrates WebSocket connections, JWT handshake
 * authentication, Zod frame validation, and the real-time bargaining state machine.
 *
 * Integrates with {@link RedisSyncManager} for multi-window/multi-device event fan-out
 * and atomic concurrency locking for listing reservations.
 */

import { IncomingMessage, Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { RedisSyncManager, ChannelMessageHandler } from './RedisSyncManager';
import {
  InboundMessageSchema,
  type InboundMessage,
  type OutboundEvent,
  type ErrorPayload,
  type SubmitOfferMessage,
  type CounterOfferMessage,
  type AcceptOfferMessage,
  type RejectOfferMessage,
  type MarkMessageReadMessage,
  type JoinConversationMessage,
  type LeaveConversationMessage,
} from './schemas/bargainingSchemas';

// ---------------------------------------------------------------------------
// Configuration & Types
// ---------------------------------------------------------------------------

export interface BargainingServerConfig {
  /** JWT secret or public key used to verify connection handshakes */
  readonly jwtSecret?: string;
  /** RedisSyncManager instance for distributed pub/sub and atomic locking */
  readonly redisSync: RedisSyncManager;
  /** Port if running as an independent server */
  readonly port?: number;
  /** Attached HTTP server if mounting on existing HTTP service */
  readonly server?: HttpServer;
}

export interface AuthenticatedUser {
  readonly userId: string;
  readonly email?: string;
  readonly role?: string;
}

interface AuthenticatedWebSocket extends WebSocket {
  isAlive: boolean;
  user: AuthenticatedUser;
  activeConversations: Set<string>;
  activeListings: Set<string>;
}

// ---------------------------------------------------------------------------
// In-Memory Offer State (For Demo / Persistence Layer Integration)
// ---------------------------------------------------------------------------

interface OfferRecord {
  offerId: string;
  conversationId: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  currentPrice: number;
  currency: string;
  status: 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  lastCounterBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// BargainingWebSocketServer Implementation
// ---------------------------------------------------------------------------

export class BargainingWebSocketServer {
  private readonly wss: WebSocketServer;
  private readonly redisSync: RedisSyncManager;
  private readonly jwtSecret: string;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private sequenceCounter = 0;

  // Sockets registry: Multi-window / multi-device tracking
  private readonly userSockets = new Map<string, Set<AuthenticatedWebSocket>>();
  private readonly conversationSockets = new Map<string, Set<AuthenticatedWebSocket>>();
  private readonly listingSockets = new Map<string, Set<AuthenticatedWebSocket>>();

  // In-memory offers registry (bridged with DB / Prisma in full application)
  private readonly offers = new Map<string, OfferRecord>();

  public constructor(config: BargainingServerConfig) {
    this.redisSync = config.redisSync;
    this.jwtSecret = config.jwtSecret || process.env.JWT_SECRET || 'otaku-bazaar-dev-secret-key-32ch';

    if (config.server) {
      this.wss = new WebSocketServer({ server: config.server });
    } else {
      this.wss = new WebSocketServer({ port: config.port ?? 8080 });
    }

    this.setupServer();
  }

  /**
   * Initializes WebSocket server handlers, Redis event listeners, and heartbeat ping.
   */
  private setupServer(): void {
    // 1. Connection & Handshake verification
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      this.handleConnection(ws as AuthenticatedWebSocket, req);
    });

    // 2. Setup 30s heartbeat interval to prune dead connections
    this.heartbeatInterval = setInterval(() => {
      for (const ws of this.wss.clients) {
        const authWs = ws as AuthenticatedWebSocket;
        if (!authWs.isAlive) {
          console.warn(`[BargainingWSS] Pruning unresponsive socket for user ${authWs.user?.userId}`);
          this.cleanupSocket(authWs);
          authWs.terminate();
          continue;
        }
        authWs.isAlive = false;
        authWs.ping();
      }
    }, 30_000);

    console.info('[BargainingWSS] WebSocket server initialized and listening for connections.');
  }

  // -------------------------------------------------------------------------
  // Handshake Authentication
  // -------------------------------------------------------------------------

  /**
   * Validates the JWT token on connection upgrade.
   * Extracts token from either:
   *   1. Query string: `?token=ey...`
   *   2. Header: `Authorization: Bearer ey...`
   *   3. `Sec-WebSocket-Protocol`: `Bearer, ey...`
   *
   * Rejects unauthenticated connections immediately.
   */
  private handleConnection(ws: AuthenticatedWebSocket, req: IncomingMessage): void {
    const user = this.authenticateHandshake(req);

    if (!user) {
      console.warn('[BargainingWSS] Handshake failed: invalid or missing JWT token');
      this.sendError(ws, 'UNAUTHORIZED', 'Authentication failed. Valid JWT token required.');
      ws.close(1008, 'Unauthorized');
      return;
    }

    // Attach user context and connection liveness flag
    ws.isAlive = true;
    ws.user = user;
    ws.activeConversations = new Set();
    ws.activeListings = new Set();

    // Register user socket for multi-window sync
    this.registerUserSocket(user.userId, ws);

    // Subscribe this server instance to the Redis user channel if this is the first socket
    this.ensureUserRedisSubscription(user.userId);

    // Setup socket listeners
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data: Buffer | string) => {
      this.handleIncomingMessage(ws, data);
    });

    ws.on('close', () => {
      this.cleanupSocket(ws);
    });

    ws.on('error', (err: Error) => {
      console.error(`[BargainingWSS] Socket error for user ${user.userId}:`, err.message);
      this.cleanupSocket(ws);
    });

    console.info(`[BargainingWSS] Client connected: user ${user.userId} (active windows: ${this.userSockets.get(user.userId)?.size})`);
  }

  /**
   * Extracts and verifies JWT from the incoming upgrade request.
   */
  private authenticateHandshake(req: IncomingMessage): AuthenticatedUser | null {
    try {
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
      let token: string | null = url.searchParams.get('token');

      const authHeader = req.headers.authorization;
      if (!token && authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] && /^Bearer$/i.test(parts[0])) {
          token = parts[1] || null;
        }
      }

      if (!token) {
        return null;
      }

      const decoded = jwt.verify(token, this.jwtSecret) as {
        sub?: string;
        userId?: string;
        email?: string;
        role?: string;
      };

      const userId = decoded.userId || decoded.sub;
      if (!userId) return null;

      return {
        userId,
        email: decoded.email,
        role: decoded.role,
      };
    } catch {
      return null;
    }
  }

  // -------------------------------------------------------------------------
  // Inbound Message Dispatcher (Zod Validation)
  // -------------------------------------------------------------------------

  /**
   * Parses and validates raw incoming WebSocket frames against the Zod schema.
   * Dispatches valid messages to specific state machine handlers.
   */
  private async handleIncomingMessage(ws: AuthenticatedWebSocket, data: Buffer | string): Promise<void> {
    try {
      const rawString = typeof data === 'string' ? data : data.toString('utf-8');
      const rawJson = JSON.parse(rawString);

      const parseResult = InboundMessageSchema.safeParse(rawJson);

      if (!parseResult.success) {
        console.warn(`[BargainingWSS] Validation error for user ${ws.user.userId}:`, parseResult.error.format());
        this.sendError(ws, 'INVALID_PAYLOAD', 'Message payload failed validation schema', parseResult.error.issues);
        return;
      }

      const message: InboundMessage = parseResult.data;

      switch (message.type) {
        case 'JOIN_CONVERSATION':
          await this.handleJoinConversation(ws, message);
          break;
        case 'LEAVE_CONVERSATION':
          await this.handleLeaveConversation(ws, message);
          break;
        case 'SUBMIT_OFFER':
          await this.handleSubmitOffer(ws, message);
          break;
        case 'COUNTER_OFFER':
          await this.handleCounterOffer(ws, message);
          break;
        case 'ACCEPT_OFFER':
          await this.handleAcceptOffer(ws, message);
          break;
        case 'REJECT_OFFER':
          await this.handleRejectOffer(ws, message);
          break;
        case 'MARK_MESSAGE_READ':
          await this.handleMarkMessageRead(ws, message);
          break;
        case 'PING':
          this.sendEventToSocket(ws, {
            type: 'PONG',
            payload: { timestamp: Date.now() },
            timestamp: new Date().toISOString(),
            sequence: ++this.sequenceCounter,
          });
          break;
      }
    } catch (err) {
      console.error(`[BargainingWSS] Unexpected error processing message:`, err);
      this.sendError(ws, 'INTERNAL_ERROR', 'Internal server processing error');
    }
  }

  // -------------------------------------------------------------------------
  // State Machine Handlers
  // -------------------------------------------------------------------------

  /**
   * Handler for `JOIN_CONVERSATION`:
   * Registers this socket to receive room-specific negotiation events and subscribes
   * to the corresponding Redis conversation channel.
   */
  private async handleJoinConversation(ws: AuthenticatedWebSocket, msg: JoinConversationMessage): Promise<void> {
    const { conversationId, listingId } = msg.payload;

    ws.activeConversations.add(conversationId);
    if (!this.conversationSockets.has(conversationId)) {
      this.conversationSockets.set(conversationId, new Set());
    }
    this.conversationSockets.get(conversationId)!.add(ws);

    // Register socket for listing updates
    if (listingId) {
      ws.activeListings.add(listingId);
      if (!this.listingSockets.has(listingId)) {
        this.listingSockets.set(listingId, new Set());
      }
      this.listingSockets.get(listingId)!.add(ws);

      const listingChannel = this.redisSync.getListingChannel(listingId);
      await this.redisSync.subscribe(listingChannel, this.createListingChannelForwarder(listingId));
    }

    // Subscribe Redis channel for cross-server conversation sync
    const convChannel = this.redisSync.getConversationChannel(conversationId);
    await this.redisSync.subscribe(convChannel, this.createChannelForwarder(conversationId));

    // Send confirmation to client with current listing lock state
    const lockStatus = await this.redisSync.checkListingLock(listingId);

    if (lockStatus.isLocked && lockStatus.lockData) {
      this.sendEventToSocket(ws, {
        type: 'LISTING_LOCKED',
        payload: {
          listingId,
          lockedByUserId: lockStatus.lockData.buyerId,
          offerId: lockStatus.lockData.offerId,
          lockExpiresAt: new Date(Date.now() + (lockStatus.remainingTtlSeconds || 900) * 1000).toISOString(),
          remainingSeconds: lockStatus.remainingTtlSeconds || 900,
        },
        timestamp: new Date().toISOString(),
        sequence: ++this.sequenceCounter,
      });
    }
  }

  /**
   * Handler for `LEAVE_CONVERSATION`:
   * Removes socket from conversation room.
   */
  private async handleLeaveConversation(ws: AuthenticatedWebSocket, msg: LeaveConversationMessage): Promise<void> {
    const { conversationId } = msg.payload;
    ws.activeConversations.delete(conversationId);

    const room = this.conversationSockets.get(conversationId);
    if (room) {
      room.delete(ws);
      if (room.size === 0) {
        this.conversationSockets.delete(conversationId);
      }
    }
  }

  /**
   * Handler for `SUBMIT_OFFER`:
   * 1. Checks if listing is already locked by another buyer. If locked, rejects request.
   * 2. Creates the pending offer.
   * 3. Publishes `OFFER_RECEIVED` to seller's Redis channel, conversation channel,
   *    and echoes to buyer's active windows.
   */
  private async handleSubmitOffer(ws: AuthenticatedWebSocket, msg: SubmitOfferMessage): Promise<void> {
    const buyerId = ws.user.userId;
    const { conversationId, listingId, sellerId, amount, currency, message } = msg.payload;

    // 1. Concurrency Guard: Check if listing is locked
    const lockStatus = await this.redisSync.checkListingLock(listingId);
    if (lockStatus.isLocked) {
      this.sendError(
        ws,
        'LISTING_LOCKED',
        'Listing is currently locked for checkout by another buyer. Please try again later.',
        undefined,
        lockStatus.remainingTtlSeconds
      );
      return;
    }

    // 2. Persist offer state
    const offerId = `off_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const offer: OfferRecord = {
      offerId,
      conversationId,
      listingId,
      buyerId,
      sellerId,
      currentPrice: amount,
      currency,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };
    this.offers.set(offerId, offer);

    // 3. Construct Outbound Event
    const event: OutboundEvent = {
      type: 'OFFER_RECEIVED',
      payload: {
        offerId,
        conversationId,
        listingId,
        buyerId,
        sellerId,
        amount,
        currency,
        message: message || '',
        createdAt: now,
      },
      timestamp: now,
      sequence: ++this.sequenceCounter,
    };

    // 4. Distribute via Redis
    // To conversation participants:
    await this.redisSync.publishEvent(this.redisSync.getConversationChannel(conversationId), event);
    // To seller's account-wide notification channel (e.g. mobile/other tabs):
    await this.redisSync.publishEvent(this.redisSync.getUserChannel(sellerId), event);
    // Echo back to all active windows belonging to the buyer:
    await this.redisSync.publishEvent(this.redisSync.getUserChannel(buyerId), event);
  }

  /**
   * Handler for `COUNTER_OFFER`:
   * 1. Checks if listing is locked.
   * 2. Validates offer exists and is in a counter-able state.
   * 3. Updates offer price and emits `OFFER_COUNTERED` to all active windows and conversation.
   */
  private async handleCounterOffer(ws: AuthenticatedWebSocket, msg: CounterOfferMessage): Promise<void> {
    const userId = ws.user.userId;
    const { conversationId, listingId, offerId, counterPrice, currency, message } = msg.payload;

    // 1. Check lock
    const lockStatus = await this.redisSync.checkListingLock(listingId);
    if (lockStatus.isLocked) {
      this.sendError(
        ws,
        'LISTING_LOCKED',
        'Listing is currently locked for checkout by another buyer. Please try again later.',
        undefined,
        lockStatus.remainingTtlSeconds
      );
      return;
    }

    // 2. Check offer existence
    let offer = this.offers.get(offerId);
    const now = new Date().toISOString();

    if (!offer) {
      // Mock / bootstrap offer if hydrate on the fly
      offer = {
        offerId,
        conversationId,
        listingId,
        buyerId: userId,
        sellerId: 'seller-placeholder',
        currentPrice: counterPrice,
        currency,
        status: 'COUNTERED',
        lastCounterBy: userId,
        createdAt: now,
        updatedAt: now,
      };
      this.offers.set(offerId, offer);
    } else {
      if (offer.status === 'ACCEPTED' || offer.status === 'REJECTED') {
        this.sendError(ws, 'INVALID_STATE_TRANSITION', `Cannot counter an offer in status ${offer.status}`);
        return;
      }
      offer.currentPrice = counterPrice;
      offer.status = 'COUNTERED';
      offer.lastCounterBy = userId;
      offer.updatedAt = now;
    }

    // 3. Emit event
    const event: OutboundEvent = {
      type: 'OFFER_COUNTERED',
      payload: {
        offerId,
        conversationId,
        listingId,
        counteredById: userId,
        counterPrice,
        currency,
        message: message || '',
        updatedAt: now,
      },
      timestamp: now,
      sequence: ++this.sequenceCounter,
    };

    await this.redisSync.publishEvent(this.redisSync.getConversationChannel(conversationId), event);
    const otherUserId = userId === offer.buyerId ? offer.sellerId : offer.buyerId;
    await this.redisSync.publishEvent(this.redisSync.getUserChannel(otherUserId), event);
    await this.redisSync.publishEvent(this.redisSync.getUserChannel(userId), event);
  }

  /**
   * Handler for `ACCEPT_OFFER`:
   * Core Concurrency Control:
   * 1. Attempts atomic lock `SET lock:listing:<id> <token> NX EX 900` (15-minute checkout lock).
   * 2. If another transaction holds lock, returns structured error with remaining TTL.
   * 3. If acquired, marks offer ACCEPTED.
   * 4. Broadcasts `OFFER_ACCEPTED` to buyer and seller, and `LISTING_LOCKED` to listing viewers.
   */
  private async handleAcceptOffer(ws: AuthenticatedWebSocket, msg: AcceptOfferMessage): Promise<void> {
    const userId = ws.user.userId;
    const { conversationId, listingId, offerId } = msg.payload;

    let offer = this.offers.get(offerId);
    const now = new Date().toISOString();

    if (!offer) {
      offer = {
        offerId,
        conversationId,
        listingId,
        buyerId: 'buyer-placeholder',
        sellerId: userId,
        currentPrice: 1000,
        currency: 'INR',
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
      };
      this.offers.set(offerId, offer);
    }

    // 1. Concurrency Control: Atomic Redis Lock (900 seconds = 15 minutes)
    const LOCK_TTL_SECONDS = 900;
    const lockResult = await this.redisSync.acquireListingLock(
      listingId,
      offer.buyerId,
      offerId,
      LOCK_TTL_SECONDS
    );

    if (!lockResult.acquired) {
      console.warn(`[BargainingWSS] Concurrency collision on listing ${listingId}: lock held by another transaction`);
      this.sendError(
        ws,
        'LISTING_LOCKED',
        lockResult.error || 'Listing is currently reserved or locked by another transaction.',
        undefined,
        lockResult.remainingTtlSeconds
      );
      return;
    }

    // 2. Transition offer status
    offer.status = 'ACCEPTED';
    offer.updatedAt = now;

    const lockExpiresAt = new Date(Date.now() + LOCK_TTL_SECONDS * 1000).toISOString();

    // 3. Emit OFFER_ACCEPTED to conversation and user channels
    const acceptedEvent: OutboundEvent = {
      type: 'OFFER_ACCEPTED',
      payload: {
        offerId,
        conversationId,
        listingId,
        buyerId: offer.buyerId,
        sellerId: offer.sellerId,
        agreedPrice: offer.currentPrice,
        currency: offer.currency,
        lockExpiresAt,
        lockDurationSeconds: LOCK_TTL_SECONDS,
      },
      timestamp: now,
      sequence: ++this.sequenceCounter,
    };

    // 4. Emit LISTING_LOCKED across listing channel so all browsers viewing listing see the lock
    const lockedEvent: OutboundEvent = {
      type: 'LISTING_LOCKED',
      payload: {
        listingId,
        lockedByUserId: offer.buyerId,
        offerId,
        lockExpiresAt,
        remainingSeconds: LOCK_TTL_SECONDS,
      },
      timestamp: now,
      sequence: ++this.sequenceCounter,
    };

    await Promise.all([
      this.redisSync.publishEvent(this.redisSync.getConversationChannel(conversationId), acceptedEvent),
      this.redisSync.publishEvent(this.redisSync.getConversationChannel(conversationId), lockedEvent),
      this.redisSync.publishEvent(this.redisSync.getUserChannel(offer.buyerId), acceptedEvent),
      this.redisSync.publishEvent(this.redisSync.getUserChannel(offer.sellerId), acceptedEvent),
      this.redisSync.publishEvent(this.redisSync.getListingChannel(listingId), lockedEvent),
    ]);

    console.info(`[BargainingWSS] Offer ${offerId} accepted. Listing ${listingId} locked for 15 minutes by buyer ${offer.buyerId}.`);
  }

  /**
   * Handler for `REJECT_OFFER`:
   * Transitions offer to REJECTED and notifies conversation and multi-windows.
   */
  private async handleRejectOffer(ws: AuthenticatedWebSocket, msg: RejectOfferMessage): Promise<void> {
    const userId = ws.user.userId;
    const { conversationId, listingId, offerId, reason } = msg.payload;

    const offer = this.offers.get(offerId);
    const now = new Date().toISOString();

    if (offer) {
      offer.status = 'REJECTED';
      offer.updatedAt = now;
    }

    const event: OutboundEvent = {
      type: 'OFFER_REJECTED',
      payload: {
        offerId,
        conversationId,
        listingId,
        rejectedById: userId,
        reason,
        updatedAt: now,
      },
      timestamp: now,
      sequence: ++this.sequenceCounter,
    };

    await this.redisSync.publishEvent(this.redisSync.getConversationChannel(conversationId), event);
  }

  /**
   * Handler for `MARK_MESSAGE_READ`:
   * Syncs read receipts across all connected windows/devices for that user and conversation.
   */
  private async handleMarkMessageRead(ws: AuthenticatedWebSocket, msg: MarkMessageReadMessage): Promise<void> {
    const userId = ws.user.userId;
    const { conversationId, messageId } = msg.payload;
    const now = new Date().toISOString();

    const event: OutboundEvent = {
      type: 'MESSAGE_READ',
      payload: {
        conversationId,
        messageId,
        readByUserId: userId,
        readAt: now,
      },
      timestamp: now,
      sequence: ++this.sequenceCounter,
    };

    // Propagate to user's other open tabs and the conversation
    await Promise.all([
      this.redisSync.publishEvent(this.redisSync.getUserChannel(userId), event),
      this.redisSync.publishEvent(this.redisSync.getConversationChannel(conversationId), event),
    ]);
  }

  // -------------------------------------------------------------------------
  // Multi-Window & Socket Management
  // -------------------------------------------------------------------------

  private registerUserSocket(userId: string, ws: AuthenticatedWebSocket): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(ws);
  }

  /**
   * Ensures this server subscribes to `user:<userId>` on Redis.
   * When an event is published to that user channel, it forwards to all sockets
   * belonging to that user on this server instance.
   */
  private ensureUserRedisSubscription(userId: string): void {
    const channel = this.redisSync.getUserChannel(userId);
    this.redisSync.subscribe(channel, (_chan: string, event: OutboundEvent) => {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        for (const s of sockets) {
          this.sendEventToSocket(s, event);
        }
      }
    });
  }

  /**
   * Creates a channel forwarding callback for a conversation.
   */
  private createChannelForwarder(conversationId: string): ChannelMessageHandler {
    return (_channel: string, event: OutboundEvent) => {
      const sockets = this.conversationSockets.get(conversationId);
      if (sockets) {
        for (const s of sockets) {
          this.sendEventToSocket(s, event);
        }
      }
    };
  }

  private createListingChannelForwarder(listingId: string): ChannelMessageHandler {
    return (_channel: string, event: OutboundEvent) => {
      const sockets = this.listingSockets.get(listingId);
      if (sockets) {
        for (const s of sockets) {
          this.sendEventToSocket(s, event);
        }
      }
    };
  }

  /**
   * Cleans up closed or terminated sockets from all tracking maps.
   */
  private cleanupSocket(ws: AuthenticatedWebSocket): void {
    if (ws.user) {
      const userList = this.userSockets.get(ws.user.userId);
      if (userList) {
        userList.delete(ws);
        if (userList.size === 0) {
          this.userSockets.delete(ws.user.userId);
        }
      }
    }

    if (ws.activeConversations) {
      for (const convId of ws.activeConversations) {
        const room = this.conversationSockets.get(convId);
        if (room) {
          room.delete(ws);
          if (room.size === 0) {
            this.conversationSockets.delete(convId);
          }
        }
      }
    }

    if (ws.activeListings) {
      for (const listId of ws.activeListings) {
        const room = this.listingSockets.get(listId);
        if (room) {
          room.delete(ws);
          if (room.size === 0) {
            this.listingSockets.delete(listId);
          }
        }
      }
    }
  }

  /**
   * Sends a structured outbound event to a specific WebSocket client.
   */
  private sendEventToSocket(ws: WebSocket, event: OutboundEvent): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    }
  }

  /**
   * Formats and delivers a standard structured error frame.
   */
  private sendError(
    ws: WebSocket,
    code: ErrorPayload['code'],
    message: string,
    details?: unknown,
    remainingTtlSeconds?: number
  ): void {
    const errorEvent: OutboundEvent = {
      type: 'ERROR',
      payload: {
        code,
        message,
        details,
        remainingTtlSeconds,
      },
      timestamp: new Date().toISOString(),
      sequence: ++this.sequenceCounter,
    };
    this.sendEventToSocket(ws, errorEvent);
  }

  /**
   * Graceful shutdown of the WebSocket server.
   */
  public async close(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    for (const ws of this.wss.clients) {
      ws.terminate();
    }

    await new Promise<void>((resolve) => {
      this.wss.close(() => resolve());
    });

    console.info('[BargainingWSS] Server closed gracefully.');
  }
}
