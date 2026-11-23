/**
 * @file src/app/api/lots/[id]/route.ts
 *
 * Direct alias for /api/listings/:id to support REST endpoints using /api/lots/:id.
 */

export { GET, PATCH, DELETE } from '@/app/api/listings/[id]/route';
