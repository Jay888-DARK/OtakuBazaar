/**
 * @file src/domain/events/DomainEvent.ts
 *
 * Defines the discriminated union of all domain events that can be raised
 * by aggregate roots. These events are the contract between the domain
 * layer and the application/infrastructure layers.
 *
 * Adding a new event:
 *   1. Define a new interface extending DomainEventBase.
 *   2. Add it to the DomainEvent union.
 *   3. Add its type string to DomainEventType.
 */

import type {
  ListingId,
  UserId,
  BargainOfferId,
  ISOTimestamp,
  CurrencyCode,
} from '@/domain/types';

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------

/** Base shape that all domain events conform to. */
interface DomainEventBase {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly occurredAt: ISOTimestamp;
}

// ---------------------------------------------------------------------------
// Listing Events
// ---------------------------------------------------------------------------

/** Raised when a listing transitions from DRAFT to ACTIVE. */
export interface ListingPublishedEvent extends DomainEventBase {
  readonly type: 'LISTING_PUBLISHED';
  readonly payload: {
    readonly listingId: ListingId;
    readonly sellerId: UserId;
  };
}

/** Raised when a listing is reserved for a buyer. */
export interface ListingReservedEvent extends DomainEventBase {
  readonly type: 'LISTING_RESERVED';
  readonly payload: {
    readonly listingId: ListingId;
    readonly buyerId: UserId;
    readonly sellerId: UserId;
  };
}

/** Raised when a listing is marked as sold. */
export interface ListingSoldEvent extends DomainEventBase {
  readonly type: 'LISTING_SOLD';
  readonly payload: {
    readonly listingId: ListingId;
    readonly buyerId: UserId | null;
    readonly sellerId: UserId;
  };
}

/** Raised when a listing is cancelled by the seller. */
export interface ListingCancelledEvent extends DomainEventBase {
  readonly type: 'LISTING_CANCELLED';
  readonly payload: {
    readonly listingId: ListingId;
    readonly sellerId: UserId;
  };
}

// ---------------------------------------------------------------------------
// Offer Events
// ---------------------------------------------------------------------------

/** Raised when a bargain offer is accepted. */
export interface OfferAcceptedEvent extends DomainEventBase {
  readonly type: 'OFFER_ACCEPTED';
  readonly payload: {
    readonly offerId: BargainOfferId;
    readonly listingId: ListingId;
    readonly buyerId: UserId;
    readonly sellerId: UserId;
    readonly agreedPrice: number;
    readonly currency: CurrencyCode;
  };
}

/** Raised when a bargain offer is rejected. */
export interface OfferRejectedEvent extends DomainEventBase {
  readonly type: 'OFFER_REJECTED';
  readonly payload: {
    readonly offerId: BargainOfferId;
    readonly listingId: ListingId;
  };
}

/** Raised when a seller counters with a different price. */
export interface OfferCounteredEvent extends DomainEventBase {
  readonly type: 'OFFER_COUNTERED';
  readonly payload: {
    readonly offerId: BargainOfferId;
    readonly listingId: ListingId;
    readonly counterPrice: number;
    readonly currency: CurrencyCode;
  };
}

/** Raised when a buyer withdraws their offer. */
export interface OfferWithdrawnEvent extends DomainEventBase {
  readonly type: 'OFFER_WITHDRAWN';
  readonly payload: {
    readonly offerId: BargainOfferId;
    readonly listingId: ListingId;
    readonly buyerId: UserId;
  };
}

// ---------------------------------------------------------------------------
// Discriminated Union
// ---------------------------------------------------------------------------

/**
 * Union of all domain events in the system.
 * Use the `type` field as the discriminant for exhaustive pattern matching.
 */
export type DomainEvent =
  | ListingPublishedEvent
  | ListingReservedEvent
  | ListingSoldEvent
  | ListingCancelledEvent
  | OfferAcceptedEvent
  | OfferRejectedEvent
  | OfferCounteredEvent
  | OfferWithdrawnEvent;

/**
 * String literal union of all domain event type discriminants.
 * Useful for type-safe event subscriptions.
 */
export type DomainEventType = DomainEvent['type'];
