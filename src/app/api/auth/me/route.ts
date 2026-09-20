/**
 * @file src/app/api/auth/me/route.ts
 *
 * Current Authenticated User Route Handler.
 *
 * Inspects incoming HttpOnly session cookie, verifies cryptographic validity,
 * and returns the authenticated user's profile and RBAC permissions.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { RBACGuard } from '@/infrastructure/security/RBACGuard';

/**
 * Handles GET /api/auth/me
 *
 * @param request - Incoming Next.js HTTP request
 * @returns JSON response with current user profile or 401
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = RBACGuard.requireAuth(request);

  if (!authResult.success) {
    return authResult.response;
  }

  const { user } = authResult;

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
    { status: 200 }
  );
}
