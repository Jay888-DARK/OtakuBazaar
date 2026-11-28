import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { encode } from 'next-auth/jwt';
import { POST as courierWebhook } from '../app/api/webhooks/courier/route';
import { POST as razorpayWebhook } from '../app/api/webhooks/razorpay/route';
import { POST as razorpayCheckout } from '../app/api/checkout/razorpay/route';
import { POST as razorpayVerify } from '../app/api/checkout/razorpay/verify/route';
import { POST as ordersPost } from '../app/api/orders/route';
import { GET as paymentsStatusGet } from '../app/api/payments/status/route';
import { IdempotencyService } from '../infrastructure/database/IdempotencyService';
import { OrderRepository } from '../infrastructure/database/repositories/OrderRepository';
import { EscrowLedgerService } from '../infrastructure/payment/EscrowLedgerService';
import { prisma } from '../infrastructure/database/prismaClient';

test('Courier webhook (/api/webhooks/courier): verifies x-api-key against SHIPROCKET_WEBHOOK_SECRET', async () => {
  const prevSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  process.env.SHIPROCKET_WEBHOOK_SECRET = 'courier-webhook-secret-test';

  const origIsProcessed = IdempotencyService.isEventProcessed;
  const origRecordProcessed = IdempotencyService.recordEventProcessed;
  const origUpdateEscrow = OrderRepository.updateEscrowStatus;

  let updatedOrderId = '';
  (IdempotencyService as any).isEventProcessed = async () => false;
  (IdempotencyService as any).recordEventProcessed = async () => {};
  (OrderRepository as any).updateEscrowStatus = async (orderId: string) => {
    updatedOrderId = orderId;
  };

  try {
    const payload = JSON.stringify({
      channel_order_id: 'order_internal_123',
      order_id: 987654,
      awb_code: 'AWB123456',
      current_status: 'DELIVERED',
    });

    const badReq = new NextRequest('https://otakubazaar.jaybhatt.me/api/webhooks/courier', {
      method: 'POST',
      headers: { 'x-api-key': 'wrong-secret' },
      body: payload,
    });
    const badRes = await courierWebhook(badReq);
    assert.equal(badRes.status, 401);

    const goodReq = new NextRequest('https://otakubazaar.jaybhatt.me/api/webhooks/courier', {
      method: 'POST',
      headers: { 'x-api-key': 'courier-webhook-secret-test' },
      body: payload,
    });
    const goodRes = await courierWebhook(goodReq);
    const goodJson = await goodRes.json();
    assert.equal(goodRes.status, 200);
    assert.equal(goodJson.orderId, 'order_internal_123');
    assert.equal(updatedOrderId, 'order_internal_123');
  } finally {
    (IdempotencyService as any).isEventProcessed = origIsProcessed;
    (IdempotencyService as any).recordEventProcessed = origRecordProcessed;
    (OrderRepository as any).updateEscrowStatus = origUpdateEscrow;
    if (prevSecret !== undefined) process.env.SHIPROCKET_WEBHOOK_SECRET = prevSecret;
    else delete process.env.SHIPROCKET_WEBHOOK_SECRET;
  }
});

