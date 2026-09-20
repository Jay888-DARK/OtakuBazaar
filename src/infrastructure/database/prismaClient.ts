/**
 * @file src/infrastructure/database/prismaClient.ts
 *
 * Prisma Client singleton for OtakuBazaar.
 *
 * In development, Next.js hot-reloads modules and would create a new
 * PrismaClient on every reload, exhausting database connections.
 * This pattern stores a single instance on `globalThis` to prevent that.
 *
 * Includes graceful configuration check and informative diagnostics for DATABASE_URL.
 *
 * @see https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from '@prisma/client';

// Validate database configuration
if (!process.env['DATABASE_URL']) {
  console.warn(
    '\n================================================================================\n' +
    '[OtakuBazaar Database Warning]\n' +
    'DATABASE_URL environment variable is missing.\n' +
    'Please configure DATABASE_URL in your .env file:\n' +
    '  - Local SQLite:     DATABASE_URL="file:./dev.db"\n' +
    '  - Production PG:    DATABASE_URL="postgresql://user:password@localhost:5432/otakubazaar"\n' +
    '================================================================================\n'
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const basePrisma = globalForPrisma.prisma ?? new PrismaClient();

/**
 * Singleton PrismaClient instance.
 */
export const prisma: PrismaClient = basePrisma;
export default prisma;

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}
