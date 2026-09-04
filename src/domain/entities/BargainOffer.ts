/**
 * @file src/domain/entities/BargainOffer.ts
 *
 * BargainOffer entity representing a price negotiation between buyer and seller.
 * Encapsulates the offer/counter-offer state machine.
 * Pure domain logic — no external dependencies.
 */

import type { BargainOfferId, ListingId, UserId, ISOTimestamp } from '@/domain/types';
import { Money } from '@/domain/value-objects/Money';
import {
  OfferStatus,
  type OfferStatusType,
  isValidOfferTransition,
} from '@/domain/value-objects/OfferStatus';
import type { DomainEvent } from '@/domain/events/DomainEvent';

// ---------------------------------------------------------------------------
// Construction Props
// ---------------------------------------------------------------------------

/** Properties required to hydrate a BargainOffer entity. */
export interface BargainOfferProps {
  readonly id: BargainOfferId;
  readonly listingId: ListingId;
  readonly buyerId: UserId;
  readonly sellerId: UserId;
  readonly offeredPrice: Money;
  readonly counterPrice: Money | null;
  readonly status: OfferStatusType;
  readonly message: string;
  readonly expiresAt: ISOTimestamp;
  readonly createdAt: ISOTimestamp;
  readonly updatedAt: ISOTimestamp;
}

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------

/**
 * Domain entity representing a bargain/negotiation offer on a listing.
 *
 * Lifecycle: Buyer submits PENDING offer → Seller accepts / rejects / counters.
 * On acceptance, the application layer coordinates reserving the listing.
 */
export class BargainOffer {
  public readonly id: BargainOfferId;
  public readonly listingId: ListingId;
  public readonly buyerId: UserId;
  public readonly sellerId: UserId;
  public readonly offeredPrice: Money;
  public readonly message: string;
  public readonly expiresAt: ISOTimestamp;
  public readonly createdAt: ISOTimestamp;

  private _counterPrice: Money | null;
  private _status: OfferStatusType;
  private _updatedAt: ISOTimestamp;

  /** Internal event queue. */
  private readonly _domainEvents: DomainEvent[] = [];

  /**
   * @param props - Hydration properties from persistence or factory.
   */
  constructor(props: BargainOfferProps) {
    this.id = props.id;
    this.listingId = props.listingId;
    this.buyerId = props.buyerId;
    this.sellerId = props.sellerId;
    this.offeredPrice = props.offeredPrice;
    this.message = props.message;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;

    this._counterPrice = props.counterPrice;
    this._status = props.status;
    this._updatedAt = props.updatedAt;
  }

  // -----------------------------------------------------------------------
  // Getters
  // -----------------------------------------------------------------------

  /** Current negotiation status. */
  get status(): OfferStatusType {
    return this._status;
  }

  /** Seller's counter-price, if any. */
  get counterPrice(): Money | null {
    return this._counterPrice;
  }

  /** Last-modified timestamp. */
  get updatedAt(): ISOTimestamp {
    return this._updatedAt;
  }

  /**
   * The effective agreed-upon price: counter-price if countered and accepted,
   * otherwise the original offered price.
   *
   * @returns The final transaction price.
   */
  get agreedPrice(): Money {
    return this._counterPrice ?? this.offeredPrice;
  }

  // -----------------------------------------------------------------------
  // Domain Operations
  // -----------------------------------------------------------------------

  /**
   * Seller accepts this offer. Transitions status to ACCEPTED.
   *
   * @param now - Current timestamp.
   * @throws {Error} If offer is not in an acceptable state (PENDING or COUNTERED).
   */
  accept(now: ISOTimestamp): void {
    this.transitionTo(OfferStatus.ACCEPTED, now);
    this._domainEvents.push({
      type: 'OFFER_ACCEPTED',
      payload: {
        offerId: this.id,
        listingId: this.listingId,
        buyerId: this.buyerId,
        sellerId: this.sellerId,
        agreedPrice: this.agreedPrice.amountInSmallestUnit,
        currency: this.agreedPrice.currency,
      },
      occurredAt: now,
    });
  }

  /**
   * Seller rejects this offer outright.
   *
   * @param now - Current timestamp.
   * @throws {Error} If offer is not in PENDING or COUNTERED status.
   */
  reject(now: ISOTimestamp): void {
    this.transitionTo(OfferStatus.REJECTED, now);
    this._domainEvents.push({
      type: 'OFFER_REJECTED',
      payload: { offerId: this.id, listingId: this.listingId },
      occurredAt: now,
    });
  }

  /**
   * Seller counters with a different price.
   *
   * @param counterPrice - The seller's counter-offer price.
   * @param now - Current timestamp.
   * @throws {Error} If offer is not in PENDING status.
   * @throws {Error} If counter-price currency doesn't match original offer.
   */
  counter(counterPrice: Money, now: ISOTimestamp): void {
    if (counterPrice.currency !== this.offeredPrice.currency) {
      throw new Error('Counter-offer currency must match the original offer currency');
    }
    this.transitionTo(OfferStatus.COUNTERED, now);
    this._counterPrice = counterPrice;
    this._domainEvents.push({
      type: 'OFFER_COUNTERED',
      payload: {
        offerId: this.id,
        listingId: this.listingId,
        counterPrice: counterPrice.amountInSmallestUnit,
        currency: counterPrice.currency,
      },
      occurredAt: now,
    });
  }

  /**
   * Buyer withdraws their offer.
   *
   * @param now - Current timestamp.
   * @throws {Error} If offer is not in PENDING or COUNTERED status.
   */
  withdraw(now: ISOTimestamp): void {
    this.transitionTo(OfferStatus.WITHDRAWN, now);
    this._domainEvents.push({
      type: 'OFFER_WITHDRAWN',
      payload: { offerId: this.id, listingId: this.listingId, buyerId: this.buyerId },
      occurredAt: now,
    });
  }

  /**
   * Returns `true` if this offer has expired past its TTL.
   *
   * @param now - Current timestamp to check against.
   * @returns Whether the offer is past expiration.
   */
  isExpired(now: ISOTimestamp): boolean {
    return new Date(now) >= new Date(this.expiresAt);
  }

  // -----------------------------------------------------------------------
  // Domain Events
  // -----------------------------------------------------------------------

  /**
   * Returns and clears all pending domain events.
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
  private transitionTo(to: OfferStatusType, now: ISOTimestamp): void {
    if (!isValidOfferTransition(this._status, to)) {
      throw new Error(
        `Invalid offer transition: ${this._status} → ${to} (offer ${this.id})`
      );
    }
    this._status = to;
    this._updatedAt = now;
  }
}
