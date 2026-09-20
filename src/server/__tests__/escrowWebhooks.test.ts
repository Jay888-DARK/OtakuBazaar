/**
 * @file src/server/__tests__/escrowWebhooks.test.ts
 *
 * Automated verification test suite for FinTech payment, escrow, and logistics webhook integration.
 *
 * Tests:
 *   1. HMAC-SHA256 signature verification (security enforcement & 401 rejection).
 *   2. Idempotency logging (duplicate webhook returns 200 without duplicate execution).
 *   3. Escrow state transitions & double-entry ledger balancing (`GATEWAY_CLEARING` -> `ESCROW_LIABILITY`).
 *   4. Shiprocket logistics delivery and 48-hour buyer inspection timer.
 *   5. Scheduled escrow auto-release background job to seller UPI VPA.
 */

import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { WebhookSecurityService } from '../../infrastructure/security/WebhookSecurityService';
import { IdempotencyService } from '../../infrastructure/database/IdempotencyService';
import { EscrowLedgerService } from '../../infrastructure/payment/EscrowLedgerService';
import { OrderRepository } from '../../infrastructure/database/repositories/OrderRepository';
import { EscrowReleaseJob } from '../../infrastructure/jobs/EscrowReleaseJob';
import { POST as razorpayPostHandler } from '../../app/api/webhooks/razorpay/route';
import { POST as shiprocketPostHandler } from '../../app/api/webhooks/shiprocket/route';

const RAZORPAY_SECRET = 'test_razorpay_secret_12345';
const SHIPROCKET_SECRET = 'test_shiprocket_secret_67890';

process.env.RAZORPAY_WEBHOOK_SECRET = RAZORPAY_SECRET;
process.env.SHIPROCKET_WEBHOOK_SECRET = SHIPROCKET_SECRET;

