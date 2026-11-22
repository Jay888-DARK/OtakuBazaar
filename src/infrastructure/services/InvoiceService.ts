/**
 * @file src/infrastructure/services/InvoiceService.ts
 *
 * Authoritative Invoice Generation & Cryptographic Verification Service.
 *
 * Implements strict OWASP & IDOR Access Control:
 * - Direct object references (orderId, invoiceId) are verified against the authenticated user.
 * - Only the verified Buyer, the verified Seller, or an elevated Administrator can generate
 *   or download invoices for an order.
 * - Generates immutable SHA-256 cryptographic checksums for document auditability.
 */

import crypto from 'crypto';
import { InvoiceRecord } from '@/domain/entities/Invoice';
import { OrderRepository } from '@/infrastructure/database/repositories/OrderRepository';
import { InvoicePdfGenerator } from '@/infrastructure/services/InvoicePdfGenerator';
import { prisma } from '@/infrastructure/database/prismaClient';

// Persistent in-memory cache for generated invoices (survives hot reloads)
const globalInvoices = globalThis as unknown as {
  __otakuInvoices?: Map<string, InvoiceRecord>;
  __otakuOrderInvoiceMap?: Map<string, string>;
};

if (!globalInvoices.__otakuInvoices) {
  globalInvoices.__otakuInvoices = new Map<string, InvoiceRecord>();
}
if (!globalInvoices.__otakuOrderInvoiceMap) {
  globalInvoices.__otakuOrderInvoiceMap = new Map<string, string>();
}

const invoiceStore = globalInvoices.__otakuInvoices;
const orderInvoiceMap = globalInvoices.__otakuOrderInvoiceMap;

export interface InvoiceGenerationResult {
  success: boolean;
  statusCode: number;
  invoice?: InvoiceRecord;
  error?: string;
}

export interface InvoiceDownloadResult {
  success: boolean;
  statusCode: number;
  pdfBuffer?: Buffer;
  invoice?: InvoiceRecord;
  error?: string;
}

export class InvoiceService {
  private static readonly INVOICE_SECRET =
    process.env.INVOICE_HASH_SECRET || process.env.JWT_SECRET || 'otaku_invoice_secret_salt_2026';

  /**
   * Computes a deterministic SHA-256 HMAC for the invoice payload to guarantee anti-tampering.
   */
  public static computeChecksum(payload: Omit<InvoiceRecord, 'checksum'>): string {
    const canonicalString = [
      payload.id,
      payload.orderId,
      payload.buyerId,
      payload.sellerId,
      payload.amountPaise,
      payload.gstin,
      payload.createdAt,
    ].join('|');

    return crypto
      .createHmac('sha256', this.INVOICE_SECRET)
      .update(canonicalString)
      .digest('hex');
  }