test('Razorpay: blocks rzp_live_ keys until approved and rejects client-supplied price fallback', async () => {
  process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-32-chars-minimum';
  const prevKeyId = process.env.RAZORPAY_KEY_ID;
  const prevKeySecret = process.env.RAZORPAY_KEY_SECRET;
  const prevAllowLive = process.env.ALLOW_LIVE_RAZORPAY;
  const prevPaymentsEnabled = process.env.PAYMENTS_ENABLED;

  const userJwt = await encode({
    token: { sub: 'google_buyer_1', role: 'BUYER', email: 'buyer@example.com' },
    secret: process.env.NEXTAUTH_SECRET,
  });

  try {
    process.env.PAYMENTS_ENABLED = 'true';
    // 1. Live key blocked
    process.env.RAZORPAY_KEY_ID = 'rzp_live_blocked_key';
    process.env.RAZORPAY_KEY_SECRET = 'live_secret_dummy';
    delete process.env.ALLOW_LIVE_RAZORPAY;

    const liveCheckoutReq = new NextRequest('https://otakubazaar.jaybhatt.me/api/checkout/razorpay', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `next-auth.session-token=${userJwt}`,
      },
      body: JSON.stringify({ productId: 'lot_1' }),
    });
    const liveCheckoutRes = await razorpayCheckout(liveCheckoutReq);
    assert.equal(liveCheckoutRes.status, 500);
    const liveCheckoutJson = await liveCheckoutRes.json();
    assert.ok(String(liveCheckoutJson.error).includes('rzp_live_'));

    const liveOrdersReq = new NextRequest('https://otakubazaar.jaybhatt.me/api/orders', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `next-auth.session-token=${userJwt}`,
      },
      body: JSON.stringify({ lotId: 'lot_1' }),
    });
    const origListingFind = prisma.listing.findUnique;
    const origProductFind = prisma.product.findUnique;
    (prisma.product as any).findUnique = async () => null;
    (prisma.listing as any).findUnique = async () => ({
      id: 'lot_1',
      title: 'Test Figure',
      askingPriceAmount: 500000,
    });
    try {
      const liveOrdersRes = await ordersPost(liveOrdersReq);
      assert.equal(liveOrdersRes.status, 403);
      const liveOrdersJson = await liveOrdersRes.json();
      assert.ok(String(liveOrdersJson.error).includes('rzp_live_'));
    } finally {
      (prisma.listing as any).findUnique = origListingFind;
      (prisma.product as any).findUnique = origProductFind;
    }

    // 2. Test key rejects client-only price when no DB item resolves
    process.env.RAZORPAY_KEY_ID = 'rzp_test_allowed_key';
    process.env.RAZORPAY_KEY_SECRET = 'test_secret_dummy';
    const clientPriceReq = new NextRequest('https://otakubazaar.jaybhatt.me/api/checkout/razorpay', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `next-auth.session-token=${userJwt}`,
      },
      body: JSON.stringify({ price: 1, amount: 1 }),
    });
    const clientPriceRes = await razorpayCheckout(clientPriceReq);
    assert.equal(clientPriceRes.status, 400);
  } finally {
    if (prevKeyId !== undefined) process.env.RAZORPAY_KEY_ID = prevKeyId;
    else delete process.env.RAZORPAY_KEY_ID;
    if (prevKeySecret !== undefined) process.env.RAZORPAY_KEY_SECRET = prevKeySecret;
    else delete process.env.RAZORPAY_KEY_SECRET;
    if (prevAllowLive !== undefined) process.env.ALLOW_LIVE_RAZORPAY = prevAllowLive;
    else delete process.env.ALLOW_LIVE_RAZORPAY;
    if (prevPaymentsEnabled !== undefined) process.env.PAYMENTS_ENABLED = prevPaymentsEnabled;
    else delete process.env.PAYMENTS_ENABLED;
  }
});

test('Razorpay webhook: payment.captured and order.paid do not duplicate orders or ledger entries', async () => {
  const prevSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = 'rzp-webhook-secret-test';

  const origIsProcessed = IdempotencyService.isEventProcessed;
  const origRecordProcessed = IdempotencyService.recordEventProcessed;
  const origUpdateEscrow = OrderRepository.updateEscrowStatus;
  const origRecordLedger = EscrowLedgerService.recordPaymentCapture;
  const origOrderFindFirst = prisma.order.findFirst;
  const origOrderUpdate = prisma.order.update;
  const origOrderCreate = prisma.order.create;

  const processedEvents = new Set<string>();
  let ledgerCount = 0;
  let createCount = 0;

  (IdempotencyService as any).isEventProcessed = async (_p: string, id: string) => processedEvents.has(id);
  (IdempotencyService as any).recordEventProcessed = async (_p: string, id: string) => {
    processedEvents.add(id);
  };
  (OrderRepository as any).updateEscrowStatus = async () => {};
  (EscrowLedgerService as any).recordPaymentCapture = async () => {
    ledgerCount += 1;
  };
  (prisma.order as any).findFirst = async () => ({
    id: 'order_rzp_1',
    status: 'ESCROW_LOCKED',
    escrowStatus: 'HELD_IN_ESCROW',
    userId: 'buyer_1',
    itemLotRef: 'lot_1',
  });
  (prisma.order as any).update = async () => ({ id: 'order_rzp_1' });
  (prisma.order as any).create = async () => {
    createCount += 1;
    return { id: 'order_rzp_1' };
  };

  try {
    const body = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_123',
            order_id: 'order_rzp_1',
            amount: 500000,
            currency: 'INR',
          },
        },
      },
    });
    const sig = crypto.createHmac('sha256', 'rzp-webhook-secret-test').update(body).digest('hex');

    const res1 = await razorpayWebhook(
      new Request('https://otakubazaar.jaybhatt.me/api/webhooks/razorpay', {
        method: 'POST',
        headers: { 'x-razorpay-signature': sig, 'x-razorpay-event-id': 'evt_1' },
        body,
      })
    );
    assert.equal(res1.status, 200);

    // Repeat identical event
    const res2 = await razorpayWebhook(
      new Request('https://otakubazaar.jaybhatt.me/api/webhooks/razorpay', {
        method: 'POST',
        headers: { 'x-razorpay-signature': sig, 'x-razorpay-event-id': 'evt_1' },
        body,
      })
    );
    const json2 = await res2.json();
    assert.equal(res2.status, 200);
    assert.equal(json2.duplicate, true);
    assert.equal(createCount, 0);
    assert.equal(ledgerCount, 0);
  } finally {
    (IdempotencyService as any).isEventProcessed = origIsProcessed;
    (IdempotencyService as any).recordEventProcessed = origRecordProcessed;
    (OrderRepository as any).updateEscrowStatus = origUpdateEscrow;
    (EscrowLedgerService as any).recordPaymentCapture = origRecordLedger;
    (prisma.order as any).findFirst = origOrderFindFirst;
    (prisma.order as any).update = origOrderUpdate;
    (prisma.order as any).create = origOrderCreate;
    if (prevSecret !== undefined) process.env.RAZORPAY_WEBHOOK_SECRET = prevSecret;
    else delete process.env.RAZORPAY_WEBHOOK_SECRET;
  }
});

