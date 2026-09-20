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
    .min(10, 'Description must be between 10 and 5000 characters')
    .max(5000, 'Description must be between 10 and 5000 characters'),
  imageUrls: z
    .array(z.string().url('Each image URL must be a valid URL'))
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
// Route Handlers
// ---------------------------------------------------------------------------

/**
 * Handles GET /api/listings — public browse endpoint.
 *
 * @returns JSON list of active listings
 */
export async function GET(): Promise<NextResponse> {
  try {
    const listings = await ListingRepository.findAllActive();
    return NextResponse.json(
      {
        total: listings.length,
        items: listings,
      },
      { status: 200 }
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
 * - Authentication: HttpOnly session cookie or Bearer token
 * - RBAC Role: SELLER or ADMIN
 * - Body: Validated against {@link CreateListingSchema}
 *
 * @param request - Incoming Next.js HTTP request
 * @returns JSON response with created listing or RFC 7807 error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Enforce Authentication and SELLER / ADMIN Role
    const authResult = RBACGuard.requireRole(request, ['SELLER', 'ADMIN']);
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
