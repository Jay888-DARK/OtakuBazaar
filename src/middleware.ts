/**
 * @file src/middleware.ts
 *
 * Next.js Edge Middleware for OtakuBazaar.
 * 1. Permanently redirects *.vercel.app traffic to https://otakubazaar.jaybhatt.me
 *    while preserving /api/auth, /api/webhooks, /api/checkout, /api/verify, and /api/cron.
 * 2. Enforces mandatory NextAuth JWT authentication on protected routes:
 *    - /sell and consignment creation flows
 *    - /vault-ops internal admin operations (requires ADMIN role)
 *
 * Legacy `otaku_session` cookies are strictly rejected.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const CANONICAL_HOST = 'otakubazaar.jaybhatt.me';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get('host') || '').toLowerCase();

  // 1. Permanent redirect from *.vercel.app to canonical domain (excluding auth & payment/logistics webhooks)
  if (
    host.endsWith('.vercel.app') &&
    !pathname.startsWith('/api/auth') &&
    !pathname.startsWith('/api/webhooks') &&
    !pathname.startsWith('/api/checkout') &&
    !pathname.startsWith('/api/verify') &&
    !pathname.startsWith('/api/cron')
  ) {
    const redirectUrl = new URL(req.url);
    redirectUrl.protocol = 'https:';
    redirectUrl.host = CANONICAL_HOST;
    return NextResponse.redirect(redirectUrl, 308);
  }

  // 2. Protect /sell and /vault-ops strictly via NextAuth JWT
  if (pathname.startsWith('/sell') || pathname.startsWith('/vault-ops')) {
    const secret = process.env.NEXTAUTH_SECRET;
    let token: Awaited<ReturnType<typeof getToken>> | null = null;

    if (secret) {
      try {
        token = await getToken({ req, secret });
      } catch {
        token = null;
      }
    }

    const userId = token?.sub || (token as { id?: string } | null)?.id;
    if (!userId) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith('/vault-ops') && (token as { role?: string } | null)?.role !== 'ADMIN') {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'ACCESS_DENIED_ADMIN_REQUIRED');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml).*)',
  ],
};
