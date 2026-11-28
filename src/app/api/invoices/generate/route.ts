/**
 * @file src/app/api/invoices/generate/route.ts
 *
 * Secure Invoice Generation Endpoint.
 *
 * OWASP & 20-Point Security Baseline:
 * - Requires authentication via HttpOnly session cookie or Bearer JWT token.
 * - Enforces Zod input validation and payload bounds.
 * - Blocks Insecure Direct Object References (IDOR): callers can only generate
 *   invoices for orders where they are the buyer or seller (or elevated admin).
 * - Enforces rate limiting against abusive generation attempts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RBACGuard } from '@/infrastructure/security/RBACGuard';
import { RateLimiter } from '@/infrastructure/security/RateLimiter';
import { InvoiceService } from '@/infrastructure/services/InvoiceService';

const generateInvoiceSchema = z.object({
  orderId: z
    .string()
    .min(1, 'orderId cannot be empty')
    .max(100, 'orderId exceeds maximum length')
    .regex(/^[A-Za-z0-9\-_]+$/, 'orderId contains invalid characters'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Point 1: Authentication Enforcement
  const auth = await RBACGuard.requireAuthAsync(request);
  if (!auth.success) {
    return auth.response;
  }
  const caller = auth.user;

  // 2. Point 8: Rate Limiting & DoS Mitigation
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rateCheck = RateLimiter.check(`inv_gen_${caller.userId}_${clientIp}`, 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many invoice generation requests. Please retry in a moment.',
          retryAfterMs: rateCheck.retryAfterMs,
        },
      },
      { status: 429 }
    );
  }

  // 3. Point 3 & 18: Input Validation & Payload Size Boundary
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_JSON',
          message: 'Malformed JSON payload.',
        },
      },
      { status: 400 }
    );
  }

  const parsed = generateInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  const { orderId } = parsed.data;

  // 4. Point 2: Strict Object-Level Authorization (IDOR Prevention) via InvoiceService
  const result = await InvoiceService.generateInvoice(orderId, caller.userId, caller.role);

  if (!result.success || !result.invoice) {
    return NextResponse.json(
      {
        error: {
          code: result.statusCode === 403 ? 'IDOR_FORBIDDEN' : result.statusCode === 404 ? 'NOT_FOUND' : 'GENERATION_FAILED',
          message: result.error || 'Failed to generate invoice.',
        },
      },
      { status: result.statusCode }
    );
  }

  const invoice = result.invoice;

  // Return standardized success response with download link and checksum
  return NextResponse.json(
    {
      success: true,
      invoice: {
        id: invoice.id,
        orderId: invoice.orderId,
        buyerId: invoice.buyerId,
        sellerId: invoice.sellerId,
        itemTitle: invoice.itemTitle,
        amountINR: invoice.amountINR,
        currency: invoice.currency,
        escrowStatus: invoice.escrowStatus,
        checksum: invoice.checksum,
        downloadUrl: `/api/invoices/${encodeURIComponent(invoice.id)}/download`,
        createdAt: invoice.createdAt,
      },
    },
    {
      status: result.statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        Pragma: 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    }
  );
}
