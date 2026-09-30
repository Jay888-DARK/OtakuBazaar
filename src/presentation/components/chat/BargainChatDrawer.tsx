'use client';

/**
 * @file src/presentation/components/chat/BargainChatDrawer.tsx
 *
 * Real-time Bargain Negotiation Chat Drawer for OtakuBazaar.
 *
 * Features:
 * 1. Subscribes to Pusher channel `deal-[offerId]` listening for `status-change`, `offer-updated`, and `new-message`.
 * 2. Live 24-hour countdown timer with real-time second ticks.
 * 3. Conditional Razorpay Escrow payment button:
 *    - PENDING: Locked / Disabled with "🔒 Awaiting Seller Acceptance"
 *    - ACCEPTED: Unlocked button "Pay Negotiated Price (₹[offeredPrice]) via Escrow"
 *    - EXPIRED: Disabled with "Offer Expired after 24 Hours"
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Pusher from 'pusher-js';
import { submitOffer, acceptOffer, getOffer } from '@/app/actions/dealActions';
import { sendDealChatMessage } from '@/app/actions/bargainActions';

export interface BargainChatDrawerProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  askingPriceINR?: number;
  productTitle?: string;
  existingOfferId?: string;
}

export function BargainChatDrawer({
  productId,
  isOpen,
  onClose,
  askingPriceINR = 15000,
  productTitle = 'Authentic Anime Collectible',
  existingOfferId,
}: BargainChatDrawerProps): React.JSX.Element | null {
  const router = useRouter();
  const [offerPrice, setOfferPrice] = useState<number>(Math.round(askingPriceINR * 0.85));
  const [message, setMessage] = useState<string>('Can you accept this offer? Ready to pay via escrow immediately.');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [dealOffer, setDealOffer] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; senderId: string; createdAt: string | Date }>>([]);
  const [newChatText, setNewChatText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('24:00:00');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Load existing offer if provided
  useEffect(() => {
    if (existingOfferId) {
      getOffer(existingOfferId)
        .then((offer) => {
          if (offer) {
            setDealOffer(offer);
            if (offer.offeredPrice) setOfferPrice(offer.offeredPrice);
          } else {
            setDealOffer({
              id: existingOfferId,
              offeredPrice: offerPrice,
              status: 'PENDING',
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });
          }
        })
        .catch(() => {
          setDealOffer({
            id: existingOfferId,
            offeredPrice: offerPrice,
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          });
        });
    }
  }, [existingOfferId, offerPrice]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Connect to Pusher channel `deal-[offerId]`
  useEffect(() => {
    if (!dealOffer?.id) return;

    const pusherKey =
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY ||
      process.env.NEXT_PUBLIC_PUSHER_KEY ||
      '781968040588c465b8d4';
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

    let pusherClient: Pusher | null = null;
    try {
      pusherClient = new Pusher(pusherKey, {
        cluster: pusherCluster,
      });

      const channel = pusherClient.subscribe(`deal-${dealOffer.id}`);

      // 1. Listen for status-change and offer-updated
      channel.bind('status-change', (data: any) => {
        setDealOffer((prev: any) => ({
          ...prev,
          status: data.status,
          offeredPrice: data.offeredPrice ?? prev?.offeredPrice,
        }));
      });

      channel.bind('offer-updated', (updatedOffer: any) => {
        setDealOffer((prev: any) => ({ ...prev, ...updatedOffer }));
      });

      // 2. Listen for new chat messages
      channel.bind('new-message', (newMsg: any) => {
        setChatMessages((prev) => [...prev, newMsg]);
      });
    } catch (err) {
      console.warn('[BargainChatDrawer] Pusher initialization note:', err);
    }

    return () => {
      if (pusherClient) {
        pusherClient.unsubscribe(`deal-${dealOffer.id}`);
        pusherClient.disconnect();
      }
    };
  }, [dealOffer?.id]);

  // Live 24-Hour Countdown Timer
  useEffect(() => {
    if (!dealOffer?.expiresAt) return;

    const targetTime = new Date(dealOffer.expiresAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        setIsExpired(true);
        setDealOffer((prev: any) => (prev ? { ...prev, status: 'EXPIRED' } : null));
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formatted = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setTimeLeft(formatted);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [dealOffer?.expiresAt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!isOpen) return null;

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerPrice || offerPrice <= 0) {
      setErrorMessage('Please enter a valid offer amount');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const res = await submitOffer({
        productId,
        offeredPrice: offerPrice,
        buyerId: 'user_buyer_tanjiro',
      });

      if (res.autoRejected) {
        setErrorMessage(res.message || 'Offer auto-rejected: Bid is too low for this collectible.');
        return;
      }

      if (res.success && res.offerId) {
        const offer = await getOffer(res.offerId);
        if (offer) {
          setDealOffer(offer);
          if (offer.messages) {
            setChatMessages(offer.messages);
          }
        }
      } else {
        setErrorMessage('Could not submit offer. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with negotiation server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim() || !dealOffer?.id) return;

    const text = newChatText.trim();
    setNewChatText('');

    const res = await sendDealChatMessage(dealOffer.id, text);
    if (res.success && res.message) {
      setChatMessages((prev) => [...prev, res.message]);
    }
  };

  const handleProceedToCheckout = () => {
    onClose();
    router.push(
      `/checkout?productId=${encodeURIComponent(productId)}&amount=${
        dealOffer?.offeredPrice || offerPrice
      }&dealOfferId=${dealOffer?.id || ''}&offerStatus=ACCEPTED`
    );
  };

  const handleSimulateSellerAccept = async () => {
    if (!dealOffer?.id) return;
    const res = await acceptOffer(dealOffer.id);
    if (res.success && res.offer) {
      setDealOffer(res.offer);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          text: `Kyojuro Rengoku: "Deal agreed at ₹${(
            res.offer.offeredPrice || offerPrice
          ).toLocaleString('en-IN')}! Secure 24-hr escrow lock engaged."`,
          senderId: 'user_seller_rengoku',
          createdAt: new Date(),
        },
      ]);
    }
  };

  const currentStatus = dealOffer?.status || 'INITIAL';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bargain-drawer-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#0e0e11] border border-zinc-800 p-6 sm:p-7 text-zinc-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold tracking-widest text-[#E8C36A] uppercase px-2 py-0.5 border border-zinc-700 bg-zinc-900">
              OFFER
            </span>
            <div>
              <h2 id="bargain-drawer-title" className="text-base font-extrabold text-zinc-100 uppercase tracking-[0.15em]">
                Collector Price Bargain
              </h2>
              <p className="text-[11px] text-zinc-400 m-0 truncate max-w-xs font-normal">
                {productTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Asking Price Comparison */}
        <div className="my-4 p-3.5 bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-semibold">Catalog Asking Price</span>
            <span className="text-sm font-bold text-zinc-300 line-through">
              ₹{askingPriceINR.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-emerald-400 font-bold block text-[11px] uppercase tracking-wider">48-Hour Escrow Protection</span>
            <span className="text-[10px] text-stone-400">Zero bootleg risk guarantee</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/50 text-red-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Stage 1: Initial Offer Submission */}
        {!dealOffer ? (
          <form onSubmit={handleSubmitOffer} className="space-y-4">
            <div>
              <label htmlFor="offer-amount" className="block text-xs font-bold text-stone-300 mb-1.5 uppercase tracking-wider">
                Your Offer Amount (INR ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  id="offer-amount"
                  type="number"
                  min="100"
                  step="50"
                  value={offerPrice || ''}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  placeholder="Enter your offer"
                  className="w-full pl-8 pr-4 py-2.5 bg-black border border-stone-800 text-white font-bold text-base focus:border-zinc-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="offer-message" className="block text-xs font-bold text-stone-300 mb-1.5 uppercase tracking-wider">
                Message to Seller
              </label>
              <textarea
                id="offer-message"
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Suggest price terms or inspection conditions..."
                className="w-full px-3.5 py-2 bg-black border border-stone-800 text-white text-xs focus:border-zinc-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-zinc-100 hover:bg-white text-black font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{submitting ? 'Submitting Bid...' : 'Submit 24-Hour Bid'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Stage 2: Active Negotiation & Chat Room */
          <div className="space-y-4">
            {/* Status Banner with Live 24-Hour Countdown */}
            <div
              className={`p-3.5 border text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
                currentStatus === 'ACCEPTED'
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                  : currentStatus === 'EXPIRED'
                  ? 'bg-stone-900 border-stone-700 text-stone-400'
                  : currentStatus === 'REJECTED' || currentStatus === 'AUTO_REJECTED'
                  ? 'bg-red-950/40 border-red-500/60 text-red-200'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider">
                    Status:{' '}
                    {currentStatus === 'ACCEPTED'
                      ? 'Offer Accepted!'
                      : currentStatus === 'EXPIRED'
                      ? 'Offer Expired'
                      : currentStatus}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-black border border-zinc-700 uppercase tracking-widest font-semibold">
                    {timeLeft}
                  </span>
                </div>
                <div className="text-[11px] opacity-90 mt-0.5 flex gap-2">
                  <span>Offered: ₹{(dealOffer.offeredPrice || offerPrice).toLocaleString('en-IN')}</span>
                  <span className="text-zinc-400">• 24-Hour Bid Window</span>
                </div>
              </div>

              {currentStatus === 'PENDING' && (
                <button
                  type="button"
                  onClick={handleSimulateSellerAccept}
                  className="px-3 py-1.5 text-xs font-bold bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 text-amber-300 transition-colors cursor-pointer self-start sm:self-center flex items-center gap-1 uppercase tracking-wider"
                  title="Simulate seller acceptance for testing"
                >
                  <span>Accept Offer (Demo)</span>
                </button>
              )}
            </div>

            {/* Real-time Message Log */}
            <div className="h-40 bg-black border border-stone-800 p-3 overflow-y-auto space-y-2 text-xs">
              {chatMessages.length === 0 ? (
                <p className="text-stone-500 text-center py-7 tracking-wider uppercase text-[11px]">
                  Pusher real-time negotiation channel connected (`deal-{dealOffer.id}`). Awaiting seller response...
                </p>
              ) : (
                chatMessages.map((msg) => {
                  const isBuyer = msg.senderId === 'user_buyer_tanjiro';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isBuyer ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-1.5 text-xs ${
                          isBuyer
                            ? 'bg-zinc-200 text-black font-medium'
                            : 'bg-zinc-900 text-zinc-200 border border-stone-800'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            {currentStatus !== 'EXPIRED' && (
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={newChatText}
                  onChange={(e) => setNewChatText(e.target.value)}
                  placeholder="Type message to seller..."
                  className="flex-1 px-3 py-2 text-xs bg-black border border-stone-800 text-white focus:border-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider border border-stone-700 transition-colors cursor-pointer"
                >
                  Send
                </button>
              </form>
            )}

            {/* Conditional Payment Button */}
            {currentStatus === 'PENDING' ? (
              <div className="pt-2">
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 px-4 bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <span>Awaiting Seller Acceptance</span>
                </button>
              </div>
            ) : currentStatus === 'ACCEPTED' ? (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 px-4 bg-zinc-100 hover:bg-white text-black font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    Pay Negotiated Price (₹{(dealOffer.offeredPrice || offerPrice).toLocaleString('en-IN')}) via Escrow
                  </span>
                </button>
              </div>
            ) : currentStatus === 'EXPIRED' ? (
              <div className="pt-2">
                <div className="p-3 text-center bg-stone-900 border border-stone-800 text-stone-500 text-xs font-bold uppercase tracking-wider">
                  Offer Expired after 24 Hours
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default BargainChatDrawer;
