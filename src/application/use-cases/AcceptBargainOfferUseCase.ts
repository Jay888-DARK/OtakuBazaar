/**
 * @file src/application/use-cases/AcceptBargainOfferUseCase.ts
 *
 * Orchestrates the acceptance of a bargain offer by the seller.
 * This is the most complex use case in the negotiation flow — it coordinates
 * across two aggregates (BargainOffer + Listing), enforces authorization,
 * and emits events for real-time multi-window sync.
 *
 * Flow:
 *   1. Load the offer and its associated listing.
 *   2. Authorize the seller.
 *   3. Accept the offer (domain operation with state machine guard).
 *   4. Reserve the listing for the buyer.
 *   5. Persist both aggregates.
 *   6. Flush and publish all domain events.
 */

import type { IBargainOfferRepository } from '@/domain/repositories/IBargainOfferRepository';
import type { IListingRepository } from '@/domain/repositories/IListingRepository';
import type { IEventBus } from '@/application/ports/IEventBus';
import type { AcceptBargainOfferDTO } from '@/application/dtos/AcceptBargainOfferDTO';
import type { BargainOffer } from '@/domain/entities/BargainOffer';
import type { Listing } from '@/domain/entities/Listing';
import {
  OfferNotFoundError,
  ListingNotFoundError,
  UnauthorizedActionError,
  BusinessRuleViolationError,
} from '@/application/errors/ApplicationErrors';
import { toBargainOfferId, toUserId, nowTimestamp } from '@/domain/types';

// ---------------------------------------------------------------------------
// Result Type
// ---------------------------------------------------------------------------

/** Structured result returned after successfully accepting an offer. */
export interface AcceptBargainOfferResult {
  /** The updated offer entity (status = ACCEPTED). */
  readonly offer: BargainOffer;
  /** The updated listing entity (status = RESERVED). */
  readonly listing: Listing;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

/**
 * Accepts a bargain offer — transitions the offer to ACCEPTED and the
 * listing to RESERVED in a single coordinated operation.
 */
export class AcceptBargainOfferUseCase {
  /**
   * @param offerRepo - Repository port for bargain offer persistence.
   * @param listingRepo - Repository port for listing persistence.
   * @param eventBus - Event bus port for publishing domain events.
   */
  constructor(
    private readonly offerRepo: IBargainOfferRepository,
    private readonly listingRepo: IListingRepository,
    private readonly eventBus: IEventBus
  ) {}

  /**
   * Executes the offer acceptance workflow.
   *
   * @param dto - Input containing the offer ID and authenticated seller ID.
   * @returns The updated offer and listing.
   * @throws {OfferNotFoundError} If the offer does not exist.
   * @throws {ListingNotFoundError} If the associated listing does not exist.
   * @throws {UnauthorizedActionError} If the caller is not the listing's seller.
   * @throws {BusinessRuleViolationError} If the offer has expired.
   * @throws {Error} If the state transition is invalid (from domain layer).
   */
  async execute(dto: AcceptBargainOfferDTO): Promise<AcceptBargainOfferResult> {
    const now = nowTimestamp();
    const offerId = toBargainOfferId(dto.offerId);
    const sellerId = toUserId(dto.sellerId);

    // ----- Step 1: Load Aggregates -----
    const offer = await this.offerRepo.findById(offerId);
    if (offer === null) {
      throw new OfferNotFoundError(dto.offerId);
    }

    const listing = await this.listingRepo.findById(offer.listingId);
    if (listing === null) {
      throw new ListingNotFoundError(offer.listingId);
    }

    // ----- Step 2: Authorize -----
    if (listing.sellerId !== sellerId) {
      throw new UnauthorizedActionError(
        'accept offer',
        'Only the listing owner can accept offers'
      );
    }

    // ----- Step 3: Business Rule — Expiry Check -----
    if (offer.isExpired(now)) {
      throw new BusinessRuleViolationError(
        `Offer ${offer.id} has expired and cannot be accepted`
      );
    }

    // ----- Step 4: Domain Operations -----
    // Accept the offer (enforces PENDING/COUNTERED → ACCEPTED transition)
    offer.accept(now);

    // Reserve the listing for the buyer (enforces ACTIVE → RESERVED transition)
    listing.reserve(offer.buyerId, now);

    // ----- Step 5: Persist Both Aggregates -----
    // In production, wrap this in a database transaction to ensure atomicity.
    // The repository interface is deliberately simple — transaction coordination
    // belongs in the infrastructure layer (e.g., Prisma's $transaction).
    await this.offerRepo.update(offer);
    await this.listingRepo.update(listing);

    // ----- Step 6: Publish Domain Events -----
    // Flush events from both aggregates and publish them.
    // These events drive the multi-window sync (via WebSocket → BroadcastChannel).
    const offerEvents = offer.flushDomainEvents();
    const listingEvents = listing.flushDomainEvents();
    const allEvents = [...offerEvents, ...listingEvents];

    if (allEvents.length > 0) {
      await this.eventBus.publishAll(allEvents);
    }

    return { offer, listing };
  }
}
