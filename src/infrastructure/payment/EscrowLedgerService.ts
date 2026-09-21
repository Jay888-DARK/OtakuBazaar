/**
 * @file src/infrastructure/payment/EscrowLedgerService.ts
 *
 * Single Responsibility: Manages immutable, double-entry financial ledger records
 * (`EscrowLedgerEntry`) for all escrow movements.
 *
 * Core Accounting Invariant:
 * Every transaction MUST satisfy: SUM(Debits) === SUM(Credits).
 */

export type AccountType =
  | 'GATEWAY_CLEARING'   // Asset: Payment gateway clearing (e.g., Razorpay/Cashfree holds funds)
  | 'ESCROW_LIABILITY'  // Liability: Platform obligation to hold buyer funds in trust
  | 'SELLER_PAYABLE'    // Liability: Money owed to seller once inspection clears
  | 'PLATFORM_REVENUE'   // Equity/Revenue: Platform commission / take rate
  | 'PAYOUT_CLEARING';   // Asset: Outbound banking/UPI disbursement clearing

export type EntryType = 'DEBIT' | 'CREDIT';

export interface LedgerEntryItem {
  readonly id: string;
  readonly orderId: string;
  readonly accountType: AccountType;
  readonly entryType: EntryType;
  readonly amount: number; // in smallest unit (paise)
  readonly currency: string;
  readonly description: string;
  readonly createdAt: Date;
}

export interface CaptureEscrowResult {
  readonly orderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly entries: LedgerEntryItem[];
}

export interface ReleaseEscrowResult {
  readonly orderId: string;
  readonly totalAmount: number;
  readonly platformFee: number;
  readonly sellerAmount: number;
  readonly currency: string;
  readonly entries: LedgerEntryItem[];
}

export class EscrowLedgerService {
  // In-memory ledger storage for test verification and fallback
  private static readonly memoryEntries: LedgerEntryItem[] = [];

  /**
   * Helper to validate the fundamental accounting equation:
   * Total Debits must equal Total Credits.
   */
  private static validateDoubleEntryBalance(entries: Omit<LedgerEntryItem, 'id' | 'createdAt'>[]): void {
    let totalDebit = 0;
    let totalCredit = 0;

    for (const e of entries) {
      if (e.amount <= 0) {
        throw new Error(`[EscrowLedger] Invalid ledger entry amount: ${e.amount}. Must be strictly positive.`);
      }
      if (e.entryType === 'DEBIT') {
        totalDebit += e.amount;
      } else if (e.entryType === 'CREDIT') {
        totalCredit += e.amount;
      }
    }

    if (totalDebit !== totalCredit) {
      throw new Error(
        `[EscrowLedger] Accounting imbalance detected! Total Debits (${totalDebit}) !== Total Credits (${totalCredit}). Transaction aborted.`
      );
    }
  }

