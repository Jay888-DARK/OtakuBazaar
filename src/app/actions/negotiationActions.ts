/**
 * @file src/app/actions/negotiationActions.ts
 *
 * Next.js Server Actions for Real-Time Bargain (Counter-Offer) Negotiation.
 */

'use server';

import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { TokenService, SESSION_COOKIE_NAME } from '@/infrastructure/security/TokenService';
import { NegotiationService, type NegotiationDto } from '@/application/services/negotiationService';

async function getAuthenticatedUserId(): Promise<string | null> {
  // 1. Check custom JWT cookie
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const payload = TokenService.verifyToken(token);
    if (payload?.userId) return payload.userId;
  }

  // 2. Check NextAuth session
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const user = session.user as { id?: string };
      if (user.id) return user.id;
    }
  } catch {}

  return null;
}

export async function getNegotiationAction(
  listingId: string
): Promise<{ success: boolean; data?: NegotiationDto | null; error?: string }> {
  try {
    const userId = (await getAuthenticatedUserId()) || 'user_buyer_tanjiro';
    const negotiation = await NegotiationService.getOrCreateNegotiation(listingId, userId);
    return { success: true, data: negotiation };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch negotiation' };
  }
}

export async function submitOpeningOfferAction(
  listingId: string,
  amount: number,
  message?: string
): Promise<{ success: boolean; data?: NegotiationDto; error?: string }> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Authentication required to make an offer. Please sign in.' };
    }

    return await NegotiationService.startNegotiation({
      listingId,
      actorId: userId,
      amount,
      message,
    });
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to submit opening offer' };
  }
}

export async function respondNegotiationAction(
  negotiationId: string,
  action: 'COUNTER' | 'ACCEPT' | 'DECLINE',
  counterAmount?: number,
  message?: string
): Promise<{ success: boolean; data?: NegotiationDto; error?: string }> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Authentication required. Please sign in.' };
    }

    return await NegotiationService.respond({
      negotiationId,
      actorId: userId,
      action,
      counterAmount,
      message,
    });
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to process negotiation response' };
  }
}
