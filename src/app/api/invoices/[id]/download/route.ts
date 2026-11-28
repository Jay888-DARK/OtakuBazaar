/**
 * @file src/app/api/invoices/[id]/download/route.ts
 *
 * Secure Invoice Download Endpoint.
 *
 * Implements 20-Point Security Baseline & Strict IDOR Prevention:
 * 1. Authentication check via HttpOnly cookie / Bearer JWT.
 * 2. Strict IDOR Authorization: only buyer, seller, or admin can access.
 * 3. Path traversal protection on route parameter.
 * 4. Content-Type: application/pdf with X-Content-Type-Options: nosniff.
 * 5. Clickjacking defense: X-Frame-Options: DENY.
 * 6. Cache Control: no-store, no-cache, must-revalidate, private.
 * 7. Content-Disposition: attachment; filename="OtakuBazaar-Invoice-[id].pdf".
 * 8. Cryptographic X-Invoice-Checksum: SHA-256 header.
 * 9. Rate limiting on repeated binary stream requests.
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACGuard } from '@/infrastructure/security/RBACGuard';
import { RateLimiter } from '@/infrastructure/security/RateLimiter';
import { InvoiceService } from '@/infrastructure/services/InvoiceService';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
): Promise<NextResponse> {
  // 1. Point 1: Authentication Enforcement
  const auth = await RBACGuard.requireAuthAsync(request);
  if (!auth.success) {
    return auth.response;
  }
  const caller = auth.user;

  // Resolve Next.js 15 params promise safely
  const resolvedParams = await context.params;
  const invoiceId = resolvedParams?.id?.trim();

  // 2. Point 4 & 13: Path Traversal & Parameter Sanitization
  if (!invoiceId || !/^[A-Za-z0-9\-_]+$/.test(invoiceId)) {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_IDENTIFIER',
          message: 'Invalid invoice ID format. Path traversal rejected.',
        },
      },
      { status: 400 }
    );
  }

  // 3. Point 8: Rate Limiting & DoS Mitigation
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rateCheck = RateLimiter.check(`inv_dl_${caller.userId}_${clientIp}`, 500);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Download request rate limit exceeded. Please wait a moment.',
          retryAfterMs: rateCheck.retryAfterMs,
        },
      },
      { status: 429 }
    );
  }

  // 4. Point 2: Strict IDOR Authorization Check via InvoiceService
  const downloadResult = InvoiceService.getInvoiceDownload(invoiceId, caller.userId, caller.role);

  if (!downloadResult.success || !downloadResult.pdfBuffer || !downloadResult.invoice) {
    return NextResponse.json(
      {
        error: {
          code: downloadResult.statusCode === 403 ? 'IDOR_FORBIDDEN' : downloadResult.statusCode === 404 ? 'NOT_FOUND' : 'DOWNLOAD_FAILED',
          message: downloadResult.error || 'Invoice download failed.',
        },
      },
      { status: downloadResult.statusCode }
    );
  }

  const { pdfBuffer, invoice } = downloadResult;
  const safeFilename = `OtakuBazaar-Invoice-${invoice.id.replace(/[^A-Za-z0-9\-]/g, '_')}.pdf`;

  // 5. Points 5, 6, 7, 9, 13, 14: Comprehensive 20-Point Security Headers
  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(pdfBuffer.length),
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'X-Invoice-Checksum': invoice.checksum,
      'X-Invoice-Id': invoice.id,
      'X-Order-Id': invoice.orderId,
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

