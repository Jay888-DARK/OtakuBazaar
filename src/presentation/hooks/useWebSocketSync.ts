/**
 * @file src/presentation/hooks/useWebSocketSync.ts
 *
 * Central WebSocket hook for real-time event synchronization.
 * Manages the full WS lifecycle: connection, authentication handshake,
 * reconnection with exponential backoff, heartbeat keep-alive, and
 * event dispatching into the SyncProvider's unified stream.
 *
 * This hook is consumed exclusively by SyncProvider — components should
 * use the SyncContext API instead of calling this hook directly.
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { DomainEvent } from '@/domain/events/DomainEvent';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Configuration for the WebSocket connection. */
export interface WebSocketSyncConfig {
  /** WebSocket server URL (e.g., 'wss://api.otakubazaar.com/ws'). */
  readonly url: string;
  /** Authentication token sent in the initial handshake. */
  readonly authToken: string;
  /** Heartbeat interval in milliseconds. Default: 30_000 (30s). */
  readonly heartbeatIntervalMs?: number;
  /** Maximum reconnection attempts before giving up. Default: 10. */
  readonly maxReconnectAttempts?: number;
  /** Base delay for exponential backoff in ms. Default: 1_000 (1s). */
  readonly baseReconnectDelayMs?: number;
}

/** Connection state exposed to consumers. */
export type WebSocketConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

/** Callback invoked when a domain event arrives over the WebSocket. */
export type OnSyncEventCallback = (event: DomainEvent) => void;

