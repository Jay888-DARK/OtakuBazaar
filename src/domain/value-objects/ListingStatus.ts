/**
 * @file src/domain/value-objects/ListingStatus.ts
 *
 * Discriminated union representing the lifecycle states of a marketplace listing.
 * Encodes valid state transitions as a pure function — no external dependencies.
 */

// ---------------------------------------------------------------------------
// Status Enum
// ---------------------------------------------------------------------------

/**
 * All possible states a listing can be in.
 *
 * State machine:
 * ```
 * DRAFT → ACTIVE → RESERVED → SOLD
 *                ↘ EXPIRED
 *   any  → CANCELLED
 * ```
 */
export const ListingStatus = {
  /** Listing created but not yet published. */
  DRAFT: 'DRAFT',
  /** Listing is live and accepting offers. */
  ACTIVE: 'ACTIVE',
  /** A buyer has reserved this listing (pending payment). */
  RESERVED: 'RESERVED',
  /** Payment confirmed — listing is sold. */
  SOLD: 'SOLD',
  /** Listing auto-expired after its TTL. */
  EXPIRED: 'EXPIRED',
  /** Seller manually cancelled the listing. */
  CANCELLED: 'CANCELLED',
} as const;

/** Union type derived from the ListingStatus constant object. */
export type ListingStatusType = (typeof ListingStatus)[keyof typeof ListingStatus];

// ---------------------------------------------------------------------------
// Transition Guard
// ---------------------------------------------------------------------------

/** Map of valid transitions: current → set of allowed next states. */
const VALID_TRANSITIONS: Readonly<Record<ListingStatusType, ReadonlySet<ListingStatusType>>> = {
  [ListingStatus.DRAFT]: new Set([ListingStatus.ACTIVE, ListingStatus.CANCELLED]),
  [ListingStatus.ACTIVE]: new Set([
    ListingStatus.RESERVED,
    ListingStatus.EXPIRED,
    ListingStatus.CANCELLED,
  ]),
  [ListingStatus.RESERVED]: new Set([
    ListingStatus.SOLD,
    ListingStatus.ACTIVE, // buyer failed to pay → release reservation
    ListingStatus.CANCELLED,
  ]),
  [ListingStatus.SOLD]: new Set([]), // terminal
  [ListingStatus.EXPIRED]: new Set([ListingStatus.ACTIVE]), // re-list
  [ListingStatus.CANCELLED]: new Set([]), // terminal
};

/**
 * Checks whether a status transition is valid according to the listing
 * state machine.
 *
 * @param from - The current listing status.
 * @param to - The desired next status.
 * @returns `true` if the transition is allowed.
 */
export function isValidListingTransition(
  from: ListingStatusType,
  to: ListingStatusType
): boolean {
  return VALID_TRANSITIONS[from].has(to);
}
