/**
 * @file src/application/dtos/AcceptBargainOfferDTO.ts
 *
 * Data Transfer Object for the AcceptBargainOffer use case.
 * Carries the minimal identifiers needed for a seller to accept an offer.
 */

/**
 * Input DTO for accepting a bargain offer.
 *
 * The seller's identity (`sellerId`) is passed separately (typically from
 * the authenticated session) to prevent impersonation.
 */
export interface AcceptBargainOfferDTO {
  /** The ID of the bargain offer to accept. */
  readonly offerId: string;
  /** The authenticated seller's user ID. */
  readonly sellerId: string;
}
