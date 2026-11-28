/**
 * @file src/app/actions/chatActions.ts
 *
 * Real-time post-bid chat Server Actions for OtakuBazaar.
 * Persists messages in Prisma database and broadcasts them to Pusher order channels.
 */

'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/infrastructure/database/prismaClient';
import { pusherServer } from '@/infrastructure/services/pusherServer';

export interface ChatMessageRecord {
  id: string;
  text: string;
  orderId: string;
  senderId: string;
  createdAt: Date | string;
  sender?: {
    id: string;
    name?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
}

export interface ChatActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Sends a new message in an Escrow Order channel.
 * Persists to database via Prisma and broadcasts via Pusher.
 */
export async function sendMessage(
  orderId: string,
  text: string,
  _senderId?: string
): Promise<ChatActionResult<ChatMessageRecord>> {
  if (!text || text.trim().length === 0) {
    return { success: false, error: 'Message cannot be empty.' };
  }

  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { id?: string; role?: string } | undefined;
    if (!sessionUser?.id) {
      return { success: false, error: '401 Unauthorized: Please sign in to send messages.' };
    }

    const senderId = sessionUser.id;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { buyerId: true, sellerId: true },
    });
    if (
      order &&
      sessionUser.role !== 'ADMIN' &&
      order.buyerId !== senderId &&
      order.sellerId !== senderId
    ) {
      return { success: false, error: '403 Forbidden: You are not a participant in this order.' };
    }

    // 1. Save to Database
    const savedMessage = await prisma.message.create({
      data: {
        orderId,
        text: text.trim(),
        senderId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // 2. Broadcast via Pusher
    try {
      await pusherServer.trigger(orderId, 'new-message', {
        ...savedMessage,
        sender: { id: senderId },
      });
    } catch (pusherErr) {
      console.warn('[chatActions] Pusher trigger note:', pusherErr);
      // Even if Pusher credentials are demo stubs, the message was persisted to DB
    }

    return {
      success: true,
      data: savedMessage,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send message';
    console.error('[chatActions:sendMessage] Error:', error);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Fetches all past messages for a given Escrow Order.
 */
export async function fetchOrderMessages(
  orderId: string
): Promise<ChatActionResult<ChatMessageRecord[]>> {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { id?: string; role?: string } | undefined;
    if (!sessionUser?.id) {
      return { success: false, error: '401 Unauthorized: Please sign in to view order messages.' };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { buyerId: true, sellerId: true },
    });
    if (
      order &&
      sessionUser.role !== 'ADMIN' &&
      order.buyerId !== sessionUser.id &&
      order.sellerId !== sessionUser.id
    ) {
      return { success: false, error: '403 Forbidden: You are not a participant in this order.' };
    }

    const messages = await prisma.message.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      success: true,
      data: messages,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load messages';
    console.error('[chatActions:fetchOrderMessages] Error:', error);
    return {
      success: false,
      error: message,
      data: [],
    };
  }
}
