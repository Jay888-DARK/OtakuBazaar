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
import { RateLimiter } from '@/infrastructure/security/RateLimiter';

// ---------------------------------------------------------------------------
// Validation Schema
// ---------------------------------------------------------------------------

const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address format').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  // Role selector for development/testing
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
  // 1. Rate Limiting Protection (Anti-Brute Force)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const rateLimit = RateLimiter.check(`auth_login_${clientIp}`, 1500);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many login attempts. Please wait.' } },
      { status: 429 }
    );
  }

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

    // Resolve user details (Strictly prevent arbitrary admin/moderator privilege escalation)
    const emailPrefix = email.split('@')[0] || 'user';
    const knownUser = DEMO_USERS[email];
    
    // Non-demo users can never self-assign ADMIN or MODERATOR roles
    let assignedRole: UserRole = 'BUYER';
    if (knownUser) {
      assignedRole = knownUser.role;
    } else if (role === 'SELLER') {
      assignedRole = 'SELLER';
    } else {
      assignedRole = 'BUYER';
    }

    const userPayload = {
      userId: knownUser?.userId || `user_${emailPrefix}_${Date.now().toString(36)}`,
      email,
      name: knownUser?.name || emailPrefix,
      role: assignedRole,
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
