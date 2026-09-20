/**
 * @file src/infrastructure/database/IdempotencyService.ts
 *
 * Single Responsibility: Manages webhook event deduplication and auditing
 * via the `IdempotencyLog` table to guarantee that payment and logistics
 * webhooks are executed exactly once.
 */

import { prisma } from '@/infrastructure/database/prismaClient';

export interface IdempotencyRecord {
  readonly id: string;
  readonly eventId: string;
  readonly provider: string;
  readonly status: 'PROCESSED' | 'FAILED';
  readonly processedAt: Date;
  readonly createdAt: Date;
}

export class IdempotencyService {
  // In-memory fallback cache for development & testing
  private static readonly memoryCache = new Map<string, IdempotencyRecord>();

  /**
   * Generates a composite key for a webhook event.
   */
  private static makeKey(provider: string, eventId: string): string {
    return `${provider.toUpperCase()}:${eventId}`;
  }

  /**
   * Checks if an event has already been processed.
   *
   * @param provider - 'RAZORPAY' | 'SHIPROCKET' | 'CASHFREE'
   * @param eventId - The provider's unique event ID (e.g. 'evt_xxx')
   * @returns `true` if previously processed, `false` otherwise
   */
  public static async isEventProcessed(provider: string, eventId: string): Promise<boolean> {
    const key = this.makeKey(provider, eventId);

    // 1. Check memory cache
    if (this.memoryCache.has(key)) {
      return true;
    }

    // 2. Check Database via Prisma
    try {
      const record = await prisma.idempotencyLog.findUnique({
        where: { eventId },
      });
      if (record) {
        this.memoryCache.set(key, {
          id: record.id,
          eventId: record.eventId,
          provider: record.provider,
          status: record.status as 'PROCESSED' | 'FAILED',
          processedAt: record.processedAt,
          createdAt: record.createdAt,
        });
        return true;
      }
    } catch {
      // Fallback to in-memory check
    }

    return false;
  }

  /**
   * Records an event as successfully processed in `IdempotencyLog`.
   *
   * @param provider - 'RAZORPAY' | 'SHIPROCKET' | 'CASHFREE'
   * @param eventId - The unique event ID
   * @param rawPayload - Optional raw body for audit logs
   */
  public static async recordEventProcessed(
    provider: string,
    eventId: string,
    rawPayload?: string
  ): Promise<void> {
    const key = this.makeKey(provider, eventId);
    const now = new Date();

    const record: IdempotencyRecord = {
      id: `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      eventId,
      provider: provider.toUpperCase(),
      status: 'PROCESSED',
      processedAt: now,
      createdAt: now,
    };

    // Save to memory cache
    this.memoryCache.set(key, record);

    // Save to database
    try {
      await prisma.idempotencyLog.create({
        data: {
          eventId,
          provider: provider.toUpperCase(),
          status: 'PROCESSED',
          payload: rawPayload ? rawPayload.substring(0, 4000) : null,
          processedAt: now,
        },
      });
    } catch (err) {
      console.warn(`[IdempotencyService] Warning: Could not persist to DB, cached in-memory:`, err);
    }
  }

  /**
   * Clears in-memory cache and test logs (primarily for automated testing).
   */
  public static async clearCache(): Promise<void> {
    this.memoryCache.clear();
    try {
      await prisma.idempotencyLog.deleteMany({});
    } catch {
      // ignore
    }
  }
}
