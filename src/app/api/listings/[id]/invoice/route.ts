/**
 * @file src/app/api/listings/[id]/invoice/route.ts
 *
 * Private invoice proof download endpoint.
 * Strictly enforces RBAC: only the listing's seller or an ADMIN may download.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { RBACGuard } from '@/infrastructure/security/RBACGuard';
import { ListingRepository } from '@/infrastructure/database/repositories/ListingRepository';
import { CloudStorageService } from '@/infrastructure/services/cloudStorageService';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await RBACGuard.requireAuthAsync(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Listing ID is required.' }, { status: 400 });
  }

  const listing = await ListingRepository.findById(id.trim());
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
  }

  if (authResult.user.role !== 'ADMIN' && listing.sellerId !== authResult.user.userId) {
    return NextResponse.json(
      { error: 'Forbidden: Only the listing seller or an admin can access invoice proof.' },
      { status: 403 }
    );
  }

  if (!listing.invoiceProofUrl) {
    return NextResponse.json({ error: 'No invoice proof attached to this listing.' }, { status: 404 });
  }

  const fetched = await CloudStorageService.fetchPrivateFile(listing.invoiceProofUrl);
  if (!fetched.success) {
    return NextResponse.json({ error: fetched.error }, { status: 502 });
  }

  return new NextResponse(new Uint8Array(fetched.buffer), {
    status: 200,
    headers: {
      'Content-Type': fetched.contentType,
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `inline; filename="invoice_${listing.id}"`,
    },
  });
}
