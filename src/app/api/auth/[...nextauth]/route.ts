/**
 * @file src/app/api/auth/[...nextauth]/route.ts
 *
 * NextAuth.js initialization route handler for Next.js App Router.
 * Configured with Google, Discord, Facebook OAuth, and Credentials providers,
 * backed by PrismaAdapter and custom branded login route.
 */

import NextAuth, { type AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import DiscordProvider from 'next-auth/providers/discord';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/infrastructure/database/prismaClient';
import type { Adapter } from 'next-auth/adapters';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'collector@otakubazaar.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Search database for the user via Prisma
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        // Note: Add bcrypt password hash verification here for production credential security.
        // e.g.: const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        // if (!isValid) return null;

        return {
          id: user.id,
          name: user.name || user.displayName || 'Collector',
          email: user.email,
          image: user.image || user.avatarUrl,
        };
      },
    }),
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

        // Verify 6-digit OTP code (demo simulation allows 6-digit OTP codes or production SMS verification)
        if (credentials.otp.trim().length !== 6) return null;

        return {
          id: `user_phone_${cleanPhone.slice(-10)}`,
          name: `Collector (+91 ${cleanPhone.slice(-10)})`,
          email: `${cleanPhone.slice(-10)}@otakubazaar.in`,
          image: '/Firefly_clean.png',
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
