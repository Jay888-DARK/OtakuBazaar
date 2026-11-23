/**
 * @file src/application/services/negotiationService.ts
 *
 * Real-time Bargain (Counter-Offer) & Distributed Escrow Lock Engine.
 *
 * Rules:
 * 1. Actor: Only buyer and seller can act.
 * 2. Price: Positive integer INR, strictly below asking price, >= seller-defined minimum.
 * 3. Alternating turns: Counterparty must respond; cannot offer twice in a row.
 * 4. Maximum 5 rounds: Once 5 rounds are reached, only ACCEPT or DECLINE is allowed.
 * 5. 24h expiration: Inactive negotiations expire after 24 hours.
 * 6. 15-minute escrow lock: Race-condition safe via Prisma transaction.
 * 7. Realtime via Pusher with automatic client polling fallback.
 */

import { prisma } from '@/lib/prismaClient';
import { pusherServer } from '@/infrastructure/services/pusherServer';

export interface NegotiationDto {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  status: 'ACTIVE' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  currentPrice: number;
  currentTurnActorId: string;
  roundCount: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
  events: Array<{
    id: string;
    actorId: string;
    type: 'OFFER' | 'COUNTER' | 'ACCEPT' | 'DECLINE' | 'EXPIRE';
    amount: number;
    message?: string | null;
    createdAt: string;
  }>;
}

export interface SubmitOfferInput {
  listingId: string;
  actorId: string; // User ID making the offer/counter
  amount: number; // in INR
  message?: string;
}

export interface RespondNegotiationInput {
  negotiationId: string;
  actorId: string;
  action: 'COUNTER' | 'ACCEPT' | 'DECLINE';
  counterAmount?: number;
  message?: string;
}

/**
 * Validates turn alternation and round count. Pure rule checker for testing.
 */
export function validateNegotiationAction(params: {
  status: string;
  currentTurnActorId: string;
  actorId: string;
  roundCount: number;
  action: 'COUNTER' | 'ACCEPT' | 'DECLINE';
  amount?: number;
  askingPrice: number;
  minOfferPrice?: number;
  updatedAt: Date | string;
  now?: Date;
}): { valid: boolean; error?: string } {
  const {
    status,
    currentTurnActorId,
    actorId,
    roundCount,
    action,
    amount,
    askingPrice,
    minOfferPrice,
    updatedAt,
    now = new Date(),
  } = params;

  // 1. Status Check
  if (status !== 'ACTIVE') {
    return { valid: false, error: `Negotiation is closed (status: ${status}).` };
  }

  // 2. 24h Inactivity Expiry Check
  const lastActive = new Date(updatedAt).getTime();
  const diffMs = now.getTime() - lastActive;
  if (diffMs > 24 * 60 * 60 * 1000) {
    return { valid: false, error: 'This offer has expired after 24 hours of inactivity.' };
  }

  // 3. Turn Check: Actor must match current turn
  if (actorId !== currentTurnActorId) {
    return { valid: false, error: 'Awaiting counterparty response. It is not your turn to act.' };
  }

  // 4. Action Checks
  if (action === 'COUNTER') {
    // Round Limit
    if (roundCount >= 5) {
      return {
        valid: false,
        error: 'Maximum 5 negotiation rounds reached. You may either Accept the current price or Decline.',
      };
    }

    if (!amount || amount <= 0) {
      return { valid: false, error: 'Offer amount must be a positive number.' };
    }

    if (amount >= askingPrice) {
      return {
        valid: false,
        error: `Offer must be below the listing asking price of ₹${askingPrice.toLocaleString('en-IN')}.`,
      };
    }

    if (minOfferPrice && amount < minOfferPrice) {
      return {
        valid: false,
        error: `Offer is below the seller minimum reserve of ₹${minOfferPrice.toLocaleString('en-IN')}.`,
      };
    }
  }

  return { valid: true };
}

export class NegotiationService {
  /**
   * Broadcasts real-time events via Pusher with fallback safety.
   */
  private static async broadcast(channel: string, event: string, payload: unknown) {
    try {
      await pusherServer.trigger(channel, event, payload);
    } catch (err) {
      console.warn(`[NegotiationService] Pusher trigger note for ${channel}:`, err);
    }
  }

  /**
   * Optional notification hook (email, in-app, WhatsApp integration ready).
   */
  private static async notifyCounterparty(
    targetUserId: string,
    title: string,
    message: string
  ) {
    // In-app audit log
    console.info(`[Notification] To ${targetUserId} -> ${title}: ${message}`);
    // Optional WhatsApp hook:
    // await sendWhatsAppTemplateMessage(targetPhone, 'deal_counter_alert', [...]);
  }

