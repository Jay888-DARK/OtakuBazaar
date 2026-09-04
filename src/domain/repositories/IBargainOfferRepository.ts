/**
 * @file src/domain/repositories/IBargainOfferRepository.ts
 *
 * Port interface (contract) for bargain offer persistence.
 * Defined in the domain layer to keep business logic decoupled from
 * any specific database or ORM. Implemented by infrastructure adapters.
 */

import type { BargainOffer } from '@/domain/entities/BargainOffer';
import type {
  BargainOfferId,
  ListingId,
  UserId,
  PaginationInput,
  PaginatedResult,
} from '@/domain/types';

/**
 * Repository port for the {@link BargainOffer} entity.
 */
export interface IBargainOfferRepository {
  /**
   * Retrieves a bargain offer by its unique identifier.
   *
   * @param id - The offer's branded ID.
   * @returns The offer if found, or `null` if it does not exist.
   */
  findById(id: BargainOfferId): Promise<BargainOffer | null>;

  /**
   * Retrieves all offers for a specific listing.
   *
   * @param listingId - The listing's branded ID.
   * @param pagination - Cursor-based pagination parameters.
   * @returns A paginated result of offers for the listing.
   */
  findByListingId(
    listingId: ListingId,
    pagination: PaginationInput
  ): Promise<PaginatedResult<BargainOffer>>;

  /**
   * Retrieves all offers made by a specific buyer.
   *
   * @param buyerId - The buyer's branded user ID.
   * @param pagination - Cursor-based pagination parameters.
   * @returns A paginated result of the buyer's offers.
   */
  findByBuyerId(
    buyerId: UserId,
    pagination: PaginationInput
  ): Promise<PaginatedResult<BargainOffer>>;

  /**
   * Retrieves the active (non-terminal) offer for a buyer on a listing, if any.
   * Used to enforce "one active offer per buyer per listing" invariant.
   *
   * @param listingId - The listing's branded ID.
   * @param buyerId - The buyer's branded user ID.
   * @returns The active offer, or `null` if none exists.
   */
  findActiveByListingAndBuyer(
    listingId: ListingId,
    buyerId: UserId
  ): Promise<BargainOffer | null>;

  /**
   * Persists a new bargain offer.
   *
   * @param offer - The offer entity to save.
   * @returns The persisted offer.
   */
  create(offer: BargainOffer): Promise<BargainOffer>;

  /**
   * Updates an existing bargain offer.
   *
   * @param offer - The offer entity with updated state.
   * @returns The updated offer.
   * @throws {Error} If the offer does not exist.
   */
  update(offer: BargainOffer): Promise<BargainOffer>;
}
