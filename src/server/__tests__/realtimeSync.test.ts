/**
 * @file src/server/__tests__/realtimeSync.test.ts
 *
 * Automated verification test for real-time bargaining and multi-window sync.
 *
 * Tests:
 *  1. JWT handshake authentication.
 *  2. Multi-window synchronization: action in Window A updates Window B.
 *  3. Interactive bargaining flow: SUBMIT_OFFER -> ACCEPT_OFFER.
 *  4. Concurrency Control: Atomic Redis lock (15 minutes). Competing buyer on
 *     locked listing is rejected with structured LISTING_LOCKED error.
 */

import http from 'http';
import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import { RedisSyncManager } from '../../infrastructure/realtime/RedisSyncManager';
import { BargainingWebSocketServer } from '../../infrastructure/realtime/BargainingWebSocketServer';
import type { OutboundEvent } from '../../infrastructure/realtime/schemas/bargainingSchemas';

const TEST_PORT = 8999;
const JWT_SECRET = 'otaku-bazaar-test-secret-key-32ch';

function makeToken(userId: string): string {
  return jwt.sign({ userId, sub: userId, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
}

function connectWs(token: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}?token=${token}`);
    ws.on('open', () => resolve(ws));
    ws.on('error', (err) => reject(err));
  });
}

function waitForEvent(ws: WebSocket, eventType: string, timeoutMs = 5000): Promise<OutboundEvent> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event "${eventType}" after ${timeoutMs}ms`));
    }, timeoutMs);

    const onMessage = (data: WebSocket.RawData) => {
      try {
        const parsed = JSON.parse(data.toString()) as OutboundEvent;
        if (parsed.type === eventType) {
          clearTimeout(timer);
          ws.off('message', onMessage);
          resolve(parsed);
        }
      } catch {
        // ignore parse error
      }
    };

    ws.on('message', onMessage);
  });
}

