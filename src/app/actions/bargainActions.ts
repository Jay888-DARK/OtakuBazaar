'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/infrastructure/database/prismaClient';
import { pusherServer } from '@/infrastructure/services/pusherServer';

export interface CreateDealOfferInput {
  productId: string;
  offeredPrice: number;
  message?: string;
}

export async function createDealOffer(input: CreateDealOfferInput) {
  try {
    const session = await getServerSession(authOptions);
    const buyerId = (session?.user as { id?: string } | undefined)?.id;
    if (!buyerId) {
      return { success: false, error: '401 Unauthorized: Please sign in to submit an offer.' };
    }

    const { productId, offeredPrice, message } = input;

    // Find the product or listing in parallel
    const [dbProduct, dbListing] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.listing.findUnique({ where: { id: productId } }),
    ]);

    let product = dbProduct;
    let sellerId: string | null = null;

    if (product) {
      sellerId = product.sellerId;
    } else if (dbListing) {
      sellerId = dbListing.sellerId;
      // Also ensure product mirror exists
      product = await prisma.product.upsert({
        where: { id: dbListing.id },
        update: {},
        create: {
          id: dbListing.id,
          sellerId: dbListing.sellerId,
          title: dbListing.title,
          description: dbListing.description,
          imageUrls: dbListing.imageUrls,
          askingPriceAmount: dbListing.askingPriceAmount,
          status: dbListing.status,
          category: dbListing.category,
          condition: dbListing.condition,
        },
      });
    }

    if (!product || !sellerId) {
      throw new Error('Collectible not found in catalog');
    }

    if (sellerId === buyerId) {
      return { success: false, error: 'You cannot make an offer on your own listing.' };
    }

    const dealOffer = await prisma.dealOffer.create({
      data: {
        productId: product.id,
        buyerId,
        sellerId,
        offeredPrice,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'PENDING',
        ...(message
          ? {
              messages: {
                create: {
                  senderId: buyerId,
                  text: message,
                },
              },
            }
          : {}),
      },
      include: {
        product: true,
        messages: true,
      },
    });

    // Broadcast real-time deal offer notification via Pusher
    try {
      await pusherServer.trigger(`product-${productId}`, 'new-deal-offer', {
        dealOfferId: dealOffer.id,
        offeredPrice: dealOffer.offeredPrice,
        status: dealOffer.status,
      });
      await pusherServer.trigger(`deal-${dealOffer.id}`, 'offer-updated', dealOffer);
    } catch (pusherErr) {
      console.warn('[bargainActions] Pusher trigger notification note:', pusherErr);
    }

    return { success: true, dealOffer };
  } catch (error: any) {
    console.error('[bargainActions] Error creating deal offer:', error);
    return { success: false, error: error.message || 'Failed to submit offer' };
  }
}

export async function respondToDealOffer(
  dealOfferId: string,
  action: 'ACCEPT' | 'REJECT' | 'COUNTER',
  counterPrice?: number
) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { id?: string; role?: string } | undefined;
    if (!sessionUser?.id) {
      return { success: false, error: '401 Unauthorized: Please sign in to respond to offers.' };
    }

    const existing = await prisma.dealOffer.findUnique({ where: { id: dealOfferId } });
    if (!existing) {
      return { success: false, error: 'Deal offer not found.' };
    }
    if (sessionUser.role !== 'ADMIN' && existing.sellerId !== sessionUser.id) {
      return { success: false, error: '403 Forbidden: Only the seller can respond to this offer.' };
    }

    const status = action === 'ACCEPT' ? 'ACCEPTED' : action === 'REJECT' ? 'REJECTED' : 'COUNTERED';
    const updatedOffer = await prisma.dealOffer.update({
      where: { id: dealOfferId },
      data: {
        status,
        ...(counterPrice ? { offeredPrice: counterPrice } : {}),
      },
      include: {
        product: true,
        messages: true,
      },
    });

    try {
      await pusherServer.trigger(`deal-${dealOfferId}`, 'offer-updated', updatedOffer);
    } catch (pusherErr) {
      console.warn('[bargainActions] Pusher update trigger note:', pusherErr);
    }

    return { success: true, dealOffer: updatedOffer };
  } catch (error: any) {
    console.error('[bargainActions] Error updating deal offer:', error);
    return { success: false, error: error.message || 'Failed to update offer' };
  }
}

export async function sendDealChatMessage(dealOfferId: string, text: string, senderId: string = 'user_buyer_tanjiro') {
  try {
    const chatMsg = await prisma.chatMessage.create({
      data: {
        dealOfferId,
        senderId,
        text,
      },
    });

    try {
      await pusherServer.trigger(`deal-${dealOfferId}`, 'new-message', chatMsg);
    } catch (pusherErr) {
      console.warn('[bargainActions] Pusher chat trigger note:', pusherErr);
    }

    return { success: true, message: chatMsg };
  } catch (error: any) {
    console.error('[bargainActions] Error sending deal chat message:', error);
    return { success: false, error: error.message || 'Failed to send message' };
  }
}
