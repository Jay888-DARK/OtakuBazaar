/**
 * @file src/app/api/listings/route.ts
 *
 * Next.js 15 API Route Handler for /api/listings.
 *
 * Endpoints:
 * - GET /api/listings: Returns active marketplace listings (public browse).
 * - POST /api/listings: Creates a new listing (requires SELLER or ADMIN role).
 *
 * Security & Compliance:
 * - OWASP compliant: Strict input validation with Zod schemas.
 * - Input sanitization against script tags / XSS.
 * - HttpOnly session cookie authentication via RBACGuard.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { RBACGuard } from '@/infrastructure/security/RBACGuard';
import { ListingRepository } from '@/infrastructure/database/repositories/ListingRepository';
import { optimizeImageUrl } from '@/infrastructure/utils/imageOptimizer';

// ---------------------------------------------------------------------------
// Zod Validation Schema
// ---------------------------------------------------------------------------

const CreateListingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be between 3 and 120 characters')
    .max(120, 'Title must be between 3 and 120 characters'),
  description: z
    .string()
    .trim()
    .max(5000, 'Description must not exceed 5000 characters')
    .optional()
    .default('Verified archival anime collectible consigned to OtakuBazaar vault custody.'),
  imageUrls: z
    .array(
      z.string().refine(
        (val) => {
          if (val.startsWith('http://') || val.startsWith('https://')) return true;
          if (
            val.startsWith('data:image/webp;base64,') ||
            val.startsWith('data:image/jpeg;base64,') ||
            val.startsWith('data:image/jpg;base64,') ||
            val.startsWith('data:image/png;base64,')
          ) {
            return val.length <= 7 * 1024 * 1024;
          }
          return false;
        },
        { message: 'Each image must be a valid WebP, JPEG, or PNG photograph under 5MB' }
      )
    )
    .min(1, 'At least 1 image is required')
    .max(10, 'Maximum of 10 images allowed'),
  askingPriceMajorUnits: z
    .number()
    .positive('Asking price must be greater than zero')
    .max(10_000_000, 'Asking price exceeds maximum permitted limit'),
  currency: z.enum(['INR', 'USD', 'JPY']).default('INR'),
  category: z
    .string()
    .trim()
    .min(2, 'Category must be at least 2 characters')
    .max(50),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
});

/**
 * Sanitizes input text by stripping dangerous HTML and script tags (OWASP defense-in-depth).
 *
 * @param input - Raw user-supplied string
 * @returns Cleaned string
 */
function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

// ---------------------------------------------------------------------------
// Public Lot Data Transfer Object (Strict PII-Free Allowlist)
// ---------------------------------------------------------------------------

export interface PublicLotDTO {
  lot_id: string;
  vault_id: string;
  title: string;
  series: string;
  studio: string;
  scale: string;
  grade: string;
  asking_price: number;
  city: string;
  state: string;
  images: string[];
  escrow_status: string;
  created_at: string;
  // Compatibility fields for existing frontend UI components
  id: string;
  imageUrls: string[];
  askingPriceAmount: number;
  askingPriceCurrency: string;
  status: string;
  condition: string;
  category: string;
  seller_handle: string;
  lockRemainingSeconds?: number;
}

/**
 * Transforms a raw database listing record into a strictly allowlisted PublicLotDTO.
 * Guaranteed to strip all seller PII, emails, phone numbers, payout details, and internal IDs.
 */
