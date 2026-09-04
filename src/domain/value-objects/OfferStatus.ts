/**
 * @file src/domain/value-objects/OfferStatus.ts
 *
 * Discriminated union representing the lifecycle states of a bargain offer.
 * Pure value — no external dependencies.
 */

// ---------------------------------------------------------------------------
// Status Enum
// ---------------------------------------------------------------------------

/**
 * All possible states a bargain offer can be in.
 *
 * State machine:
 * ```
 * PENDING → ACCEPTED → (triggers listing RESERVED)
 *         → REJECTED
 *         → COUNTERED → PENDING (new offer from other party)
 *         → EXPIRED
 *         → WITHDRAWN
 * ```
 */
export const OfferStatus = {
  /** Offer submitted, awaiting seller response. */
  PENDING: 'PENDING',
  /** Seller accepted the offer. */
  ACCEPTED: 'ACCEPTED',
  /** Seller rejected the offer outright. */
  REJECTED: 'REJECTED',
  /** Seller countered with a different price. */
  COUNTERED: 'COUNTERED',
  /** Offer expired before a response was given. */
  EXPIRED: 'EXPIRED',
  /** Buyer withdrew their offer. */
  WITHDRAWN: 'WITHDRAWN',
} as const;

/** Union type derived from the OfferStatus constant object. */
export type OfferStatusType = (typeof OfferStatus)[keyof typeof OfferStatus];

// ---------------------------------------------------------------------------
// Transition Guard
// ---------------------------------------------------------------------------

/** Map of valid transitions: current → set of allowed next states. */
const VALID_TRANSITIONS: Readonly<Record<OfferStatusType, ReadonlySet<OfferStatusType>>> = {
  [OfferStatus.PENDING]: new Set([
    OfferStatus.ACCEPTED,
    OfferStatus.REJECTED,
    OfferStatus.COUNTERED,
    OfferStatus.EXPIRED,
    OfferStatus.WITHDRAWN,
  ]),
  [OfferStatus.ACCEPTED]: new Set([]),    // terminal
  [OfferStatus.REJECTED]: new Set([]),    // terminal
  [OfferStatus.COUNTERED]: new Set([
    OfferStatus.ACCEPTED,
    OfferStatus.REJECTED,
    OfferStatus.EXPIRED,
    OfferStatus.WITHDRAWN,
  ]),
  [OfferStatus.EXPIRED]: new Set([]),     // terminal
  [OfferStatus.WITHDRAWN]: new Set([]),   // terminal
};

/**
 * Checks whether an offer status transition is valid.
 *
 * @param from - The current offer status.
 * @param to - The desired next status.
 * @returns `true` if the transition is allowed.
 */
export function isValidOfferTransition(
  from: OfferStatusType,
  to: OfferStatusType
): boolean {
  return VALID_TRANSITIONS[from].has(to);
}
