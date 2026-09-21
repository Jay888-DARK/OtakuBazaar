/**
 * @file src/app/api/bargain/offer/route.ts
 *
 * Next.js 15 API Route Handler for POST /api/bargain/offer.
 * Transmits real-time bargain offers over Pusher with rate limiting protection.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { pusherServer } from '@/lib/pusherServer';

// Basic in-memory rate store (Note: In serverless deployments, use Redis for persistent rate limiting)
const rateLimit = new Map<string, number>();

export async function POST(req: Request): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  const now = Date.now();
  const windowMs = 3000; // 3 seconds cooldown window

  const lastRequest = rateLimit.get(ip);
  if (lastRequest && now - lastRequest < windowMs) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Await counterparty response.' },
      { status: 429 }
    );
  }
  rateLimit.set(ip, now);

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const { productId, offeredPrice, buyerId = 'user_buyer_tanjiro', message } = body;

    if (!productId || typeof offeredPrice !== 'number' || offeredPrice <= 0) {
      return NextResponse.json(
        { error: 'Invalid offer parameters: productId and a positive offeredPrice are required.' },
        { status: 400 }
      );
    }

    // 1. Fetch collectible from DB or listing mirror
    let product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      const listing = await prisma.listing.findUnique({ where: { id: productId } });
      if (listing) {
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
      return NextResponse.json({ error: 'Collectible not found in vault' }, { status: 404 });
    }

    const sellerId = product.sellerId || 'user_seller_rengoku';
    const effectivePrice =
      product.price > 0 ? product.price : Math.round(product.askingPriceAmount / 100);

    // 2. Auto-Reject Floor Price check
    const floorPrice = product.minOfferPrice ?? effectivePrice * 0.75;
    if (offeredPrice < floorPrice) {
      return NextResponse.json(
        {
          success: false,
          autoRejected: true,
          error: `Offer auto-rejected: Minimum acceptable offer is ₹${floorPrice.toLocaleString('en-IN')}`,
        },
        { status: 400 }
      );
    }

    // 3. 24-Hour Expiration Window
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Ensure foreign key relations exist for user records
    const effectiveBuyerId = buyerId || 'user_buyer_tanjiro';
    try {
      await Promise.all([
        prisma.user.upsert({
          where: { id: sellerId },
          update: {},
          create: {
            id: sellerId,
            name: 'Kyojuro Rengoku',
            email: `${sellerId}@otakubazaar.dev`,
          },
        }),
        prisma.user.upsert({
          where: { id: effectiveBuyerId },
          update: {},
          create: {
            id: effectiveBuyerId,
            name: 'Tanjiro Kamado',
            email: `${effectiveBuyerId}@otakubazaar.dev`,
          },
        }),
      ]);
    } catch (userErr) {
      console.warn('[bargain/offer] Note ensuring user records:', userErr);
    }

    // 4. Save Offer to Database
    const dealOffer = await prisma.dealOffer.create({
      data: {
        productId: product.id,
        buyerId: effectiveBuyerId,
        sellerId,
        offeredPrice,
        status: 'PENDING',
        expiresAt,
      },
    });

    if (message && message.trim()) {
      try {
        await prisma.chatMessage.create({
          data: {
            dealOfferId: dealOffer.id,
            senderId: buyerId,
            text: message.trim(),
          },
        });
      } catch (msgErr) {
        console.warn('[bargain/offer] Note saving initial message:', msgErr);
      }
    }

    // 5. Broadcast Pusher Real-Time Events
    try {
      await pusherServer.trigger(`seller-${sellerId}`, 'new-bid', {
        offerId: dealOffer.id,
        productTitle: product.title,
        offeredPrice,
        expiresAt,
      });

      await pusherServer.trigger(`deal-${dealOffer.id}`, 'offer-updated', dealOffer);
      await pusherServer.trigger(`product-${productId}`, 'new-deal-offer', {
        offerId: dealOffer.id,
        offeredPrice,
      });
    } catch (pusherErr) {
      console.warn('[bargain/offer] Pusher broadcast note:', pusherErr);
    }

    // Return exact status required
    return NextResponse.json({
      status: 'Offer Transmitted',
      offerId: dealOffer.id,
      offeredPrice,
      expiresAt,
    });
  } catch (error) {
    console.error('[bargain/offer] Failed to transmit offer:', error);
    return NextResponse.json({ error: 'Failed to transmit offer' }, { status: 500 });
  }
}