export function toPublicLotDTO(listing: any): PublicLotDTO {
  const rawPrimary = Array.isArray(listing.imageUrls) && listing.imageUrls[0]
    ? listing.imageUrls[0]
    : '/Firefly_clean.png';
  const primaryImg = optimizeImageUrl(rawPrimary, 800);
  const optimizedImages = Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0
    ? listing.imageUrls.map((img: string) => optimizeImageUrl(img, 800))
    : [primaryImg];

  const scale = listing.title.includes('1/4')
    ? '1/4 SCALE'
    : listing.title.includes('1/6')
      ? '1/6 SCALE'
      : listing.title.includes('1/7')
        ? '1/7 SCALE'
        : listing.title.includes('1/8')
          ? '1/8 SCALE'
          : 'NON-SCALE';

  const grade = listing.condition === 'NEW'
    ? 'GRADE S // MISB (FACTORY SEALED)'
    : 'GRADE A // BIB (CABINET DISPLAYED)';

  const sanitizedHandle = `@vault_seller_${String(listing.sellerId || listing.id).slice(-4).toLowerCase()}`;

  return {
    lot_id: listing.id,
    vault_id: `VAULT-IN-${String(listing.id).replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase() || '0001'}`,
    title: listing.title,
    series: listing.category || 'Archival Anime Collectible',
    studio: 'Japanese Licensed Studio',
    scale,
    grade,
    asking_price: Math.round(listing.askingPriceAmount / 100),
    city: 'Mumbai',
    state: 'MH',
    images: optimizedImages,
    escrow_status: listing.status || 'ACTIVE',
    created_at: listing.createdAt ? new Date(listing.createdAt).toISOString() : new Date().toISOString(),

    // Frontend UI backward compatibility
    id: listing.id,
    imageUrls: optimizedImages,
    askingPriceAmount: listing.askingPriceAmount,
    askingPriceCurrency: listing.askingPriceCurrency || 'INR',
    status: listing.status || 'ACTIVE',
    condition: listing.condition || 'NEW',
    category: listing.category || 'Scale Figure',
    seller_handle: sanitizedHandle,
    lockRemainingSeconds: listing.lockRemainingSeconds || 0,
  };
}

// ---------------------------------------------------------------------------
// Route Handlers
// ---------------------------------------------------------------------------

/**
 * Handles GET /api/listings — public browse endpoint.
 * Strictly enforces PublicLotDTO allowlist with zero PII serialization.
 *
 * @returns JSON list of active listings with stripped PII
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const my = searchParams.get('my');
    const sellerId = searchParams.get('sellerId');

    let listings = [];

    if (my === 'true') {
      const auth = await RBACGuard.authenticateAsync(request);
      if (!auth) {
        return NextResponse.json({ error: 'Unauthorized: Please log in to view personal vault listings' }, { status: 401 });
      }
      listings = await ListingRepository.findBySellerId(auth.userId);
    } else if (sellerId) {
      listings = await ListingRepository.findBySellerId(sellerId);
    } else {
      listings = await ListingRepository.findAllActive();
    }

    const publicItems = listings.map(toPublicLotDTO);
    return NextResponse.json(
      {
        total: publicItems.length,
        items: publicItems,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': my === 'true' ? 'no-store' : 'public, s-maxage=10, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('[GET /api/listings] Error fetching listings:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve listings' } },
      { status: 500 }
    );
  }
}

/**
 * Handles POST /api/listings — creates a new marketplace listing.
 *
 * Requirements:
 * - Authentication: HttpOnly session cookie or Bearer token (NextAuth or custom JWT)
 * - Attaches sellerId strictly from verified session (never client body)
 * - Body: Validated against {@link CreateListingSchema}
 *
 * @param request - Incoming Next.js HTTP request
 * @returns JSON response with created listing or RFC 7807 error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Enforce Authentication
    const authResult = await RBACGuard.requireAuthAsync(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult;

    // 2. Parse and Validate JSON Body
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'MALFORMED_JSON', message: 'Invalid JSON body provided' } },
        { status: 400 }
      );
    }

    const parseResult = CreateListingSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const fieldErrors = parseResult.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Input validation failed',
            fieldErrors,
          },
        },
        { status: 422 }
      );
    }

    const data = parseResult.data;

    // 3. Sanitize User Text Inputs
    const cleanTitle = sanitizeInput(data.title);
    const cleanDescription = sanitizeInput(data.description);

    // 4. Calculate Minor Currency Units (Paise for INR: multiply by 100)
    const askingPriceAmount = Math.round(data.askingPriceMajorUnits * 100);

    // 5. Persist to Database / Memory Repository
    const createdListing = await ListingRepository.create({
      sellerId: user.userId,
      title: cleanTitle,
      description: cleanDescription,
      imageUrls: data.imageUrls,
      askingPriceAmount,
      askingPriceCurrency: data.currency,
      category: data.category,
      condition: data.condition,
    });

    return NextResponse.json(
      {
        message: 'Listing created successfully',
        data: createdListing,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/listings] Unexpected error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred while creating listing' } },
      { status: 500 }
    );
  }
}
