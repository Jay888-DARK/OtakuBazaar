/**
 * @file src/infrastructure/payment/RazorpayGateway.ts
 *
 * Infrastructure adapter implementing the IPaymentGateway port using Razorpay.
 * Isolates all Razorpay SDK interactions behind the domain-level contract.
 *
 * NOTE: This is a structural stub. Replace the TODO blocks with actual
 * Razorpay SDK calls (`razorpay` npm package) when integrating.
 */

import type {
  IPaymentGateway,
  CreatePaymentOrderInput,
  PaymentOrder,
  VerifyPaymentInput,
} from '@/application/ports/IPaymentGateway';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Razorpay credentials loaded from environment variables. */
interface RazorpayConfig {
  readonly keyId: string;
  readonly keySecret: string;
}

/**
 * Loads Razorpay configuration from environment variables.
 *
 * @returns The Razorpay configuration.
 * @throws {Error} If required environment variables are missing.
 */
function loadRazorpayConfig(): RazorpayConfig {
  const keyId = process.env['RAZORPAY_KEY_ID'];
  const keySecret = process.env['RAZORPAY_KEY_SECRET'];

  if (!keyId || !keySecret) {
    throw new Error(
      'Missing Razorpay credentials: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set'
    );
  }

  return { keyId, keySecret };
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

/**
 * Razorpay implementation of the {@link IPaymentGateway} port.
 *
 * In production, instantiate this with the Razorpay SDK:
 * ```ts
 * import Razorpay from 'razorpay';
 * const instance = new Razorpay({ key_id: config.keyId, key_secret: config.keySecret });
 * ```
 */
export class RazorpayGateway implements IPaymentGateway {
  private readonly config: RazorpayConfig;

  constructor() {
    this.config = loadRazorpayConfig();
  }

  /**
   * {@inheritDoc IPaymentGateway.createOrder}
   *
   * @example
   * ```ts
   * const order = await gateway.createOrder({
   *   amountInSmallestUnit: 49999,
   *   currency: 'INR',
   *   referenceId: 'listing_abc123',
   * });
   * ```
   */
  async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> {
    // TODO: Replace with actual Razorpay SDK call:
    // const order = await this.razorpay.orders.create({
    //   amount: input.amountInSmallestUnit,
    //   currency: input.currency,
    //   receipt: input.referenceId,
    //   notes: input.notes,
    // });

    void this.config; // Acknowledge config usage for strict TS

    return {
      providerOrderId: `order_stub_${Date.now()}`,
      amountInSmallestUnit: input.amountInSmallestUnit,
      currency: input.currency,
      status: 'created',
    };
  }

  /**
   * {@inheritDoc IPaymentGateway.verifyPayment}
   */
  async verifyPayment(input: VerifyPaymentInput): Promise<boolean> {
    // TODO: Replace with Razorpay signature verification:
    // const body = input.providerOrderId + '|' + input.providerPaymentId;
    // const expectedSignature = crypto
    //   .createHmac('sha256', this.config.keySecret)
    //   .update(body)
    //   .digest('hex');
    // return expectedSignature === input.providerSignature;

    void input; // Acknowledge input for strict TS
    return true;
  }
}
