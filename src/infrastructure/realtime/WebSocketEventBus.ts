/**
 * @file src/infrastructure/realtime/WebSocketEventBus.ts
 *
 * Infrastructure adapter implementing the IEventBus port using WebSockets.
 * Publishes domain events to connected clients for real-time multi-window sync.
 *
 * In production, this would integrate with a WebSocket server (e.g., Socket.io,
 * ws, or a managed service like Ably/Pusher). This stub uses in-process
 * pub/sub for local development and demonstrates the contract.
 */

import type { DomainEvent, DomainEventType } from '@/domain/events/DomainEvent';
import type { IEventBus, EventHandler } from '@/application/ports/IEventBus';

// ---------------------------------------------------------------------------
// In-Process Event Bus (Development / Single-Server)
// ---------------------------------------------------------------------------

/**
 * WebSocket-backed event bus implementing {@link IEventBus}.
 *
 * For development, this uses an in-process subscriber map. In production,
 * replace the `publish` method body with a WebSocket broadcast or
 * Redis Pub/Sub fan-out.
 */
export class WebSocketEventBus implements IEventBus {
  /** Map of event type → set of subscriber callbacks. */
  private readonly subscribers = new Map<DomainEventType, Set<EventHandler>>();

  /**
   * {@inheritDoc IEventBus.publish}
   *
   * Dispatches the event to all handlers subscribed to its type.
   * Errors in individual handlers are caught and logged — they do not
   * prevent other handlers from executing.
   */
  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.subscribers.get(event.type);
    if (!handlers || handlers.size === 0) return;

    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(event);
      } catch (error: unknown) {
        // Log but don't propagate — event handlers should be resilient.
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[WebSocketEventBus] Handler error for event "${event.type}": ${message}`
        );
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * {@inheritDoc IEventBus.publishAll}
   *
   * Publishes events sequentially to preserve ordering guarantees.
   */
  async publishAll(events: ReadonlyArray<DomainEvent>): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  /**
   * {@inheritDoc IEventBus.subscribe}
   *
   * @returns An unsubscribe function that removes the handler.
   */
  subscribe(eventType: DomainEventType, handler: EventHandler): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    const handlerSet = this.subscribers.get(eventType);
    // Non-null assertion is safe: we just set the key above.
    handlerSet!.add(handler);

    // Return unsubscribe function
    return () => {
      handlerSet!.delete(handler);
      if (handlerSet!.size === 0) {
        this.subscribers.delete(eventType);
      }
    };
  }
}
