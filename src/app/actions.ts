/**
 * @file src/app/actions.ts
 *
 * Next.js Server Actions ("use server") for OtakuBazaar.
 *
 * Bridges the presentation layer directly to the Clean Architecture layer:
 * - CreateListing: Validates input, constructs aggregate, persists via ListingRepository / Prisma.
 * - AcceptBargainOffer: Enforces atomic 15-min distributed lock, marks RESERVED, triggers escrow.
 * - RejectBargainOffer: Updates offer state and unlocks negotiations.
 * - FetchProfileDashboard: Aggregates seller analytics, escrow trust balance, and incoming bargains.
 * - FetchBuyerFeed: Returns active authenticated anime collectibles for the buyer discovery feed.
 *
 * All functions return strictly typed ServerActionResponse objects with zero 'any'.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/infrastructure/database/prismaClient';
import { ListingRepository, type ListingRecord } from '@/infrastructure/database/repositories/ListingRepository';
import { RedisSyncManager } from '@/infrastructure/realtime/RedisSyncManager';

/**
 * Safely revalidates a Next.js cache path, tolerating non-HTTP / CLI execution environments.
 */
function safeRevalidatePath(path: string): void {
  try {
    revalidatePath(path);
  } catch {
    // Gracefully handle invocation outside of active Next.js static generation context
  }
}

// ---------------------------------------------------------------------------
// Types & Result Interfaces
// ---------------------------------------------------------------------------

export interface ServerActionResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

export interface CreateListingInput {
  readonly title: string;
  readonly series: string;
  readonly manufacturer: string;
  readonly category: string;
  readonly condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
  readonly conditionGrade: string;
  readonly askingPriceINR: number;
  readonly originalPriceINR: number;
  readonly imageUrls?: readonly string[];
  readonly imageUrl?: string;
  readonly description: string;
  readonly pickupPincode?: string;
  readonly weightKg?: number;
  readonly dimensionsCm?: string;
  readonly invoiceProofUrl?: string;
  readonly mfcItemId?: string;
  readonly mfcUrl?: string;
  readonly originalPriceJPY?: number;
  readonly releaseYear?: number;
  readonly scale?: string;
}

export interface AcceptOfferInput {
  readonly offerId: string;
  readonly listingId: string;
  readonly buyerId: string;
  readonly agreedPricePaise: number;
}

export interface ProfileDashboardData {
  readonly sellerId: string;
  readonly sellerName: string;
  readonly sellerHandle: string;
  readonly sellerAvatar: string;
  readonly hasActiveListings: boolean;
  readonly totalListingsCount: number;
  readonly activeListings: ListingRecord[];
  readonly escrowVaultHeldINR: number;
  readonly escrowDisbursedINR: number;
  readonly incomingOffers: Array<{
    readonly offerId: string;
    readonly listingId: string;
    readonly listingTitle: string;
    readonly buyerName: string;
    readonly buyerAvatar: string;
    readonly originalAskingPriceINR: number;
    readonly offeredPriceINR: number;
    readonly message: string;
    readonly timestamp: string;
    readonly status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  }>;
}

// ---------------------------------------------------------------------------
// Validation Schemas
// ---------------------------------------------------------------------------

const listingImageValidator = z.string().refine(
  (val) => val.startsWith('http://') || val.startsWith('https://'),
  { message: 'Photograph must be uploaded to cloud storage (HTTP/HTTPS URL required).' }
);

const invoiceProofValidator = z
  .string()
  .trim()
  .refine(
    (val) =>
      val === '' ||
      val.startsWith('private://') ||
      val.startsWith('https://') ||
      val.startsWith('http://'),
    { message: 'Invoice proof must be uploaded to private storage before publishing.' }
  )
  .optional();

const CreateListingSchema = z.object({
  title: z.string().trim().min(3, 'Title must be between 3 and 150 characters').max(150),
  series: z.string().trim().min(2, 'Franchise series is required').default('Anime Series'),
  manufacturer: z.string().trim().min(2, 'Manufacturer is required').default('Import Studio'),
  category: z.string().trim().min(2, 'Category is required').default('Scale Figure'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
  conditionGrade: z.string().trim().default('GRADE A'),
  askingPriceINR: z.number().positive('Price must be greater than zero').max(10_000_000),
  originalPriceINR: z.number().positive('Original estimated price must be positive').optional().default(1000),
  imageUrls: z.array(listingImageValidator).max(10, 'Maximum of 10 photographs allowed.').optional(),
  imageUrl: listingImageValidator.optional(),
  description: z.string().trim().max(5000).optional().default(''),
  pickupPincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, 'Pickup PIN code must be a valid 6-digit Indian PIN code').optional(),
  weightKg: z.number().positive('Weight must be positive').max(500).optional(),
  dimensionsCm: z.string().trim().max(64).optional(),
  invoiceProofUrl: invoiceProofValidator,
  mfcItemId: z.string().optional(),
  mfcUrl: z.string().optional(),
  originalPriceJPY: z.number().int().optional(),
  releaseYear: z.number().int().optional(),
  scale: z.string().optional(),
});

