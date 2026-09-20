/**
 * @file src/infrastructure/realtime/RedisSyncManager.ts
 *
 * Single Responsibility: Manages Redis connections for Pub/Sub messaging and
 * atomic distributed locking.
 *
 * Capabilities:
 *  1. Multi-window / multi-device fan-out via `user:<userId>` and `conversation:<conversationId>`.
 *  2. Listing-level notification channel `listing:<listingId>`.
 *  3. Atomic concurrency control: acquires 15-minute checkout locks (`SET ... NX EX 900`)
 *     and safe atomic release via Lua script.
 *  4. In-memory fallback mode for local development when an external Redis server is offline.
 */

import Redis, { type RedisOptions } from 'ioredis';
import type { OutboundEvent } from './schemas/bargainingSchemas';

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export interface RedisSyncManagerConfig {
  /** Redis connection URL (e.g., 'redis://127.0.0.1:6379') */
  readonly redisUrl?: string;
  /** Key prefix for Redis namespaces */
  readonly keyPrefix?: string;
  /** Whether to enable in-memory fallback if Redis connection fails */
  readonly allowFallback?: boolean;
}

export interface LockTokenData {
  readonly token: string;
  readonly buyerId: string;
  readonly offerId: string;
  readonly lockedAt: string;
  readonly ttlSeconds: number;
}

export interface LockAcquireResult {
  readonly acquired: boolean;
  readonly token?: string;
  readonly existingLock?: LockTokenData;
  readonly remainingTtlSeconds?: number;
  readonly error?: string;
}

export interface LockStatusResult {
  readonly isLocked: boolean;
  readonly lockData?: LockTokenData;
  readonly remainingTtlSeconds?: number;
}

export type ChannelMessageHandler = (channel: string, event: OutboundEvent) => void;

// ---------------------------------------------------------------------------
// Lua Script for Safe Lock Release
// ---------------------------------------------------------------------------

/**
 * Ensures a lock is only released if the stored token matches the caller's token.
 * Prevents accidental release if a lock expired and was acquired by another client.
 */
const RELEASE_LOCK_LUA = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

// ---------------------------------------------------------------------------
// RedisSyncManager Implementation
// ---------------------------------------------------------------------------

export class RedisSyncManager {
  private static defaultInstance: RedisSyncManager | null = null;

  /**
   * Retrieves or initializes the shared singleton instance of RedisSyncManager.
   */
  public static async getInstance(): Promise<RedisSyncManager> {
    if (!this.defaultInstance) {
      this.defaultInstance = new RedisSyncManager({ allowFallback: true });
      await this.defaultInstance.initialize();
    }
    return this.defaultInstance;
  }

  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;
  private client: Redis | null = null;

  private isConnected = false;
  private readonly config: Required<RedisSyncManagerConfig>;
  private readonly subscriptions = new Map<string, Set<ChannelMessageHandler>>();

  // In-memory fallback store when Redis is unavailable during local development
  private readonly fallbackStore = new Map<string, { value: string; expiresAt: number }>();
  private readonly fallbackSubscribers = new Map<string, Set<ChannelMessageHandler>>();

  public constructor(config: RedisSyncManagerConfig = {}) {
    this.config = {
      redisUrl: config.redisUrl || process.env.REDIS_URL || 'redis://127.0.0.1:6379',
      keyPrefix: config.keyPrefix || 'otaku:',
      allowFallback: config.allowFallback ?? true,
    };
  }

