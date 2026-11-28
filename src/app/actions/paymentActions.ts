'use server';

import Razorpay from 'razorpay';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prismaClient';
import { isPaymentsEnabled, PAYMENTS_COMING_SOON_MESSAGE } from '@/infrastructure/payment/paymentConfig';

/**
 * Creates a Razorpay Order on the server enforcing Server-Side Price Authority.
 * Never blindly trusts client-provided amounts if an item or offer ID is available.
 *
 * @param amount - Fallback amount in INR.
 * @param receiptId - The unique receipt identifier for the transaction.
 * @param lotId - Optional Lot or Product ID for database lookup.
 * @param dealOfferId - Optional Deal Offer ID for negotiated offer price lookup.
 * @returns The generated Razorpay order ID string.
 */
export async function createRazorpayOrder(
  amount: number,
  receiptId: string,
  lotId?: string,
  dealOfferId?: string
): Promise<string> {
  if (!isPaymentsEnabled()) {
    throw new Error(PAYMENTS_COMING_SOON_MESSAGE);
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    throw new Error('401 Unauthorized: Please sign in to initiate payment.');
  }

  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    console.error(
      `[paymentActions] Missing Razorpay credentials: keyId=${keyId ? 'present' : 'MISSING'}, ` +
      `keySecret=${keySecret ? 'present' : 'MISSING'}.`
    );
    throw new Error('Razorpay credentials are not configured in environment variables.');
  }

  if (keyId.startsWith('rzp_live_') && process.env.ALLOW_LIVE_RAZORPAY !== 'true') {
    throw new Error('Live Razorpay keys (rzp_live_) are blocked until live payments are approved.');
  }

  let truePriceINR = 0;

  // 1. Check deal offer if applicable
  if (dealOfferId) {
    const dealOffer = await prisma.dealOffer.findUnique({
      where: { id: dealOfferId },
    });
    if (dealOffer && dealOffer.status === 'ACCEPTED') {
      truePriceINR = dealOffer.offeredPrice;
    }
  }

  // 2. Check product database or active listings
  if (truePriceINR <= 0 && lotId) {
    const product = await prisma.product.findUnique({ where: { id: lotId } });
    if (product) {
      truePriceINR = product.price > 0 ? product.price : Math.round(product.askingPriceAmount / 100);
    } else {
      const listing = await prisma.listing.findUnique({ where: { id: lotId } });
      if (listing) {
        truePriceINR = Math.round(listing.askingPriceAmount / 100);
      }
    }
  }

  // 3. Reject if no authoritative server-side price could be resolved
  if (truePriceINR <= 0) {
    throw new Error('Unable to resolve authoritative item or deal price on the server.');
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const order = await razorpay.orders.create({
    amount: Math.round(truePriceINR * 100), // amount in paise
    currency: 'INR',
    receipt: receiptId,
  });

  if (!order || !order.id) {
    throw new Error('Failed to generate Razorpay order ID.');
  }

  return order.id;
}
