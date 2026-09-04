/**
 * @file src/domain/types/index.ts
 *
 * Centralized shared types for the OtakuBazaar domain.
 * Contains branded ID types (preventing accidental ID swaps at compile time),
 * utility types, and common enumerations used across all layers.
 *
 * This file has ZERO external dependencies — it is pure TypeScript.
 */

// ---------------------------------------------------------------------------
// Branded Type Utility
// ---------------------------------------------------------------------------

/**
 * Creates a nominal/branded type that is structurally incompatible with
 * other branded types, even if the underlying primitive is the same.
 *
 * @example
 * ```ts
 * type UserId = Brand<string, 'UserId'>;
 * type ListingId = Brand<string, 'ListingId'>;
 * // UserId and ListingId are NOT assignable to each other.
 * ```
 */
type Brand<T, B extends string> = T & { readonly __brand: B };

// ---------------------------------------------------------------------------
// Branded ID Types
// ---------------------------------------------------------------------------

/** Unique identifier for a User entity. */
export type UserId = Brand<string, 'UserId'>;

/** Unique identifier for a Listing entity. */
export type ListingId = Brand<string, 'ListingId'>;

/** Unique identifier for a BargainOffer entity. */
export type BargainOfferId = Brand<string, 'BargainOfferId'>;

/** Unique identifier for a Transaction entity. */
export type TransactionId = Brand<string, 'TransactionId'>;

// ---------------------------------------------------------------------------
// Brand Constructors (runtime identity — zero overhead after minification)
// ---------------------------------------------------------------------------

/**
 * Constructs a branded {@link UserId} from a raw string.
 *
 * @param raw - The raw string identifier (e.g., a UUID from the database).
 * @returns A branded `UserId`.
 */
export function toUserId(raw: string): UserId {
  return raw as UserId;
}

/**
 * Constructs a branded {@link ListingId} from a raw string.
 *
 * @param raw - The raw string identifier.
 * @returns A branded `ListingId`.
 */
export function toListingId(raw: string): ListingId {
  return raw as ListingId;
}

/**
 * Constructs a branded {@link BargainOfferId} from a raw string.
 *
 * @param raw - The raw string identifier.
 * @returns A branded `BargainOfferId`.
 */
export function toBargainOfferId(raw: string): BargainOfferId {
  return raw as BargainOfferId;
}

/**
 * Constructs a branded {@link TransactionId} from a raw string.
 *
 * @param raw - The raw string identifier.
 * @returns A branded `TransactionId`.
 */
export function toTransactionId(raw: string): TransactionId {
  return raw as TransactionId;
}

// ---------------------------------------------------------------------------
// Currency Enum
// ---------------------------------------------------------------------------

/**
 * ISO 4217 currency codes supported by the platform.
 * Extend this union as new payment regions are onboarded.
 */
export type CurrencyCode = 'INR' | 'USD' | 'JPY';

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/** Standard cursor-based pagination input. */
export interface PaginationInput {
  readonly cursor?: string | undefined;
  readonly limit: number;
}

/** Standard cursor-based pagination output wrapping a list of items. */
export interface PaginatedResult<T> {
  readonly items: ReadonlyArray<T>;
  readonly nextCursor: string | null;
  readonly totalCount: number;
}

// ---------------------------------------------------------------------------
// Timestamp Utility
// ---------------------------------------------------------------------------

/**
 * ISO-8601 timestamp string branded for clarity.
 * All domain timestamps use this type instead of raw `string`.
 */
export type ISOTimestamp = Brand<string, 'ISOTimestamp'>;

/**
 * Creates a branded {@link ISOTimestamp} from the current time.
 *
 * @returns The current UTC time as a branded ISO-8601 string.
 */
export function nowTimestamp(): ISOTimestamp {
  return new Date().toISOString() as ISOTimestamp;
}
