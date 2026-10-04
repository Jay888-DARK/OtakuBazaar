/**
 * @file src/app/api/checkout/razorpay/route.ts
 *
 * Backend API route for Razorpay Order Creation and Signature Verification.
 * Enforces Server-Side Price Authority and strict integer paise calculations.
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prismaClient';
import { MOCK_PRODUCTS } from '@/infrastructure/data/mockProducts';
import { MOCK_GRAILS } from '@/lib/mockProducts';
import { OrderRepository } from '@/infrastructure/database/repositories/OrderRepository';
import { EscrowLedgerService } from '@/infrastructure/payment/EscrowLedgerService';

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID?.trim() || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();

  // Validation: If either key is undefined or missing, log a descriptive error to console before executing new Razorpay
  if (!key_id) {
    console.error(
      '[Razorpay Authentication Error] RAZORPAY_KEY_ID is undefined or missing in environment variables. ' +
      'Check that RAZORPAY_KEY_ID or NEXT_PUBLIC_RAZORPAY_KEY_ID is properly configured.'
    );
  }
  if (!key_secret) {
    console.error(
      '[Razorpay Authentication Error] RAZORPAY_KEY_SECRET is undefined or missing in environment variables. ' +
      'Check that RAZORPAY_KEY_SECRET is properly configured.'
    );
  }

  // Key mode check (test vs live)
  if (key_id) {
    const isTestKey = key_id.startsWith('rzp_test_');
    const isLiveKey = key_id.startsWith('rzp_live_');
    if (!isTestKey && !isLiveKey) {
      console.warn(`[Razorpay Configuration] Unrecognized Razorpay key format: ${key_id.substring(0, 8)}...`);
    }
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID?.trim(),
    key_secret: process.env.RAZORPAY_KEY_SECRET?.trim(),
  });

  return {
    key_id: key_id || '',
    key_secret: key_secret || '',
    client: razorpay,
  };
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const { key_id, key_secret, client: razorpay } = getRazorpayClient();

    // 1. Check if this is a payment verification action
    if (body.action === 'verify' || (body.razorpay_signature && body.razorpay_payment_id)) {
      const orderId = body.razorpay_order_id || body.orderId;
      const paymentId = body.razorpay_payment_id || body.paymentId;
      const signature = body.razorpay_signature || body.signature;
      const trimmedSecret = (process.env.RAZORPAY_KEY_SECRET?.trim() || key_secret?.trim());

      if (!trimmedSecret) {
        console.error('[Razorpay Verification] RAZORPAY_KEY_SECRET is undefined or missing.');
        return NextResponse.json(
          { error: 'Server configuration error: RAZORPAY_KEY_SECRET is missing or empty.' },
          { status: 500 }
        );
      }

      if (!orderId || !paymentId || !signature) {
        return NextResponse.json(
          { error: 'Missing required parameters for verification (order_id, payment_id, signature)' },
          { status: 400 }
        );
      }

      const generatedSignature = crypto
        .createHmac('sha256', trimmedSecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid =
        generatedSignature.length === signature.length &&
        crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(signature));

      if (!isValid) {
        console.error(
          `[Razorpay Verification] Invalid signature detected. Payload: "${orderId}|${paymentId}", Expected: "${generatedSignature}", Received: "${signature}"`
        );
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
      }

      // Update Database & Escrow Status upon verified completion
      const targetId = body.lotId || body.productId;
      if (targetId) {
        try {
          await Promise.allSettled([
            prisma.product.updateMany({ where: { id: targetId }, data: { status: 'SOLD' } }),
            prisma.listing.updateMany({ where: { id: targetId }, data: { status: 'SOLD' } }),
          ]);
        } catch (dbErr) {
          console.warn('[Razorpay Verification] DB update notice:', dbErr);
        }
      }

      if (body.dealOfferId) {
        try {
          await prisma.dealOffer.updateMany({
            where: { id: body.dealOfferId },
            data: { status: 'PAID' },
          });
        } catch (offerErr) {
          console.warn('[Razorpay Verification] Deal offer update notice:', offerErr);
        }
      }

      // Wrap the database update (Prisma Order.update) in a dedicated try/catch block returning explicit 500 if it fails
      try {
        const orderRecord = await prisma.order.findFirst({
          where: {
            OR: [
              { id: orderId },
              { razorpayOrderId: orderId },
              { razorpayPaymentId: paymentId },
            ],
          },
        });

        if (orderRecord) {
          await prisma.order.update({
            where: { id: orderRecord.id },
            data: {
              status: 'ESCROW_LOCKED',
              escrowStatus: 'HELD_IN_ESCROW',
              razorpayPaymentId: paymentId,
            },
          });
        } else {
          await OrderRepository.updateEscrowStatus(orderId, {
            escrowStatus: 'HELD_IN_ESCROW',
            razorpayPaymentId: paymentId,
          });
        }
      } catch (orderErr: any) {
        console.error('[Razorpay Verification] Database Order.update failure:', orderErr);
        return NextResponse.json(
          {
            error: `Database update failed (Prisma Order.update): ${orderErr?.message || 'Database write error'}`,
            details: String(orderErr),
            orderId,
            paymentId,
          },
          { status: 500 }
        );
      }

      try {
        const amountPaise = body.amount ? Math.round(Number(body.amount)) : 0;
        await EscrowLedgerService.recordPaymentCapture(orderId, amountPaise, 'INR', paymentId);
      } catch (ledgerErr) {
        console.warn('[Razorpay Verification] Ledger notice:', ledgerErr);
      }

      return NextResponse.json({
        success: true,
        status: 'verified',
        escrowStatus: 'HELD_IN_ESCROW',
        orderId,
        paymentId,
      });
    }

    // 2. Order Creation
    const { price, amount, productId, lotId, dealOfferId, receipt } = body;
    const targetLotId = productId || lotId;

    let authoritativePriceINR = 0;
    let itemTitle = 'OtakuBazaar Authentic Collectible';

    // A. Check deal offer if applicable
    if (dealOfferId) {
      try {
        const dealOffer = await prisma.dealOffer.findUnique({
          where: { id: dealOfferId },
          include: { product: true },
        });
        if (dealOffer) {
          if (dealOffer.status !== 'ACCEPTED') {
            return NextResponse.json(
              { error: 'Escrow payment locked: Offer has not been accepted by seller.' },
              { status: 403 }
            );
          }
          authoritativePriceINR = dealOffer.offeredPrice;
          if (dealOffer.product?.title) {
            itemTitle = dealOffer.product.title;
          }
        }
      } catch (err) {
        console.warn('[Razorpay Order] Deal offer lookup notice:', err);
      }
    }

    // B. Check product in database if ID provided
    if (authoritativePriceINR <= 0 && targetLotId) {
      try {
        const [dbProduct, dbListing] = await Promise.all([
          prisma.product.findUnique({ where: { id: targetLotId } }),
          prisma.listing.findUnique({ where: { id: targetLotId } }),
        ]);

        if (dbProduct) {
          authoritativePriceINR = dbProduct.price > 0 ? dbProduct.price : Math.round(dbProduct.askingPriceAmount / 100);
          itemTitle = dbProduct.title;
        } else if (dbListing) {
          authoritativePriceINR = Math.round(dbListing.askingPriceAmount / 100);
          itemTitle = dbListing.title;
        }
      } catch (err) {
        console.warn('[Razorpay Order] DB product lookup notice:', err);
      }

      // Fallback to catalog data
      if (authoritativePriceINR <= 0) {
        const mockProduct = MOCK_PRODUCTS.find((p) => p.id === targetLotId || p.lotNumber === targetLotId);
        if (mockProduct) {
          authoritativePriceINR = mockProduct.price;
          itemTitle = mockProduct.title;
        } else {
          const mockGrail = MOCK_GRAILS.find((g) => g.id === targetLotId || g.lotNumber === targetLotId);
          if (mockGrail) {
            authoritativePriceINR = mockGrail.price;
            itemTitle = mockGrail.title;
          }
        }
      }
    }

    // C. Fallback to client-provided price or amount if no entity ID resolved
    if (authoritativePriceINR <= 0) {
      const rawPrice = price ?? amount;
      const cleanPrice = typeof rawPrice === 'string'
        ? rawPrice.replace(/,/g, '').replace(/₹/g, '').trim()
        : rawPrice;
      const numericPrice = Number(cleanPrice);
      if (!isNaN(numericPrice) && numericPrice > 0) {
        authoritativePriceINR = numericPrice;
      } else {
        authoritativePriceINR = 999;
      }
    }

    // STRICT REQUIREMENT: Amount passed to Razorpay is strictly an integer in paise: Math.round(Number(price) * 100)
    // Do not send decimals or uncalculated rupee values.
    const amountInPaise = Math.round(Number(authoritativePriceINR) * 100);

    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
      return NextResponse.json({ error: 'Calculated amount in paise must be a positive integer.' }, { status: 400 });
    }

    const orderOptions = {
      amount: amountInPaise, // STRICTLY integer in paise
      currency: 'INR',
      receipt: receipt || `rcpt_${targetLotId || 'direct'}_${Date.now()}`,
      notes: {
        productId: targetLotId || '',
        lotId: targetLotId || '',
        dealOfferId: dealOfferId || '',
        itemTitle,
        priceINR: String(authoritativePriceINR),
      },
    };

    let order;
    try {
      order = await razorpay.orders.create(orderOptions);
    } catch (orderError: any) {
      console.error('[Razorpay Order Creation Error]:', orderError);
      const errorMessage =
        orderError?.error?.description ||
        orderError?.description ||
        orderError?.message ||
        (typeof orderError === 'string' ? orderError : 'Razorpay order creation failed.');
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json({
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id,
      notes: order.notes,
      receipt: order.receipt,
    });
  } catch (error: any) {
    console.error('[API /api/checkout/razorpay] Error:', error);
    const errorMessage =
      error?.error?.description ||
      error?.description ||
      error?.message ||
      'Internal Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
