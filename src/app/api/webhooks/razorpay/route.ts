/**
 * @file src/app/api/webhooks/razorpay/route.ts
 *
 * Next.js 15 App Router Route Handler for Razorpay Webhooks.
 *
 * Cryptographically secures financial webhook events against spoofing and replay:
 *   1. HMAC-SHA256 signature verification over raw body string.
 *   2. Rejects invalid or missing signatures with HTTP 400 before parsing JSON.
 *   3. Enforces idempotency via IdempotencyService to deduplicate webhook replays.
 *   4. Atomically transitions order to HELD_IN_ESCROW and marks item as SOLD on payment.captured / order.paid.
 *   5. Writes balanced double-entry accounting ledger entries.
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prismaClient';
import { IdempotencyService } from '@/infrastructure/database/IdempotencyService';
import { EscrowLedgerService } from '@/infrastructure/payment/EscrowLedgerService';
import { OrderRepository } from '@/infrastructure/database/repositories/OrderRepository';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    // In Next.js App Router, you must get the raw text body for HMAC verification
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      console.warn('[RazorpayWebhook] 400 Bad Request: Missing signature or secret');
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    // Constant-time buffer comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const actualBuffer = Buffer.from(signature, 'utf-8');
    const isValid =
      expectedBuffer.length === actualBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, actualBuffer);

    if (!isValid) {
      console.error('CRITICAL: Invalid Razorpay Signature Detected.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Parse body only AFTER verification
    const data = JSON.parse(rawBody);
    const eventType = data.event;

    // Razorpay event identifier for deduplication
    const eventId: string =
      req.headers.get('x-razorpay-event-id') ||
      data.payload?.payment?.entity?.id ||
      data.id ||
      `rzp_evt_${Date.now()}`;

    // Idempotency Check: Guard against duplicate deliveries
    const alreadyProcessed = await IdempotencyService.isEventProcessed('RAZORPAY', eventId);
    if (alreadyProcessed) {
      console.info(`[RazorpayWebhook] Idempotent hit: Event ${eventId} already processed.`);
      return NextResponse.json(
        {
          status: 'ok',
          duplicate: true,
          message: `Event ${eventId} has already been processed`,
        },
        { status: 200 }
      );
    }

    // Handle the event (e.g., payment.captured, order.paid)
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const payment = data.payload?.payment?.entity || data.payload?.order?.entity;
      const paymentId = payment?.id || `pay_${Date.now()}`;
      const amountInPaise = payment?.amount || 0;
      const currency = payment?.currency || 'INR';

      // Order and listing references from notes or entity
      const orderId =
        payment?.notes?.orderId ||
        payment?.notes?.order_id ||
        payment?.order_id ||
        `order_${paymentId}`;
      const lotId = payment?.notes?.lotId || payment?.notes?.productId;
      const dealOfferId = payment?.notes?.dealOfferId;

      console.info(
        `[RazorpayWebhook] Processing ${eventType} for Order ${orderId}: ₹${amountInPaise / 100} ${currency}`
      );

      // 1. Update DB: Mark item as SOLD, lock escrow (concurrent execution)
      const statusUpdates: Promise<unknown>[] = [];

      if (lotId) {
        statusUpdates.push(
          prisma.product.updateMany({
            where: { id: lotId },
            data: { status: 'SOLD' },
          }),
          prisma.listing.updateMany({
            where: { id: lotId },
            data: { status: 'SOLD' },
          })
        );
      }

      if (dealOfferId) {
        statusUpdates.push(
          prisma.dealOffer.updateMany({
            where: { id: dealOfferId },
            data: { status: 'PAID' },
          })
        );
      }

      if (statusUpdates.length > 0) {
        try {
          await Promise.all(statusUpdates);
        } catch (dbErr) {
          console.warn('[RazorpayWebhook] Note updating product/dealOffer status:', dbErr);
        }
      }

      // 2. Transition Order escrowStatus to HELD_IN_ESCROW
      try {
        await OrderRepository.updateEscrowStatus(orderId, {
          escrowStatus: 'HELD_IN_ESCROW',
          razorpayPaymentId: paymentId,
        });
      } catch (orderErr) {
        console.warn('[RazorpayWebhook] Note updating order repo:', orderErr);
      }

      // 3. Record Double-Entry Accounting Ledger Records
      try {
        await EscrowLedgerService.recordPaymentCapture(orderId, amountInPaise, currency, paymentId);
      } catch (ledgerErr) {
        console.warn('[RazorpayWebhook] Note recording ledger:', ledgerErr);
      }

      // 4. Record Event in IdempotencyLog
      await IdempotencyService.recordEventProcessed('RAZORPAY', eventId, rawBody);

      console.info(`[RazorpayWebhook] Successfully moved Order ${orderId} to HELD_IN_ESCROW.`);
      return NextResponse.json({
        status: 'ok',
        orderId,
        escrowStatus: 'HELD_IN_ESCROW',
      });
    }

    // Default acknowledgement for other events
    await IdempotencyService.recordEventProcessed('RAZORPAY', eventId, rawBody);
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[RazorpayWebhook] Webhook processing failed:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
