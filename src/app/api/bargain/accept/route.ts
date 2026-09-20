/**
 * @file src/app/api/bargain/accept/route.ts
 *
 * Next.js 15 API Route Handler for POST /api/bargain/accept.
 *
 * Executes the offer acceptance workflow with atomic concurrency control:
 * 1. Validates authentication via HttpOnly session cookies (RBACGuard).
 * 2. Enforces input schema validation via Zod.
 * 3. Acquires a 15-minute atomic Redis distributed lock (`SETNX lock:listing:<id> <token> EX 900`).
 * 4. Transitions listing state to RESERVED.
 * 5. Broadcasts OFFER_ACCEPTED and LISTING_LOCKED events via Redis Pub/Sub for multi-window synchronization.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { RBACGuard } from '@/infrastructure/security/RBACGuard';
import { RedisSyncManager } from '@/infrastructure/realtime/RedisSyncManager';
import { ListingRepository } from '@/infrastructure/database/repositories/ListingRepository';
import { RateLimiter } from '@/infrastructure/security/RateLimiter';
import type { OutboundEvent } from '@/infrastructure/realtime/schemas/bargainingSchemas';

// ---------------------------------------------------------------------------
// Validation Schema
// ---------------------------------------------------------------------------

const AcceptOfferSchema = z.object({
  offerId: z.string().trim().min(1, 'offerId is required'),
  listingId: z.string().trim().min(1, 'listingId is required'),
  buyerId: z.string().trim().min(1, 'buyerId is required'),
  agreedPricePaise: z
    .number()
    .int('Price must be an integer in minor units (paise)')
    .positive('Price must be positive'),
});

/**
 * Handles POST /api/bargain/accept — accepts a bargain offer and locks the listing for 15 minutes.
 *
 * @param request - Incoming Next.js HTTP request
 * @returns JSON response with accepted offer details and checkout lock expiry
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  const rateLimit = RateLimiter.check(ip, 3000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Await counterparty response.' },
      { status: 429 }
    );
  }

  try {
    // 1. Enforce Authentication
    const authResult = RBACGuard.requireAuth(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult;

    // 2. Parse and Validate Request Body
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'MALFORMED_JSON', message: 'Invalid JSON body provided' } },
        { status: 400 }
      );
    }

    const parseResult = AcceptOfferSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid offer acceptance parameters',
            fieldErrors: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 422 }
      );
    }

    const { offerId, listingId, buyerId, agreedPricePaise } = parseResult.data;

    // 3. Verify Listing Existence
    const listing = await ListingRepository.findById(listingId);
    if (!listing) {
      return NextResponse.json(
        { error: { code: 'LISTING_NOT_FOUND', message: `Listing ${listingId} does not exist.` } },
        { status: 404 }
      );
    }

    // 4. Acquire 15-Minute Atomic Distributed Lock via Redis
    const redisSync = await RedisSyncManager.getInstance();
    const lockResult = await redisSync.acquireListingLock(
      listingId,
      buyerId,
      offerId,
      900 // 15 minutes = 900 seconds
    );

    if (!lockResult.acquired) {
      return NextResponse.json(
        {
          error: {
            code: 'LISTING_LOCKED',
            message: lockResult.error || 'Listing is currently locked for checkout by another buyer.',
            remainingTtlSeconds: lockResult.remainingTtlSeconds,
          },
        },
        { status: 409 }
      );
    }

    // 5. Reserve Listing in Store
    await ListingRepository.reserveListing(listingId, buyerId);

    // 6. Fan-Out Real-Time Notifications via Redis Pub/Sub
    const nowIso = new Date().toISOString();
    const lockExpiresAt = new Date(Date.now() + 900 * 1000).toISOString();

    const offerAcceptedEvent: OutboundEvent = {
      type: 'OFFER_ACCEPTED',
      payload: {
        offerId,
        conversationId: `conv_${listingId}_${buyerId}`,
        listingId,
        buyerId,
        sellerId: user.userId,
        agreedPrice: agreedPricePaise,
        currency: 'INR',
        lockExpiresAt,
        lockDurationSeconds: 900,
      },
      timestamp: nowIso,
      sequence: Date.now(),
    };

    const listingLockedEvent: OutboundEvent = {
      type: 'LISTING_LOCKED',
      payload: {
        listingId,
        lockedByUserId: buyerId,
        offerId,
        lockExpiresAt,
        remainingSeconds: 900,
      },
      timestamp: nowIso,
      sequence: Date.now(),
    };

    // Publish to listing channel and user channels
    await Promise.all([
      redisSync.publishEvent(redisSync.getListingChannel(listingId), offerAcceptedEvent),
      redisSync.publishEvent(redisSync.getListingChannel(listingId), listingLockedEvent),
      redisSync.publishEvent(redisSync.getUserChannel(buyerId), offerAcceptedEvent),
      redisSync.publishEvent(redisSync.getUserChannel(user.userId), offerAcceptedEvent),
    ]);

    return NextResponse.json(
      {
        message: 'Offer accepted successfully. Listing locked for 15-minute checkout window.',
        data: {
          offerId,
          listingId,
          agreedPricePaise,
          checkoutLock: {
            token: lockResult.token,
            durationSeconds: 900,
            expiresAt: lockExpiresAt,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/bargain/accept] Unexpected error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to accept bargain offer.' } },
      { status: 500 }
    );
  }
}