  /**
   * Initializes Redis clients (command client, publisher, and subscriber).
   * Falls back gracefully to in-memory mode if Redis server is unreachable.
   */
  public async initialize(): Promise<void> {
    try {
      const opts: RedisOptions = {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        retryStrategy: (times: number) => {
          if (times > 3) return null; // Stop retrying if Redis is not installed/running locally
          return Math.min(times * 500, 2000);
        },
      };

      this.client = new Redis(this.config.redisUrl, opts);
      this.publisher = new Redis(this.config.redisUrl, opts);
      this.subscriber = new Redis(this.config.redisUrl, opts);

      // Suppress unhandled error events when Redis server is offline in fallback mode
      const errorHandler = () => {};
      this.client.on('error', errorHandler);
      this.publisher.on('error', errorHandler);
      this.subscriber.on('error', errorHandler);

      await Promise.all([
        this.client.connect(),
        this.publisher.connect(),
        this.subscriber.connect(),
      ]);

      this.isConnected = true;
      this.setupSubscriberDispatcher();
      console.info(`[RedisSyncManager] Connected to Redis at ${this.config.redisUrl}`);
    } catch (err) {
      if (this.config.allowFallback) {
        this.isConnected = false;
        console.warn(
          `[RedisSyncManager] Redis server not reachable at ${this.config.redisUrl}. Operating in high-performance in-memory fallback mode.`
        );
      } else {
        throw err;
      }
    }
  }

  // -------------------------------------------------------------------------
  // Channel Formatting Helpers
  // -------------------------------------------------------------------------

  public getUserChannel(userId: string): string {
    return `${this.config.keyPrefix}user:${userId}`;
  }

  public getConversationChannel(conversationId: string): string {
    return `${this.config.keyPrefix}conversation:${conversationId}`;
  }

  public getListingChannel(listingId: string): string {
    return `${this.config.keyPrefix}listing:${listingId}`;
  }

  private getListingLockKey(listingId: string): string {
    return `${this.config.keyPrefix}lock:listing:${listingId}`;
  }

  // -------------------------------------------------------------------------
  // Pub/Sub Implementation
  // -------------------------------------------------------------------------

