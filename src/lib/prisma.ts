/**
 * @file src/lib/prisma.ts
 *
 * Re-export singleton Prisma client instance for common @/lib/prisma imports.
 */

export { prisma } from '@/infrastructure/database/prismaClient';
