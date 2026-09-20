/**
 * @file src/infrastructure/database/repositories/PrismaListingRepository.ts
 *
 * Prisma-based implementation of the IListingRepository port.
 * Translates between Prisma's database model and the domain's Listing aggregate.
 * This is the ONLY file in the codebase that knows about Prisma's Listing model.
 */

import type { PrismaClient, Listing as PrismaListing } from '@prisma/client';
import type { IListingRepository } from '@/domain/repositories/IListingRepository';
import { Listing, type ListingProps } from '@/domain/entities/Listing';
import { Money } from '@/domain/value-objects/Money';
import type { ListingStatusType } from '@/domain/value-objects/ListingStatus';
import {
  toListingId,
  toUserId,
  type ListingId,
  type UserId,
  type PaginationInput,
  type PaginatedResult,
  type ISOTimestamp,
  type CurrencyCode,
} from '@/domain/types';

function serializeImageUrls(urls: unknown): string {
  if (Array.isArray(urls)) {
    return JSON.stringify(urls);
  }
  if (typeof urls === 'string' && urls.startsWith('[')) {
    return urls;
  }
  return JSON.stringify([urls || '']);
}

function deserializeImageUrls(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw as string[];
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as string[];
      return [raw];
    } catch {
      return [raw];
    }
  }
  return [];
}

/**
 * Prisma adapter for the {@link IListingRepository} port.
 *
 * Handles all ORM-specific mapping logic — the domain layer never touches
 * Prisma types directly.
 */
export class PrismaListingRepository implements IListingRepository {
  /**
   * @param prisma - Prisma client instance (injected, not imported globally).
   */
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * {@inheritDoc IListingRepository.findById}
   */
  async findById(id: ListingId): Promise<Listing | null> {
    const row = await this.prisma.listing.findUnique({
      where: { id },
    });
    return row ? this.toDomain(row) : null;
  }

  /**
   * {@inheritDoc IListingRepository.findBySellerId}
   */
  async findBySellerId(
    sellerId: UserId,
    pagination: PaginationInput
  ): Promise<PaginatedResult<Listing>> {
    const [rows, totalCount] = await Promise.all([
      this.prisma.listing.findMany({
        where: { sellerId },
        take: pagination.limit,
        ...(pagination.cursor ? { skip: 1, cursor: { id: pagination.cursor } } : {}),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count({ where: { sellerId } }),
    ]);

    return {
      items: rows.map((row) => this.toDomain(row)),
      nextCursor: rows.length === pagination.limit ? rows[rows.length - 1]?.id ?? null : null,
      totalCount,
    };
  }

  /**
   * {@inheritDoc IListingRepository.findByStatus}
   */
  async findByStatus(
    status: ListingStatusType,
    pagination: PaginationInput
  ): Promise<PaginatedResult<Listing>> {
    const [rows, totalCount] = await Promise.all([
      this.prisma.listing.findMany({
        where: { status },
        take: pagination.limit,
        ...(pagination.cursor ? { skip: 1, cursor: { id: pagination.cursor } } : {}),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count({ where: { status } }),
    ]);

    return {
      items: rows.map((row) => this.toDomain(row)),
      nextCursor: rows.length === pagination.limit ? rows[rows.length - 1]?.id ?? null : null,
      totalCount,
    };
  }

  /**
   * {@inheritDoc IListingRepository.create}
   */
  async create(listing: Listing): Promise<Listing> {
    const row = await this.prisma.listing.create({
      data: {
        id: listing.id,
        sellerId: listing.sellerId,
        title: listing.title,
        description: listing.description,
        imageUrls: serializeImageUrls(listing.imageUrls),
        askingPriceAmount: listing.askingPrice.amountInSmallestUnit,
        askingPriceCurrency: listing.askingPrice.currency,
        status: listing.status,
        category: listing.category,
        condition: listing.condition,
        reservedByBuyerId: listing.reservedByBuyerId,
      },
    });
    return this.toDomain(row);
  }

  /**
   * {@inheritDoc IListingRepository.update}
   */
  async update(listing: Listing): Promise<Listing> {
    const row = await this.prisma.listing.update({
      where: { id: listing.id },
      data: {
        status: listing.status,
        reservedByBuyerId: listing.reservedByBuyerId,
      },
    });
    return this.toDomain(row);
  }

  /**
   * {@inheritDoc IListingRepository.delete}
   */
  async delete(id: ListingId): Promise<boolean> {
    try {
      await this.prisma.listing.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // -----------------------------------------------------------------------
  // Mapper: Prisma Row → Domain Aggregate
  // -----------------------------------------------------------------------

  /**
   * Maps a Prisma database row to a domain Listing aggregate.
   *
   * @param row - The raw Prisma listing model.
   * @returns A hydrated Listing domain entity.
   */
  private toDomain(row: PrismaListing): Listing {
    const props: ListingProps = {
      id: toListingId(row.id),
      sellerId: toUserId(row.sellerId),
      title: row.title,
      description: row.description,
      imageUrls: deserializeImageUrls(row.imageUrls),
      askingPrice: new Money(
        row.askingPriceAmount,
        row.askingPriceCurrency as CurrencyCode
      ),
      status: row.status as ListingStatusType,
      category: row.category,
      condition: row.condition as ListingProps['condition'],
      reservedByBuyerId: row.reservedByBuyerId
        ? toUserId(row.reservedByBuyerId)
        : null,
      createdAt: row.createdAt.toISOString() as ISOTimestamp,
      updatedAt: row.updatedAt.toISOString() as ISOTimestamp,
    };
    return new Listing(props);
  }
}