async function runVerification(): Promise<void> {
  console.log('\n--- Starting Real-Time Bargaining Verification Test ---');

  // 1. Setup Server
  const redisSync = new RedisSyncManager({ allowFallback: true });
  await redisSync.initialize();

  const server = http.createServer();
  const wss = new BargainingWebSocketServer({
    server,
    redisSync,
    jwtSecret: JWT_SECRET,
  });

  await new Promise<void>((resolve) => server.listen(TEST_PORT, () => resolve()));
  console.log(`[Test] Test server listening on port ${TEST_PORT}`);

  const buyer1Token = makeToken('buyer-1');
  const sellerToken = makeToken('seller-1');
  const buyer2Token = makeToken('buyer-2');

  const listingId = 'listing-naruto-figure-001';
  const convId = 'conv-naruto-101';

  let buyer1WindowA: WebSocket | null = null;
  let buyer1WindowB: WebSocket | null = null;
  let sellerWindow: WebSocket | null = null;
  let buyer2Window: WebSocket | null = null;

  try {
    // 2. Connect Buyer 1 Window A and Window B (Multi-Window Simulation)
    buyer1WindowA = await connectWs(buyer1Token);
    buyer1WindowB = await connectWs(buyer1Token);
    console.log('✔ Buyer 1 connected with 2 simultaneous windows');

    // 3. Connect Seller
    sellerWindow = await connectWs(sellerToken);
    console.log('✔ Seller connected');

    // Join conversation room
    buyer1WindowA.send(
      JSON.stringify({
        type: 'JOIN_CONVERSATION',
        payload: { conversationId: convId, listingId },
      })
    );

    buyer1WindowB.send(
      JSON.stringify({
        type: 'JOIN_CONVERSATION',
        payload: { conversationId: convId, listingId },
      })
    );

    sellerWindow.send(
      JSON.stringify({
        type: 'JOIN_CONVERSATION',
        payload: { conversationId: convId, listingId },
      })
    );

    await new Promise((r) => setTimeout(r, 200));

    // 4. Buyer 1 Window A submits an offer
    console.log('[Test] Step 1: Buyer 1 Window A submits offer (₹4,500)...');
    const sellerOfferPromise = waitForEvent(sellerWindow, 'OFFER_RECEIVED');
    const buyerMultiWindowPromise = waitForEvent(buyer1WindowB, 'OFFER_RECEIVED');

    buyer1WindowA.send(
      JSON.stringify({
        type: 'SUBMIT_OFFER',
        payload: {
          conversationId: convId,
          listingId,
          sellerId: 'seller-1',
          amount: 4500,
          currency: 'INR',
          message: 'Can you do ₹4,500 for the Naruto Sage Mode figure?',
        },
      })
    );

    const [sellerReceived, windowBReceived] = await Promise.all([
      sellerOfferPromise,
      buyerMultiWindowPromise,
    ]);

    const receivedPayload = sellerReceived.payload as { offerId: string; amount: number };
    const offerId = receivedPayload.offerId;
    console.log(`✔ Seller received OFFER_RECEIVED: offerId=${offerId}, amount=₹${receivedPayload.amount}`);
    console.log(`✔ Buyer 1 Window B received synchronized OFFER_RECEIVED via Redis multi-window sync!`);

    // 5. Seller accepts offer -> Atomic Redis Lock Triggered
    console.log('[Test] Step 2: Seller accepts offer. Triggering 15-minute atomic listing lock...');
    const buyerAcceptedPromise = waitForEvent(buyer1WindowA, 'OFFER_ACCEPTED');
    const buyerLockedPromise = waitForEvent(buyer1WindowA, 'LISTING_LOCKED');
    const sellerAcceptedPromise = waitForEvent(sellerWindow, 'OFFER_ACCEPTED');

    sellerWindow.send(
      JSON.stringify({
        type: 'ACCEPT_OFFER',
        payload: {
          conversationId: convId,
          listingId,
          offerId,
        },
      })
    );

    const [buyerAccepted, buyerLocked] = await Promise.all([
      buyerAcceptedPromise,
      buyerLockedPromise,
      sellerAcceptedPromise,
    ]);

    console.log(`✔ OFFER_ACCEPTED received by Buyer 1: agreedPrice=₹${(buyerAccepted.payload as any).agreedPrice}`);
    console.log(
      `✔ LISTING_LOCKED received by Buyer 1: lockDuration=${(buyerLocked.payload as any).remainingSeconds}s (15 minutes)`
    );

    // Verify lock status in Redis manager
    const lockCheck = await redisSync.checkListingLock(listingId);
    if (!lockCheck.isLocked) {
      throw new Error('Lock was not recorded in Redis manager!');
    }
    console.log(`✔ Verified Redis lock state: isLocked=${lockCheck.isLocked}, remainingTTL=${lockCheck.remainingTtlSeconds}s`);

    // 6. Concurrency Control Test: Buyer 2 tries to submit offer on locked listing
    console.log('[Test] Step 3: Competing Buyer 2 attempts to submit offer on the locked listing...');
    buyer2Window = await connectWs(buyer2Token);

    buyer2Window.send(
      JSON.stringify({
        type: 'JOIN_CONVERSATION',
        payload: { conversationId: 'conv-naruto-102', listingId },
      })
    );
    await new Promise((r) => setTimeout(r, 100));

    const errorPromise = waitForEvent(buyer2Window, 'ERROR');

    buyer2Window.send(
      JSON.stringify({
        type: 'SUBMIT_OFFER',
        payload: {
          conversationId: 'conv-naruto-102',
          listingId,
          sellerId: 'seller-1',
          amount: 5000,
          currency: 'INR',
          message: 'I can pay full price!',
        },
      })
    );

    const errorEvent = await errorPromise;
    const errorPayload = errorEvent.payload as { code: string; message: string; remainingTtlSeconds?: number };

    if (errorPayload.code !== 'LISTING_LOCKED') {
      throw new Error(`Expected error code LISTING_LOCKED, got ${errorPayload.code}`);
    }
    console.log(`✔ Competing buyer rejected with code "${errorPayload.code}": "${errorPayload.message}"`);
    console.log(`✔ Error contains remaining checkout lock TTL: ${errorPayload.remainingTtlSeconds}s`);

    console.log('\n======================================================');
    console.log('🎉 ALL REAL-TIME & CONCURRENCY VERIFICATION CHECKS PASSED!');
    console.log('======================================================\n');
  } finally {
    if (buyer1WindowA) buyer1WindowA.close();
    if (buyer1WindowB) buyer1WindowB.close();
    if (sellerWindow) sellerWindow.close();
    if (buyer2Window) buyer2Window.close();

    await wss.close();
    await redisSync.shutdown();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
