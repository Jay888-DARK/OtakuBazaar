/**
 * @file src/app/api/user/delete/route.ts
 *
 * Account & Personal Data Deletion API Route Handler for OtakuBazaar.
 *
 * Compliance Mandates:
 * 1. Verifies the active NextAuth session (with fallback to RBAC token auth).
 * 2. Executes an atomic Prisma transaction to permanently wipe:
 *    - User's Message history (senderId)
 *    - Active Session tokens (userId)
 *    - Associated non-cascading relations (offers, orders, listings, accounts)
 *    - Finally the User record from PostgreSQL / SQLite.
 * 3. Returns a standardized JSON response.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/infrastructure/database/prismaClient';
import { RBACGuard } from '@/infrastructure/security/RBACGuard';

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Strictly Verify Active NextAuth JWT Session (OAuth only; legacy cookies rejected)
    const authResult = await RBACGuard.requireAuthAsync(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: An active authenticated session is required to delete account data.',
        },
        { status: 401 }
      );
    }

    const targetUserId: string | null = authResult.user.userId ?? null;
    const targetUserEmail: string | null = authResult.user.email ?? null;

    // Resolve user ID if only email is present
    let finalUserId = targetUserId;
    if (!finalUserId && targetUserEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: targetUserEmail },
        select: { id: true },
      });
      if (existingUser) {
        finalUserId = existingUser.id;
      }
    }

    if (!finalUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User record not found.',
        },
        { status: 404 }
      );
    }

    const userId = finalUserId;

    // 4. Atomic Prisma Transaction to Wipe All User Data
    await prisma.$transaction(async (tx) => {
      // Step A: Purge user's Message history
      await tx.message.deleteMany({
        where: { senderId: userId },
      });

      // Step B: Purge user's active NextAuth Sessions
      await tx.session.deleteMany({
        where: { userId: userId },
      });

      // Step C: Purge related Bargain Offers (as buyer or seller)
      await tx.bargainOffer.deleteMany({
        where: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
      });

      // Step D: Clean up Orders and Escrow Ledger entries if user is buyer/seller
      const userOrders = await tx.order.findMany({
        where: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
        select: { id: true },
      });

      if (userOrders.length > 0) {
        const orderIds = userOrders.map((o) => o.id);
        await tx.escrowLedgerEntry.deleteMany({
          where: { orderId: { in: orderIds } },
        });
        await tx.order.deleteMany({
          where: { id: { in: orderIds } },
        });
      }

      // Step E: Purge Listings owned by user
      await tx.listing.deleteMany({
        where: { sellerId: userId },
      });

      // Step F: Purge NextAuth Account records
      await tx.account.deleteMany({
        where: { userId: userId },
      });

      // Step G: Finally delete the User record
      await tx.user.delete({
        where: { id: userId },
      });
    });

    // Clear session cookies in the response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Account and all associated personal records permanently deleted.',
      },
      { status: 200 }
    );

    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token');
    response.cookies.delete('otaku_session');

    return response;
  } catch (error) {
    console.error('[Account Deletion Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error while purging user data.',
      },
      { status: 500 }
    );
  }
}

// Support POST alias for form submissions or clients preferring POST
export async function POST(request: NextRequest): Promise<NextResponse> {
  return DELETE(request);
}