test('PAYMENTS_ENABLED switch: off by default, blocks order/payment endpoints while keeping webhooks verified', async () => {
  process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-32-chars-minimum';
  const prevPaymentsEnabled = process.env.PAYMENTS_ENABLED;
  const prevRzpWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const prevShipWebhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  delete process.env.PAYMENTS_ENABLED;
  process.env.RAZORPAY_WEBHOOK_SECRET = 'rzp-webhook-secret-test';
  process.env.SHIPROCKET_WEBHOOK_SECRET = 'courier-webhook-secret-test';

  const userJwt = await encode({
    token: { sub: 'google_buyer_1', role: 'BUYER', email: 'buyer@example.com' },
    secret: process.env.NEXTAUTH_SECRET,
  });

  try {
    const statusRes = await paymentsStatusGet();
    const statusJson = await statusRes.json();
    assert.equal(statusRes.status, 200);
    assert.equal(statusJson.paymentsEnabled, false);
    assert.equal(statusJson.message, 'Payments coming soon');

    const checkoutRes = await razorpayCheckout(
      new NextRequest('https://otakubazaar.jaybhatt.me/api/checkout/razorpay', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: `next-auth.session-token=${userJwt}` },
        body: JSON.stringify({ productId: 'lot_1' }),
      })
    );
    assert.equal(checkoutRes.status, 503);
    assert.equal((await checkoutRes.json()).error, 'Payments coming soon');

    const ordersRes = await ordersPost(
      new NextRequest('https://otakubazaar.jaybhatt.me/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: `next-auth.session-token=${userJwt}` },
        body: JSON.stringify({ lotId: 'lot_1' }),
      })
    );
    assert.equal(ordersRes.status, 503);
    assert.equal((await ordersRes.json()).error, 'Payments coming soon');

    const verifyRes = await razorpayVerify(
      new Request('https://otakubazaar.jaybhatt.me/api/checkout/razorpay/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderId: 'order_1', paymentId: 'pay_1', signature: 'sig_1' }),
      })
    );
    assert.equal(verifyRes.status, 503);
    assert.equal((await verifyRes.json()).error, 'Payments coming soon');

    // Webhooks must still verify signatures when PAYMENTS_ENABLED is off
    const badRzpWebhook = await razorpayWebhook(
      new Request('https://otakubazaar.jaybhatt.me/api/webhooks/razorpay', {
        method: 'POST',
        headers: { 'x-razorpay-signature': 'invalid-sig' },
        body: JSON.stringify({ event: 'payment.captured' }),
      })
    );
    assert.equal(badRzpWebhook.status, 400);

    const badCourierWebhook = await courierWebhook(
      new NextRequest('https://otakubazaar.jaybhatt.me/api/webhooks/courier', {
        method: 'POST',
        headers: { 'x-api-key': 'wrong-key' },
        body: JSON.stringify({ current_status: 'DELIVERED' }),
      })
    );
    assert.equal(badCourierWebhook.status, 401);
  } finally {
    if (prevPaymentsEnabled !== undefined) process.env.PAYMENTS_ENABLED = prevPaymentsEnabled;
    else delete process.env.PAYMENTS_ENABLED;
    if (prevRzpWebhookSecret !== undefined) process.env.RAZORPAY_WEBHOOK_SECRET = prevRzpWebhookSecret;
    else delete process.env.RAZORPAY_WEBHOOK_SECRET;
    if (prevShipWebhookSecret !== undefined) process.env.SHIPROCKET_WEBHOOK_SECRET = prevShipWebhookSecret;
    else delete process.env.SHIPROCKET_WEBHOOK_SECRET;
  }
});
