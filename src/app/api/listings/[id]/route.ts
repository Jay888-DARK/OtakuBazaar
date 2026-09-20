/**
 * @file src/app/api/listings/[id]/route.ts
 *
 * Route Handler for individual listing operations (/api/listings/:id).
 * Supports DELETE /api/listings/:id.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { ListingRepository } from '@/infrastructure/database/repositories/ListingRepository';

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const success = await ListingRepository.delete(id);
    if (!success) {
      return NextResponse.json({ error: 'Listing not found or could not be deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Listing deleted successfully' }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
