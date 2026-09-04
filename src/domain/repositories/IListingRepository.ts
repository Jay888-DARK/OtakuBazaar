/**
 * @file src/domain/repositories/IListingRepository.ts
 *
 * Port interface (contract) for listing persistence.
 * Defined in the domain layer so the domain remains decoupled from any
 * specific database or ORM. Implemented by infrastructure adapters.
 */

import type { Listing } from '@/domain/entities/Listing';
import type { ListingId, UserId, PaginationInput, PaginatedResult } from '@/domain/types';
import type { ListingStatusType } from '@/domain/value-objects/ListingStatus';

/**
 * Repository port for the {@link Listing} aggregate.
 *
 * All methods return promises to support async I/O in infrastructure
 * implementations. The domain layer never awaits these directly — only
 * the application layer (use cases) orchestrates the async flow.
 */
export interface IListingRepository {
  /**
   * Retrieves a listing by its unique identifier.
   *
   * @param id - The listing's branded ID.
   * @returns The listing if found, or `null` if it does not exist.
   */
  findById(id: ListingId): Promise<Listing | null>;

  /**
   * Retrieves all listings owned by a specific seller.
   *
   * @param sellerId - The seller's branded user ID.
   * @param pagination - Cursor-based pagination parameters.
   * @returns A paginated result of listings.
   */
  findBySellerId(
    sellerId: UserId,
    pagination: PaginationInput
  ): Promise<PaginatedResult<Listing>>;

  /**
   * Retrieves listings filtered by status with pagination.
   *
   * @param status - The listing status to filter by.
   * @param pagination - Cursor-based pagination parameters.
   * @returns A paginated result of listings matching the status.
   */
  findByStatus(
    status: ListingStatusType,
    pagination: PaginationInput
  ): Promise<PaginatedResult<Listing>>;

  /**
   * Persists a new listing to the store.
   *
   * @param listing - The listing aggregate to save.
   * @returns The persisted listing (may include generated fields).
   */
  create(listing: Listing): Promise<Listing>;

  /**
   * Updates an existing listing in the store.
   * Implementations must enforce optimistic concurrency via `updatedAt`.
   *
   * @param listing - The listing aggregate with updated state.
   * @returns The updated listing.
   * @throws {Error} If the listing does not exist or a concurrency conflict occurs.
   */
  update(listing: Listing): Promise<Listing>;

  /**
   * Soft-deletes a listing by ID.
   *
   * @param id - The listing's branded ID.
   * @returns `true` if the listing was deleted, `false` if not found.
   */
  delete(id: ListingId): Promise<boolean>;
}
