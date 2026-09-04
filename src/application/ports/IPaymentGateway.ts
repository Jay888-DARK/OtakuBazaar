/**
 * @file src/application/ports/IPaymentGateway.ts
 *
 * Port interface for payment processing.
 * Abstracts Razorpay (or any payment provider) behind a clean contract
 * so the application layer never couples to vendor SDKs.
 */

import type { CurrencyCode } from '@/domain/types';

// ---------------------------------------------------------------------------
// DTOs for the Payment Port
// ---------------------------------------------------------------------------

/** Input for creating a payment order (Razorpay "order" concept). */
export interface CreatePaymentOrderInput {
  /** Amount in smallest currency unit (paise/cents). */
  readonly amountInSmallestUnit: number;
  /** ISO 4217 currency code. */
  readonly currency: CurrencyCode;
  /** Internal reference ID linking this payment to a listing/offer. */
  readonly referenceId: string;
  /** Optional notes/metadata passed to the payment provider. */
  readonly notes?: Readonly<Record<string, string>> | undefined;
}

/** Output after a payment order is created on the provider. */
export interface PaymentOrder {
  /** Provider-assigned order ID (e.g., Razorpay order_xxx). */
  readonly providerOrderId: string;
  /** Amount in smallest currency unit. */
  readonly amountInSmallestUnit: number;
  /** Currency code. */
  readonly currency: CurrencyCode;
  /** Status string from the provider. */
  readonly status: 'created' | 'attempted' | 'paid';
}

/** Input for verifying a completed payment. */
export interface VerifyPaymentInput {
  /** Provider-assigned order ID. */
  readonly providerOrderId: string;
  /** Provider-assigned payment ID. */
  readonly providerPaymentId: string;
  /** Signature from the provider for tamper-proofing. */
  readonly providerSignature: string;
}

/**
 * Port for payment gateway operations.
 *
 * Infrastructure adapters implement this for specific providers
 * (e.g., Razorpay, Stripe).
 */
export interface IPaymentGateway {
  /**
   * Creates a payment order on the provider.
   *
   * @param input - Order creation parameters.
   * @returns The created payment order.
   * @throws {Error} If the provider rejects the order (e.g., invalid amount).
   */
  createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder>;

  /**
   * Verifies a payment's authenticity using the provider's signature.
   *
   * @param input - Payment verification parameters.
   * @returns `true` if the payment is verified and legitimate.
   * @throws {Error} If signature verification fails.
   */
  verifyPayment(input: VerifyPaymentInput): Promise<boolean>;
}
