/**
 * @file src/domain/entities/Listing.ts
 *
 * Listing aggregate root — the central entity of the marketplace.
 * Owns its lifecycle state machine and emits domain events on transitions.
 * Pure domain logic with ZERO external dependencies.
 */

import type { ListingId, UserId, ISOTimestamp } from '@/domain/types';
import { Money } from '@/domain/value-objects/Money';
import {
  ListingStatus,
  type ListingStatusType,
  isValidListingTransition,
} from '@/domain/value-objects/ListingStatus';
import type { DomainEvent } from '@/domain/events/DomainEvent';

// ---------------------------------------------------------------------------
// Construction Props
// ---------------------------------------------------------------------------

/** Properties required to hydrate a Listing aggregate. */
export interface ListingProps {
  readonly id: ListingId;
  readonly sellerId: UserId;
  readonly title: string;
  readonly description: string;
  readonly imageUrls: ReadonlyArray<string>;
  readonly askingPrice: Money;
  readonly status: ListingStatusType;
  readonly category: string;
  readonly condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  readonly reservedByBuyerId: UserId | null;
  readonly createdAt: ISOTimestamp;
  readonly updatedAt: ISOTimestamp;
}

// ---------------------------------------------------------------------------
// Aggregate Root
// ---------------------------------------------------------------------------

/**
 * Marketplace listing aggregate root.
 *
 * Encapsulates all invariant enforcement for listing lifecycle transitions.
 * Collects domain events internally; the application layer flushes them
 * after persisting the aggregate.
 */
export class Listing {
  public readonly id: ListingId;
  public readonly sellerId: UserId;
  public readonly title: string;
  public readonly description: string;
  public readonly imageUrls: ReadonlyArray<string>;
  public readonly askingPrice: Money;
  public readonly category: string;
  public readonly condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  public readonly createdAt: ISOTimestamp;

  private _status: ListingStatusType;
  private _reservedByBuyerId: UserId | null;
  private _updatedAt: ISOTimestamp;

  /** Internal event queue — flushed by the application layer after persistence. */
  private readonly _domainEvents: DomainEvent[] = [];

  /**
   * @param props - Hydration properties from persistence or factory.
   */
  constructor(props: ListingProps) {
    this.id = props.id;
    this.sellerId = props.sellerId;
    this.title = props.title;
    this.description = props.description;
    this.imageUrls = props.imageUrls;
    this.askingPrice = props.askingPrice;
    this.category = props.category;
    this.condition = props.condition;
    this.createdAt = props.createdAt;

    this._status = props.status;
    this._reservedByBuyerId = props.reservedByBuyerId;
    this._updatedAt = props.updatedAt;
  }

  // -----------------------------------------------------------------------
  // Getters
  // -----------------------------------------------------------------------

  /** Current lifecycle status. */
  get status(): ListingStatusType {
    return this._status;
  }

  /** ID of the buyer who reserved this listing, if any. */
  get reservedByBuyerId(): UserId | null {
    return this._reservedByBuyerId;
  }

  /** Last-modified timestamp. */
  get updatedAt(): ISOTimestamp {
    return this._updatedAt;
  }

  // -----------------------------------------------------------------------
  // Domain Operations
  // -----------------------------------------------------------------------

  /**
   * Publishes a draft listing, making it visible to buyers.
   *
   * @param now - Current timestamp.
   * @throws {Error} If the listing is not in DRAFT status.
   */
  publish(now: ISOTimestamp): void {
    this.transitionTo(ListingStatus.ACTIVE, now);
    this._domainEvents.push({
      type: 'LISTING_PUBLISHED',
      payload: { listingId: this.id, sellerId: this.sellerId },
      occurredAt: now,
    });
  }

  /**
   * Reserves this listing for a specific buyer (e.g., after an offer is accepted).
   *
   * @param buyerId - The ID of the buyer reserving the listing.
   * @param now - Current timestamp.
   * @throws {Error} If the listing is not ACTIVE or the buyer is the seller.
   */
  reserve(buyerId: UserId, now: ISOTimestamp): void {
    if (buyerId === this.sellerId) {
      throw new Error('Seller cannot reserve their own listing');
    }
    this.transitionTo(ListingStatus.RESERVED, now);
    this._reservedByBuyerId = buyerId;
    this._domainEvents.push({
      type: 'LISTING_RESERVED',
      payload: { listingId: this.id, buyerId, sellerId: this.sellerId },
      occurredAt: now,
    });
  }

  /**
   * Marks the listing as sold after payment confirmation.
   *
   * @param now - Current timestamp.
   * @throws {Error} If the listing is not in RESERVED status.
   */
  markSold(now: ISOTimestamp): void {
    this.transitionTo(ListingStatus.SOLD, now);
    this._domainEvents.push({
      type: 'LISTING_SOLD',
      payload: {
        listingId: this.id,
        buyerId: this._reservedByBuyerId,
        sellerId: this.sellerId,
      },
      occurredAt: now,
    });
  }

  /**
   * Cancels the listing. Allowed from most non-terminal states.
   *
   * @param now - Current timestamp.
   * @throws {Error} If cancellation is not valid from the current state.
   */
  cancel(now: ISOTimestamp): void {
    this.transitionTo(ListingStatus.CANCELLED, now);
    this._domainEvents.push({
      type: 'LISTING_CANCELLED',
      payload: { listingId: this.id, sellerId: this.sellerId },
      occurredAt: now,
    });
  }

  // -----------------------------------------------------------------------
  // Domain Events
  // -----------------------------------------------------------------------

  /**
   * Returns and clears all pending domain events.
   * Called by the application layer after the aggregate is persisted.
   *
   * @returns Array of domain events accumulated during this unit of work.
   */
  flushDomainEvents(): ReadonlyArray<DomainEvent> {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }

  // -----------------------------------------------------------------------
  // Private Helpers
  // -----------------------------------------------------------------------

  /**
   * Validates and applies a status transition.
   *
   * @param to - Target status.
   * @param now - Current timestamp.
   * @throws {Error} If the transition is invalid.
   */
  private transitionTo(to: ListingStatusType, now: ISOTimestamp): void {
    if (!isValidListingTransition(this._status, to)) {
      throw new Error(
        `Invalid listing transition: ${this._status} → ${to} (listing ${this.id})`
      );
    }
    this._status = to;
    this._updatedAt = now;
  }
}
