'use client';

/**
 * @file src/presentation/components/providers/SyncProvider.tsx
 *
 * Context provider that unifies two real-time synchronization channels:
 *
 *   1. **BroadcastChannel** — Instant, zero-latency sync between tabs/windows
 *      on the SAME device and origin. No network round-trip required.
 *
 *   2. **WebSocket** (via useWebSocketSync) — Sync between different devices
 *      or browsers via the server. Handles auth, reconnection, and heartbeat.
 *
 * When an action occurs in Window A:
 *   - The use case publishes a domain event via the API.
 *   - The server pushes the event over WebSocket to all connected clients.
 *   - Window A also broadcasts the event via BroadcastChannel.
 *   - Windows B and C on the same device receive it instantly via BC.
 *   - Windows on other devices receive it via WebSocket.
 *
 * Components consume this via `useSyncContext()` to react to events and
 * `useSyncDispatch()` to broadcast local actions.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useReducer,
  type ReactNode,
} from 'react';
import type { DomainEvent, DomainEventType } from '@/domain/events/DomainEvent';
import {
  useWebSocketSync,
  type WebSocketSyncConfig,
  type WebSocketConnectionState,
} from '@/presentation/hooks/useWebSocketSync';

// ---------------------------------------------------------------------------
// Sync State
// ---------------------------------------------------------------------------

/** A sync event wraps a domain event with metadata about its origin. */
export interface SyncEvent {
  /** The domain event payload. */
  readonly event: DomainEvent;
  /** Origin of this event: 'local' (this tab), 'broadcast' (other tab), 'websocket' (server). */
  readonly origin: 'local' | 'broadcast' | 'websocket';
  /** Monotonically increasing sequence number for ordering. */
  readonly sequence: number;
}

/** State managed by the SyncProvider. */
export interface SyncState {
  /** Ordered log of recent sync events (ring buffer, max 100). */
  readonly recentEvents: ReadonlyArray<SyncEvent>;
  /** WebSocket connection state. */
  readonly connectionState: WebSocketConnectionState;
  /** Total events processed since mount. */
  readonly totalEventsProcessed: number;
}

/** Actions for the sync state reducer. */
type SyncAction =
  | { readonly type: 'SYNC_EVENT'; readonly payload: SyncEvent }
  | { readonly type: 'CONNECTION_STATE_CHANGED'; readonly payload: WebSocketConnectionState };

const MAX_RECENT_EVENTS = 100;

/**
 * Reducer for sync state management.
 * Maintains a bounded ring buffer of recent events.
 *
 * @param state - Current sync state.
 * @param action - The dispatched action.
 * @returns Updated sync state.
 */
function syncReducer(state: SyncState, action: SyncAction): SyncState {
  switch (action.type) {
    case 'SYNC_EVENT': {
      const recentEvents = [
        ...state.recentEvents.slice(-(MAX_RECENT_EVENTS - 1)),
        action.payload,
      ];
      return {
        ...state,
        recentEvents,
        totalEventsProcessed: state.totalEventsProcessed + 1,
      };
    }
    case 'CONNECTION_STATE_CHANGED':
      return { ...state, connectionState: action.payload };
    default:
      return state;
  }
}

