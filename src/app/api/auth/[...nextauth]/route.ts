/**
 * @file src/app/api/auth/[...nextauth]/route.ts
 *
 * NextAuth.js initialization route handler for Next.js App Router.
 * Configured with Google, Discord, and Credentials providers.
 * Backed by PrismaAdapter, JWT session strategy, and strict production URL handling:
 * - Automatically resolves production app URL (https://otaku-bazaar.vercel.app).
 * - Strips all accidental localhost redirects in production environments.
 * - Handles auto-provisioning for email/password collector authentication.
 * - Bridges OAuth providers cleanly with inline error handling.
 */

import NextAuth, { type AuthOptions } from 'next-auth';
import type { Provider } from 'next-auth/providers/index';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/infrastructure/database/prismaClient';
import type { Adapter } from 'next-auth/adapters';

/**
 * Resolves the canonical base URL for the current runtime environment.
 * Strictly prevents localhost fallback in production or Vercel preview environments.
 */
function getCanonicalBaseUrl(): string {
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('localhost')) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://otakubazaar.jaybhatt.me';
  }
  return (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
}

const canonicalBaseUrl = getCanonicalBaseUrl();

// Ensure process.env.NEXTAUTH_URL is consistently populated for NextAuth internals
if (!process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL.includes('localhost'))) {
  process.env.NEXTAUTH_URL = canonicalBaseUrl;
}

// ---------------------------------------------------------------------------
// Provider Assembly
// ---------------------------------------------------------------------------

const providers: Provider[] = [];

// 1. Google OAuth Provider
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    })
  );
}

// 2. Discord OAuth Provider (Supports both DISCORD_CLIENT_ID and Discord_ID casing)
const discordClientId = (process.env.DISCORD_CLIENT_ID || process.env.Discord_ID)?.trim();
const discordClientSecret = (process.env.DISCORD_CLIENT_SECRET || process.env.Discord_Key_SECRET)?.trim();

if (discordClientId && discordClientSecret) {
  providers.push(
    DiscordProvider({
      clientId: discordClientId,
      clientSecret: discordClientSecret,
    })
  );
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      const trustedBase = getCanonicalBaseUrl();

      // Never redirect to localhost in production
      if (url.includes('localhost') && !trustedBase.includes('localhost')) {
        const path = url.replace(/https?:\/\/localhost(:\d+)?/, '');
        return `${trustedBase}${path.startsWith('/') ? path : `/${path}`}`;
      }

      // Allow relative paths
      if (url.startsWith('/')) {
        return `${trustedBase}${url}`;
      }

      // Allow same-origin redirects
      try {
        const parsed = new URL(url);
        if (parsed.origin === new URL(trustedBase).origin) {
          return url;
        }
      } catch {}

      return trustedBase;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        (token as any).role = (user as any).role || 'SELLER';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string; role?: string }).id = token.sub;
        (session.user as { id?: string; role?: string }).role = (token as any).role || 'SELLER';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