  /**
   * Publishes an outbound domain event to a Redis channel.
   * Dispatches to all instances and in-memory listeners.
   *
   * @param channel - Target channel name
   * @param event - Formatted outbound event
   */
  public async publishEvent(channel: string, event: OutboundEvent): Promise<void> {
    const payloadString = JSON.stringify(event);

    if (this.isConnected && this.publisher) {
      try {
        await this.publisher.publish(channel, payloadString);
        return;
      } catch (err) {
        console.error(`[RedisSyncManager] Failed to publish event to ${channel}:`, err);
      }
    }

    // In-memory fallback dispatch
    const handlers = this.fallbackSubscribers.get(channel);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(channel, event);
        } catch (handlerErr) {
          console.error(`[RedisSyncManager] Fallback subscriber error on ${channel}:`, handlerErr);
        }
      }
    }
  }

  /**
   * Subscribes to a channel and registers a callback.
   *
   * @param channel - Channel name
   * @param handler - Callback invoked when a message arrives
   */
  public async subscribe(channel: string, handler: ChannelMessageHandler): Promise<void> {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
      if (this.isConnected && this.subscriber) {
        try {
          await this.subscriber.subscribe(channel);
        } catch (err) {
          console.error(`[RedisSyncManager] Failed to subscribe to ${channel}:`, err);
        }
      }
    }
    this.subscriptions.get(channel)!.add(handler);

    // Fallback registry
    if (!this.fallbackSubscribers.has(channel)) {
      this.fallbackSubscribers.set(channel, new Set());
    }
    this.fallbackSubscribers.get(channel)!.add(handler);
  }

  /**
   * Unsubscribes a specific handler or leaves the channel if no handlers remain.
   *
   * @param channel - Channel name
   * @param handler - The handler to remove
   */
  public async unsubscribe(channel: string, handler: ChannelMessageHandler): Promise<void> {
    const handlers = this.subscriptions.get(channel);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.subscriptions.delete(channel);
        if (this.isConnected && this.subscriber) {
          try {
            await this.subscriber.unsubscribe(channel);
          } catch (err) {
            console.error(`[RedisSyncManager] Failed to unsubscribe from ${channel}:`, err);
          }
        }
      }
    }

    const fallbackHandlers = this.fallbackSubscribers.get(channel);
    if (fallbackHandlers) {
      fallbackHandlers.delete(handler);
      if (fallbackHandlers.size === 0) {
        this.fallbackSubscribers.delete(channel);
      }
    }
  }

  /**
   * Internal message dispatcher when messages arrive on the Redis subscriber connection.
   */
  private setupSubscriberDispatcher(): void {
    if (!this.subscriber) return;

    this.subscriber.on('message', (channel: string, message: string) => {
      const handlers = this.subscriptions.get(channel);
      if (!handlers || handlers.size === 0) return;

      try {
        const event = JSON.parse(message) as OutboundEvent;
        for (const handler of handlers) {
          try {
            handler(channel, event);
          } catch (err) {
            console.error(`[RedisSyncManager] Handler error on ${channel}:`, err);
          }
        }
      } catch (parseErr) {
        console.error(`[RedisSyncManager] Malformed JSON on channel ${channel}:`, parseErr);
      }
    });
  }

  // -------------------------------------------------------------------------
  // Atomic Concurrency Control (Listing Distributed Lock)
  // -------------------------------------------------------------------------

  /**
   * Attempts to acquire an exclusive atomic lock on a listing for 15 minutes (900 seconds).
   * Uses Redis `SET lock:listing:<id> <token_json> NX EX 900`.
   *
   * If another transaction already holds the lock, returns `acquired: false` along with
   * remaining TTL and owner details so the client receives a structured conflict response.
   *
   * @param listingId - The listing aggregate ID
   * @param buyerId - The buyer acquiring the reservation lock
   * @param offerId - The accepted offer ID
   * @param ttlSeconds - Lock duration in seconds (defaults to 900 = 15 minutes)
   */
  public async acquireListingLock(
    listingId: string,
    buyerId: string,
    offerId: string,
    ttlSeconds = 900
  ): Promise<LockAcquireResult> {
    const lockKey = this.getListingLockKey(listingId);
    const token = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const lockData: LockTokenData = {
      token,
      buyerId,
      offerId,
      lockedAt: new Date().toISOString(),
      ttlSeconds,
    };
    const serializedData = JSON.stringify(lockData);

    if (this.isConnected && this.client) {
      try {
        // Atomic SET with NX (only if not exists) and EX (expire in seconds)
        const result = await this.client.set(lockKey, serializedData, 'EX', ttlSeconds, 'NX');

        if (result === 'OK') {
          return { acquired: true, token };
        }

        // Lock already held by someone else: fetch remaining TTL and current lock data
        const [existingVal, remainingTtl] = await Promise.all([
          this.client.get(lockKey),
          this.client.ttl(lockKey),
        ]);

        let parsedLockData: LockTokenData | undefined;
        if (existingVal) {
          try {
            parsedLockData = JSON.parse(existingVal);
          } catch {
            // ignore parse failure
          }
        }

        return {
          acquired: false,
          existingLock: parsedLockData,
          remainingTtlSeconds: remainingTtl > 0 ? remainingTtl : undefined,
          error: 'Listing is currently locked for checkout by another buyer.',
        };
      } catch (err) {
        console.error(`[RedisSyncManager] Redis lock error for ${listingId}:`, err);
      }
    }

    // In-memory fallback
    const now = Date.now();
    const existing = this.fallbackStore.get(lockKey);
    if (existing && existing.expiresAt > now) {
      let parsed: LockTokenData | undefined;
      try {
        parsed = JSON.parse(existing.value);
      } catch {
        // ignore
      }
      return {
        acquired: false,
        existingLock: parsed,
        remainingTtlSeconds: Math.ceil((existing.expiresAt - now) / 1000),
        error: 'Listing is currently locked for checkout by another buyer.',
      };
    }

    // Set fallback lock
    this.fallbackStore.set(lockKey, {
      value: serializedData,
      expiresAt: now + ttlSeconds * 1000,
    });
    return { acquired: true, token };
  }

  /**
   * Releases an existing listing lock using an atomic Lua check-and-delete.
   * Only the token holder can release the lock.
   *
   * @param listingId - The listing aggregate ID
   * @param token - The unique token returned when lock was acquired
   */
  public async releaseListingLock(listingId: string, token: string): Promise<boolean> {
    const lockKey = this.getListingLockKey(listingId);

    if (this.isConnected && this.client) {
      try {
        const raw = await this.client.get(lockKey);
        if (!raw) return true; // Already released or expired

        const parsed = JSON.parse(raw) as LockTokenData;
        if (parsed.token === token) {
          await this.client.eval(RELEASE_LOCK_LUA, 1, lockKey, raw);
          return true;
        }
        return false; // Token mismatch: cannot release someone else's lock
      } catch (err) {
        console.error(`[RedisSyncManager] Error releasing lock for ${listingId}:`, err);
      }
    }

    // In-memory fallback
    const existing = this.fallbackStore.get(lockKey);
    if (!existing) return true;
    try {
      const parsed = JSON.parse(existing.value) as LockTokenData;
      if (parsed.token === token) {
        this.fallbackStore.delete(lockKey);
        return true;
      }
    } catch {
      this.fallbackStore.delete(lockKey);
      return true;
    }
    return false;
  }

  /**
   * Inspects the current lock state of a listing.
   * Used to reject new offer submissions on a locked listing before acceptance.
   *
   * @param listingId - The listing aggregate ID
   */
  public async checkListingLock(listingId: string): Promise<LockStatusResult> {
    const lockKey = this.getListingLockKey(listingId);

    if (this.isConnected && this.client) {
      try {
        const [val, ttl] = await Promise.all([
          this.client.get(lockKey),
          this.client.ttl(lockKey),
        ]);

        if (val && ttl > 0) {
          try {
            const lockData = JSON.parse(val) as LockTokenData;
            return { isLocked: true, lockData, remainingTtlSeconds: ttl };
          } catch {
            return { isLocked: true, remainingTtlSeconds: ttl };
          }
        }
        return { isLocked: false };
      } catch (err) {
        console.error(`[RedisSyncManager] Error checking lock for ${listingId}:`, err);
      }
    }

    // In-memory fallback
    const now = Date.now();
    const existing = this.fallbackStore.get(lockKey);
    if (existing && existing.expiresAt > now) {
      try {
        const lockData = JSON.parse(existing.value) as LockTokenData;
        return {
          isLocked: true,
          lockData,
          remainingTtlSeconds: Math.ceil((existing.expiresAt - now) / 1000),
        };
      } catch {
        return {
          isLocked: true,
          remainingTtlSeconds: Math.ceil((existing.expiresAt - now) / 1000),
        };
      }
    }

    return { isLocked: false };
  }

  /**
   * Cleanly closes all Redis connections.
   */
  public async shutdown(): Promise<void> {
    this.subscriptions.clear();
    this.fallbackSubscribers.clear();
    this.fallbackStore.clear();

    const disconnectPromises: Promise<void>[] = [];
    if (this.client) {
      this.client.removeAllListeners('error');
      disconnectPromises.push(this.client.quit().then(() => {}).catch(() => { this.client?.disconnect(); }));
    }
    if (this.publisher) {
      this.publisher.removeAllListeners('error');
      disconnectPromises.push(this.publisher.quit().then(() => {}).catch(() => { this.publisher?.disconnect(); }));
    }
    if (this.subscriber) {
      this.subscriber.removeAllListeners('error');
      disconnectPromises.push(this.subscriber.quit().then(() => {}).catch(() => { this.subscriber?.disconnect(); }));
    }

    await Promise.allSettled(disconnectPromises);
    this.isConnected = false;
    console.info('[RedisSyncManager] Redis connections closed.');
  }
}
