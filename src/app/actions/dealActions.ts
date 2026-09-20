'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prismaClient';
import { pusherServer } from '@/lib/pusherServer';
import { RateLimiter } from '@/infrastructure/security/RateLimiter';

export async function submitOffer({
  productId,
  offeredPrice,
  buyerId,
}: {
  productId: string;
  offeredPrice: number;
  buyerId: string;
}) {
  const reqHeaders = await headers();
  const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ?? buyerId ?? '127.0.0.1';
  const rateLimit = RateLimiter.check(ip, 3000);
  if (!rateLimit.allowed) {
    return {
      success: false,
      rateLimited: true,
      message: 'Rate limit exceeded. Await counterparty response.',
    };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error('Product not found');

  const sellerId = product.sellerId || 'user_seller_rengoku';
  const effectivePrice = product.price > 0 ? product.price : Math.round(product.askingPriceAmount / 100);

  // 1. Auto-Reject check if bid is lower than least acceptable bid
  const floorPrice = product.minOfferPrice ?? effectivePrice * 0.75;
  if (offeredPrice < floorPrice) {
    return {
      success: false,
      autoRejected: true,
      message: `Offer auto-rejected: Bid is too low. Minimum acceptable offer is ₹${floorPrice.toLocaleString()}`,
    };
  }

  // 2. Set 24-Hour Expiration
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // 3. Create active DealOffer (supports multiple concurrent bids per product)
  const offer = await prisma.dealOffer.create({
    data: {
      productId,
      buyerId,
      sellerId,
      offeredPrice,
      status: 'PENDING',
      expiresAt,
    },
  });

  // 4. Notify seller via Pusher real-time channel
  try {
    await pusherServer.trigger(`seller-${sellerId}`, 'new-bid', {
      offerId: offer.id,
      productTitle: product.title,
      offeredPrice,
      expiresAt,
    });
    await pusherServer.trigger(`deal-${offer.id}`, 'offer-updated', offer);
  } catch (err) {
    console.warn('[dealActions] Pusher notification note:', err);
  }

  return { success: true, autoRejected: false, offerId: offer.id };
}

export async function acceptOffer(offerId: string) {
  try {
    const offer = await prisma.dealOffer.update({
      where: { id: offerId },
      data: { status: 'ACCEPTED' },
      include: { product: true, messages: true },
    });

    try {
      await pusherServer.trigger(`deal-${offerId}`, 'status-change', {
        status: 'ACCEPTED',
        offerId,
        offeredPrice: offer.offeredPrice,
      });
      await pusherServer.trigger(`deal-${offerId}`, 'offer-updated', offer);
      await pusherServer.trigger(`product-${offer.productId}`, 'offer-accepted', {
        offerId,
        offeredPrice: offer.offeredPrice,
      });
    } catch (err) {
      console.warn('[dealActions] Pusher notification note:', err);
    }

    return { success: true, offer };
  } catch (error: any) {
    console.error('[dealActions] Error accepting offer:', error);
    return { success: false, error: error.message || 'Failed to accept offer' };
  }
}

export async function getOffer(offerId: string) {
  try {
    const offer = await prisma.dealOffer.findUnique({
      where: { id: offerId },
      include: { product: true, messages: true },
    });
    return offer;
  } catch {
    return null;
  }
}

// Cart actions for Slide-Over Cart Drawer
export async function getCartItems(userId: string = 'user_buyer_tanjiro') {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            dealOffers: {
              where: { buyerId: userId },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return items;
  } catch (err) {
    console.error('[dealActions] Error getting cart items:', err);
    return [];
  }
}

export async function addToCart(productId: string, userId: string = 'user_buyer_tanjiro') {
  try {
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      update: {
        quantity: { increment: 1 },
      },
      create: {
        userId,
        productId,
        quantity: 1,
      },
      include: { product: true },
    });
    return { success: true, cartItem };
  } catch (err: any) {
    console.error('[dealActions] Error adding to cart:', err);
    return { success: false, error: err.message || 'Failed to add to cart' };
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
    return { success: true };
  } catch (err: any) {
    console.error('[dealActions] Error removing from cart:', err);
    return { success: false, error: err.message || 'Failed to remove from cart' };
  }
}
