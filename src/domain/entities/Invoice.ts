/**
 * @file src/domain/entities/Invoice.ts
 *
 * Domain Entity representing an authentic Escrow Tax Invoice & Receipt.
 * Holds immutable financial figures, GST calculations, party identifiers,
 * and cryptographic SHA-256 tamper-evident digest.
 */

export interface InvoiceLineItem {
  description: string;
  sacCode: string;
  quantity: number;
  baseAmountINR: number;
  gstAmountINR: number;
  totalAmountINR: number;
}

export interface InvoiceRecord {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  itemTitle: string;
  amountPaise: number;
  amountINR: number;
  currency: string;
  escrowStatus: string;
  gstin: string;
  hsnSacCode: string;
  lineItems: InvoiceLineItem[];
  baseAmountINR: number;
  gstAmountINR: number;
  checksum: string;
  createdAt: string;
}

