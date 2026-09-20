/**
 * @file src/infrastructure/database/repositories/OrderRepository.ts
 *
 * Single Responsibility: Persistence management for Orders and Escrow states.
 * Connects directly with Prisma database client for durable SQLite/PostgreSQL persistence.
 */

import { prisma } from '@/infrastructure/database/prismaClient';

export type EscrowStatusType =
  | 'PAYMENT_PENDING'
  | 'HELD_IN_ESCROW'
  | 'SHIPPED'
  | 'DELIVERED_INSPECTION'
  | 'ESCROW_RELEASED'
  | 'DISPUTED'
  | 'REFUNDED';

export interface OrderRecord {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  totalAmount: number; // in smallest unit (paise)
  currency: string;
  escrowStatus: EscrowStatusType;
  inspectionEndsAt: Date | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  shiprocketShipmentId: string | null;
  shiprocketAwb: string | null;
  payoutReferenceId: string | null;
  payoutCompletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderRepository {
  /**
   * Clears order records (used in test suite teardown/setup).
   */
  public static async clearMemory(): Promise<void> {
    try {
      await prisma.escrowLedgerEntry.deleteMany({});
      await prisma.order.deleteMany({});
    } catch {
      // ignore
    }
  }

  /**
   * Creates an order record in the database, ensuring prerequisite foreign entities exist.
   */
  public static async createOrder(order: Omit<OrderRecord, 'createdAt' | 'updatedAt'>): Promise<OrderRecord> {
    // 1. Ensure buyer user exists
    const buyer = await prisma.user.findUnique({ where: { id: order.buyerId } });
    if (!buyer) {
      await prisma.user.create({
        data: {
          id: order.buyerId,
          displayName: 'Otaku Buyer',
          email: `${order.buyerId}@otakubazaar.dev`,
        },
      });
    }

    // 2. Ensure seller user exists
    const seller = await prisma.user.findUnique({ where: { id: order.sellerId } });
    if (!seller) {
      await prisma.user.create({
        data: {
          id: order.sellerId,
          displayName: 'Otaku Seller',
          email: `${order.sellerId}@otakubazaar.dev`,
        },
      });
    }

    // 3. Ensure listing exists
    const listing = await prisma.listing.findUnique({ where: { id: order.listingId } });
    if (!listing) {
      await prisma.listing.create({
        data: {
          id: order.listingId,
          sellerId: order.sellerId,
          title: 'Anime Collectible Item',
          description: 'Collectible purchased through escrow checkout',
          imageUrls: '[]',
          askingPriceAmount: order.totalAmount,
          askingPriceCurrency: order.currency,
          status: 'RESERVED',
          category: 'Figures',
          condition: 'NEW',
          reservedByBuyerId: order.buyerId,
        },
      });
    }

    const record = await prisma.order.create({
      data: {
        id: order.id,
        listingId: order.listingId,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        totalAmount: order.totalAmount,
        currency: order.currency,
        escrowStatus: order.escrowStatus,
        inspectionEndsAt: order.inspectionEndsAt,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        shiprocketShipmentId: order.shiprocketShipmentId,
        shiprocketAwb: order.shiprocketAwb,
        payoutReferenceId: order.payoutReferenceId,
        payoutCompletedAt: order.payoutCompletedAt,
      },
    });

    return {
      id: record.id,
      listingId: record.listingId,
      buyerId: record.buyerId,
      sellerId: record.sellerId,
      totalAmount: record.totalAmount,
      currency: record.currency,
      escrowStatus: record.escrowStatus as EscrowStatusType,
      inspectionEndsAt: record.inspectionEndsAt,
      razorpayOrderId: record.razorpayOrderId,
      razorpayPaymentId: record.razorpayPaymentId,
      shiprocketShipmentId: record.shiprocketShipmentId,
      shiprocketAwb: record.shiprocketAwb,
      payoutReferenceId: record.payoutReferenceId,
      payoutCompletedAt: record.payoutCompletedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  /**
   * Finds an order by its internal ID.
   */
  public static async findById(id: string): Promise<OrderRecord | null> {
    const record = await prisma.order.findUnique({ where: { id } });
    if (!record) return null;

    return {
      id: record.id,
      listingId: record.listingId,
      buyerId: record.buyerId,
      sellerId: record.sellerId,
      totalAmount: record.totalAmount,
      currency: record.currency,
      escrowStatus: record.escrowStatus as EscrowStatusType,
      inspectionEndsAt: record.inspectionEndsAt,
      razorpayOrderId: record.razorpayOrderId,
      razorpayPaymentId: record.razorpayPaymentId,
      shiprocketShipmentId: record.shiprocketShipmentId,
      shiprocketAwb: record.shiprocketAwb,
      payoutReferenceId: record.payoutReferenceId,
      payoutCompletedAt: record.payoutCompletedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  /**
   * Updates an order's escrow status and related timestamps/provider IDs.
   */
  public static async updateEscrowStatus(
    id: string,
    updates: Partial<Pick<OrderRecord, 'escrowStatus' | 'inspectionEndsAt' | 'razorpayPaymentId' | 'shiprocketAwb' | 'payoutReferenceId' | 'payoutCompletedAt'>>
  ): Promise<OrderRecord | null> {
    try {
      const record = await prisma.order.update({
        where: { id },
        data: updates,
      });

      return {
        id: record.id,
        listingId: record.listingId,
        buyerId: record.buyerId,
        sellerId: record.sellerId,
        totalAmount: record.totalAmount,
        currency: record.currency,
        escrowStatus: record.escrowStatus as EscrowStatusType,
        inspectionEndsAt: record.inspectionEndsAt,
        razorpayOrderId: record.razorpayOrderId,
        razorpayPaymentId: record.razorpayPaymentId,
        shiprocketShipmentId: record.shiprocketShipmentId,
        shiprocketAwb: record.shiprocketAwb,
        payoutReferenceId: record.payoutReferenceId,
        payoutCompletedAt: record.payoutCompletedAt,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
    } catch {
      return null;
    }
  }

  /**
   * Finds orders whose inspection period has expired and are pending escrow payout.
   */
  public static async findExpiredInspections(cutoffTime = new Date()): Promise<OrderRecord[]> {
    const records = await prisma.order.findMany({
      where: {
        escrowStatus: 'DELIVERED_INSPECTION',
        inspectionEndsAt: {
          lte: cutoffTime,
        },
      },
    });

    return records.map((record) => ({
      id: record.id,
      listingId: record.listingId,
      buyerId: record.buyerId,
      sellerId: record.sellerId,
      totalAmount: record.totalAmount,
      currency: record.currency,
      escrowStatus: record.escrowStatus as EscrowStatusType,
      inspectionEndsAt: record.inspectionEndsAt,
      razorpayOrderId: record.razorpayOrderId,
      razorpayPaymentId: record.razorpayPaymentId,
      shiprocketShipmentId: record.shiprocketShipmentId,
      shiprocketAwb: record.shiprocketAwb,
      payoutReferenceId: record.payoutReferenceId,
      payoutCompletedAt: record.payoutCompletedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }));
  }
}
