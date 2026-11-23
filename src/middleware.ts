/**
 * @file src/middleware.ts
 *
 * Next.js Edge Middleware for OtakuBazaar.
 * Enforces mandatory collector authentication on protected routes:
 * - /sell and consignment creation flows
 * - /vault-ops internal operations
 *
 * Checks both NextAuth session cookies (next-auth.session-token / __Secure-next-auth.session-token)
 * and custom JWT session cookies (otaku_session).
 * Unauthenticated requests are immediately redirected to /login?callbackUrl=<requested_path>.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /sell and /vault-ops
  if (pathname.startsWith('/sell') || pathname.startsWith('/vault-ops')) {
    const hasCustomSession = req.cookies.has('otaku_session');
    const hasNextAuthCookie =
      req.cookies.has('next-auth.session-token') ||
      req.cookies.has('__Secure-next-auth.session-token');

    let isAuthenticated = hasCustomSession;

    if (!isAuthenticated && hasNextAuthCookie) {
      try {
        const secret =
          process.env.NEXTAUTH_SECRET ||
          process.env.JWT_SECRET ||
          'otakubazaar-escrow-super-secret-key-2026';
        const token = await getToken({ req, secret });
        if (token && (token.sub || (token as any).id)) {
          isAuthenticated = true;
        }
      } catch {
        // Non-blocking fallback
      }
    }

    if (!isAuthenticated) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/sell',
    '/sell/:path*',
    '/vault-ops',
    '/vault-ops/:path*',
  ],
};
