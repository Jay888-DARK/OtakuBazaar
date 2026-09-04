/**
 * @file src/application/errors/ApplicationErrors.ts
 *
 * Typed error hierarchy for the application layer.
 * Every error carries a machine-readable `code` for API consumers and
 * a human-readable `message` for logging. Infrastructure and presentation
 * layers map these to HTTP status codes.
 */

// ---------------------------------------------------------------------------
// Base Application Error
// ---------------------------------------------------------------------------

/**
 * Base class for all application-layer errors.
 * Extends the native Error with a stable `code` for programmatic handling.
 */
export abstract class ApplicationError extends Error {
  /** Machine-readable error code (e.g., 'LISTING_NOT_FOUND'). */
  public abstract readonly code: string;

  /**
   * @param message - Human-readable error description.
   */
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Maintains proper prototype chain for instanceof checks in TS
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// Not Found Errors
// ---------------------------------------------------------------------------

/** Thrown when a requested listing does not exist in the store. */
export class ListingNotFoundError extends ApplicationError {
  public readonly code = 'LISTING_NOT_FOUND' as const;

  /**
   * @param listingId - The ID of the listing that was not found.
   */
  constructor(listingId: string) {
    super(`Listing not found: ${listingId}`);
  }
}

/** Thrown when a requested bargain offer does not exist in the store. */
export class OfferNotFoundError extends ApplicationError {
  public readonly code = 'OFFER_NOT_FOUND' as const;

  /**
   * @param offerId - The ID of the offer that was not found.
   */
  constructor(offerId: string) {
    super(`Bargain offer not found: ${offerId}`);
  }
}

// ---------------------------------------------------------------------------
// Authorization Errors
// ---------------------------------------------------------------------------

/** Thrown when a user attempts an action they are not authorized to perform. */
export class UnauthorizedActionError extends ApplicationError {
  public readonly code = 'UNAUTHORIZED_ACTION' as const;

  /**
   * @param action - Description of the attempted action.
   * @param reason - Why the action is not allowed.
   */
  constructor(action: string, reason: string) {
    super(`Unauthorized: cannot ${action} — ${reason}`);
  }
}

// ---------------------------------------------------------------------------
// Business Rule Violations
// ---------------------------------------------------------------------------

/** Thrown when a domain invariant or business rule is violated. */
export class BusinessRuleViolationError extends ApplicationError {
  public readonly code = 'BUSINESS_RULE_VIOLATION' as const;

  /**
   * @param rule - The business rule that was violated.
   */
  constructor(rule: string) {
    super(`Business rule violation: ${rule}`);
  }
}

/** Thrown when a state transition is invalid for the current entity state. */
export class InvalidStateTransitionError extends ApplicationError {
  public readonly code = 'INVALID_STATE_TRANSITION' as const;

  /**
   * @param entity - The entity type (e.g., 'Listing', 'BargainOffer').
   * @param from - The current state.
   * @param to - The attempted target state.
   */
  constructor(entity: string, from: string, to: string) {
    super(`Invalid ${entity} transition: ${from} → ${to}`);
  }
}

// ---------------------------------------------------------------------------
// Validation Errors
// ---------------------------------------------------------------------------

/** Individual field validation failure. */
export interface ValidationFieldError {
  readonly field: string;
  readonly message: string;
}

/** Thrown when input validation fails. Carries per-field error details. */
export class ValidationError extends ApplicationError {
  public readonly code = 'VALIDATION_ERROR' as const;

  /** Per-field validation failures. */
  public readonly fieldErrors: ReadonlyArray<ValidationFieldError>;

  /**
   * @param fieldErrors - Array of field-level validation failures.
   */
  constructor(fieldErrors: ReadonlyArray<ValidationFieldError>) {
    const summary = fieldErrors.map((e) => `${e.field}: ${e.message}`).join('; ');
    super(`Validation failed — ${summary}`);
    this.fieldErrors = fieldErrors;
  }
}

// ---------------------------------------------------------------------------
// Concurrency Errors
// ---------------------------------------------------------------------------

/** Thrown when an optimistic concurrency conflict is detected during update. */
export class ConcurrencyConflictError extends ApplicationError {
  public readonly code = 'CONCURRENCY_CONFLICT' as const;

  /**
   * @param entity - The entity type that had a conflict.
   * @param entityId - The ID of the conflicting entity.
   */
  constructor(entity: string, entityId: string) {
    super(`Concurrency conflict on ${entity} (${entityId}) — please retry`);
  }
}
