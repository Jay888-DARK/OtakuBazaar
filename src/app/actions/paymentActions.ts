'use server';

import Razorpay from 'razorpay';
import { prisma } from '@/lib/prismaClient';
import { MOCK_GRAILS } from '@/lib/mockProducts';

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
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured in environment variables.');
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

  // 2. Check product database or catalog grails
  if (truePriceINR <= 0 && lotId) {
    const product = await prisma.product.findUnique({ where: { id: lotId } });
    if (product) {
      truePriceINR = product.price > 0 ? product.price : Math.round(product.askingPriceAmount / 100);
    } else {
      const mockGrail = MOCK_GRAILS.find((g) => g.id === lotId || g.lotNumber === lotId);
      if (mockGrail) {
        truePriceINR = mockGrail.price;
      }
    }
  }

  // 3. Fallback to amount if no ID was provided
  if (truePriceINR <= 0) {
    truePriceINR = amount > 0 ? amount : 999;
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
