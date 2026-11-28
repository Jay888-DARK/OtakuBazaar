/**
 * @file src/app/api/orders/route.ts
 *
 * Next.js 15 Server-Side Price Authority Route Handler for Razorpay Orders.
 *
 * CRITICAL SECURITY DIRECTIVE:
 * Never trust client-side price payloads. The client must only transmit
 * identifier references (`lotId`, `productId`, `dealOfferId`).
 * The authoritative financial amount is resolved strictly server-side from
 * the SQLite/Postgres database or verified catalog models.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prismaClient';
import { RateLimiter } from '@/infrastructure/security/RateLimiter';
import { RBACGuard } from '@/infrastructure/security/RBACGuard';
import { isPaymentsEnabled, PAYMENTS_COMING_SOON_MESSAGE } from '@/infrastructure/payment/paymentConfig';

const CreateOrderSchema = z.object({
  lotId: z.string().trim().max(100).optional(),
  productId: z.string().trim().max(100).optional(),
  dealOfferId: z.string().trim().max(100).optional(),
});

function getRazorpayClient(): Razorpay {
  const key_id = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)?.trim() || '';
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim() || '';

  if (!key_id || !key_secret) {
    throw new Error('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in environment variables.');
  }

  if (key_id.startsWith('rzp_live_') && process.env.ALLOW_LIVE_RAZORPAY !== 'true') {
    throw new Error('Live Razorpay keys (rzp_live_) are blocked until live payments are approved.');
  }

  return new Razorpay({ key_id, key_secret });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!isPaymentsEnabled()) {
    return NextResponse.json(
      { error: PAYMENTS_COMING_SOON_MESSAGE, paymentsEnabled: false },
      { status: 503 }
    );
  }

  const authResult = await RBACGuard.requireAuthAsync(req);
  if (!authResult.success) {
    return authResult.response;
  }

  // 1. Rate Limiting Protection (Checkout order creation)
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const rateLimit = RateLimiter.check(`order_create_${clientIp}`, 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
      { status: 429 }
    );
  }

  try {
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const parseResult = CreateOrderSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid order parameters', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { lotId, productId, dealOfferId } = parseResult.data;
    const targetLotId = lotId || productId;

    if (!targetLotId && !dealOfferId) {
      return NextResponse.json(
        { error: 'Invalid request: lotId, productId, or dealOfferId is required.' },
        { status: 400 }
      );
    }

    let truePriceINR = 0;
    let itemTitle = 'OtakuBazaar Authentic Collectible';

    // 1. CRITICAL: Fetch true price from database, NOT client request
    if (dealOfferId) {
      // Look up accepted deal offer in database
      const dealOffer = await prisma.dealOffer.findUnique({
        where: { id: dealOfferId },
        include: { product: true },
      });

      if (!dealOffer) {
        return NextResponse.json({ error: 'Deal offer not found' }, { status: 404 });
      }

      // Security check: Offer must be in ACCEPTED state
      if (dealOffer.status !== 'ACCEPTED') {
        return NextResponse.json(
          { error: 'Escrow payment locked: Offer has not been accepted by seller.' },
          { status: 403 }
        );
      }

      truePriceINR = dealOffer.offeredPrice;
      if (dealOffer.product?.title) {
        itemTitle = dealOffer.product.title;
      }
    } else if (targetLotId) {
      // 1A. Attempt parallel database query for product or listing
      const [dbProduct, dbListing] = await Promise.all([
        prisma.product.findUnique({ where: { id: targetLotId } }),
        prisma.listing.findUnique({ where: { id: targetLotId } }),
      ]);

      if (dbProduct) {
        truePriceINR = dbProduct.price > 0 ? dbProduct.price : Math.round(dbProduct.askingPriceAmount / 100);
        itemTitle = dbProduct.title;
      } else if (dbListing) {
        truePriceINR = Math.round(dbListing.askingPriceAmount / 100);
        itemTitle = dbListing.title;
      }
    }

    // Default fallback if item exists but price not resolved
    if (truePriceINR <= 0) {
      return NextResponse.json({ error: 'Item not found or invalid valuation' }, { status: 404 });
    }

    // 2. Format for Razorpay (Paise)
    const amountInPaise = Math.round(truePriceINR * 100);

    // 3. Create order with Razorpay
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_order_${targetLotId || dealOfferId}_${Date.now()}`,
      notes: {
        lotId: targetLotId || '',
        dealOfferId: dealOfferId || '',
        itemTitle,
        serverAuthorizedPrice: String(truePriceINR),
      },
    };

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof Error && error.message.includes('rzp_live_')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('[API /api/orders] Escrow initialization failed:', error);
    return NextResponse.json({ error: 'Escrow initialization failed' }, { status: 500 });
  }
}
