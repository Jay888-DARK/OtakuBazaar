/**
 * @file src/presentation/hooks/useBargainingSync.ts
 *
 * Single Responsibility: Client-side React hook for real-time negotiation
 * with dual synchronization:
 *   1. WebSocket connection to the backend service (with JWT authentication).
 *   2. BroadcastChannel API (`otaku_bargain_sync`) for 0ms cross-window/tab
 *      synchronization on the same device without page reloads.
 *
 * Compliant with React 19 hook guidelines: no ref reads during render.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  OutboundEvent,
  OfferReceivedPayload,
  OfferCounteredPayload,
  OfferAcceptedPayload,
  OfferRejectedPayload,
  ListingLockedPayload,
  ErrorPayload,
} from '@/infrastructure/realtime/schemas/bargainingSchemas';

// ---------------------------------------------------------------------------
// Hook Interfaces
// ---------------------------------------------------------------------------

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface UseBargainingSyncOptions {
  /** WebSocket service URL (e.g., 'ws://localhost:8080') */
  readonly wsUrl: string;
  /** JWT token for handshake authentication */
  readonly authToken: string | null;
  /** Active conversation ID to join */
  readonly conversationId: string;
  /** Associated listing ID */
  readonly listingId: string;
  /** User's ID for identifying incoming events */
  readonly currentUserId: string;
  /** Optional callback for custom event dispatching */
  readonly onEvent?: (event: OutboundEvent) => void;
}

export interface BargainingOfferState {
  readonly offerId: string;
  readonly currentPrice: number;
  readonly currency: string;
  readonly status: 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED';
  readonly lastActionBy: string;
  readonly updatedAt: string;
}

export interface UseBargainingSyncReturn {
  /** Current connection health */
  readonly connectionStatus: ConnectionStatus;
  /** Current active offer in this conversation room */
  readonly activeOffer: BargainingOfferState | null;
  /** Whether the listing is currently locked by an accepted offer */
  readonly isListingLocked: boolean;
  /** Countdown in seconds if listing is locked */
  readonly lockRemainingSeconds: number;
  /** Last structured error received from the server */
  readonly lastError: ErrorPayload | null;
  /** List of recent events in this session */
  readonly recentEvents: ReadonlyArray<OutboundEvent>;
  /** Submits a new offer */
  readonly submitOffer: (amount: number, currency: string, sellerId: string, message?: string) => void;
  /** Counters an existing offer */
  readonly counterOffer: (offerId: string, counterPrice: number, currency: string, message?: string) => void;
  /** Accepts an offer, acquiring the 15-minute listing lock */
  readonly acceptOffer: (offerId: string) => void;
  /** Rejects an offer */
  readonly rejectOffer: (offerId: string, reason?: string) => void;
  /** Marks conversation message as read across all windows */
  readonly markRead: (messageId: string) => void;
}

const BROADCAST_CHANNEL_NAME = 'otaku_bargain_sync';

// ---------------------------------------------------------------------------
// Hook Implementation
// ---------------------------------------------------------------------------

