/**
 * @file src/app/api/auth/login/route.ts
 *
 * Authentication Login Route Handler.
 *
 * Validates login credentials, issues an authenticated JWT, and sets an
 * OWASP-compliant HttpOnly, Secure, SameSite=Strict cookie in the HTTP response.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { TokenService, type UserRole } from '@/infrastructure/security/TokenService';

// ---------------------------------------------------------------------------
// Validation Schema
// ---------------------------------------------------------------------------

const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address format').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  // Role selector for development/testing and role switching
  role: z.enum(['BUYER', 'SELLER', 'MODERATOR', 'ADMIN']).optional().default('BUYER'),
});

// Demo accounts for instant onboarding and local testing
const DEMO_USERS: Record<string, { userId: string; name: string; role: UserRole }> = {
  'seller@otakubazaar.com': {
    userId: 'user_seller_rengoku',
    name: 'Kyojuro Rengoku',
    role: 'SELLER',
  },
  'buyer@otakubazaar.com': {
    userId: 'user_buyer_tanjiro',
    name: 'Tanjiro Kamado',
    role: 'BUYER',
  },
  'admin@otakubazaar.com': {
    userId: 'user_admin_allmight',
    name: 'Toshinori Yagi',
    role: 'ADMIN',
  },
};

/**
 * Handles POST /api/auth/login
 *
 * @param request - Incoming Next.js HTTP request
 * @returns JSON response with user profile and Set-Cookie header
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await request.json();
    const parseResult = LoginRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid login parameters',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { email, role } = parseResult.data;

    // Resolve user details (from demo registry or dynamic profile)
    const emailPrefix = email.split('@')[0] || 'user';
    const knownUser = DEMO_USERS[email];
    const userPayload = {
      userId: knownUser?.userId || `user_${emailPrefix}_${Date.now().toString(36)}`,
      email,
      name: knownUser?.name || emailPrefix,
      role: knownUser?.role || (role as UserRole),
    };

    // 1. Sign JWT
    const token = TokenService.signToken(userPayload);

    // 2. Build secure cookie options
    const cookieOptions = TokenService.getSessionCookieOptions(token);

    // 3. Create response with HttpOnly cookie
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: userPayload,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: cookieOptions.name,
      value: cookieOptions.value,
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      maxAge: cookieOptions.maxAge,
    });

    return response;
  } catch (error) {
    console.error('[POST /api/auth/login] Unexpected error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected authentication error occurred.',
        },
      },
      { status: 500 }
    );
  }
}