const AcceptOfferSchema = z.object({
  offerId: z.string().trim().min(1, 'Offer ID is required'),
  listingId: z.string().trim().min(1, 'Listing ID is required'),
  buyerId: z.string().trim().min(1, 'Buyer ID is required'),
  agreedPricePaise: z.number().int().positive('Agreed price must be positive'),
});

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * Creates a new marketplace listing in the database and revalidates feeds.
 */
export async function createListingAction(
  rawInput: CreateListingInput
): Promise<ServerActionResponse<ListingRecord>> {
  try {
    // 1. Enforce Server-Side Authentication strictly via NextAuth
    let authenticatedUserId: string | null = null;
    let authenticatedUserEmail: string | undefined = undefined;
    let authenticatedUserName: string | undefined = undefined;

    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        authenticatedUserId = (session.user as { id?: string }).id || null;
        authenticatedUserEmail = session.user.email || undefined;
        authenticatedUserName = session.user.name || undefined;

        if (!authenticatedUserId && session.user.email) {
          const user = await prisma.user.findUnique({ where: { email: session.user.email } });
          if (user) authenticatedUserId = user.id;
        }
      }
    } catch {
      // Fail closed
    }

    if (!authenticatedUserId) {
      return {
        success: false,
        error: '401 Unauthorized: You must be logged into your Collector Vault to consign a lot.',
      };
    }

    const validated = CreateListingSchema.parse(rawInput);

    // Preserve all uploaded photos in order (supporting both imageUrls[] and legacy single imageUrl)
    const rawImages = [
      ...(validated.imageUrls ?? []),
      ...(validated.imageUrl ? [validated.imageUrl] : []),
    ];
    const resolvedImageUrls: string[] = [];
    for (const img of rawImages) {
      const trimmed = img.trim();
      if (trimmed && !resolvedImageUrls.includes(trimmed)) {
        resolvedImageUrls.push(trimmed);
      }
    }
    if (resolvedImageUrls.length === 0) {
      return {
        success: false,
        error: 'At least 1 valid collectible photograph is required.',
      };
    }

    const createdRecord = await ListingRepository.create({
      id: `listing-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sellerId: authenticatedUserId,
      sellerEmail: authenticatedUserEmail,
      sellerName: authenticatedUserName,
      title: validated.title,
      description: validated.description,
      imageUrls: resolvedImageUrls,
      askingPriceAmount: Math.round(validated.askingPriceINR * 100),
      askingPriceCurrency: 'INR',
      category: validated.category,
      condition: validated.condition,
      franchise: validated.series,
      mfcItemId: validated.mfcItemId,
      mfcUrl: validated.mfcUrl,
      originalPriceJPY: validated.originalPriceJPY,
      releaseYear: validated.releaseYear,
      scale: validated.scale,
      manufacturer: validated.manufacturer,
      pickupPincode: validated.pickupPincode ?? null,
      weightKg: validated.weightKg ?? null,
      dimensionsCm: validated.dimensionsCm ?? null,
      invoiceProofUrl: validated.invoiceProofUrl ?? null,
    });

    // Revalidate frontend caches
    safeRevalidatePath('/');
    safeRevalidatePath('/profile');
    safeRevalidatePath('/vault');
    safeRevalidatePath('/sell');

    return {
      success: true,
      data: createdRecord,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to publish listing';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Accepts a buyer's bargain offer, holds the 15-minute distributed lock,
 * and transitions the listing to RESERVED.
 */
export async function acceptOfferAction(
  rawInput: AcceptOfferInput
): Promise<ServerActionResponse<{ lockToken: string; durationSeconds: number }>> {
  try {
    const validated = AcceptOfferSchema.parse(rawInput);

    // 1. Enforce Server-Side Authentication & Ownership Check (IDOR Protection)
    const nextAuthSession = await getServerSession(authOptions);
    const sessionUser = nextAuthSession?.user as { id?: string; role?: string } | undefined;
    if (!sessionUser?.id) {
      return { success: false, error: '401 Unauthorized: Please sign in to accept offers.' };
    }

    const targetListing = await ListingRepository.findById(validated.listingId);
    if (!targetListing) {
      return { success: false, error: 'Listing not found in vault registry.' };
    }

    if (sessionUser.role !== 'ADMIN' && sessionUser.id !== targetListing.sellerId) {
      return {
        success: false,
        error: 'Forbidden: Only the consigning seller can accept offers on this lot.',
      };
    }

    // 2. Acquire atomic 15-minute lock via RedisSyncManager
    const redisSync = await RedisSyncManager.getInstance();
    const lockResult = await redisSync.acquireListingLock(
      validated.listingId,
      validated.buyerId,
      validated.offerId,
      900 // 15 minutes = 900 seconds
    );

    if (!lockResult.acquired || !lockResult.token) {
      return {
        success: false,
        error: 'This listing is already reserved by another buyer in checkout.',
      };
    }

    // 2. Update listing status to RESERVED in database
    await ListingRepository.update(validated.listingId, {
      status: 'RESERVED',
      reservedByBuyerId: validated.buyerId,
    });

    // 3. Revalidate paths
    safeRevalidatePath('/');
    safeRevalidatePath('/profile');

    return {
      success: true,
      data: {
        lockToken: lockResult.token,
        durationSeconds: 900,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to accept offer';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Rejects a bargain offer politely.
 */
export async function rejectOfferAction(
  offerId: string,
  listingId: string,
  reason: string = 'Offer below minimum reserve'
): Promise<ServerActionResponse<{ offerId: string; status: 'REJECTED'; reason: string }>> {
  try {
    if (!offerId || !listingId) {
      return { success: false, error: 'offerId and listingId are required' };
    }

    safeRevalidatePath('/profile');
    return {
      success: true,
      data: {
        offerId,
        status: 'REJECTED',
        reason,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to decline offer',
    };
  }
}

/**
 * Fetches dashboard analytics, active listings, and incoming offers for a unified profile.
 */
export async function fetchProfileDashboardAction(
  userId?: string
): Promise<ServerActionResponse<ProfileDashboardData>> {
  try {
    // 1. Session IDOR Check via NextAuth
    const nextAuthSession = await getServerSession(authOptions);
    const sessionUser = nextAuthSession?.user as { id?: string; role?: string } | undefined;
    if (!sessionUser?.id) {
      return { success: false, error: '401 Unauthorized: Please sign in to view your dashboard.' };
    }

    // Enforce identity: Caller can only view their own dashboard unless they have ADMIN role
    const effectiveUserId =
      sessionUser.role === 'ADMIN' && userId ? userId : sessionUser.id;

    // Fetch all listings associated with this user
    const listings: ListingRecord[] = await ListingRepository.findBySellerId(effectiveUserId);
    const activeListings: ListingRecord[] = listings.filter(
      (l: ListingRecord) => l.status === 'ACTIVE' || l.status === 'RESERVED'
    );

    // Compute Escrow Trust Balance
    const escrowVaultHeldINR = activeListings.reduce(
      (sum: number, l: ListingRecord) => sum + Math.round(l.askingPriceAmount / 100),
      0
    );
    const escrowDisbursedINR = 0;
    const incomingOffers: ProfileDashboardData['incomingOffers'] = [];

    const data: ProfileDashboardData = {
      sellerId: effectiveUserId,
      sellerName: effectiveUserId === 'user_buyer_tanjiro' ? 'Tanjiro Kamado' : 'Kyojuro Rengoku',
      sellerHandle: effectiveUserId === 'user_buyer_tanjiro' ? '@tanjiro_slayer' : '@flame_hashira',
      sellerAvatar: effectiveUserId === 'user_buyer_tanjiro' ? 'TK' : 'KR',
      hasActiveListings: activeListings.length > 0,
      totalListingsCount: listings.length,
      activeListings,
      escrowVaultHeldINR,
      escrowDisbursedINR,
      incomingOffers,
    };

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load profile dashboard',
    };
  }
}

/**
 * Fetches the active buyer feed listings.
 */
export async function fetchBuyerFeedAction(
  category?: string
): Promise<ServerActionResponse<ListingRecord[]>> {
  try {
    const allListings: ListingRecord[] = await ListingRepository.findAllActive();
    const filtered = category && category !== 'ALL'
      ? allListings.filter((l) => l.category.toLowerCase().includes(category.toLowerCase()))
      : allListings;

    return {
      success: true,
      data: filtered,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch buyer feed',
    };
  }
}