export function useBargainingSync(options: UseBargainingSyncOptions): UseBargainingSyncReturn {
  const { wsUrl, authToken, conversationId, listingId, currentUserId, onEvent } = options;
  void currentUserId;

  // Reactive state (clean for React 19 rendering)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [activeOffer, setActiveOffer] = useState<BargainingOfferState | null>(null);
  const [isListingLocked, setIsListingLocked] = useState(false);
  const [lockRemainingSeconds, setLockRemainingSeconds] = useState(0);
  const [lastError, setLastError] = useState<ErrorPayload | null>(null);
  const [recentEvents, setRecentEvents] = useState<OutboundEvent[]>([]);

  // Refs for stable identity & timer handles
  const wsRef = useRef<WebSocket | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const lockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEventRef = useRef(onEvent);
  const connectRef = useRef<() => void>(() => {});

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  // -------------------------------------------------------------------------
  // Event Processing & State Update
  // -------------------------------------------------------------------------

  const applyEvent = useCallback((event: OutboundEvent, fromBroadcast = false) => {
    // 1. Append to recent events list
    setRecentEvents((prev) => [...prev.slice(-49), event]);

    // 2. Invoke optional callback
    if (onEventRef.current) {
      onEventRef.current(event);
    }

    // 3. Mirror to other browser tabs if not received from broadcast
    if (!fromBroadcast && broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(event);
      } catch (err) {
        console.warn('[useBargainingSync] Failed to broadcast event:', err);
      }
    }

    // 4. Update local reactive state based on event type
    switch (event.type) {
      case 'OFFER_RECEIVED': {
        const p = event.payload as OfferReceivedPayload;
        setActiveOffer({
          offerId: p.offerId,
          currentPrice: p.amount,
          currency: p.currency,
          status: 'PENDING',
          lastActionBy: p.buyerId,
          updatedAt: p.createdAt,
        });
        setLastError(null);
        break;
      }
      case 'OFFER_COUNTERED': {
        const p = event.payload as OfferCounteredPayload;
        setActiveOffer({
          offerId: p.offerId,
          currentPrice: p.counterPrice,
          currency: p.currency,
          status: 'COUNTERED',
          lastActionBy: p.counteredById,
          updatedAt: p.updatedAt,
        });
        setLastError(null);
        break;
      }
      case 'OFFER_ACCEPTED': {
        const p = event.payload as OfferAcceptedPayload;
        setActiveOffer({
          offerId: p.offerId,
          currentPrice: p.agreedPrice,
          currency: p.currency,
          status: 'ACCEPTED',
          lastActionBy: p.sellerId,
          updatedAt: p.lockExpiresAt,
        });
        setIsListingLocked(true);
        setLockRemainingSeconds(p.lockDurationSeconds);
        setLastError(null);
        break;
      }
      case 'OFFER_REJECTED': {
        const p = event.payload as OfferRejectedPayload;
        setActiveOffer((prev) =>
          prev
            ? {
                ...prev,
                status: 'REJECTED',
                lastActionBy: p.rejectedById,
                updatedAt: p.updatedAt,
              }
            : null
        );
        break;
      }
      case 'LISTING_LOCKED': {
        const p = event.payload as ListingLockedPayload;
        setIsListingLocked(true);
        setLockRemainingSeconds(p.remainingSeconds);
        break;
      }
      case 'LISTING_UNLOCKED': {
        setIsListingLocked(false);
        setLockRemainingSeconds(0);
        break;
      }
      case 'ERROR': {
        const p = event.payload as ErrorPayload;
        setLastError(p);
        if (p.code === 'LISTING_LOCKED' && p.remainingTtlSeconds) {
          setIsListingLocked(true);
          setLockRemainingSeconds(p.remainingTtlSeconds);
        }
        break;
      }
    }
  }, []);

  // -------------------------------------------------------------------------
  // Lock Countdown Timer
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (isListingLocked && lockRemainingSeconds > 0) {
      lockTimerRef.current = setInterval(() => {
        setLockRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsListingLocked(false);
            clearInterval(lockTimerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    }

    return () => {
      if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    };
  }, [isListingLocked, lockRemainingSeconds]);

  // -------------------------------------------------------------------------
  // BroadcastChannel Multi-Window Synchronization
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return;
    }

    const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannelRef.current = bc;

    bc.onmessage = (messageEvent: MessageEvent<OutboundEvent>) => {
      if (messageEvent.data && typeof messageEvent.data.type === 'string') {
        // Apply state change locally with fromBroadcast = true to avoid echo loops
        applyEvent(messageEvent.data, true);
      }
    };

    return () => {
      bc.close();
      broadcastChannelRef.current = null;
    };
  }, [applyEvent]);

  // -------------------------------------------------------------------------
  // WebSocket Connection Management
  // -------------------------------------------------------------------------

  const connect = useCallback(() => {
    if (!authToken || typeof window === 'undefined') return;

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setConnectionStatus('connecting');
    const url = new URL(wsUrl);
    url.searchParams.set('token', authToken);

    const ws = new WebSocket(url.toString());
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('connected');
      reconnectAttemptsRef.current = 0;

      // Join current conversation room immediately upon connection
      ws.send(
        JSON.stringify({
          type: 'JOIN_CONVERSATION',
          payload: { conversationId, listingId },
        })
      );
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const outbound = JSON.parse(event.data) as OutboundEvent;
        applyEvent(outbound, false);
      } catch (err) {
        console.error('[useBargainingSync] Failed to parse message:', err);
      }
    };

    ws.onclose = (event: CloseEvent) => {
      setConnectionStatus('disconnected');
      wsRef.current = null;

      // Don't reconnect on normal close or unauthorized code
      if (event.code === 1000 || event.code === 1008) return;

      // Exponential backoff reconnect
      if (reconnectAttemptsRef.current < 8) {
        setConnectionStatus('reconnecting');
        const delay = Math.min(1000 * Math.pow(1.8, reconnectAttemptsRef.current), 15000);
        reconnectAttemptsRef.current += 1;
        reconnectTimerRef.current = setTimeout(() => {
          connectRef.current();
        }, delay);
      }
    };

    ws.onerror = () => {
      console.warn('[useBargainingSync] WebSocket connection error');
    };
  }, [authToken, wsUrl, conversationId, listingId, applyEvent]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'LEAVE_CONVERSATION',
              payload: { conversationId },
            })
          );
        }
        wsRef.current.close(1000, 'Component unmounted');
        wsRef.current = null;
      }
    };
  }, [connect, conversationId]);

  // -------------------------------------------------------------------------
  // Action Handlers
  // -------------------------------------------------------------------------

  const sendPayload = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[useBargainingSync] Cannot send frame: WebSocket is not open.');
    }
  }, []);

  const submitOffer = useCallback(
    (amount: number, currency: string, sellerId: string, message = '') => {
      sendPayload({
        type: 'SUBMIT_OFFER',
        payload: {
          conversationId,
          listingId,
          sellerId,
          amount,
          currency,
          message,
        },
      });
    },
    [conversationId, listingId, sendPayload]
  );

  const counterOffer = useCallback(
    (offerId: string, counterPrice: number, currency: string, message = '') => {
      sendPayload({
        type: 'COUNTER_OFFER',
        payload: {
          conversationId,
          listingId,
          offerId,
          counterPrice,
          currency,
          message,
        },
      });
    },
    [conversationId, listingId, sendPayload]
  );

  const acceptOffer = useCallback(
    (offerId: string) => {
      sendPayload({
        type: 'ACCEPT_OFFER',
        payload: {
          conversationId,
          listingId,
          offerId,
        },
      });
    },
    [conversationId, listingId, sendPayload]
  );

  const rejectOffer = useCallback(
    (offerId: string, reason?: string) => {
      sendPayload({
        type: 'REJECT_OFFER',
        payload: {
          conversationId,
          listingId,
          offerId,
          reason,
        },
      });
    },
    [conversationId, listingId, sendPayload]
  );

  const markRead = useCallback(
    (messageId: string) => {
      sendPayload({
        type: 'MARK_MESSAGE_READ',
        payload: {
          conversationId,
          messageId,
        },
      });
    },
    [conversationId, sendPayload]
  );

  return {
    connectionStatus,
    activeOffer,
    isListingLocked,
    lockRemainingSeconds,
    lastError,
    recentEvents,
    submitOffer,
    counterOffer,
    acceptOffer,
    rejectOffer,
    markRead,
  };
}
