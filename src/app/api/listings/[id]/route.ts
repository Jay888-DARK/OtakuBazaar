/**
 * @file src/app/api/listings/[id]/route.ts
 *
 * Route Handler for individual listing operations (/api/listings/:id).
 *
 * Endpoints:
 * - GET /api/listings/:id: Returns public lot DTO with zero seller PII.
 * - PATCH /api/listings/:id: Authenticated edit with strict IDOR ownership check.
 * - DELETE /api/listings/:id: Authenticated deletion with strict IDOR ownership check.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { ListingRepository, type ListingRecord } from '@/infrastructure/database/repositories/ListingRepository';
import { RBACGuard } from '@/infrastructure/security/RBACGuard';
import { RateLimiter } from '@/infrastructure/security/RateLimiter';
import { toPublicLotDTO, toPrivateLotDTO } from '@/app/api/listings/route';

const UpdateListingSchema = z.object({
  title: z.string().trim().min(3).max(150).optional(),
  description: z.string().trim().max(5000).optional(),
  askingPriceINR: z.number().positive().max(10_000_000).optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  category: z.string().trim().min(2).max(50).optional(),
  imageUrls: z.array(z.string()).min(1).max(10).optional(),
});

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

    const auth = await RBACGuard.authenticateAsync(_req);
    const canViewPrivate = Boolean(
      auth && (auth.role === 'ADMIN' || auth.userId === listing.sellerId)
    );

    return NextResponse.json(
      { lot: canViewPrivate ? toPrivateLotDTO(listing) : toPublicLotDTO(listing) },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Authenticated PATCH /api/listings/:id
 * Strictly enforces IDOR ownership: caller must own the lot or be an ADMIN.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const rateLimit = RateLimiter.check(`patch_listing_${clientIp}`, 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
      { status: 429 }
    );
  }

  try {
    // 1. Authenticate caller (supports NextAuth & custom JWT)
    const authResult = await RBACGuard.requireAuthAsync(req);
    if (!authResult.success) {
      return authResult.response;
    }
    const { user } = authResult;

    // 2. Resolve Target Listing
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const listing = await ListingRepository.findById(id.trim());
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found in vault registry' }, { status: 404 });
    }

    // 3. Strict IDOR Ownership Check
    if (user.role !== 'ADMIN' && listing.sellerId !== user.userId) {
      console.warn(
        `[Security IDOR Violation] User ${user.userId} attempted to edit listing ${id} owned by ${listing.sellerId}`
      );
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to modify this lot.' },
        { status: 403 }
      );
    }

    // 4. Validate Request Body
    const rawBody = await req.json();
    const parseResult = UpdateListingSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const data = parseResult.data;
    const patchData: Partial<ListingRecord> = {};

    if (data.title !== undefined) {
      patchData.title = data.title.replace(/<[^>]*>/g, '').trim();
    }
    if (data.description !== undefined) {
      patchData.description = data.description.replace(/<[^>]*>/g, '').trim();
    }
    if (data.askingPriceINR !== undefined) {
      patchData.askingPriceAmount = Math.round(data.askingPriceINR * 100);
    }
    if (data.condition !== undefined) {
      patchData.condition = data.condition;
    }
    if (data.category !== undefined) {
      patchData.category = data.category.replace(/<[^>]*>/g, '').trim();
    }
    if (data.imageUrls !== undefined) {
      patchData.imageUrls = data.imageUrls;
    }

    // 5. Update Database Record
    const updated = await ListingRepository.update(id.trim(), patchData);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }

    return NextResponse.json({ success: true, lot: toPublicLotDTO(updated) }, { status: 200 });
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
    const authResult = await RBACGuard.requireAuthAsync(req);
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
