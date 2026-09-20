/**
 * @file src/server/__tests__/verifySecurityAudit.ts
 *
 * Automated verification suite for Principal Security Architecture implementation.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Load .env into process.env for audit test
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1]?.trim();
        let val = match[2]?.trim();
        if (val?.startsWith('"') && val?.endsWith('"')) {
          val = val.slice(1, -1);
        }
        if (key && !process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {
  console.warn('Could not read .env file directly:', e);
}

async function runSecurityAuditTests() {
  console.log('===============================================================');
  console.log('🔒 Running OtakuBazaar Security Architecture Verification Tests');
  console.log('===============================================================\n');

  const BASE_URL = 'http://localhost:3000';

  // ---------------------------------------------------------------------------
  // 1. Server-Side Price Authority Verification (/api/orders)
  // ---------------------------------------------------------------------------
  console.log('--- Test 1: Server-Side Price Authority ---');
  try {
    // Malicious attempt: client specifies amount = 1 (1 Rupee) for an 89,000 INR collectible
    const spoofAttempt = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lotId: 'lot-0482', amount: 1 }),
    });

    const orderJson: any = await spoofAttempt.json();
    console.log(`[Price Authority] Server response order amount: ${orderJson.amount} paise (₹${orderJson.amount / 100})`);

    // Expected: 89,000 INR = 8,900,000 paise (client amount=1 completely rejected)
    if (orderJson.amount !== 8900000) {
      throw new Error(`CRITICAL FAILURE: Server accepted client price! Expected 8900000 paise, got ${orderJson.amount}`);
    }
    console.log('✔ Server-Side Price Authority enforced: Client price payload rejected, true DB price applied.\n');
  } catch (err) {
    console.error('Test 1 failed:', err);
    throw err;
  }

  // ---------------------------------------------------------------------------
  // 2. Razorpay Webhook Cryptographic HMAC SHA256 Verification
  // ---------------------------------------------------------------------------
  console.log('--- Test 2: Razorpay Webhook HMAC SHA256 Signature Verification ---');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_webhook_secret_key_2026';
  const testWebhookPayload = JSON.stringify({
    event: 'payment.captured',
    id: `evt_audit_${Date.now()}`,
    payload: {
      payment: {
        entity: {
          id: `pay_audit_${Date.now()}`,
          amount: 8900000,
          currency: 'INR',
          notes: {
            lotId: 'lot-0482',
            orderId: `order_audit_${Date.now()}`,
          },
        },
      },
    },
  });

  // 2A. Test missing signature
  const missingSigRes = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: testWebhookPayload,
  });
  console.log(`[Webhook Security] Missing signature HTTP status: ${missingSigRes.status}`);
  if (missingSigRes.status !== 400) {
    throw new Error(`Expected 400 for missing signature, got ${missingSigRes.status}`);
  }
  console.log('✔ Missing webhook signature rejected with HTTP 400.');

  // 2B. Test spoofed / tampered signature
  const spoofedSigRes = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': 'tampered_fake_signature_abc123',
    },
    body: testWebhookPayload,
  });
  console.log(`[Webhook Security] Tampered signature HTTP status: ${spoofedSigRes.status}`);
  if (spoofedSigRes.status !== 400) {
    throw new Error(`Expected 400 for tampered signature, got ${spoofedSigRes.status}`);
  }
  console.log('✔ Tampered webhook signature rejected with HTTP 400.');

  // 2C. Test authentic signature
  const validSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(testWebhookPayload)
    .digest('hex');

  const validSigRes = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': validSignature,
      'x-razorpay-event-id': `evt_valid_${Date.now()}`,
    },
    body: testWebhookPayload,
  });
  const validJson: any = await validSigRes.json();
  console.log(`[Webhook Security] Authentic signature HTTP status: ${validSigRes.status}`, validJson);
  if (validSigRes.status !== 200 || validJson.status !== 'ok') {
    throw new Error(`Expected HTTP 200 { status: "ok" }, got ${validSigRes.status}: ${JSON.stringify(validJson)}`);
  }
  console.log('✔ Authentic HMAC SHA256 signature verified and processed successfully with HTTP 200.\n');

  // ---------------------------------------------------------------------------
  // 3. Pusher WebSocket Negotiation Rate Limiter Verification (/api/bargain/offer)
  // ---------------------------------------------------------------------------
  console.log('--- Test 3: Real-Time Negotiation Rate Limiter Protection ---');
  const testClientIp = `192.168.1.${Math.floor(Math.random() * 200) + 10}`;

  // First request: Should succeed
  const firstOffer = await fetch(`${BASE_URL}/api/bargain/offer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': testClientIp,
    },
    body: JSON.stringify({
      productId: 'lot-0482',
      offeredPrice: 75000,
      buyerId: 'user_buyer_audit',
    }),
  });
  const firstJson: any = await firstOffer.json();
  console.log(`[Rate Limiting] First request status: ${firstOffer.status}`, firstJson);
  if (firstOffer.status !== 200 || firstJson.status !== 'Offer Transmitted') {
    throw new Error(`Expected HTTP 200 "Offer Transmitted", got ${firstOffer.status}`);
  }
  console.log('✔ Initial offer transmitted successfully.');

  // Immediate second request from same IP: Should be rate limited (429)
  const spamOffer = await fetch(`${BASE_URL}/api/bargain/offer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': testClientIp,
    },
    body: JSON.stringify({
      productId: 'lot-0482',
      offeredPrice: 76000,
      buyerId: 'user_buyer_audit',
    }),
  });
  const spamJson: any = await spamOffer.json();
  console.log(`[Rate Limiting] Immediate spam request status: ${spamOffer.status}`, spamJson);
  if (spamOffer.status !== 429 || !spamJson.error?.includes('Rate limit exceeded')) {
    throw new Error(`Expected HTTP 429 Rate Limit Exceeded, got ${spamOffer.status}`);
  }
  console.log('✔ Anti-spam protection enforced: Immediate subsequent offer rejected with HTTP 429.\n');

  // ---------------------------------------------------------------------------
  // 4. Environment Variable Prefix Audit Verification
  // ---------------------------------------------------------------------------
  console.log('--- Test 4: Environment Variable Prefix Security Audit ---');
  const browserSafe = [
    'NEXT_PUBLIC_RAZORPAY_KEY_ID',
    'NEXT_PUBLIC_PUSHER_APP_KEY',
    'NEXT_PUBLIC_PUSHER_CLUSTER',
  ];
  const strictlyBackend = [
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET',
    'PUSHER_SECRET',
    'DATABASE_URL',
  ];

  for (const varName of browserSafe) {
    if (!process.env[varName]) {
      console.warn(`[Env Audit] Warning: ${varName} is missing in current process.env`);
    } else {
      console.log(`✔ Browser-safe key "${varName}" verified present with NEXT_PUBLIC_ prefix.`);
    }
  }

  for (const varName of strictlyBackend) {
    if (process.env[`NEXT_PUBLIC_${varName}`]) {
      throw new Error(`SECURITY VULNERABILITY: Secret "${varName}" has NEXT_PUBLIC_ prefix!`);
    }
    console.log(`✔ Secret key "${varName}" strictly protected without NEXT_PUBLIC_ prefix.`);
  }

  console.log('\n===============================================================');
  console.log('🎉 All Security Architecture Tests Passed with 100% Compliance');
  console.log('===============================================================\n');
}

runSecurityAuditTests().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
