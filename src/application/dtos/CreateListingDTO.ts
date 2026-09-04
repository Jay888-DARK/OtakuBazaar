/**
 * @file src/application/dtos/CreateListingDTO.ts
 *
 * Data Transfer Object for the CreateListing use case.
 * DTOs carry raw input from the presentation layer into use cases.
 * Validation is performed inside the use case, not here — this is a
 * pure data carrier.
 */

import type { CurrencyCode } from '@/domain/types';

/**
 * Input DTO for creating a new marketplace listing.
 *
 * All fields are readonly to prevent mutation after construction.
 * The use case validates these fields and maps them to domain entities.
 */
export interface CreateListingDTO {
  /** Display title for the listing (3–120 characters). */
  readonly title: string;
  /** Detailed description of the item (10–5000 characters). */
  readonly description: string;
  /** Array of image URLs (1–10 images). */
  readonly imageUrls: ReadonlyArray<string>;
  /** Asking price in the currency's major units (e.g., 499.99 for ₹499.99). */
  readonly askingPriceMajorUnits: number;
  /** ISO 4217 currency code for the asking price. */
  readonly currency: CurrencyCode;
  /** Category slug (e.g., 'manga', 'figures', 'cosplay'). */
  readonly category: string;
  /** Item condition. */
  readonly condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
}
