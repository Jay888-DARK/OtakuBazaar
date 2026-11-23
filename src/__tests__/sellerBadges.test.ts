/**
 * @file src/__tests__/sellerBadges.test.ts
 * Unit tests for Seller Reputation Badge computation rules
 */

import assert from 'node:assert';
import test from 'node:test';
import { computeSellerBadges, type SellerOrderStats } from '../domain/services/sellerBadgeService';

test('computeSellerBadges: identifies New Seller with under 5 completed orders', () => {
  const stats: SellerOrderStats = {
    completedOrdersCount: 4,
    totalDisputesCount: 0,
    upheldDisputesCount: 0,
    recentOrders: [],
  };

  const result = computeSellerBadges(stats);
  assert.strictEqual(result.isNewSeller, true);
  assert.strictEqual(result.badges.length, 0);
});

test('computeSellerBadges: awards VERIFIED VAULT CURATOR and 0% DISPUTE RATE on 5+ clean orders', () => {
  const stats: SellerOrderStats = {
    completedOrdersCount: 6,
    totalDisputesCount: 0,
    upheldDisputesCount: 0,
    recentOrders: [],
  };

  const result = computeSellerBadges(stats);
  assert.strictEqual(result.isNewSeller, false);
  assert.deepStrictEqual(result.rawBadgeIds, ['VERIFIED_VAULT_CURATOR', 'ZERO_DISPUTES']);
});

test('computeSellerBadges: withholds 0% DISPUTE RATE if dispute was raised, but keeps CURATOR if not upheld', () => {
  const stats: SellerOrderStats = {
    completedOrdersCount: 10,
    totalDisputesCount: 1, // 1 dispute raised by buyer
    upheldDisputesCount: 0, // but rejected/dismissed by platform
    recentOrders: [],
  };

  const result = computeSellerBadges(stats);
  assert.strictEqual(result.isNewSeller, false);
  assert.strictEqual(result.rawBadgeIds.includes('VERIFIED_VAULT_CURATOR'), true);
  assert.strictEqual(result.rawBadgeIds.includes('ZERO_DISPUTES'), false);
});

test('computeSellerBadges: withholds both if dispute was upheld against seller', () => {
  const stats: SellerOrderStats = {
    completedOrdersCount: 8,
    totalDisputesCount: 1,
    upheldDisputesCount: 1,
    recentOrders: [],
  };

  const result = computeSellerBadges(stats);
  assert.strictEqual(result.isNewSeller, false);
  assert.strictEqual(result.rawBadgeIds.includes('VERIFIED_VAULT_CURATOR'), false);
  assert.strictEqual(result.rawBadgeIds.includes('ZERO_DISPUTES'), false);
});

test('computeSellerBadges: awards FAST DISPATCH <24H when >= 70% of orders ship within 24h', () => {
  const now = new Date('2026-10-01T10:00:00Z');
  const paid = now.toISOString();
  // 12 hours later (fast)
  const fastShipped = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();
  // 30 hours later (slow)
  const slowShipped = new Date(now.getTime() + 30 * 60 * 60 * 1000).toISOString();

  const stats: SellerOrderStats = {
    completedOrdersCount: 10,
    totalDisputesCount: 0,
    upheldDisputesCount: 0,
    recentOrders: [
      { paidAt: paid, shippedAt: fastShipped },
      { paidAt: paid, shippedAt: fastShipped },
      { paidAt: paid, shippedAt: fastShipped },
      { paidAt: paid, shippedAt: fastShipped },
      { paidAt: paid, shippedAt: slowShipped }, // 4 out of 5 = 80% fast
    ],
  };

  const result = computeSellerBadges(stats);
  assert.strictEqual(result.rawBadgeIds.includes('FAST_DISPATCH'), true);
});

test('computeSellerBadges: withholds FAST DISPATCH <24H when below 70%', () => {
  const now = new Date('2026-10-01T10:00:00Z');
  const paid = now.toISOString();
  const fastShipped = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();
  const slowShipped = new Date(now.getTime() + 30 * 60 * 60 * 1000).toISOString();

  const stats: SellerOrderStats = {
    completedOrdersCount: 10,
    totalDisputesCount: 0,
    upheldDisputesCount: 0,
    recentOrders: [
      { paidAt: paid, shippedAt: fastShipped },
      { paidAt: paid, shippedAt: fastShipped },
      { paidAt: paid, shippedAt: slowShipped },
      { paidAt: paid, shippedAt: slowShipped },
      { paidAt: paid, shippedAt: slowShipped }, // 2 out of 5 = 40% fast
    ],
  };

  const result = computeSellerBadges(stats);
  assert.strictEqual(result.rawBadgeIds.includes('FAST_DISPATCH'), false);
});

test('computeSellerBadges: excludes revoked badges even if criteria are met', () => {
  const stats: SellerOrderStats = {
    completedOrdersCount: 15,
    totalDisputesCount: 0,
    upheldDisputesCount: 0,
    recentOrders: [],
    revokedBadges: ['ZERO_DISPUTES'], // Admin revoked
  };

  const result = computeSellerBadges(stats);
  assert.strictEqual(result.rawBadgeIds.includes('VERIFIED_VAULT_CURATOR'), true);
  assert.strictEqual(result.rawBadgeIds.includes('ZERO_DISPUTES'), false);
});
