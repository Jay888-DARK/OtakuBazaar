/**
 * @file src/app/api/checkout/razorpay/verify/route.ts
 *
 * Server-side payment signature verification upon Razorpay checkout completion.
 * Validates HMAC-SHA256 signature, updates order status to HELD_IN_ESCROW,
 * and performs Silent Account Provisioning with secure authentication cookies.
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prismaClient';
import { OrderRepository } from '@/infrastructure/database/repositories/OrderRepository';
import { EscrowLedgerService } from '@/infrastructure/payment/EscrowLedgerService';
import { TokenService } from '@/infrastructure/security/TokenService';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const orderId = body.razorpay_order_id || body.orderId;
    const paymentId = body.razorpay_payment_id || body.paymentId;
    const signature = body.razorpay_signature || body.signature;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'u5wkPbmPedlHMnJH0a5M7FvQ';

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: order_id, payment_id, signature' },
        { status: 400 }
      );
    }

    const payload = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    const isValid =
      generatedSignature.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(signature));

    if (!isValid) {
      console.error('[Razorpay Verify] Invalid signature detected.');
      return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
    }

    // Update product & listing statuses in database
    const targetId = body.lotId || body.productId;
    if (targetId) {
      try {
        await Promise.allSettled([
          prisma.product.updateMany({ where: { id: targetId }, data: { status: 'SOLD' } }),
          prisma.listing.updateMany({ where: { id: targetId }, data: { status: 'SOLD' } }),
        ]);
      } catch (dbErr) {
        console.warn('[Razorpay Verify] DB update note:', dbErr);
      }
    }

    if (body.dealOfferId) {
      try {
        await prisma.dealOffer.updateMany({
          where: { id: body.dealOfferId },
          data: { status: 'PAID' },
        });
      } catch (offerErr) {
        console.warn('[Razorpay Verify] Deal offer update note:', offerErr);
      }
    }

    // Update order repository escrowStatus to HELD_IN_ESCROW
    try {
      await OrderRepository.updateEscrowStatus(orderId, {
        escrowStatus: 'HELD_IN_ESCROW',
        razorpayPaymentId: paymentId,
      });
    } catch (orderErr) {
      console.warn('[Razorpay Verify] Order repository update note:', orderErr);
    }

    // Record in double-entry accounting ledger
    try {
      const amountPaise = body.amount ? Math.round(Number(body.amount)) : 0;
      await EscrowLedgerService.recordPaymentCapture(orderId, amountPaise, 'INR', paymentId);
    } catch (ledgerErr) {
      console.warn('[Razorpay Verify] Ledger update note:', ledgerErr);
    }

    // Silent Account Provisioning:
    // Automatically provision user profile tied to buyer's phone and email
    const buyerPhone = body.phone || body.contact;
    const buyerName = body.name || 'Verified Collector';
    const buyerEmail = body.email || (buyerPhone ? `${String(buyerPhone).replace(/\D/g, '')}@buyer.otakubazaar.dev` : `collector_${Date.now()}@buyer.otakubazaar.dev`);

    let provisionedUser = null;
    try {
      provisionedUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(buyerEmail ? [{ email: buyerEmail }] : []),
            ...(buyerPhone ? [{ verifiedUpiVpa: buyerPhone }] : []),
          ],
        },
      });

      if (!provisionedUser) {
        provisionedUser = await prisma.user.create({
          data: {
            email: buyerEmail,
            name: buyerName,
            displayName: buyerName,
            verifiedUpiVpa: buyerPhone || null,
            totalPurchases: 1,
          },
        });
      } else {
        provisionedUser = await prisma.user.update({
          where: { id: provisionedUser.id },
          data: {
            totalPurchases: { increment: 1 },
            ...(buyerPhone && !provisionedUser.verifiedUpiVpa ? { verifiedUpiVpa: buyerPhone } : {}),
            ...(buyerName && !provisionedUser.name ? { name: buyerName } : {}),
          },
        });
      }
    } catch (provisionErr) {
      console.warn('[Razorpay Verify] Silent user provisioning notice:', provisionErr);
    }

    const response = NextResponse.json({
      success: true,
      status: 'verified',
      escrowStatus: 'HELD_IN_ESCROW',
      orderId,
      paymentId,
      provisionedUser: provisionedUser ? { id: provisionedUser.id, name: provisionedUser.name } : null,
    });

    // Set secure authentication cookie for subsequent visits
    if (provisionedUser) {
      const token = TokenService.signToken({
        userId: provisionedUser.id,
        email: provisionedUser.email || buyerEmail,
        name: provisionedUser.name || buyerName,
        role: 'BUYER',
      });

      const cookieOpts = TokenService.getSessionCookieOptions(token);
      response.cookies.set(cookieOpts.name, cookieOpts.value, {
        httpOnly: cookieOpts.httpOnly,
        secure: cookieOpts.secure,
        sameSite: cookieOpts.sameSite,
        path: cookieOpts.path,
        maxAge: cookieOpts.maxAge,
      });
    }

    // Store saved delivery profile cookie so subsequent visits bypass form input
    if (buyerName || buyerPhone || body.address || body.pinCode) {
      const deliveryData = JSON.stringify({
        name: buyerName,
        phone: buyerPhone,
        address: body.address || '',
        pinCode: body.pinCode || '',
      });

      response.cookies.set('otaku_saved_delivery', encodeURIComponent(deliveryData), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch (error: any) {
    console.error('[API /api/checkout/razorpay/verify] Verification failed:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error during signature verification' },
      { status: 500 }
    );
  }
}