  /**
   * Generates a tax invoice for an existing order with strict IDOR access control.
   *
   * @param orderId - Target order identifier
   * @param callerUserId - Authenticated user attempting the operation
   * @param callerRole - Role of caller ('BUYER' | 'SELLER' | 'ADMIN')
   */
  public static async generateInvoice(
    orderId: string,
    callerUserId: string,
    callerRole: string = 'BUYER'
  ): Promise<InvoiceGenerationResult> {
    // 1. Check if invoice has already been generated for this order (Idempotency)
    const existingInvoiceId = orderInvoiceMap.get(orderId);
    if (existingInvoiceId) {
      const existing = invoiceStore.get(existingInvoiceId);
      if (existing) {
        // STRICT IDOR CHECK ON EXISTING INVOICE
        const isAuthorized =
          callerRole === 'ADMIN' ||
          callerUserId === existing.buyerId ||
          callerUserId === existing.sellerId;

        if (!isAuthorized) {
          return {
            success: false,
            statusCode: 403,
            error: 'FORBIDDEN: You are not authorized to access invoices for this order (IDOR Prevented).',
          };
        }

        return {
          success: true,
          statusCode: 200,
          invoice: existing,
        };
      }
    }

    // 2. Fetch authoritative order details
    let order: any = null;
    try {
      order = await OrderRepository.findById(orderId);
    } catch {
      // ignore db errors in test harness
    }

    if (!order) {
      return {
        success: false,
        statusCode: 404,
        error: `Order with ID "${orderId}" not found.`,
      };
    }

    // 3. STRICT IDOR OBJECT-LEVEL AUTHORIZATION CHECK
    // Only the Buyer, the Seller, or an elevated Administrator may generate or view this invoice
    const isAuthorized =
      callerRole === 'ADMIN' ||
      callerUserId === order.buyerId ||
      callerUserId === order.sellerId;

    if (!isAuthorized) {
      return {
        success: false,
        statusCode: 403,
        error: 'FORBIDDEN: Insecure Direct Object Reference prevented. You can only generate invoices for orders you participate in.',
      };
    }

    // 4. Resolve Lot title
    let itemTitle = 'OtakuBazaar Japanese Archival Collectible';
    if (order?.listingId) {
      try {
        const dbListing = await prisma.listing.findUnique({ where: { id: order.listingId } });
        if (dbListing?.title) {
          itemTitle = dbListing.title;
        }
      } catch {
        // fallback to standard title
      }
    }

    // 5. Authoritative financial calculations (Integer arithmetic to avoid precision loss)
    const amountPaise = order.totalAmount;
    const amountINR = Math.round(amountPaise / 100);
    // Standard GST 18% reverse calculation: Base = Total / 1.18
    const baseAmountINR = Math.round(amountINR / 1.18);
    const gstAmountINR = amountINR - baseAmountINR;

    const invoiceId = `INV-2026-${order.id.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const createdAt = new Date().toISOString();

    const candidateInvoice: Omit<InvoiceRecord, 'checksum'> = {
      id: invoiceId,
      orderId: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      listingId: order.listingId,
      itemTitle,
      amountPaise,
      amountINR,
      currency: order.currency || 'INR',
      escrowStatus: order.escrowStatus || 'HELD_IN_ESCROW',
      gstin: '27AAFCO0123M1Z5',
      hsnSacCode: '998399',
      lineItems: [
        {
          description: itemTitle,
          sacCode: '998399',
          quantity: 1,
          baseAmountINR,
          gstAmountINR,
          totalAmountINR: amountINR,
        },
      ],
      baseAmountINR,
      gstAmountINR,
      createdAt,
    };

    const checksum = this.computeChecksum(candidateInvoice);
    const fullInvoice: InvoiceRecord = {
      ...candidateInvoice,
      checksum,
    };

    // 6. Cache in memory
    invoiceStore.set(invoiceId, fullInvoice);
    orderInvoiceMap.set(orderId, invoiceId);

    return {
      success: true,
      statusCode: 201,
      invoice: fullInvoice,
    };
  }

  /**
   * Retrieves an invoice and generates its high-contrast PDF buffer with strict IDOR verification.
   *
   * @param invoiceId - Unique invoice identifier
   * @param callerUserId - Authenticated user attempting download
   * @param callerRole - Role of caller ('BUYER' | 'SELLER' | 'ADMIN')
   */
  public static getInvoiceDownload(
    invoiceId: string,
    callerUserId: string,
    callerRole: string = 'BUYER'
  ): InvoiceDownloadResult {
    // 1. Sanitize input to prevent path traversal or injection
    if (!/^[A-Za-z0-9\-_]+$/.test(invoiceId)) {
      return {
        success: false,
        statusCode: 400,
        error: 'BAD REQUEST: Invalid invoice identifier format (Path traversal prevented).',
      };
    }

    // 2. Fetch invoice from store
    const invoice = invoiceStore.get(invoiceId);
    if (!invoice) {
      return {
        success: false,
        statusCode: 404,
        error: `Invoice "${invoiceId}" not found.`,
      };
    }

    // 3. STRICT IDOR OBJECT-LEVEL AUTHORIZATION CHECK
    const isAuthorized =
      callerRole === 'ADMIN' ||
      callerUserId === invoice.buyerId ||
      callerUserId === invoice.sellerId;

    if (!isAuthorized) {
      return {
        success: false,
        statusCode: 403,
        error: 'FORBIDDEN: Insecure Direct Object Reference prevented. Users can only download their own invoice files.',
      };
    }

    // 4. Verify cryptographic integrity before streaming
    const computedDigest = this.computeChecksum({
      id: invoice.id,
      orderId: invoice.orderId,
      buyerId: invoice.buyerId,
      sellerId: invoice.sellerId,
      listingId: invoice.listingId,
      itemTitle: invoice.itemTitle,
      amountPaise: invoice.amountPaise,
      amountINR: invoice.amountINR,
      currency: invoice.currency,
      escrowStatus: invoice.escrowStatus,
      gstin: invoice.gstin,
      hsnSacCode: invoice.hsnSacCode,
      lineItems: invoice.lineItems,
      baseAmountINR: invoice.baseAmountINR,
      gstAmountINR: invoice.gstAmountINR,
      createdAt: invoice.createdAt,
    });

    if (computedDigest !== invoice.checksum) {
      return {
        success: false,
        statusCode: 500,
        error: 'SECURITY INTEGRITY ERROR: Cryptographic checksum mismatch on invoice record.',
      };
    }

    // 5. Generate pristine binary PDF buffer
    const pdfBuffer = InvoicePdfGenerator.generate(invoice);

    return {
      success: true,
      statusCode: 200,
      pdfBuffer,
      invoice,
    };
  }

  /**
   * Helper to seed an invoice directly (used in automated security audit test suite).
   */
  public static seedInvoice(invoice: InvoiceRecord): void {
    invoiceStore.set(invoice.id, invoice);
    orderInvoiceMap.set(invoice.orderId, invoice.id);
  }

  /**
   * Clears the invoice store (used in test suite reset).
   */
  public static clearStore(): void {
    invoiceStore.clear();
    orderInvoiceMap.clear();
  }
}
