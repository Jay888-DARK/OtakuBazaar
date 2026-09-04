/**
 * @file src/application/ports/IEventBus.ts
 *
 * Port interface for publishing domain events to external consumers.
 * The application layer publishes events after persisting aggregates;
 * infrastructure adapters deliver them via WebSockets, message queues, etc.
 */

import type { DomainEvent, DomainEventType } from '@/domain/events/DomainEvent';

/** Callback signature for domain event subscribers. */
export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void>;

/**
 * Port for a domain event bus.
 *
 * Implementations may back this with in-process pub/sub, WebSockets,
 * Redis Pub/Sub, or cloud message queues (e.g., Google Pub/Sub).
 */
export interface IEventBus {
  /**
   * Publishes a domain event to all registered subscribers.
   *
   * @param event - The domain event to publish.
   * @returns Resolves when the event has been dispatched (not necessarily processed).
   */
  publish(event: DomainEvent): Promise<void>;

  /**
   * Publishes multiple domain events in order.
   *
   * @param events - Array of domain events to publish sequentially.
   * @returns Resolves when all events have been dispatched.
   */
  publishAll(events: ReadonlyArray<DomainEvent>): Promise<void>;

  /**
   * Subscribes a handler to a specific event type.
   *
   * @param eventType - The discriminant string of the event to subscribe to.
   * @param handler - The callback to invoke when the event is published.
   * @returns An unsubscribe function.
   */
  subscribe(eventType: DomainEventType, handler: EventHandler): () => void;
}
