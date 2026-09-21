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

import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prismaClient';
import { MOCK_GRAILS } from '@/lib/mockProducts';

// Initialize Razorpay SDK with environment secrets
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_TdBTiCyaOJ95KC',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'u5wkPbmPedlHMnJH0a5M7FvQ',
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    // Explicitly reject or ignore any client-supplied amount to enforce Server Authority
    const { lotId, productId, dealOfferId } = body;
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

      // 1B. Fallback to verified catalog grails if not found in dynamic database tables
      if (truePriceINR <= 0) {
        const mockGrail = MOCK_GRAILS.find(
          (g) => g.id === targetLotId || g.lotNumber === targetLotId
        );
        if (mockGrail) {
          truePriceINR = mockGrail.price;
          itemTitle = mockGrail.title;
        }
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

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error('[API /api/orders] Escrow initialization failed:', error);
    return NextResponse.json({ error: 'Escrow initialization failed' }, { status: 500 });
  }
}
