/**
 * @file src/infrastructure/realtime/schemas/bargainingSchemas.ts
 *
 * Single Responsibility: Defines strict runtime validation schemas (Zod)
 * for incoming WebSocket frames and strong TypeScript types for both
 * inbound client commands and outbound distributed events.
 *
 * All client-submitted payloads must pass through these schemas before reaching
 * the bargaining state machine or Redis pub/sub layer.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Primitive Validation Rules
// ---------------------------------------------------------------------------

const IdSchema = z.string().min(1, 'Identifier cannot be empty').max(128, 'Identifier exceeds maximum length');
const CurrencySchema = z.enum(['INR', 'USD', 'JPY', 'EUR']).default('INR');
const PositiveAmountSchema = z.number().positive('Amount must be strictly greater than 0').max(100_000_000, 'Amount exceeds platform limit');

// ---------------------------------------------------------------------------
// Inbound Action Schemas (Client -> Server)
// ---------------------------------------------------------------------------

/**
 * Validates client request to join a specific conversation room.
 */
export const JoinConversationSchema = z.object({
  type: z.literal('JOIN_CONVERSATION'),
  payload: z.object({
    conversationId: IdSchema,
    listingId: IdSchema,
  }),
});

/**
 * Validates client request to leave a specific conversation room.
 */
export const LeaveConversationSchema = z.object({
  type: z.literal('LEAVE_CONVERSATION'),
  payload: z.object({
    conversationId: IdSchema,
  }),
});

/**
 * Validates buyer initial offer submission.
 */
export const SubmitOfferSchema = z.object({
  type: z.literal('SUBMIT_OFFER'),
  payload: z.object({
    conversationId: IdSchema,
    listingId: IdSchema,
    sellerId: IdSchema,
    amount: PositiveAmountSchema,
    currency: CurrencySchema,
    message: z.string().max(500, 'Message cannot exceed 500 characters').optional().default(''),
  }),
});

/**
 * Validates seller or buyer counter-offer submission.
 */
export const CounterOfferSchema = z.object({
  type: z.literal('COUNTER_OFFER'),
  payload: z.object({
    conversationId: IdSchema,
    listingId: IdSchema,
    offerId: IdSchema,
    counterPrice: PositiveAmountSchema,
    currency: CurrencySchema,
    message: z.string().max(500, 'Message cannot exceed 500 characters').optional().default(''),
  }),
});

/**
 * Validates offer acceptance. Triggers atomic 15-minute listing lock.
 */
export const AcceptOfferSchema = z.object({
  type: z.literal('ACCEPT_OFFER'),
  payload: z.object({
    conversationId: IdSchema,
    listingId: IdSchema,
    offerId: IdSchema,
  }),
});

/**
 * Validates offer rejection.
 */
export const RejectOfferSchema = z.object({
  type: z.literal('REJECT_OFFER'),
  payload: z.object({
    conversationId: IdSchema,
    listingId: IdSchema,
    offerId: IdSchema,
    reason: z.string().max(300, 'Reason cannot exceed 300 characters').optional(),
  }),
});

/**
 * Validates marking a message or negotiation event as read across multi-windows.
 */
export const MarkMessageReadSchema = z.object({
  type: z.literal('MARK_MESSAGE_READ'),
  payload: z.object({
    conversationId: IdSchema,
    messageId: IdSchema,
  }),
});

/**
 * Heartbeat Ping from client.
 */
export const PingSchema = z.object({
  type: z.literal('PING'),
  payload: z.object({
    timestamp: z.number().optional(),
  }).optional(),
});

/**
 * Comprehensive Discriminated Union of all inbound client messages.
 */
export const InboundMessageSchema = z.discriminatedUnion('type', [
  JoinConversationSchema,
  LeaveConversationSchema,
  SubmitOfferSchema,
  CounterOfferSchema,
  AcceptOfferSchema,
  RejectOfferSchema,
  MarkMessageReadSchema,
  PingSchema,
]);

// ---------------------------------------------------------------------------
// Inferred Inbound Types
// ---------------------------------------------------------------------------