/** Return type of the useWebSocketSync hook. */
export interface UseWebSocketSyncReturn {
  /** Current reactive connection state. */
  readonly connectionState: WebSocketConnectionState;
  /** Sends a domain event to the server over the WebSocket. */
  readonly sendEvent: (event: DomainEvent) => void;
  /** Manually triggers a reconnection attempt. */
  readonly reconnect: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_HEARTBEAT_INTERVAL_MS = 30_000;
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;
const DEFAULT_BASE_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages a persistent WebSocket connection for real-time domain event sync.
 *
 * Features:
 * - **Exponential backoff** reconnection (1s → 2s → 4s → ... → 30s cap).
 * - **Heartbeat ping** to detect stale connections behind proxies/load balancers.
 * - **Auth handshake** on connection open.
 * - **Type-safe event parsing** — invalid payloads are logged and dropped.
 * - **React 19 verified**: Uses reactive state for connection lifecycle rather than ref reads during render.
 *
 * @param config - WebSocket connection configuration.
 * @param onEvent - Callback invoked for each received domain event.
 * @returns Connection state, send function, and manual reconnect trigger.
 */
export function useWebSocketSync(
  config: WebSocketSyncConfig,
  onEvent: OnSyncEventCallback
): UseWebSocketSyncReturn {
  // Reactive state for UI consumers
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>('disconnected');

  // ---- Refs (stable across renders) ----
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Store latest callback in ref to avoid stale closures
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  // Stable reference to connect for scheduleReconnect recursion
  const connectRef = useRef<() => void>(() => {});

  const heartbeatInterval = config.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_INTERVAL_MS;
  const maxReconnectAttempts = config.maxReconnectAttempts ?? DEFAULT_MAX_RECONNECT_ATTEMPTS;
  const baseDelay = config.baseReconnectDelayMs ?? DEFAULT_BASE_RECONNECT_DELAY_MS;

  // ---- Heartbeat Management ----

  /** Stops the heartbeat timer. */
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current !== null) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  /**
   * Starts a periodic heartbeat ping to keep the connection alive.
   * Proxies and load balancers often close idle WebSocket connections.
   */
  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    heartbeatTimerRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: '__ping__' }));
      }
    }, heartbeatInterval);
  }, [heartbeatInterval, stopHeartbeat]);

  // ---- Connection Management ----

  /**
   * Calculates the reconnection delay using exponential backoff with jitter.
   *
   * @param attempt - The current reconnection attempt number (0-indexed).
   * @returns Delay in milliseconds before the next reconnection attempt.
   */
  const getReconnectDelay = useCallback(
    (attempt: number): number => {
      const exponential = Math.min(baseDelay * Math.pow(2, attempt), MAX_RECONNECT_DELAY_MS);
      const jitter = exponential * (0.75 + Math.random() * 0.5);
      return Math.round(jitter);
    },
    [baseDelay]
  );

  /**
   * Schedules a reconnection attempt with exponential backoff.
   * Gives up after `maxReconnectAttempts`.
   */
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.warn(
        `[useWebSocketSync] Max reconnection attempts (${maxReconnectAttempts}) reached. Operating in local BroadcastChannel mode.`
      );
      setConnectionState('disconnected');
      return;
    }

    setConnectionState('reconnecting');
    const delay = getReconnectDelay(reconnectAttemptsRef.current);
    reconnectAttemptsRef.current += 1;

    console.info(
      `[useWebSocketSync] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
    );

    reconnectTimerRef.current = setTimeout(() => {
      connectRef.current();
    }, delay);
  }, [maxReconnectAttempts, getReconnectDelay]);

  /**
   * Establishes a new WebSocket connection.
   * Sets up all event handlers: open, message, close, error.
   */
  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Clean up any existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    queueMicrotask(() => {
      setConnectionState('connecting');
    });
    const ws = new WebSocket(config.url);

    // ---- onopen: Auth handshake + start heartbeat ----
    ws.onopen = () => {
      setConnectionState('connected');
      reconnectAttemptsRef.current = 0; // Reset on successful connect

      // Send auth token as the first message (handshake)
      ws.send(
        JSON.stringify({
          type: '__auth__',
          payload: { token: config.authToken },
        })
      );

      startHeartbeat();
    };

    // ---- onmessage: Parse and dispatch domain events ----
    ws.onmessage = (messageEvent: MessageEvent) => {
      try {
        const data: unknown = JSON.parse(String(messageEvent.data));

        // Type guard: ensure it looks like a domain event
        if (
          typeof data === 'object' &&
          data !== null &&
          'type' in data &&
          typeof (data as Record<string, unknown>)['type'] === 'string' &&
          'payload' in data &&
          'occurredAt' in data
        ) {
          // Skip internal protocol messages
          const eventType = (data as Record<string, unknown>)['type'] as string;
          if (eventType.startsWith('__')) return;

          onEventRef.current(data as DomainEvent);
        }
      } catch {
        console.warn('[useWebSocketSync] Received non-JSON message, ignoring');
      }
    };

    // ---- onclose: Attempt reconnection ----
    ws.onclose = (closeEvent: CloseEvent) => {
      stopHeartbeat();
      setConnectionState('disconnected');

      // 1000 = normal closure, 1001 = going away — don't reconnect
      if (closeEvent.code === 1000 || closeEvent.code === 1001) return;

      scheduleReconnect();
    };

    // ---- onerror: Log warning and let onclose handle fallback ----
    ws.onerror = () => {
      console.warn('[useWebSocketSync] WebSocket server unavailable, active tabs synced via BroadcastChannel');
    };

    wsRef.current = ws;
  }, [config.url, config.authToken, startHeartbeat, stopHeartbeat, scheduleReconnect]);

  // Keep connectRef synchronized with the latest connect function
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // ---- Public API ----

  /**
   * Sends a domain event to the server over the open WebSocket.
   * Silently drops the message if the connection is not open.
   *
   * @param event - The domain event to send.
   */
  const sendEvent = useCallback((event: DomainEvent): void => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(event));
    } else {
      console.warn('[useWebSocketSync] Cannot send — WebSocket is not open');
    }
  }, []);

  /**
   * Manually triggers a reconnection attempt, resetting the attempt counter.
   */
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // ---- Lifecycle ----

  useEffect(() => {
    connect();

    return () => {
      stopHeartbeat();
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
        wsRef.current = null;
      }
    };
  }, [connect, stopHeartbeat]);

  return {
    connectionState,
    sendEvent,
    reconnect,
  };
}