  /**
   * Finds or creates an active negotiation for a buyer on a listing.
   */
  public static async getOrCreateNegotiation(
    listingId: string,
    buyerId: string
  ): Promise<NegotiationDto | null> {
    // Auto-release any expired lock on read
    await this.releaseExpiredLocks(listingId);

    const existing = await prisma.negotiation.findFirst({
      where: {
        listingId,
        buyerId,
        status: { in: ['ACTIVE', 'ACCEPTED'] },
      },
      include: {
        events: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (existing) {
      return this.formatDto(existing);
    }

    return null;
  }

  /**
   * Starts a new negotiation with the buyer's opening offer.
   */
  public static async startNegotiation(input: SubmitOfferInput): Promise<{ success: boolean; data?: NegotiationDto; error?: string }> {
    const { listingId, actorId: buyerId, amount, message } = input;

    // Check listing
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return { success: false, error: 'Listing not found in vault custody.' };
    }

    if (listing.sellerId === buyerId) {
      return { success: false, error: 'You cannot make an offer on your own consignment.' };
    }

    const askingPrice = Math.round(listing.askingPriceAmount / 100);
    const minOfferPrice = Math.round(askingPrice * 0.7); // 70% floor

    // Validate opening offer
    if (amount <= 0 || amount >= askingPrice) {
      return {
        success: false,
        error: `Offer must be positive and below the asking price of ₹${askingPrice.toLocaleString('en-IN')}.`,
      };
    }

    if (amount < minOfferPrice) {
      return {
        success: false,
        error: `Offer auto-rejected: Minimum acceptable reserve is ₹${minOfferPrice.toLocaleString('en-IN')} (70% of asking price).`,
      };
    }

    // Auto-release expired lock if present
    await this.releaseExpiredLocks(listingId);

    // Check if listing is currently locked by an accepted negotiation
    if (listing.status === 'RESERVED') {
      const activeLock = await prisma.negotiation.findFirst({
        where: {
          listingId,
          status: 'ACCEPTED',
          lockedUntil: { gt: new Date() },
        },
      });
      if (activeLock && activeLock.buyerId !== buyerId) {
        return {
          success: false,
          error: 'This listing is currently locked in escrow by another accepted buyer offer. Please check back shortly.',
        };
      }
    }

    // Create negotiation & opening event
    const negotiation = await prisma.negotiation.create({
      data: {
        listingId,
        buyerId,
        sellerId: listing.sellerId,
        status: 'ACTIVE',
        currentPrice: amount,
        currentTurnActorId: listing.sellerId, // Next turn is for the seller to counter or accept
        roundCount: 1,
        events: {
          create: {
            actorId: buyerId,
            type: 'OFFER',
            amount,
            message: message || `Buyer submitted opening offer of ₹${amount.toLocaleString('en-IN')}.`,
          },
        },
      },
      include: {
        events: { orderBy: { createdAt: 'asc' } },
      },
    });

    const dto = this.formatDto(negotiation);

    // Broadcast
    await this.broadcast(`negotiation-${negotiation.id}`, 'negotiation-update', dto);
    await this.broadcast(`listing-${listingId}`, 'new-offer', { negotiationId: negotiation.id, amount });

    await this.notifyCounterparty(
      listing.sellerId,
      'New Escrow Offer Received',
      `Buyer offered ₹${amount.toLocaleString('en-IN')} on lot "${listing.title}".`
    );

    return { success: true, data: dto };
  }

  /**
   * Responds to an active negotiation: COUNTER, ACCEPT, or DECLINE.
   * Race-condition safe with transactional 15-minute lock.
   */
  public static async respond(input: RespondNegotiationInput): Promise<{ success: boolean; data?: NegotiationDto; error?: string }> {
    const { negotiationId, actorId, action, counterAmount, message } = input;

    // Fetch negotiation with listing
    const negotiation = await prisma.negotiation.findUnique({
      where: { id: negotiationId },
      include: {
        listing: true,
        events: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!negotiation) {
      return { success: false, error: 'Negotiation thread not found.' };
    }

    const askingPrice = Math.round(negotiation.listing.askingPriceAmount / 100);
    const minOfferPrice = Math.round(askingPrice * 0.7);

    // Rule validation
    const ruleCheck = validateNegotiationAction({
      status: negotiation.status,
      currentTurnActorId: negotiation.currentTurnActorId,
      actorId,
      roundCount: negotiation.roundCount,
      action,
      amount: counterAmount,
      askingPrice,
      minOfferPrice,
      updatedAt: negotiation.updatedAt,
    });

    if (!ruleCheck.valid) {
      return { success: false, error: ruleCheck.error };
    }

    // Next turn target
    const isActorBuyer = actorId === negotiation.buyerId;
    const nextTurnActorId = isActorBuyer ? negotiation.sellerId : negotiation.buyerId;

    // Execute atomic transition in transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Re-verify status inside transaction
      const fresh = await tx.negotiation.findUnique({ where: { id: negotiationId } });
      if (!fresh || fresh.status !== 'ACTIVE') {
        throw new Error('Negotiation state has already transitioned.');
      }

      if (action === 'ACCEPT') {
        // Enforce 15-minute lock
        const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);

        // Check if listing has another active lock
        const existingLock = await tx.listing.findUnique({ where: { id: negotiation.listingId } });
        if (existingLock?.status === 'RESERVED' && existingLock.reservedByBuyerId && existingLock.reservedByBuyerId !== negotiation.buyerId) {
          throw new Error('Listing is already reserved by another transaction.');
        }

        // Lock listing
        await tx.listing.update({
          where: { id: negotiation.listingId },
          data: {
            status: 'RESERVED',
            reservedByBuyerId: negotiation.buyerId,
          },
        });

        // Update negotiation
        const result = await tx.negotiation.update({
          where: { id: negotiationId },
          data: {
            status: 'ACCEPTED',
            lockedUntil,
            events: {
              create: {
                actorId,
                type: 'ACCEPT',
                amount: fresh.currentPrice,
                message: message || `Offer accepted at ₹${fresh.currentPrice.toLocaleString('en-IN')}. Item reserved for 15 minutes.`,
              },
            },
          },
          include: {
            events: { orderBy: { createdAt: 'asc' } },
          },
        });

        return result;
      }

      if (action === 'DECLINE') {
        const result = await tx.negotiation.update({
          where: { id: negotiationId },
          data: {
            status: 'DECLINED',
            events: {
              create: {
                actorId,
                type: 'DECLINE',
                amount: fresh.currentPrice,
                message: message || 'Negotiation declined.',
              },
            },
          },
          include: {
            events: { orderBy: { createdAt: 'asc' } },
          },
        });
        return result;
      }

      // COUNTER
      const newPrice = counterAmount!;
      const result = await tx.negotiation.update({
        where: { id: negotiationId },
        data: {
          currentPrice: newPrice,
          currentTurnActorId: nextTurnActorId,
          roundCount: fresh.roundCount + 1,
          events: {
            create: {
              actorId,
              type: 'COUNTER',
              amount: newPrice,
              message: message || `Counter-offer proposed at ₹${newPrice.toLocaleString('en-IN')}.`,
            },
          },
        },
        include: {
          events: { orderBy: { createdAt: 'asc' } },
        },
      });

      return result;
    });

    const dto = this.formatDto(updated);

    // Broadcast
    await this.broadcast(`negotiation-${negotiation.id}`, 'negotiation-update', dto);

    await this.notifyCounterparty(
      nextTurnActorId,
      action === 'ACCEPT' ? 'Bargain Accepted!' : action === 'COUNTER' ? 'New Counter-Offer' : 'Offer Declined',
      action === 'ACCEPT'
        ? `Offer of ₹${updated.currentPrice.toLocaleString('en-IN')} was accepted. 15-minute escrow payment lock initiated.`
        : action === 'COUNTER'
        ? `Counter-offer of ₹${updated.currentPrice.toLocaleString('en-IN')} proposed.`
        : 'The counterparty has declined the offer.'
    );

    return { success: true, data: dto };
  }

  /**
   * Automatically releases any expired locks on a listing.
   */
  public static async releaseExpiredLocks(listingId: string): Promise<void> {
    try {
      const expiredLocks = await prisma.negotiation.findMany({
        where: {
          listingId,
          status: 'ACCEPTED',
          lockedUntil: { lte: new Date() },
        },
      });

      if (expiredLocks.length > 0) {
        await prisma.negotiation.updateMany({
          where: {
            id: { in: expiredLocks.map((n) => n.id) },
          },
          data: { status: 'EXPIRED' },
        });

        // Release listing reservation if it matches
        await prisma.listing.updateMany({
          where: {
            id: listingId,
            status: 'RESERVED',
          },
          data: {
            status: 'ACTIVE',
            reservedByBuyerId: null,
          },
        });
      }
    } catch (err) {
      console.warn('[NegotiationService] releaseExpiredLocks notice:', err);
    }
  }

  private static formatDto(n: any): NegotiationDto {
    return {
      id: n.id,
      listingId: n.listingId,
      buyerId: n.buyerId,
      sellerId: n.sellerId,
      status: n.status,
      currentPrice: n.currentPrice,
      currentTurnActorId: n.currentTurnActorId,
      roundCount: n.roundCount,
      lockedUntil: n.lockedUntil ? n.lockedUntil.toISOString() : null,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
      events: (n.events || []).map((e: any) => ({
        id: e.id,
        actorId: e.actorId,
        type: e.type,
        amount: e.amount,
        message: e.message,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  }
}
