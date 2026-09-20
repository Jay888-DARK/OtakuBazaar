/**
 * @file src/infrastructure/database/repositories/PrismaBargainOfferRepository.ts
 *
 * Prisma-based implementation of the IBargainOfferRepository port.
 * Translates between Prisma's database model and the domain's BargainOffer entity.
 */

import type { PrismaClient, BargainOffer as PrismaOffer } from '@prisma/client';
import type { IBargainOfferRepository } from '@/domain/repositories/IBargainOfferRepository';
import { BargainOffer, type BargainOfferProps } from '@/domain/entities/BargainOffer';
import { Money } from '@/domain/value-objects/Money';
import type { OfferStatusType } from '@/domain/value-objects/OfferStatus';
import {
  toBargainOfferId,
  toListingId,
  toUserId,
  type BargainOfferId,
  type ListingId,
  type UserId,
  type PaginationInput,
  type PaginatedResult,
  type ISOTimestamp,
  type CurrencyCode,
} from '@/domain/types';

// ---------------------------------------------------------------------------
// Repository Implementation
// ---------------------------------------------------------------------------

/**
 * Prisma adapter for the {@link IBargainOfferRepository} port.
 */
export class PrismaBargainOfferRepository implements IBargainOfferRepository {
  /**
   * @param prisma - Prisma client instance (injected).
   */
  constructor(private readonly prisma: PrismaClient) {}

  /** {@inheritDoc IBargainOfferRepository.findById} */
  async findById(id: BargainOfferId): Promise<BargainOffer | null> {
    const row = await this.prisma.bargainOffer.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  /** {@inheritDoc IBargainOfferRepository.findByListingId} */
  async findByListingId(
    listingId: ListingId,
    pagination: PaginationInput
  ): Promise<PaginatedResult<BargainOffer>> {
    const [rows, totalCount] = await Promise.all([
      this.prisma.bargainOffer.findMany({
        where: { listingId },
        take: pagination.limit,
        ...(pagination.cursor ? { skip: 1, cursor: { id: pagination.cursor } } : {}),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bargainOffer.count({ where: { listingId } }),
    ]);

    return {
      items: rows.map((row) => this.toDomain(row)),
      nextCursor: rows.length === pagination.limit ? rows[rows.length - 1]?.id ?? null : null,
      totalCount,
    };
  }

  /** {@inheritDoc IBargainOfferRepository.findByBuyerId} */
  async findByBuyerId(
    buyerId: UserId,
    pagination: PaginationInput
  ): Promise<PaginatedResult<BargainOffer>> {
    const [rows, totalCount] = await Promise.all([
      this.prisma.bargainOffer.findMany({
        where: { buyerId },
        take: pagination.limit,
        ...(pagination.cursor ? { skip: 1, cursor: { id: pagination.cursor } } : {}),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bargainOffer.count({ where: { buyerId } }),
    ]);

    return {
      items: rows.map((row) => this.toDomain(row)),
      nextCursor: rows.length === pagination.limit ? rows[rows.length - 1]?.id ?? null : null,
      totalCount,
    };
  }

  /** {@inheritDoc IBargainOfferRepository.findActiveByListingAndBuyer} */
  async findActiveByListingAndBuyer(
    listingId: ListingId,
    buyerId: UserId
  ): Promise<BargainOffer | null> {
    const row = await this.prisma.bargainOffer.findFirst({
      where: {
        listingId,
        buyerId,
        status: { in: ['PENDING', 'COUNTERED'] },
      },
    });
    return row ? this.toDomain(row) : null;
  }

  /** {@inheritDoc IBargainOfferRepository.create} */
  async create(offer: BargainOffer): Promise<BargainOffer> {
    const row = await this.prisma.bargainOffer.create({
      data: {
        id: offer.id,
        listingId: offer.listingId,
        buyerId: offer.buyerId,
        sellerId: offer.sellerId,
        offeredPriceAmount: offer.offeredPrice.amountInSmallestUnit,
        offeredPriceCurrency: offer.offeredPrice.currency,
        counterPriceAmount: offer.counterPrice?.amountInSmallestUnit ?? null,
        counterPriceCurrency: offer.counterPrice?.currency ?? null,
        status: offer.status,
        message: offer.message,
        expiresAt: new Date(offer.expiresAt),
      },
    });
    return this.toDomain(row);
  }

  /** {@inheritDoc IBargainOfferRepository.update} */
  async update(offer: BargainOffer): Promise<BargainOffer> {
    const row = await this.prisma.bargainOffer.update({
      where: { id: offer.id },
      data: {
        status: offer.status,
        counterPriceAmount: offer.counterPrice?.amountInSmallestUnit ?? null,
        counterPriceCurrency: offer.counterPrice?.currency ?? null,
      },
    });
    return this.toDomain(row);
  }

  // -----------------------------------------------------------------------
  // Mapper: Prisma Row → Domain Entity
  // -----------------------------------------------------------------------

  /**
   * Maps a Prisma database row to a domain BargainOffer entity.
   *
   * @param row - The raw Prisma bargain offer model.
   * @returns A hydrated BargainOffer domain entity.
   */
  private toDomain(row: PrismaOffer): BargainOffer {
    const props: BargainOfferProps = {
      id: toBargainOfferId(row.id),
      listingId: toListingId(row.listingId),
      buyerId: toUserId(row.buyerId),
      sellerId: toUserId(row.sellerId),
      offeredPrice: new Money(
        row.offeredPriceAmount,
        row.offeredPriceCurrency as CurrencyCode
      ),
      counterPrice:
        row.counterPriceAmount !== null && row.counterPriceCurrency !== null
          ? new Money(row.counterPriceAmount, row.counterPriceCurrency as CurrencyCode)
          : null,
      status: row.status as OfferStatusType,
      message: row.message,
      expiresAt: row.expiresAt.toISOString() as ISOTimestamp,
      createdAt: row.createdAt.toISOString() as ISOTimestamp,
      updatedAt: row.updatedAt.toISOString() as ISOTimestamp,
    };
    return new BargainOffer(props);
  }
}
