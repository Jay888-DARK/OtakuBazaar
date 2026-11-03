/**
 * @file src/infrastructure/services/InvoicePdfGenerator.ts
 *
 * Lightweight, zero-dependency ISO 32000-1 PDF Generator for OtakuBazaar.
 * Produces crisp, editorial tax receipts and custody certificates with
 * high-contrast typography, 0px border-radius frames, and cryptographic checksums.
 */

import { InvoiceRecord } from '@/domain/entities/Invoice';

export class InvoicePdfGenerator {
  /**
   * Escapes special characters for PDF literal strings.
   */
  private static escapePdfString(str: string): string {
    return String(str)
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  /**
   * Generates a fully compliant PDF 1.4 binary buffer.
   */
  public static generate(invoice: InvoiceRecord): Buffer {
    const esc = this.escapePdfString;

    const streamLines: string[] = [
      // Outer Page Border (High-contrast 0px sharp hairline frame)
      '0.75 w',
      '0 0 0 RG', // Black stroke
      '30 30 535.28 781.89 re S',

      // Header Banner
      'BT',
      '/F1 16 Tf',
      '50 780 Td',
      `(${esc('OTAKUBAZAAR // TAX INVOICE & ESCROW RECEIPT')}) Tj`,
      'ET',

      'BT',
      '/F2 8 Tf',
      '50 764 Td',
      `(${esc('OFFICIAL FINANCIAL SETTLEMENT RECORD • INDIAN GST & CONSUMER PROTECTION COMPLIANT')}) Tj`,
      'ET',

      // Divider 1
      '0.5 w',
      '50 752 m 545 752 l S',

      // Issuer Column (Left)
      'BT',
      '/F1 9 Tf',
      '50 736 Td',
      `(${esc('ISSUER & ESCROW CUSTODIAN:')}) Tj`,
      '/F2 8 Tf',
      '0 -13 Td',
      `(${esc('OtakuBazaar Vault Custody India Pvt. Ltd.')}) Tj`,
      '0 -11 Td',
      `(${esc(`GSTIN: ${invoice.gstin} | SAC: ${invoice.hsnSacCode}`)}) Tj`,
      '0 -11 Td',
      `(${esc('Corporate Staging Vaults: Mumbai & Tokyo Custody Terminals')}) Tj`,
      '0 -11 Td',
      `(${esc('Escrow Settlement Partner: Razorpay Software Private Limited')}) Tj`,
      'ET',

      // Telemetry Column (Right)
      'BT',
      '/F1 9 Tf',
      '320 736 Td',
      `(${esc('TRANSACTION TELEMETRY:')}) Tj`,
      '/F2 8 Tf',
      '0 -13 Td',
      `(${esc(`INVOICE NUMBER:   ${invoice.id}`)}) Tj`,
      '0 -11 Td',
      `(${esc(`ORDER REFERENCE:  ${invoice.orderId}`)}) Tj`,
      '0 -11 Td',
      `(${esc(`DATE & TIME:      ${invoice.createdAt}`)}) Tj`,
      '0 -11 Td',
      `(${esc(`ESCROW STATUS:    ${invoice.escrowStatus}`)}) Tj`,
      '0 -11 Td',
      `(${esc(`DIGEST (SHA-256): ${invoice.checksum.substring(0, 24)}...`)}) Tj`,
      'ET',

      // Divider 2
      '0.5 w',
      '50 670 m 545 670 l S',

      // Parties Section
      'BT',
      '/F1 9 Tf',
      '50 654 Td',
      `(${esc('CONSIGNOR (SELLER):')}) Tj`,
      '/F2 8 Tf',
      '0 -12 Td',
      `(${esc(`ACCOUNT ID:   ${invoice.sellerId}`)}) Tj`,
      '0 -10 Td',
      `(${esc('VERIFICATION: KYC Level 2 Verified Authenticator')}) Tj`,
      'ET',

      'BT',
      '/F1 9 Tf',
      '320 654 Td',
      `(${esc('CONSIGNEE (BUYER):')}) Tj`,
      '/F2 8 Tf',
      '0 -12 Td',
      `(${esc(`ACCOUNT ID:   ${invoice.buyerId}`)}) Tj`,
      '0 -10 Td',
      `(${esc('PROTECTION:   48-Hour Inspection Escrow Custody')}) Tj`,
      'ET',

      // Table Header (0px solid rectangular table)
      '1.0 w',
      '50 615 m 545 615 l S',
      'BT',
      '/F1 8 Tf',
      '55 603 Td',
      `(${esc('LOT SPECIMEN DESCRIPTION')}) Tj`,
      '220 0 Td',
      `(${esc('SAC')}) Tj`,
      '45 0 Td',
      `(${esc('QTY')}) Tj`,
      '35 0 Td',
      `(${esc('BASE (INR)')}) Tj`,
      '65 0 Td',
      `(${esc('GST (18%)')}) Tj`,
      '60 0 Td',
      `(${esc('TOTAL (INR)')}) Tj`,
      'ET',
      '0.5 w',
      '50 595 m 545 595 l S',

      // Table Row
      'BT',
      '/F2 8 Tf',
      '55 580 Td',
      `(${esc(invoice.itemTitle.length > 35 ? invoice.itemTitle.substring(0, 35) + '...' : invoice.itemTitle)}) Tj`,
      '220 0 Td',
      `(${esc(invoice.hsnSacCode)}) Tj`,
      '45 0 Td',
      `(${esc('1')}) Tj`,
      '35 0 Td',
      `(${esc('INR ' + invoice.baseAmountINR.toLocaleString('en-IN'))}) Tj`,
      '65 0 Td',
      `(${esc('INR ' + invoice.gstAmountINR.toLocaleString('en-IN'))}) Tj`,
      '60 0 Td',
      `(${esc('INR ' + invoice.amountINR.toLocaleString('en-IN'))}) Tj`,
      'ET',

      '0.5 w',
      '50 568 m 545 568 l S',

      // Totals Box
      'BT',
      '/F1 9 Tf',
      '320 548 Td',
      `(${esc('TOTAL ESCROW PAYABLE:')}) Tj`,
      '120 0 Td',
      `(${esc(`INR ${invoice.amountINR.toLocaleString('en-IN')}`)}) Tj`,
      'ET',

      '0.5 w',
      '320 540 m 545 540 l S',

      // Escrow Legal Safeguard & Policy Box
      '0.5 w',
      '50 495 495 105 re S',

      'BT',
      '/F1 8.5 Tf',
      '60 585 Td',
      `(${esc('CUSTODIAL ESCROW & AUTHENTICITY ASSURANCE CHARTER:')}) Tj`,
      '/F2 7.5 Tf',
      '0 -14 Td',
      `(${esc('1. FINANCIAL LOCK: Total payment remains held in Razorpay Custodial Escrow during transit.')}) Tj`,
      '0 -11 Td',
      `(${esc('2. 48-HOUR INSPECTION CLOCK: Begins upon courier delivery scan. Discrepancies guarantee 100% refund.')}) Tj`,
      '0 -11 Td',
      `(${esc('3. ZERO-BOOTLEG PENALTY: Consignors submitting counterfeit lots forfeit security deposits.')}) Tj`,
      '0 -11 Td',
      `(${esc('4. MANDATORY UNBOXING: Buyer unboxing video is preserved as immutable evidence for dispute resolution.')}) Tj`,
      '0 -11 Td',
      `(${esc('5. CRYPTOGRAPHIC VERIFICATION: The SHA-256 digest guarantees this record has not been altered.')}) Tj`,
      'ET',

      // Footer
      '0.5 w',
      '50 70 m 545 70 l S',

      'BT',
      '/F2 7 Tf',
      '50 55 Td',
      `(${esc('OTAKUBAZAAR ARCHIVAL INFRASTRUCTURE • STRICT ENFORCEMENT OF OBJECT-LEVEL ACCESS CONTROL (IDOR PROTECTED)')}) Tj`,
      '0 -10 Td',
      `(${esc(`FULL DIGEST: ${invoice.checksum}`)}) Tj`,
      'ET',
    ];

    const streamContent = streamLines.join('\n');
    const streamLength = Buffer.byteLength(streamContent, 'utf-8');

    const objects: string[] = [];
    // 1 0 obj: Catalog
    objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
    // 2 0 obj: Pages
    objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
    // 3 0 obj: Page
    objects.push(
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj'
    );
    // 4 0 obj: Helvetica-Bold
    objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj');
    // 5 0 obj: Helvetica
    objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
    // 6 0 obj: Content Stream
    objects.push(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`);

    let offset = 0;
    const header = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    offset += Buffer.byteLength(header, 'utf-8');

    const xrefEntries: string[] = ['0000000000 65535 f '];
    let body = '';

    for (const obj of objects) {
      const entry = String(offset).padStart(10, '0') + ' 00000 n ';
      xrefEntries.push(entry);
      body += obj + '\n';
      offset += Buffer.byteLength(obj + '\n', 'utf-8');
    }

    const xrefStart = offset;
    const xref = `xref\n0 ${objects.length + 1}\n` + xrefEntries.join('\n') + '\n';
    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

    return Buffer.from(header + body + xref + trailer, 'utf-8');
  }
}

