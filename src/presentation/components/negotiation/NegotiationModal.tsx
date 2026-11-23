/**
 * @file src/presentation/components/negotiation/NegotiationModal.tsx
 *
 * Real-Time Bargain (Counter-Offer) Terminal Modal for OtakuBazaar.
 *
 * Features:
 * - Real-time negotiation timeline: "Buyer offered ₹4,800 -> Seller countered ₹5,200".
 * - Alternating turns indicator and max 5 rounds tracker.
 * - Accept / Decline / Counter actions with inline input validation.
 * - Post-acceptance 15-minute countdown timer with authoritative "Pay now" button.
 * - Dual-layer sync: Pusher WebSocket subscription + 3-second background polling fallback.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Pusher from 'pusher-js';
import { useSession } from 'next-auth/react';
import type { NegotiationDto } from '@/application/services/negotiationService';
import {
  getNegotiationAction,
  submitOpeningOfferAction,
  respondNegotiationAction,
} from '@/app/actions/negotiationActions';

export interface NegotiationModalProps {
  listingId: string;
  askingPriceINR: number;
  productTitle: string;
  isOpen: boolean;
  onClose: () => void;
  sellerId?: string;
}

export function NegotiationModal({
  listingId,
  askingPriceINR,
  productTitle,
  isOpen,
  onClose,
  sellerId,
}: NegotiationModalProps): React.JSX.Element | null {
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id || 'user_buyer_tanjiro';

  const [negotiation, setNegotiation] = useState<NegotiationDto | null>(null);
  const [offerInput, setOfferInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('15:00');
  const [isLockExpired, setIsLockExpired] = useState<boolean>(false);

  const timelineEndRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Initial load & Polling fallback (every 3 seconds)
  useEffect(() => {
    if (!isOpen) return;

    const fetchLatest = async () => {
      const res = await getNegotiationAction(listingId);
      if (res.success && res.data) {
        setNegotiation(res.data);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 3500);
    return () => clearInterval(interval);
  }, [isOpen, listingId]);

  // Pusher real-time subscription
  useEffect(() => {
    if (!negotiation?.id) return;

    const pusherKey =
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY ||
      process.env.NEXT_PUBLIC_PUSHER_KEY ||
      '781968040588c465b8d4';
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

    let pusherClient: Pusher | null = null;
    try {
      pusherClient = new Pusher(pusherKey, { cluster: pusherCluster });
      const channel = pusherClient.subscribe(`negotiation-${negotiation.id}`);

      channel.bind('negotiation-update', (updated: NegotiationDto) => {
        setNegotiation(updated);
      });
    } catch (err) {
      console.warn('[NegotiationModal] Pusher initialization note:', err);
    }

    return () => {
      if (pusherClient) {
        pusherClient.unsubscribe(`negotiation-${negotiation.id}`);
        pusherClient.disconnect();
      }
    };
  }, [negotiation?.id]);

  // 15-minute countdown timer on ACCEPTED
  useEffect(() => {
    if (!negotiation?.lockedUntil || negotiation.status !== 'ACCEPTED') return;

    const updateTimer = () => {
      const targetTime = new Date(negotiation.lockedUntil!).getTime();
      const diffSecs = Math.floor((targetTime - Date.now()) / 1000);

      if (diffSecs <= 0) {
        setTimeLeft('00:00');
        setIsLockExpired(true);
        return;
      }

      const mins = Math.floor(diffSecs / 60);
      const secs = diffSecs % 60;
      setTimeLeft(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      setIsLockExpired(false);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [negotiation?.lockedUntil, negotiation?.status]);

  // Auto-scroll timeline
  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [negotiation?.events]);

  if (!isOpen) return null;

  const isActorTurn = negotiation
    ? negotiation.currentTurnActorId === currentUserId
    : true; // Opening offer

  const isAccepted = negotiation?.status === 'ACCEPTED';
  const isDeclined = negotiation?.status === 'DECLINED';
  const isExpired = negotiation?.status === 'EXPIRED' || isLockExpired;
  const isBuyer = negotiation ? negotiation.buyerId === currentUserId : true;

  const minFloor = Math.round(askingPriceINR * 0.7);

  // Quick preset discount buttons
  const applyPreset = (discountPct: number) => {
    const calculated = Math.round(askingPriceINR * (1 - discountPct / 100));
    setOfferInput(String(calculated));
    setErrorMsg(null);
  };

  const handleStartOffer = async () => {
    const val = Number(offerInput);
    if (!val || val <= 0) {
      setErrorMsg('Please enter a valid offer amount in ₹ INR.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);

    const res = await submitOpeningOfferAction(listingId, val);
    setIsSubmitting(false);

    if (!res.success || !res.data) {
      setErrorMsg(res.error || 'Failed to submit opening offer.');
      return;
    }

    setNegotiation(res.data);
    setOfferInput('');
  };

  const handleRespond = async (action: 'COUNTER' | 'ACCEPT' | 'DECLINE') => {
    if (!negotiation) return;

    let counterVal: number | undefined;
    if (action === 'COUNTER') {
      counterVal = Number(offerInput);
      if (!counterVal || counterVal <= 0) {
        setErrorMsg('Please enter your counter-offer price.');
        return;
      }
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    const res = await respondNegotiationAction(
      negotiation.id,
      action,
      counterVal
    );
    setIsSubmitting(false);

    if (!res.success || !res.data) {
      setErrorMsg(res.error || 'Failed to submit response.');
      return;
    }

    setNegotiation(res.data);
    setOfferInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0C0C0C] border border-[#262626] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#F2EFE9] font-sans">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F1F1F] bg-[#080808]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#777777]">
              REAL-TIME BARGAIN TERMINAL
            </span>
            {negotiation && (
              <span className="px-1.5 py-0.5 border border-[#333333] text-[9px] uppercase tracking-wider text-[#D4AF37]">
                ROUND {negotiation.roundCount}/5
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase tracking-widest text-[#777777] hover:text-white transition-colors cursor-pointer"
          >
            [ ESC // CLOSE ]
          </button>
        </div>

        {/* Collectible Overview Bar */}
        <div className="px-5 py-3 border-b border-[#1A1A1A] bg-[#0E0E0E] flex items-center justify-between text-xs">
          <div className="truncate max-w-[280px]">
            <span className="text-[10px] text-[#888888] uppercase block tracking-wider">TARGET LOT</span>
            <span className="font-serif text-[#F2EFE9] uppercase truncate font-medium">{productTitle}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#888888] uppercase block tracking-wider">ASKING PRICE</span>
            <span className="font-serif text-sm text-[#F2EFE9]">₹{askingPriceINR.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Negotiation Event Timeline */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[160px] max-h-[260px] bg-[#080808]">
          {!negotiation || negotiation.events.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-6 text-[#666666] text-xs">
              <span className="text-[10px] uppercase tracking-[0.18em] mb-1 text-[#888888] font-semibold">
                [ NO OFFERS YET ]
              </span>
              <p className="max-w-xs text-[11px] leading-relaxed">
                Enter your opening escrow offer below. You have up to 5 rounds of alternating counter-offers.
              </p>
            </div>
          ) : (
            negotiation.events.map((event, idx) => {
              const isBuyerEvent = event.actorId === negotiation.buyerId;
              const isAcceptedEvent = event.type === 'ACCEPT';
              const isDeclinedEvent = event.type === 'DECLINE';

              return (
                <div
                  key={event.id || idx}
                  className={`p-3 border text-xs transition-all ${
                    isAcceptedEvent
                      ? 'border-[#10B981] bg-[#091812] text-[#10B981]'
                      : isDeclinedEvent
                      ? 'border-[#EF4444] bg-[#180A0A] text-[#EF4444]'
                      : isBuyerEvent
                      ? 'border-[#1F1F1F] bg-[#0E0E0E] text-[#F2EFE9]'
                      : 'border-[#D4AF37]/40 bg-[#141208] text-[#D4AF37]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider mb-1 opacity-75">
                    <span className="font-bold">
                      {isBuyerEvent ? 'BUYER OFFER' : 'SELLER COUNTER'} • {event.type}
                    </span>
                    <span className="font-mono text-[9px]">
                      {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-serif font-bold">
                      ₹{event.amount.toLocaleString('en-IN')}
                    </span>
                    {isAcceptedEvent && (
                      <span className="px-2 py-0.5 bg-[#10B981] text-[#080808] text-[9px] font-bold uppercase tracking-wider">
                        AGREED PRICE
                      </span>
                    )}
                  </div>
                  {event.message && (
                    <p className="mt-1 text-[11px] opacity-80 normal-case">{event.message}</p>
                  )}
                </div>
              );
            })
          )}
          <div ref={timelineEndRef} />
        </div>

        {/* Status / Turn Banner */}
        {negotiation && !isAccepted && !isDeclined && !isExpired && (
          <div className="px-5 py-2 border-t border-b border-[#1A1A1A] bg-[#0D0D0D] flex items-center justify-between text-[11px]">
            <span className="text-[#888888] uppercase tracking-wider text-[10px]">CURRENT STANDING:</span>
            <span className="font-bold uppercase tracking-wider font-sans">
              {isActorTurn ? (
                <span className="text-[#10B981]">● YOUR TURN TO RESPOND</span>
              ) : (
                <span className="text-[#D4AF37]">⏳ AWAITING COUNTERPARTY ACTION</span>
              )}
            </span>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="px-5 py-2.5 bg-[#180A0A] border-t border-[#EF4444] text-[#EF4444] text-[11px] uppercase tracking-wider">
            [ ERROR: {errorMsg} ]
          </div>
        )}

        {/* Accepted 15-Minute Payment Lock State */}
        {isAccepted && (
          <div className="p-5 border-t border-[#10B981] bg-[#091812] text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-[#10B981] font-bold uppercase tracking-[0.2em] text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
              <span>BARGAIN ACCEPTED // 15-MIN LOCK ACTIVE</span>
            </div>

            <div className="font-mono text-3xl font-extrabold text-[#F2EFE9] tracking-wider py-1">
              {timeLeft}
            </div>

            <p className="text-xs text-[#8E8E8E] max-w-sm mx-auto leading-relaxed">
              Price locked at <span className="text-white font-bold">₹{negotiation.currentPrice.toLocaleString('en-IN')}</span>. Complete checkout before the countdown expires to secure this grail into vault escrow.
            </p>

            {isBuyer ? (
              <Link
                href={`/checkout?lotId=${listingId}&dealOfferId=${negotiation.id}&negotiatedPrice=${negotiation.currentPrice}`}
                className="w-full py-3.5 bg-[#10B981] hover:bg-[#0ea572] text-[#080808] font-bold text-xs uppercase tracking-[0.2em] transition-all block text-center no-underline cursor-pointer"
              >
                [ PROCEED TO ESCROW CHECKOUT • ₹{negotiation.currentPrice.toLocaleString('en-IN')} ]
              </Link>
            ) : (
              <div className="text-xs text-[#10B981] uppercase tracking-wider font-semibold py-2">
                [ AWAITING BUYER ESCROW PAYMENT INGESTION ]
              </div>
            )}
          </div>
        )}

        {/* Declined State */}
        {isDeclined && (
          <div className="p-5 border-t border-[#EF4444] bg-[#180A0A] text-center space-y-2">
            <span className="text-[#EF4444] text-xs font-bold uppercase tracking-widest block">
              [ NEGOTIATION CLOSED // DECLINED ]
            </span>
            <p className="text-xs text-[#888888]">
              This offer thread has been declined. You may acquire the lot at full asking price via standard checkout.
            </p>
          </div>
        )}

        {/* Expired State */}
        {isExpired && !isDeclined && (
          <div className="p-5 border-t border-[#262626] bg-[#0E0E0E] text-center space-y-2">
            <span className="text-[#888888] text-xs font-bold uppercase tracking-widest block">
              [ 15-MINUTE PAYMENT LOCK EXPIRED ]
            </span>
            <p className="text-xs text-[#666666]">
              The reservation lock has lapsed. The item is once again active in the open marketplace.
            </p>
          </div>
        )}

        {/* Active Interaction Form */}
        {!isAccepted && !isDeclined && !isExpired && (
          <div className="p-5 border-t border-[#1F1F1F] bg-[#0A0A0A] space-y-3">
            {/* Discount Presets (only for buyer opening/counter) */}
            {(!negotiation || isBuyer) && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#777777] uppercase tracking-wider">OFFER PRESETS:</span>
                {[10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyPreset(pct)}
                    className="px-2 py-1 bg-[#141414] hover:bg-[#202020] border border-[#222222] text-[10px] uppercase tracking-wider text-[#CCCCCC] transition-colors"
                  >
                    -{pct}% (₹{Math.round(askingPriceINR * (1 - pct / 100)).toLocaleString('en-IN')})
                  </button>
                ))}
              </div>
            )}

            {/* Input & Action Row */}
            <div className="flex gap-2">
              <input
                type="number"
                min={minFloor}
                max={askingPriceINR - 1}
                value={offerInput}
                onChange={(e) => {
                  setOfferInput(e.target.value);
                  setErrorMsg(null);
                }}
                disabled={isSubmitting || !isActorTurn}
                placeholder={
                  !negotiation
                    ? `Enter offer (min ₹${minFloor.toLocaleString('en-IN')})`
                    : isActorTurn
                    ? `Enter counter-offer in ₹`
                    : 'Awaiting other party...'
                }
                className="flex-1 bg-[#080808] border border-[#262626] focus:border-[#F2EFE9] px-3.5 py-3 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none disabled:opacity-50"
              />

              {!negotiation ? (
                <button
                  type="button"
                  onClick={handleStartOffer}
                  disabled={isSubmitting}
                  className="px-5 py-3 bg-[#F2EFE9] hover:bg-white text-[#080808] text-xs font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? '[ TRANSMITTING... ]' : '[ SUBMIT OFFER ]'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRespond('COUNTER')}
                    disabled={isSubmitting || !isActorTurn || negotiation.roundCount >= 5}
                    className="px-4 py-3 bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer disabled:opacity-40"
                  >
                    [ COUNTER ]
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRespond('ACCEPT')}
                    disabled={isSubmitting || !isActorTurn}
                    className="px-4 py-3 bg-[#10B981] hover:bg-[#0ea572] text-[#080808] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40"
                  >
                    [ ACCEPT ₹{negotiation.currentPrice.toLocaleString('en-IN')} ]
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRespond('DECLINE')}
                    disabled={isSubmitting || !isActorTurn}
                    className="px-3 py-3 bg-transparent hover:bg-[#180A0A] border border-[#333333] hover:border-[#EF4444] text-xs uppercase tracking-wider text-[#EF4444] transition-colors cursor-pointer disabled:opacity-40"
                  >
                    [ DECLINE ]
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
