/**
 * @file src/app/api/auth/logout/route.ts
 *
 * Authentication Logout Route Handler.
 *
 * Explicitly clears the HttpOnly session cookie by returning an expired
 * Set-Cookie header with maxAge=0.
 */

import { NextResponse } from 'next/server';
import { TokenService } from '@/infrastructure/security/TokenService';

/**
 * Handles POST /api/auth/logout
 *
 * @returns JSON response clearing the session cookie
 */
export async function POST(): Promise<NextResponse> {
  const logoutCookie = TokenService.getLogoutCookieOptions();

  const response = NextResponse.json(
    {
      message: 'Logged out successfully',
    },
    { status: 200 }
  );

  response.cookies.set({
    name: logoutCookie.name,
    value: logoutCookie.value,
    httpOnly: logoutCookie.httpOnly,
    secure: logoutCookie.secure,
    sameSite: logoutCookie.sameSite,
    path: logoutCookie.path,
    maxAge: logoutCookie.maxAge,
  });

  return response;
}
