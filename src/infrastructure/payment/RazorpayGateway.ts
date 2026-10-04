/**
 * @file src/infrastructure/payment/RazorpayGateway.ts
 *
 * Infrastructure adapter implementing the IPaymentGateway port using Razorpay Node SDK.
 * Isolates all Razorpay SDK interactions behind the domain-level contract.
 */

import crypto from 'crypto';
import Razorpay from 'razorpay';
import type {
  IPaymentGateway,
  CreatePaymentOrderInput,
  PaymentOrder,
  VerifyPaymentInput,
} from '@/application/ports/IPaymentGateway';

/** Razorpay credentials loaded from environment variables. */
interface RazorpayConfig {
  readonly keyId: string;
  readonly keySecret: string;
}

function loadRazorpayConfig(): RazorpayConfig {
  const keyId = (process.env['RAZORPAY_KEY_ID'] || process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'])?.trim() || 'rzp_test_TdBTiCyaOJ95KC';
  const keySecret = process.env['RAZORPAY_KEY_SECRET']?.trim() || 'u5wkPbmPedlHMnJH0a5M7FvQ';

  if (!process.env['RAZORPAY_KEY_ID']?.trim() && !process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID']?.trim()) {
    console.error('[RazorpayGateway] RAZORPAY_KEY_ID is missing from environment variables.');
  }
  if (!process.env['RAZORPAY_KEY_SECRET']?.trim()) {
    console.error('[RazorpayGateway] RAZORPAY_KEY_SECRET is missing from environment variables.');
  }

  return { keyId, keySecret };
}

export class RazorpayGateway implements IPaymentGateway {
  private readonly config: RazorpayConfig;
  private readonly razorpay: Razorpay;

  constructor() {
    this.config = loadRazorpayConfig();
    this.razorpay = new Razorpay({
      key_id: this.config.keyId,
      key_secret: this.config.keySecret,
    });
  }

  /**
   * {@inheritDoc IPaymentGateway.createOrder}
   */
  async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> {
    const amountInPaise = Math.round(Number(input.amountInSmallestUnit));

    const order = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: input.currency || 'INR',
      receipt: input.referenceId,
      notes: input.notes,
    });

    return {
      providerOrderId: order.id,
      amountInSmallestUnit: Number(order.amount),
      currency: (order.currency as import('@/domain/types').CurrencyCode) || input.currency || 'INR',
      status: (order.status as PaymentOrder['status']) || 'created',
    };
  }

  /**
   * {@inheritDoc IPaymentGateway.verifyPayment}
   */
  async verifyPayment(input: VerifyPaymentInput): Promise<boolean> {
    const payload = `${input.providerOrderId}|${input.providerPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.config.keySecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature.length !== input.providerSignature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(input.providerSignature)
    );
  }
}
