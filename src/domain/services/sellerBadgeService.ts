/**
 * @file src/domain/services/sellerBadgeService.ts
 *
 * Reputation & Badge Computation Service for OtakuBazaar Sellers.
 *
 * Strict Rules (Computed strictly from real order and dispute data - NEVER hardcoded):
 * 1. VERIFIED VAULT CURATOR: 5+ completed orders with 0 upheld disputes.
 * 2. 0% DISPUTE RATE: 5+ completed orders and 0 disputes raised against seller.
 * 3. FAST DISPATCH <24H: At least 70% of seller's last 10 orders shipped within 24h of payment.
 *
 * Below threshold sellers: Display "New seller".
 * Supports Admin-Only Badge Revocation.
 */

import { prisma } from '@/lib/prismaClient';

export type BadgeType = 'VERIFIED_VAULT_CURATOR' | 'ZERO_DISPUTES' | 'FAST_DISPATCH';

export interface BadgeDefinition {
  id: BadgeType;
  label: string;
  description: string;
  shortLabel: string;
}

export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  VERIFIED_VAULT_CURATOR: {
    id: 'VERIFIED_VAULT_CURATOR',
    label: 'VERIFIED VAULT CURATOR',
    shortLabel: 'VAULT CURATOR',
    description: 'Earned by completing 5+ orders with zero upheld buyer disputes in vault escrow.',
  },
  ZERO_DISPUTES: {
    id: 'ZERO_DISPUTES',
    label: '0% DISPUTE RATE',
    shortLabel: '0% DISPUTES',
    description: 'Earned by completing 5+ orders with zero disputes ever filed by buyers.',
  },
  FAST_DISPATCH: {
    id: 'FAST_DISPATCH',
    label: 'FAST DISPATCH <24H',
    shortLabel: 'FAST DISPATCH',
    description: 'Earned when at least 70% of the last 10 orders were dispatched within 24 hours of payment.',
  },
};

export interface SellerOrderStats {
  completedOrdersCount: number;
  totalDisputesCount: number;
  upheldDisputesCount: number;
  recentOrders: Array<{
    paidAt?: Date | string | null;
    shippedAt?: Date | string | null;
  }>;
  revokedBadges?: string[];
}

export interface SellerBadgeResult {
  badges: BadgeDefinition[];
  isNewSeller: boolean;
  rawBadgeIds: BadgeType[];
}

/**
 * Pure function: Computes earned badges from real statistics.
 * Never hardcodes badges. Honors admin revocations.
 */
export function computeSellerBadges(stats: SellerOrderStats): SellerBadgeResult {
  const revoked = new Set(stats.revokedBadges || []);
  const earned: BadgeType[] = [];

  // Threshold: Seller with < 5 completed orders is classified as "New seller"
  const isNewSeller = stats.completedOrdersCount < 5;

  if (!isNewSeller) {
    // 1. VERIFIED VAULT CURATOR: 5+ completed orders and 0 upheld disputes
    if (stats.completedOrdersCount >= 5 && stats.upheldDisputesCount === 0) {
      if (!revoked.has('VERIFIED_VAULT_CURATOR')) {
        earned.push('VERIFIED_VAULT_CURATOR');
      }
    }

    // 2. 0% DISPUTE RATE: 5+ completed orders and 0 disputes raised
    if (stats.completedOrdersCount >= 5 && stats.totalDisputesCount === 0) {
      if (!revoked.has('ZERO_DISPUTES')) {
        earned.push('ZERO_DISPUTES');
      }
    }

    // 3. FAST DISPATCH <24H: At least 70% of last 10 orders dispatched within 24h
    const ordersWithShipping = stats.recentOrders.slice(0, 10).filter(
      (o) => o.paidAt && o.shippedAt
    );

    if (ordersWithShipping.length >= 5) {
      let fastCount = 0;
      for (const order of ordersWithShipping) {
        const paidTime = new Date(order.paidAt!).getTime();
        const shippedTime = new Date(order.shippedAt!).getTime();
        const diffHours = (shippedTime - paidTime) / (1000 * 60 * 60);
        if (diffHours >= 0 && diffHours <= 24) {
          fastCount++;
        }
      }
      const fastRatio = fastCount / ordersWithShipping.length;
      if (fastRatio >= 0.7 && !revoked.has('FAST_DISPATCH')) {
        earned.push('FAST_DISPATCH');
      }
    }
  }

  const badgeObjects = earned.map((id) => BADGE_DEFINITIONS[id]).filter(Boolean);

  return {
    badges: badgeObjects,
    isNewSeller,
    rawBadgeIds: earned,
  };
}

/**
 * Gathers order and dispute statistics for a seller from the database.
 */
export async function gatherSellerStats(sellerId: string): Promise<SellerOrderStats> {
  const [completedOrders, totalDisputes, upheldDisputes, recentOrders, user] = await Promise.all([
    // Completed orders
    prisma.order.count({
      where: {
        sellerId,
        status: { in: ['COMPLETED', 'SETTLED', 'DELIVERED', 'PAID'] },
      },
    }),
    // Total disputes raised against seller
    prisma.dispute.count({
      where: { sellerId },
    }),
    // Upheld disputes
    prisma.dispute.count({
      where: { sellerId, status: 'UPHELD' },
    }),
    // Recent orders with shipping timestamps
    prisma.order.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { paidAt: true, shippedAt: true },
    }),
    // User record to check revoked badges
    prisma.user.findUnique({
      where: { id: sellerId },
      select: { revokedBadges: true },
    }),
  ]);

  let revokedBadges: string[] = [];
  if (user?.revokedBadges) {
    try {
      revokedBadges = JSON.parse(user.revokedBadges);
    } catch {
      revokedBadges = [];
    }
  }

  return {
    completedOrdersCount: completedOrders,
    totalDisputesCount: totalDisputes,
    upheldDisputesCount: upheldDisputes,
    recentOrders,
    revokedBadges,
  };
}

/**
 * Recomputes and caches badges on the User record.
 */
export async function recomputeAndSaveSellerBadges(sellerId: string): Promise<SellerBadgeResult> {
  const stats = await gatherSellerStats(sellerId);
  const result = computeSellerBadges(stats);

  try {
    await prisma.user.update({
      where: { id: sellerId },
      data: {
        sellerBadges: JSON.stringify(result.rawBadgeIds),
      },
    });
  } catch (err) {
    console.warn('[sellerBadgeService] User badge cache update note:', err);
  }

  return result;
}

/**
 * Admin-only action to revoke an earned badge with audit logging.
 */
export async function revokeSellerBadge(
  adminUserId: string,
  sellerId: string,
  badgeId: BadgeType,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Verify caller has ADMIN role
  const admin = await prisma.user.findUnique({ where: { id: adminUserId } });
  if (!admin || admin.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized: Admin privileges required to revoke seller badges.' };
  }

  // 2. Add to revoked list
  const seller = await prisma.user.findUnique({ where: { id: sellerId } });
  if (!seller) {
    return { success: false, error: 'Seller account not found.' };
  }

  let revoked: string[] = [];
  try {
    revoked = seller.revokedBadges ? JSON.parse(seller.revokedBadges) : [];
  } catch {
    revoked = [];
  }

  if (!revoked.includes(badgeId)) {
    revoked.push(badgeId);
  }

  await prisma.user.update({
    where: { id: sellerId },
    data: {
      revokedBadges: JSON.stringify(revoked),
    },
  });

  // 3. Recompute badges immediately
  await recomputeAndSaveSellerBadges(sellerId);

  return { success: true };
}