export type JoinConversationMessage = z.infer<typeof JoinConversationSchema>;
export type LeaveConversationMessage = z.infer<typeof LeaveConversationSchema>;
export type SubmitOfferMessage = z.infer<typeof SubmitOfferSchema>;
export type CounterOfferMessage = z.infer<typeof CounterOfferSchema>;
export type AcceptOfferMessage = z.infer<typeof AcceptOfferSchema>;
export type RejectOfferMessage = z.infer<typeof RejectOfferSchema>;
export type MarkMessageReadMessage = z.infer<typeof MarkMessageReadSchema>;
export type PingMessage = z.infer<typeof PingSchema>;
export type InboundMessage = z.infer<typeof InboundMessageSchema>;

// ---------------------------------------------------------------------------
// Outbound Event Types (Server -> Client & Redis Pub/Sub)
// ---------------------------------------------------------------------------

export type RealtimeEventType =
  | 'OFFER_RECEIVED'
  | 'OFFER_COUNTERED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'LISTING_LOCKED'
  | 'LISTING_UNLOCKED'
  | 'MESSAGE_READ'
  | 'CONVERSATION_JOINED'
  | 'CONVERSATION_LEFT'
  | 'ERROR'
  | 'PONG';

export interface OutboundEventBase<T extends RealtimeEventType, P> {
  readonly type: T;
  readonly payload: P;
  readonly timestamp: string;
  readonly sequence: number;
}

export interface OfferReceivedPayload {
  readonly offerId: string;
  readonly conversationId: string;
  readonly listingId: string;
  readonly buyerId: string;
  readonly sellerId: string;
  readonly amount: number;
  readonly currency: string;
  readonly message: string;
  readonly createdAt: string;
}

export interface OfferCounteredPayload {
  readonly offerId: string;
  readonly conversationId: string;
  readonly listingId: string;
  readonly counteredById: string;
  readonly counterPrice: number;
  readonly currency: string;
  readonly message: string;
  readonly updatedAt: string;
}

export interface OfferAcceptedPayload {
  readonly offerId: string;
  readonly conversationId: string;
  readonly listingId: string;
  readonly buyerId: string;
  readonly sellerId: string;
  readonly agreedPrice: number;
  readonly currency: string;
  readonly lockExpiresAt: string;
  readonly lockDurationSeconds: number;
}

export interface OfferRejectedPayload {
  readonly offerId: string;
  readonly conversationId: string;
  readonly listingId: string;
  readonly rejectedById: string;
  readonly reason?: string;
  readonly updatedAt: string;
}

export interface ListingLockedPayload {
  readonly listingId: string;
  readonly lockedByUserId: string;
  readonly offerId: string;
  readonly lockExpiresAt: string;
  readonly remainingSeconds: number;
}

export interface ListingUnlockedPayload {
  readonly listingId: string;
  readonly reason: 'EXPIRED' | 'RELEASED' | 'PURCHASE_COMPLETED';
}

export interface MessageReadPayload {
  readonly conversationId: string;
  readonly messageId: string;
  readonly readByUserId: string;
  readonly readAt: string;
}

export interface ErrorPayload {
  readonly code:
    | 'UNAUTHORIZED'
    | 'INVALID_PAYLOAD'
    | 'LISTING_LOCKED'
    | 'OFFER_NOT_FOUND'
    | 'INVALID_STATE_TRANSITION'
    | 'INTERNAL_ERROR';
  readonly message: string;
  readonly details?: unknown;
  readonly remainingTtlSeconds?: number;
}

export type OutboundEvent =
  | OutboundEventBase<'OFFER_RECEIVED', OfferReceivedPayload>
  | OutboundEventBase<'OFFER_COUNTERED', OfferCounteredPayload>
  | OutboundEventBase<'OFFER_ACCEPTED', OfferAcceptedPayload>
  | OutboundEventBase<'OFFER_REJECTED', OfferRejectedPayload>
  | OutboundEventBase<'LISTING_LOCKED', ListingLockedPayload>
  | OutboundEventBase<'LISTING_UNLOCKED', ListingUnlockedPayload>
  | OutboundEventBase<'MESSAGE_READ', MessageReadPayload>
  | OutboundEventBase<'ERROR', ErrorPayload>
  | OutboundEventBase<'PONG', { readonly timestamp: number }>;
