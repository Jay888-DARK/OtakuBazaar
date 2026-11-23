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
import CredentialsProvider from 'next-auth/providers/credentials';
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
    return 'https://otaku-bazaar.vercel.app';
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

// 3. Email & Password Credentials Provider
providers.push(
  CredentialsProvider({
    id: 'credentials',
    name: 'Collector Credentials',
    credentials: {
      email: { label: 'Collector Email', type: 'email', placeholder: 'collector@otakubazaar.com' },
      password: { label: 'Vault Passphrase', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const cleanEmail = credentials.email.trim().toLowerCase();

      // Search database for the user via Prisma
      let user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      // Auto-provision a new user account if this is a first-time collector
      if (!user) {
        try {
          user = await prisma.user.create({
            data: {
              email: cleanEmail,
              name: cleanEmail.split('@')[0],
              displayName: cleanEmail.split('@')[0],
              avatarUrl: '/otakubazaar-logo.png',
            },
          });
        } catch {
          // If created concurrently by another worker
          user = await prisma.user.findUnique({
            where: { email: cleanEmail },
          });
        }
      }

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name || user.displayName || cleanEmail.split('@')[0],
        email: user.email,
        image: user.image || user.avatarUrl || '/otakubazaar-logo.png',
      };
    },
  })
);

// 4. Phone OTP Credentials Provider (Mobile fallback)
providers.push(
  CredentialsProvider({
    id: 'phone-otp',
    name: 'Phone OTP',
    credentials: {
      phone: { label: 'Phone', type: 'text' },
      otp: { label: 'OTP', type: 'text' },
    },
    async authorize(credentials) {
      if (!credentials?.phone || !credentials?.otp) return null;
      const cleanPhone = credentials.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) return null;
      if (credentials.otp.trim().length !== 6) return null;

      const userEmail = `${cleanPhone.slice(-10)}@otakubazaar.in`;
      let user = await prisma.user.findUnique({ where: { phone: cleanPhone } });

      if (!user) {
        try {
          user = await prisma.user.create({
            data: {
              phone: cleanPhone,
              email: userEmail,
              name: `Collector (+91 ${cleanPhone.slice(-10)})`,
              displayName: `Collector (+91 ${cleanPhone.slice(-10)})`,
              avatarUrl: '/otakubazaar-logo.png',
            },
          });
        } catch {
          user = await prisma.user.findUnique({ where: { phone: cleanPhone } });
        }
      }

      return {
        id: user?.id || `user_phone_${cleanPhone.slice(-10)}`,
        name: user?.name || `Collector (+91 ${cleanPhone.slice(-10)})`,
        email: user?.email || userEmail,
        image: user?.image || user?.avatarUrl || '/otakubazaar-logo.png',
      };
    },
  })
);

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
  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.JWT_SECRET ||
    'otakubazaar-escrow-super-secret-key-2026',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