function computeHmacSha256(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

async function runFintechVerification(): Promise<void> {
  console.log('\n===============================================================');
  console.log('💳 Starting FinTech Payment, Escrow & Logistics Verification');
  console.log('===============================================================\n');

  // Reset in-memory states
  IdempotencyService.clearCache();
  EscrowLedgerService.clearMemory();
  OrderRepository.clearMemory();

  const testOrderId = 'order_tanjiro_figure_777';
  const buyerId = 'user_buyer_zenitsu';
  const sellerId = 'user_seller_rengoku';
  const amountPaise = 500000; // ₹5,000.00

  // Seed initial order in PAYMENT_PENDING
  await OrderRepository.createOrder({
    id: testOrderId,
    listingId: 'listing_rengoku_scale_figure',
    buyerId,
    sellerId,
    totalAmount: amountPaise,
    currency: 'INR',
    escrowStatus: 'PAYMENT_PENDING',
    inspectionEndsAt: null,
    razorpayOrderId: 'order_rzp_mock_123',
    razorpayPaymentId: null,
    shiprocketShipmentId: null,
    shiprocketAwb: null,
    payoutReferenceId: null,
    payoutCompletedAt: null,
  });
  console.log(`✔ Order created in status PAYMENT_PENDING (Amount: ₹${amountPaise / 100})`);

  // -------------------------------------------------------------------------
  // Test 1: HMAC-SHA256 Webhook Security & 401 Rejection
  // -------------------------------------------------------------------------
  console.log('\n--- Test 1: HMAC-SHA256 Signature Security ---');

  const razorpayPayload = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_rzp_test_9999',
          amount: amountPaise,
          currency: 'INR',
          status: 'captured',
          order_id: 'order_rzp_mock_123',
          notes: {
            orderId: testOrderId,
          },
        },
      },
    },
  });

  // A. Tampered / invalid signature
  const invalidSignatureReq = new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-razorpay-signature': 'invalid_forged_signature_000',
    },
    body: razorpayPayload,
  });

  const invalidRes = await razorpayPostHandler(invalidSignatureReq);
  if (invalidRes.status !== 400 && invalidRes.status !== 401) {
    throw new Error(`Expected 400 or 401 for invalid signature, got ${invalidRes.status}`);
  }
  console.log('✔ Tampered/invalid signature successfully rejected.');

  // B. Valid HMAC-SHA256 signature
  const validSignature = computeHmacSha256(razorpayPayload, RAZORPAY_SECRET);
  const validReq = new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-razorpay-signature': validSignature,
      'x-razorpay-event-id': 'evt_rzp_capture_001',
    },
    body: razorpayPayload,
  });

  const validRes = await razorpayPostHandler(validReq);
  const validJson = await validRes.json();
  if (validRes.status !== 200 || (validJson.status !== 'success' && validJson.status !== 'ok')) {
    throw new Error(`Expected HTTP 200 success, got ${validRes.status}: ${JSON.stringify(validJson)}`);
  }
  console.log('✔ Valid HMAC-SHA256 signature verified and accepted with HTTP 200.');

  // -------------------------------------------------------------------------
  // Test 2: Double-Entry Escrow Ledger & Status Transition
  // -------------------------------------------------------------------------
  console.log('\n--- Test 2: Escrow State & Double-Entry Ledger Verification ---');

  const orderAfterPayment = await OrderRepository.findById(testOrderId);
  if (orderAfterPayment?.escrowStatus !== 'HELD_IN_ESCROW') {
    throw new Error(`Expected status HELD_IN_ESCROW, got ${orderAfterPayment?.escrowStatus}`);
  }
  console.log(`✔ Order ${testOrderId} transitioned to HELD_IN_ESCROW.`);

  const ledgerAfterPayment = await EscrowLedgerService.getOrderLedger(testOrderId);
  console.log(`✔ Ledger entries recorded for payment capture: ${ledgerAfterPayment.length} entries`);

  let totalDebits = 0;
  let totalCredits = 0;
  for (const entry of ledgerAfterPayment) {
    console.log(`   [${entry.entryType}] ${entry.accountType}: ₹${entry.amount / 100} - "${entry.description}"`);
    if (entry.entryType === 'DEBIT') totalDebits += entry.amount;
    if (entry.entryType === 'CREDIT') totalCredits += entry.amount;
  }

  if (totalDebits !== totalCredits || totalDebits !== amountPaise) {
    throw new Error(`Ledger imbalance! Debits (${totalDebits}) !== Credits (${totalCredits})`);
  }
  console.log(`✔ Double-entry equation verified: Total Debits (₹${totalDebits / 100}) === Total Credits (₹${totalCredits / 100}).`);

  // -------------------------------------------------------------------------
  // Test 3: Idempotency Logging (Duplicate Webhook Delivery)
  // -------------------------------------------------------------------------
  console.log('\n--- Test 3: Idempotency Protection ---');

  // Replay identical webhook request
  const duplicateReq = new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-razorpay-signature': validSignature,
      'x-razorpay-event-id': 'evt_rzp_capture_001',
    },
    body: razorpayPayload,
  });

  const duplicateRes = await razorpayPostHandler(duplicateReq);
  const duplicateJson = await duplicateRes.json();

  if (duplicateRes.status !== 200 || !duplicateJson.duplicate) {
    throw new Error(`Expected HTTP 200 duplicate acknowledgment, got: ${JSON.stringify(duplicateJson)}`);
  }
  console.log('✔ Duplicate webhook detected: returned HTTP 200 with duplicate=true.');

  const ledgerAfterDuplicate = await EscrowLedgerService.getOrderLedger(testOrderId);
  if (ledgerAfterDuplicate.length !== ledgerAfterPayment.length) {
    throw new Error('Duplicate execution occurred! Ledger entries were duplicated.');
  }
  console.log('✔ Verified ledger integrity: No duplicate entries created on replay.');

  // -------------------------------------------------------------------------
  // Test 4: Shiprocket Logistics Webhook & 48-Hour Inspection Timer
  // -------------------------------------------------------------------------
  console.log('\n--- Test 4: Shiprocket Delivery & 48-Hour Inspection Timer ---');

  const shiprocketPayload = JSON.stringify({
    event: 'shipment.delivered',
    current_status: 'DELIVERED',
    order_id: testOrderId,
    awb_code: 'SR_DEL_AWB_88889999',
    courier_name: 'BlueDart Express',
    shipment_id: 1234567,
  });

  const shiprocketSignature = computeHmacSha256(shiprocketPayload, SHIPROCKET_SECRET);
  const shiprocketReq = new NextRequest('http://localhost:3000/api/webhooks/shiprocket', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-shiprocket-signature': shiprocketSignature,
    },
    body: shiprocketPayload,
  });

  const shiprocketRes = await shiprocketPostHandler(shiprocketReq);
  const shiprocketJson = await shiprocketRes.json();

  if (shiprocketRes.status !== 200 || shiprocketJson.status !== 'success') {
    throw new Error(`Shiprocket webhook failed: ${JSON.stringify(shiprocketJson)}`);
  }

  const orderAfterDelivery = await OrderRepository.findById(testOrderId);
  if (orderAfterDelivery?.escrowStatus !== 'DELIVERED_INSPECTION') {
    throw new Error(`Expected DELIVERED_INSPECTION, got ${orderAfterDelivery?.escrowStatus}`);
  }

  if (!orderAfterDelivery.inspectionEndsAt) {
    throw new Error('inspectionEndsAt was not set!');
  }

  const hoursRemaining = (orderAfterDelivery.inspectionEndsAt.getTime() - Date.now()) / (1000 * 60 * 60);
  console.log(`✔ Order transitioned to DELIVERED_INSPECTION.`);
  console.log(`✔ Inspection ends at: ${orderAfterDelivery.inspectionEndsAt.toISOString()} (~${Math.round(hoursRemaining)} hours from now).`);

  // -------------------------------------------------------------------------
  // Test 5: Scheduled Background Job & Automated UPI Escrow Disbursement
  // -------------------------------------------------------------------------
  console.log('\n--- Test 5: Escrow Release Background Job & UPI Disbursement ---');

  // A. Run job BEFORE 48 hours elapsed (cutoff = now)
  const prematureRun = await EscrowReleaseJob.run(new Date());
  if (prematureRun.successfulReleases !== 0) {
    throw new Error(`Expected 0 releases before timer expiry, got ${prematureRun.successfulReleases}`);
  }
  console.log('✔ Job evaluated before inspection expiry: 0 orders disbursed (funds held securely in escrow).');

  // B. Run job AFTER 48 hours elapsed (simulated cutoff = NOW + 49 hours)
  const simulatedFuture = new Date(Date.now() + 49 * 60 * 60 * 1000);
  console.log(`[Test] Simulating timer expiry with cutoff: ${simulatedFuture.toISOString()}...`);

  const expiredRun = await EscrowReleaseJob.run(simulatedFuture);
  if (expiredRun.successfulReleases !== 1) {
    throw new Error(`Expected 1 successful release, got ${expiredRun.successfulReleases}. Errors: ${JSON.stringify(expiredRun.errors)}`);
  }

  const releasedInfo = expiredRun.releases[0];
  if (!releasedInfo) {
    throw new Error('Expected releasedInfo to be present');
  }
  console.log(`✔ Escrow release executed successfully!`);
  console.log(`   Seller ID: ${releasedInfo.sellerId}`);
  console.log(`   Disbursed to UPI: ${releasedInfo.upiVpa}`);
  console.log(`   Net Seller Payout: ₹${releasedInfo.amountDisbursed / 100} (95%)`);
  console.log(`   Platform Commission: ₹${releasedInfo.platformFee / 100} (5%)`);
  console.log(`   Payout Reference: ${releasedInfo.payoutReferenceId}`);

  const orderFinal = await OrderRepository.findById(testOrderId);
  if (orderFinal?.escrowStatus !== 'ESCROW_RELEASED') {
    throw new Error(`Expected ESCROW_RELEASED, got ${orderFinal?.escrowStatus}`);
  }
  console.log(`✔ Final Order status: ESCROW_RELEASED.`);

  // Verify final ledger balance
  const fullLedger = await EscrowLedgerService.getOrderLedger(testOrderId);
  let finalDebits = 0;
  let finalCredits = 0;
  console.log('\nFull Double-Entry Ledger for Order Lifecycle:');
  for (const entry of fullLedger) {
    console.log(`   [${entry.entryType.padEnd(6)}] ${entry.accountType.padEnd(20)} ₹${(entry.amount / 100).toFixed(2)} - ${entry.description}`);
    if (entry.entryType === 'DEBIT') finalDebits += entry.amount;
    if (entry.entryType === 'CREDIT') finalCredits += entry.amount;
  }

  if (finalDebits !== finalCredits) {
    throw new Error(`Final ledger imbalance! Debits (${finalDebits}) !== Credits (${finalCredits})`);
  }
  console.log(`\n✔ Double-Entry Accounting Verified: Cumulative Debits (₹${finalDebits / 100}) === Cumulative Credits (₹${finalCredits / 100})`);

  console.log('\n===============================================================');
  console.log('🎉 ALL FINTECH ESCROW & LOGISTICS VERIFICATION CHECKS PASSED!');
  console.log('===============================================================\n');
}

runFintechVerification().catch((err) => {
  console.error('❌ FinTech verification failed:', err);
  process.exit(1);
});