  /**
   * Records double-entry entries when buyer payment is captured into escrow:
   *
   * 1. DEBIT  GATEWAY_CLEARING  (Asset increases: Gateway received buyer funds)
   * 2. CREDIT ESCROW_LIABILITY  (Liability increases: Platform owes fulfillment/refund)
   */
  public static async recordPaymentCapture(
    orderId: string,
    amount: number,
    currency = 'INR',
    paymentId?: string
  ): Promise<CaptureEscrowResult> {
    const rawEntries: Omit<LedgerEntryItem, 'id' | 'createdAt'>[] = [
      {
        orderId,
        accountType: 'GATEWAY_CLEARING',
        entryType: 'DEBIT',
        amount,
        currency,
        description: `Payment captured via Razorpay (${paymentId || 'N/A'}) - gateway clearing debit`,
      },
      {
        orderId,
        accountType: 'ESCROW_LIABILITY',
        entryType: 'CREDIT',
        amount,
        currency,
        description: `Escrow liability credit - holding buyer funds in trust`,
      },
    ];

    // Assert balancing before persisting
    this.validateDoubleEntryBalance(rawEntries);

    const now = new Date();
    const createdEntries: LedgerEntryItem[] = rawEntries.map((e, idx) => ({
      ...e,
      id: `ledg_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
    }));

    // Save to memory
    this.memoryEntries.push(...createdEntries);

    // Save to Prisma if DB is available
    try {
      const { prisma } = await import('@/infrastructure/database/prismaClient');
      if (prisma) {
        await prisma.escrowLedgerEntry.createMany({
          data: createdEntries.map((e) => ({
            id: e.id,
            orderId: e.orderId,
            accountType: e.accountType,
            entryType: e.entryType,
            amount: e.amount,
            currency: e.currency,
            description: e.description,
            createdAt: e.createdAt,
          })),
        });
      }
    } catch (err) {
      console.warn('[EscrowLedgerService] Persisted in-memory, DB write skipped:', err);
    }

    console.info(`[EscrowLedgerService] Payment capture recorded for order ${orderId}: ₹${amount / 100} ${currency}`);
    return { orderId, amount, currency, entries: createdEntries };
  }

  /**
   * Records double-entry entries when escrow is released after 48-hour inspection:
   *
   * 1. DEBIT  ESCROW_LIABILITY (Liability extinguished: Escrow completed)
   * 2. CREDIT PLATFORM_REVENUE (Revenue recognized: OtakuBazaar 5% commission)
   * 3. CREDIT SELLER_PAYABLE   (Payable established: Seller earned share)
   * 4. DEBIT  SELLER_PAYABLE   (Payable fulfilled: Disbursed to seller UPI)
   * 5. CREDIT PAYOUT_CLEARING  (Asset cleared: Outbound UPI transfer executed)
   */
  public static async recordEscrowDisbursement(
    orderId: string,
    totalAmount: number,
    platformFeeRate = 0.05, // 5% marketplace commission
    currency = 'INR',
    upiVpa = 'seller@upi'
  ): Promise<ReleaseEscrowResult> {
    const platformFee = Math.round(totalAmount * platformFeeRate);
    const sellerAmount = totalAmount - platformFee;

    const rawEntries: Omit<LedgerEntryItem, 'id' | 'createdAt'>[] = [
      // Step A: Extinguish escrow liability and allocate revenue & seller payable
      {
        orderId,
        accountType: 'ESCROW_LIABILITY',
        entryType: 'DEBIT',
        amount: totalAmount,
        currency,
        description: `Escrow liability released upon 48-hour inspection completion`,
      },
      {
        orderId,
        accountType: 'PLATFORM_REVENUE',
        entryType: 'CREDIT',
        amount: platformFee,
        currency,
        description: `Platform fee revenue (${(platformFeeRate * 100).toFixed(1)}% take rate)`,
      },
      {
        orderId,
        accountType: 'SELLER_PAYABLE',
        entryType: 'CREDIT',
        amount: sellerAmount,
        currency,
        description: `Seller payable allocation after platform fee`,
      },
      // Step B: Disburse seller payable via outbound UPI transfer
      {
        orderId,
        accountType: 'SELLER_PAYABLE',
        entryType: 'DEBIT',
        amount: sellerAmount,
        currency,
        description: `Seller payable debit - disbursed to UPI ${upiVpa}`,
      },
      {
        orderId,
        accountType: 'PAYOUT_CLEARING',
        entryType: 'CREDIT',
        amount: sellerAmount,
        currency,
        description: `Payout clearing credit - funds transferred to UPI ${upiVpa}`,
      },
    ];

    // Assert double-entry balancing
    this.validateDoubleEntryBalance(rawEntries);

    const now = new Date();
    const createdEntries: LedgerEntryItem[] = rawEntries.map((e, idx) => ({
      ...e,
      id: `ledg_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
    }));

    this.memoryEntries.push(...createdEntries);

    try {
      const { prisma } = await import('@/infrastructure/database/prismaClient');
      if (prisma) {
        await prisma.escrowLedgerEntry.createMany({
          data: createdEntries.map((e) => ({
            id: e.id,
            orderId: e.orderId,
            accountType: e.accountType,
            entryType: e.entryType,
            amount: e.amount,
            currency: e.currency,
            description: e.description,
            createdAt: e.createdAt,
          })),
        });
      }
    } catch (err) {
      console.warn('[EscrowLedgerService] Persisted in-memory, DB write skipped:', err);
    }

    console.info(
      `[EscrowLedgerService] Escrow disbursement recorded for order ${orderId}: Seller payout ₹${sellerAmount / 100}, Platform fee ₹${platformFee / 100}`
    );

    return {
      orderId,
      totalAmount,
      platformFee,
      sellerAmount,
      currency,
      entries: createdEntries,
    };
  }

  /**
   * Retrieves all ledger entries for a given order (memory + DB).
   */
  public static async getOrderLedger(orderId: string): Promise<LedgerEntryItem[]> {
    const memory = this.memoryEntries.filter((e) => e.orderId === orderId);
    if (memory.length > 0) return memory;

    try {
      const { prisma } = await import('@/infrastructure/database/prismaClient');
      if (prisma) {
        const records = await prisma.escrowLedgerEntry.findMany({
          where: { orderId },
        });
        return records.map((r) => ({
          id: r.id,
          orderId: r.orderId,
          accountType: r.accountType as AccountType,
          entryType: r.entryType as EntryType,
          amount: r.amount,
          currency: r.currency,
          description: r.description,
          createdAt: r.createdAt,
        }));
      }
    } catch {
      // return memory
    }

    return memory;
  }

  /**
   * Clears in-memory ledger entries (for testing).
   */
  public static clearMemory(): void {
    this.memoryEntries.length = 0;
  }
}
