/**
 * @file src/application/use-cases/CreateListingUseCase.ts
 *
 * Orchestrates the creation of a new marketplace listing.
 * Validates input, constructs the Listing aggregate, persists it,
 * and publishes domain events. This is the canonical "happy path"
 * use case demonstrating Clean Architecture wiring.
 */

import { Listing, type ListingProps } from '@/domain/entities/Listing';
import type { IListingRepository } from '@/domain/repositories/IListingRepository';
import type { IEventBus } from '@/application/ports/IEventBus';
import type { CreateListingDTO } from '@/application/dtos/CreateListingDTO';
import {
  ValidationError,
  type ValidationFieldError,
} from '@/application/errors/ApplicationErrors';
import { Money } from '@/domain/value-objects/Money';
import { ListingStatus } from '@/domain/value-objects/ListingStatus';
import { toListingId, nowTimestamp } from '@/domain/types';
import type { UserId } from '@/domain/types';

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

/**
 * Creates a new marketplace listing for a seller.
 *
 * Flow:
 *   1. Validate the DTO fields.
 *   2. Construct a `Listing` aggregate in DRAFT status.
 *   3. Persist via `IListingRepository`.
 *   4. Flush and publish any domain events via `IEventBus`.
 *   5. Return the created listing.
 */
export class CreateListingUseCase {
  /**
   * @param listingRepo - Repository port for listing persistence.
   * @param eventBus - Event bus port for publishing domain events.
   */
  constructor(
    private readonly listingRepo: IListingRepository,
    private readonly eventBus: IEventBus
  ) {}

  /**
   * Executes the listing creation workflow.
   *
   * @param sellerId - The authenticated seller's branded user ID.
   * @param dto - The raw input data from the presentation layer.
   * @returns The persisted Listing aggregate.
   * @throws {ValidationError} If any DTO fields fail validation.
   */
  async execute(sellerId: UserId, dto: CreateListingDTO): Promise<Listing> {
    // ----- Step 1: Validate DTO -----
    this.validate(dto);

    // ----- Step 2: Construct Domain Objects -----
    const now = nowTimestamp();
    const askingPrice = Money.fromMajorUnits(dto.askingPriceMajorUnits, dto.currency);

    const listingProps: ListingProps = {
      // In production, use a UUID v7 generator for sortable IDs.
      // Placeholder: crypto.randomUUID() gives a v4 UUID.
      id: toListingId(crypto.randomUUID()),
      sellerId,
      title: dto.title.trim(),
      description: dto.description.trim(),
      imageUrls: dto.imageUrls,
      askingPrice,
      status: ListingStatus.DRAFT,
      category: dto.category,
      condition: dto.condition,
      reservedByBuyerId: null,
      createdAt: now,
      updatedAt: now,
    };

    const listing = new Listing(listingProps);

    // ----- Step 3: Persist -----
    const persisted = await this.listingRepo.create(listing);

    // ----- Step 4: Publish Domain Events -----
    const events = persisted.flushDomainEvents();
    if (events.length > 0) {
      await this.eventBus.publishAll(events);
    }

    // ----- Step 5: Return -----
    return persisted;
  }

  // -----------------------------------------------------------------------
  // Private Validation
  // -----------------------------------------------------------------------

  /**
   * Validates all fields of the CreateListingDTO.
   * Collects all field errors and throws a single {@link ValidationError}.
   *
   * @param dto - The input DTO to validate.
   * @throws {ValidationError} If one or more fields are invalid.
   */
  private validate(dto: CreateListingDTO): void {
    const errors: ValidationFieldError[] = [];

    // Title: 3–120 chars
    const title = dto.title.trim();
    if (title.length < 3 || title.length > 120) {
      errors.push({
        field: 'title',
        message: 'Title must be between 3 and 120 characters',
      });
    }

    // Description: 10–5000 chars
    const description = dto.description.trim();
    if (description.length < 10 || description.length > 5000) {
      errors.push({
        field: 'description',
        message: 'Description must be between 10 and 5000 characters',
      });
    }

    // Images: 1–10
    if (dto.imageUrls.length < 1 || dto.imageUrls.length > 10) {
      errors.push({
        field: 'imageUrls',
        message: 'Must provide between 1 and 10 images',
      });
    }

    // Price: positive
    if (dto.askingPriceMajorUnits <= 0) {
      errors.push({
        field: 'askingPriceMajorUnits',
        message: 'Asking price must be greater than zero',
      });
    }

    // Condition: valid enum value
    const validConditions = new Set(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']);
    if (!validConditions.has(dto.condition)) {
      errors.push({
        field: 'condition',
        message: `Invalid condition: ${dto.condition}`,
      });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }
}
