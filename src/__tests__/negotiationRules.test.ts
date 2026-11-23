/**
 * @file src/__tests__/negotiationRules.test.ts
 * Unit tests for Real-Time Bargain (Counter-Offer) rules, turn alternation, and lock lifecycle.
 */

import assert from 'node:assert';
import test from 'node:test';
import { validateNegotiationAction } from '../application/services/negotiationService';

test('validateNegotiationAction: enforces alternating turns', () => {
  const buyerId = 'user_buyer_1';
  const sellerId = 'user_seller_2';

  // Buyer just submitted, now it's Seller's turn: buyer cannot act again
  const result = validateNegotiationAction({
    status: 'ACTIVE',
    currentTurnActorId: sellerId,
    actorId: buyerId, // Buyer attempts to act out of turn
    roundCount: 1,
    action: 'COUNTER',
    amount: 5000,
    askingPrice: 8000,
    updatedAt: new Date(),
  });

  assert.strictEqual(result.valid, false);
  assert.match(result.error || '', /not your turn/i);
});

test('validateNegotiationAction: permits counter when it is actor turn', () => {
  const sellerId = 'user_seller_2';

  const result = validateNegotiationAction({
    status: 'ACTIVE',
    currentTurnActorId: sellerId,
    actorId: sellerId,
    roundCount: 1,
    action: 'COUNTER',
    amount: 7200,
    askingPrice: 8000,
    updatedAt: new Date(),
  });

  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.error, undefined);
});

test('validateNegotiationAction: enforces price must be below asking price', () => {
  const sellerId = 'user_seller_2';

  const result = validateNegotiationAction({
    status: 'ACTIVE',
    currentTurnActorId: sellerId,
    actorId: sellerId,
    roundCount: 1,
    action: 'COUNTER',
    amount: 8500, // higher than asking!
    askingPrice: 8000,
    updatedAt: new Date(),
  });

  assert.strictEqual(result.valid, false);
  assert.match(result.error || '', /below the listing asking price/i);
});

test('validateNegotiationAction: enforces seller minimum reserve floor', () => {
  const buyerId = 'user_buyer_1';

  const result = validateNegotiationAction({
    status: 'ACTIVE',
    currentTurnActorId: buyerId,
    actorId: buyerId,
    roundCount: 2,
    action: 'COUNTER',
    amount: 3000,
    askingPrice: 10000,
    minOfferPrice: 6000, // floor is 6000
    updatedAt: new Date(),
  });

  assert.strictEqual(result.valid, false);
  assert.match(result.error || '', /below the seller minimum reserve/i);
});

test('validateNegotiationAction: enforces maximum of 5 rounds for counter-offers', () => {
  const buyerId = 'user_buyer_1';

  // Round 5 reached: Counter is forbidden
  const counterResult = validateNegotiationAction({
    status: 'ACTIVE',
    currentTurnActorId: buyerId,
    actorId: buyerId,
    roundCount: 5,
    action: 'COUNTER',
    amount: 7500,
    askingPrice: 10000,
    updatedAt: new Date(),
  });

  assert.strictEqual(counterResult.valid, false);
  assert.match(counterResult.error || '', /Maximum 5 negotiation rounds reached/i);

  // But ACCEPT is still permitted on Round 5
  const acceptResult = validateNegotiationAction({
    status: 'ACTIVE',
    currentTurnActorId: buyerId,
    actorId: buyerId,
    roundCount: 5,
    action: 'ACCEPT',
    askingPrice: 10000,
    updatedAt: new Date(),
  });

  assert.strictEqual(acceptResult.valid, true);
});

test('validateNegotiationAction: expires offers after 24 hours of inactivity', () => {
  const buyerId = 'user_buyer_1';
  const now = new Date('2026-10-02T12:00:00Z');
  // 25 hours ago
  const oldDate = new Date(now.getTime() - 25 * 60 * 60 * 1000);

  const result = validateNegotiationAction({
    status: 'ACTIVE',
    currentTurnActorId: buyerId,
    actorId: buyerId,
    roundCount: 1,
    action: 'ACCEPT',
    askingPrice: 10000,
    updatedAt: oldDate,
    now,
  });

  assert.strictEqual(result.valid, false);
  assert.match(result.error || '', /expired after 24 hours/i);
});

test('validateNegotiationAction: blocks action on non-active negotiation', () => {
  const buyerId = 'user_buyer_1';

  const result = validateNegotiationAction({
    status: 'ACCEPTED', // already accepted
    currentTurnActorId: buyerId,
    actorId: buyerId,
    roundCount: 1,
    action: 'COUNTER',
    amount: 5000,
    askingPrice: 10000,
    updatedAt: new Date(),
  });

  assert.strictEqual(result.valid, false);
  assert.match(result.error || '', /closed/i);
});
