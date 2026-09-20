'use server';

import { prisma } from '@/infrastructure/database/prismaClient';
import { pusherServer } from '@/infrastructure/services/pusherServer';

export interface CreateDealOfferInput {
  productId: string;
  offeredPrice: number;
  message?: string;
}

export async function createDealOffer(input: CreateDealOfferInput) {
  try {
    const { productId, offeredPrice, message } = input;

    // Find the product or listing
    let product = await prisma.product.findUnique({
      where: { id: productId },
    });

    let originalPrice = 0;
    let sellerId = 'user_seller_rengoku';

    if (product) {
      originalPrice = Math.round(product.askingPriceAmount / 100);
      if (product.sellerId) sellerId = product.sellerId;
    } else {
      const listing = await prisma.listing.findUnique({
        where: { id: productId },
      });
      if (listing) {
        originalPrice = Math.round(listing.askingPriceAmount / 100);
        sellerId = listing.sellerId;
        // Also ensure product mirror exists
        product = await prisma.product.upsert({
          where: { id: listing.id },
          update: {},
          create: {
            id: listing.id,
            sellerId: listing.sellerId,
            title: listing.title,
            description: listing.description,
            imageUrls: listing.imageUrls,
            askingPriceAmount: listing.askingPriceAmount,
            status: listing.status,
            category: listing.category,
            condition: listing.condition,
          },
        });
      }
    }

    if (!product) {
      throw new Error('Collectible not found in catalog');
    }

    const buyerId = 'user_buyer_tanjiro';

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