const INITIAL_SYNC_STATE: SyncState = {
  recentEvents: [],
  connectionState: 'disconnected',
  totalEventsProcessed: 0,
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/** Read-only sync state context. */
interface SyncContextValue {
  /** Current sync state (recent events, connection status). */
  readonly state: SyncState;
  /**
   * Subscribes to a specific domain event type.
   *
   * @param eventType - The event type discriminant to listen for.
   * @param handler - Callback invoked when the event arrives.
   * @returns An unsubscribe function.
   */
  readonly subscribe: (
    eventType: DomainEventType,
    handler: (event: SyncEvent) => void
  ) => () => void;
}

/** Dispatch context for broadcasting events from this tab. */
interface SyncDispatchContextValue {
  /**
   * Broadcasts a domain event to all other tabs (via BroadcastChannel)
   * and to the server (via WebSocket).
   *
   * @param event - The domain event to broadcast.
   */
  readonly broadcastEvent: (event: DomainEvent) => void;
  /** Manually trigger WebSocket reconnection. */
  readonly reconnect: () => void;
}

const SyncContext = createContext<SyncContextValue | null>(null);
const SyncDispatchContext = createContext<SyncDispatchContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider Component
// ---------------------------------------------------------------------------

/** Props for the SyncProvider component. */
export interface SyncProviderProps {
  /** Child components that can consume sync context. */
  readonly children: ReactNode;
  /** WebSocket connection configuration. */
  readonly wsConfig: WebSocketSyncConfig;
}

/**
 * Root-level provider that initializes BroadcastChannel and WebSocket
 * synchronization. Wrap your app's root layout with this component.
 *
 * @param props - Provider props including children and WS config.
 * @returns The provider-wrapped children.
 *
 * @example
 * ```tsx
 * // In src/app/layout.tsx
 * <SyncProvider wsConfig={{ url: 'wss://...', authToken: 'jwt-...' }}>
 *   {children}
 * </SyncProvider>
 * ```
 */
export function SyncProvider({ children, wsConfig }: SyncProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(syncReducer, INITIAL_SYNC_STATE);
  const sequenceRef = useRef(0);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Per-event-type subscriber registry
  const subscribersRef = useRef(new Map<DomainEventType, Set<(event: SyncEvent) => void>>());

  // ---- Helper: Create a SyncEvent and dispatch it ----

  /**
   * Creates a SyncEvent, dispatches it to state, and notifies subscribers.
   *
   * @param event - The domain event.
   * @param origin - Where the event came from.
   */
  const handleIncomingEvent = useCallback(
    (event: DomainEvent, origin: SyncEvent['origin']) => {
      sequenceRef.current += 1;
      const syncEvent: SyncEvent = {
        event,
        origin,
        sequence: sequenceRef.current,
      };

      // Update state (ring buffer)
      dispatch({ type: 'SYNC_EVENT', payload: syncEvent });

      // Notify per-type subscribers
      const handlers = subscribersRef.current.get(event.type);
      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(syncEvent);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            console.error(`[SyncProvider] Subscriber error for "${event.type}": ${msg}`);
          }
        });
      }
    },
    []
  );

  // ---- BroadcastChannel Setup ----

  useEffect(() => {
    // BroadcastChannel: same-origin, cross-tab communication
    // Channel name is scoped to the app to avoid collisions
    const channel = new BroadcastChannel('otaku-bazaar-sync');
    broadcastChannelRef.current = channel;

    channel.onmessage = (messageEvent: MessageEvent) => {
      try {
        const data: unknown = messageEvent.data;

        // Type guard for domain events
        if (
          typeof data === 'object' &&
          data !== null &&
          'type' in data &&
          'payload' in data &&
          'occurredAt' in data
        ) {
          handleIncomingEvent(data as DomainEvent, 'broadcast');
        }
      } catch {
        console.warn('[SyncProvider] Invalid BroadcastChannel message, ignoring');
      }
    };

    return () => {
      channel.close();
      broadcastChannelRef.current = null;
    };
  }, [handleIncomingEvent]);

  // ---- WebSocket Setup ----

  const onWebSocketEvent = useCallback(
    (event: DomainEvent) => {
      handleIncomingEvent(event, 'websocket');
    },
    [handleIncomingEvent]
  );

  const { connectionState, sendEvent, reconnect } = useWebSocketSync(
    wsConfig,
    onWebSocketEvent
  );

  // Sync connection state to reducer
  useEffect(() => {
    dispatch({ type: 'CONNECTION_STATE_CHANGED', payload: connectionState });
  }, [connectionState]);

  // ---- Public API: Subscribe ----

  const subscribe = useCallback(
    (eventType: DomainEventType, handler: (event: SyncEvent) => void): (() => void) => {
      if (!subscribersRef.current.has(eventType)) {
        subscribersRef.current.set(eventType, new Set());
      }
      const handlerSet = subscribersRef.current.get(eventType)!;
      handlerSet.add(handler);

      // Return unsubscribe function
      return () => {
        handlerSet.delete(handler);
        if (handlerSet.size === 0) {
          subscribersRef.current.delete(eventType);
        }
      };
    },
    []
  );

  // ---- Public API: Broadcast ----

  const broadcastEvent = useCallback(
    (event: DomainEvent) => {
      // 1. Dispatch locally
      handleIncomingEvent(event, 'local');

      // 2. Broadcast to other tabs on same device (instant, no network)
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage(event);
      }

      // 3. Send to server via WebSocket (for cross-device sync)
      sendEvent(event);
    },
    [handleIncomingEvent, sendEvent]
  );

  // ---- Render ----

  const syncContextValue: SyncContextValue = {
    state,
    subscribe,
  };

  const dispatchContextValue: SyncDispatchContextValue = {
    broadcastEvent,
    reconnect,
  };

  return (
    <SyncContext.Provider value={syncContextValue}>
      <SyncDispatchContext.Provider value={dispatchContextValue}>
        {children}
      </SyncDispatchContext.Provider>
    </SyncContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Consumer Hooks
// ---------------------------------------------------------------------------

/**
 * Returns the read-only sync state and subscription API.
 *
 * @returns The sync context value (state + subscribe).
 * @throws {Error} If used outside of a SyncProvider.
 *
 * @example
 * ```tsx
 * const { state, subscribe } = useSyncContext();
 *
 * useEffect(() => {
 *   const unsub = subscribe('OFFER_ACCEPTED', (syncEvent) => {
 *     console.log('Offer accepted!', syncEvent.event.payload);
 *     // Update local UI state
 *   });
 *   return unsub;
 * }, [subscribe]);
 * ```
 */
export function useSyncContext(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (ctx === null) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }
  return ctx;
}

/**
 * Returns the dispatch API for broadcasting events from this tab.
 *
 * @returns The dispatch context (broadcastEvent + reconnect).
 * @throws {Error} If used outside of a SyncProvider.
 *
 * @example
 * ```tsx
 * const { broadcastEvent } = useSyncDispatch();
 *
 * const handleAcceptOffer = () => {
 *   // After API call succeeds:
 *   broadcastEvent({
 *     type: 'OFFER_ACCEPTED',
 *     payload: { offerId, listingId, buyerId, sellerId, agreedPrice, currency },
 *     occurredAt: new Date().toISOString() as ISOTimestamp,
 *   });
 * };
 * ```
 */
export function useSyncDispatch(): SyncDispatchContextValue {
  const ctx = useContext(SyncDispatchContext);
  if (ctx === null) {
    throw new Error('useSyncDispatch must be used within a SyncProvider');
  }
  return ctx;
}
