/**
 * @file src/app/api/listings/[id]/route.ts
 *
 * Route Handler for individual listing operations (/api/listings/:id).
 *
 * Endpoints:
 * - GET /api/listings/:id: Returns public lot DTO with zero seller PII.
 * - DELETE /api/listings/:id: Strictly authenticated with IDOR ownership enforcement.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { ListingRepository } from '@/infrastructure/database/repositories/ListingRepository';
import { RBACGuard } from '@/infrastructure/security/RBACGuard';
import { RateLimiter } from '@/infrastructure/security/RateLimiter';
import { toPublicLotDTO } from '@/app/api/listings/route';

/**
 * Public GET /api/listings/:id
 * Returns strictly allowlisted PublicLotDTO with zero seller PII.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Valid listing ID is required' }, { status: 400 });
    }

    const listing = await ListingRepository.findById(id.trim());
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found in vault registry' }, { status: 404 });
    }

    return NextResponse.json({ lot: toPublicLotDTO(listing) }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Authenticated DELETE /api/listings/:id
 * Strictly enforces IDOR ownership: caller must be the verified seller or an ADMIN.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // 1. Rate Limiting Protection
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const rateLimit = RateLimiter.check(`del_listing_${clientIp}`, 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
      { status: 429 }
    );
  }

  try {
    // 2. Server-Side Authentication Enforcement
    const authResult = RBACGuard.requireAuth(req);
    if (!authResult.success) {
      return authResult.response;
    }
    const { user } = authResult;

    // 3. Resolve Target Listing
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const listing = await ListingRepository.findById(id.trim());
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found or already deleted' }, { status: 404 });
    }

    // 4. Strict IDOR Ownership Check: Caller must own the listing or have ADMIN role
    if (user.role !== 'ADMIN' && listing.sellerId !== user.userId) {
      console.warn(
        `[Security IDOR Violation] User ${user.userId} attempted to delete listing ${id} owned by ${listing.sellerId}`
      );
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to delete this listing.' },
        { status: 403 }
      );
    }

    // 5. Execute Deletion
    const success = await ListingRepository.delete(id.trim());
    if (!success) {
      return NextResponse.json({ error: 'Could not delete listing' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Listing deleted successfully' }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
