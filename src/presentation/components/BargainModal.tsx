'use client';

/**
 * @file src/presentation/components/BargainModal.tsx
 *
 * Real-time Bargaining & Escrow Negotiation Terminal for OtakuBazaar.
 * High-end institutional banking terminal aesthetic (obsidian, matte zinc, hairline borders).
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Pusher from 'pusher-js';
import { submitOffer, acceptOffer, getOffer } from '@/app/actions/dealActions';
import { sendDealChatMessage } from '@/app/actions/bargainActions';
import { HoldButton } from '@/presentation/components/ui/HoldButton';
import { AuthenticityLedger } from '@/presentation/components/ui/AuthenticityLedger';

export interface BargainModalProps {
  productId: string;
  isOpen?: boolean;
  onClose?: () => void;
  askingPriceINR?: number;
  productTitle?: string;
}

export function BargainModal({
  productId,
  isOpen = true,
  onClose,
  askingPriceINR = 15000,
  productTitle = 'Authentic Anime Collectible',
}: BargainModalProps): React.JSX.Element | null {
  const router = useRouter();
  const [offerPrice, setOfferPrice] = useState<number | string>(Math.round(askingPriceINR * 0.85));
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [dealOffer, setDealOffer] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; text: string; senderId: string; createdAt: string | Date }>
  >([]);
  const [newChatText, setNewChatText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Connect to Pusher real-time updates once DealOffer is created
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

      channel.bind('offer-updated', (updatedOffer: any) => {
        setDealOffer((prev: any) => ({ ...prev, ...updatedOffer }));
      });

      channel.bind('new-message', (newMsg: any) => {
        setChatMessages((prev) => [...prev, newMsg]);
      });
    } catch (err) {
      console.warn('[BargainModal] Pusher initialization note:', err);
    }

    return () => {
      if (pusherClient) {
        pusherClient.unsubscribe(`deal-${dealOffer.id}`);
        pusherClient.disconnect();
      }
    };
  }, [dealOffer?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!isOpen) return null;

  const handleSendOffer = async () => {
    const numericOffer = Number(offerPrice);
    if (!numericOffer || numericOffer <= 0) {
      setErrorMessage('ENTER A VALID VALUATION AMOUNT');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const res = await submitOffer({
        productId,
        offeredPrice: numericOffer,
        buyerId: 'user_buyer_tanjiro',
      });

      if (res.autoRejected) {
        setErrorMessage(res.message || 'AUTOMATIC REJECTION: Counter-offer below risk threshold.');
        return;
      }

      if (res.success && res.offerId) {
        const offer = await getOffer(res.offerId);
        if (offer) {
          setDealOffer(offer);
          if (offer.messages) {
            setChatMessages(offer.messages);
          } else {
            setChatMessages([
              {
                id: `msg-${Date.now()}`,
                text: `Offer of ₹${numericOffer.toLocaleString('en-IN')} submitted to Tokyo Archival Vault. Escrow pending seller counter-signature.`,
                senderId: 'system',
                createdAt: new Date(),
              },
            ]);
          }
        }
      } else {
        setErrorMessage('OFFER TRANSMISSION FAILED. RETRY PROTOCOL.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'CONNECTION ERROR WITH NEGOTIATION GATEWAY.');
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
    if (onClose) onClose();
    const finalAmount = dealOffer?.offeredPrice || Number(offerPrice) || askingPriceINR;
    router.push(
      `/checkout?productId=${encodeURIComponent(productId)}&amount=${finalAmount}&dealOfferId=${dealOffer?.id || ''}&offerStatus=ACCEPTED`
    );
  };

  // Seller acceptance simulation invoking real server action
  const handleSimulateSellerAccept = async () => {
    if (!dealOffer?.id) return;
    const res = await acceptOffer(dealOffer.id);
    if (res.success && res.offer) {
      setDealOffer(res.offer);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          text: `VAULT SELLER COUNTER-SIGNATURE CONFIRMED: Offer accepted at ₹${(
            res.offer.offeredPrice || Number(offerPrice)
          ).toLocaleString('en-IN')}. Razorpay escrow release key prepared.`,
          senderId: 'user_seller_rengoku',
          createdAt: new Date(),
        },
      ]);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bargain-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {/* High-End Banking Terminal Container */}
      <div className="bg-[#0a0a0c] border border-zinc-800 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] max-w-lg w-full p-6 relative overflow-hidden">
        {/* A. Modal Header */}
        <div className="flex justify-between items-start border-b border-zinc-800/80 pb-4 mb-5">
          <div>
            <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-500 uppercase">
              Encrypted Escrow Channel
            </span>
            <h2 id="bargain-modal-title" className="text-base font-mono font-bold text-zinc-100 uppercase tracking-widest mt-1">
              Vault Negotiation
            </h2>
            <div className="text-[10px] font-mono text-zinc-400 mt-0.5 truncate max-w-sm">
              {productTitle}
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close terminal"
              className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* B. Financial Readout Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#121214] border border-zinc-800/50 rounded-lg p-3">
            <div className="text-[9px] font-mono text-zinc-500 uppercase mb-1 tracking-widest">
              Archival Valuation
            </div>
            <div className="text-sm font-mono font-bold text-zinc-200">
              ₹{askingPriceINR.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-[#121214] border border-zinc-800/50 rounded-lg p-3 flex flex-col justify-center">
            <div className="flex items-center space-x-2 text-[9px] font-mono text-zinc-300 uppercase mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span>48-H Protection Active</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500">Zero bootleg risk guarantee</div>
          </div>
        </div>

        {/* Digital Certificate of Authenticity (COA) */}
        <div className="mb-4">
          <AuthenticityLedger
            lotId={`LOT-${productId.replace(/[^0-9]/g, '').padStart(4, '0').slice(-4) || '0482'}`}
            grader="Prime Inspection Escrow"
            hash="0x8F4A...B99C"
          />
        </div>

        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 text-[11px] font-mono">
            {errorMessage}
          </div>
        )}

        {/* C. Pusher WebSocket Terminal Log */}
        <div className="bg-[#121214] border border-zinc-800/50 rounded-lg p-4 h-40 mb-5 overflow-y-auto flex flex-col justify-end">
          <div className="text-center text-[9px] font-mono text-zinc-600 uppercase tracking-widest border-b border-zinc-800/30 pb-2 mb-2">
            WebSocket Live // Awaiting Counterparty
          </div>

          <div className="overflow-y-auto space-y-2 pr-1">
            {chatMessages.length === 0 ? (
              <div className="text-[11px] font-mono text-zinc-500 text-center py-4">
                Telemetry connected. Enter target offer below to initialize escrow channel.
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isBuyer = msg.senderId === 'user_buyer_tanjiro';
                const isSystem = msg.senderId === 'system';
                return (
                  <div key={msg.id} className={`flex flex-col ${isBuyer ? 'items-end' : isSystem ? 'items-center' : 'items-start'}`}>
                    <div
                      className={`max-w-[90%] px-2.5 py-1 rounded text-[11px] font-mono ${
                        isSystem
                          ? 'text-zinc-500 text-[10px] border border-zinc-800/60 bg-zinc-900/40 text-center'
                          : isBuyer
                          ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                          : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
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
        </div>

        {/* Status Actions (When Offer is Active) */}
        {dealOffer && (
          <div className="mb-4 p-3 rounded-lg border border-zinc-800 bg-[#121214] flex items-center justify-between font-mono text-xs">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">OFFER PROTOCOL STATUS</div>
              <div className="text-zinc-200 font-bold uppercase tracking-wide">
                {dealOffer.status === 'ACCEPTED' ? '✓ COUNTERSIGNED' : dealOffer.status} // ₹{(dealOffer.offeredPrice || Number(offerPrice)).toLocaleString('en-IN')}
              </div>
            </div>

            {dealOffer.status === 'PENDING' && (
              <button
                type="button"
                onClick={handleSimulateSellerAccept}
                className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 bg-zinc-800/80 rounded transition-colors cursor-pointer"
              >
                Simulate Seller Accept
              </button>
            )}
          </div>
        )}

        {/* D. Hold-to-Submit Action Area & Payment Gateway Trigger */}
        {dealOffer?.status === 'ACCEPTED' ? (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="w-full py-2.5 bg-zinc-100 hover:bg-white text-black font-mono text-[11px] font-bold uppercase tracking-[0.2em] rounded-lg transition-all shadow-xl cursor-pointer"
            >
              PROCEED TO ESCROW PAYMENT (₹{(dealOffer.offeredPrice || Number(offerPrice)).toLocaleString('en-IN')})
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">₹</span>
              <input
                type="number"
                placeholder="ENTER OFFER..."
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                disabled={submitting}
                className="w-full bg-[#121214] border border-zinc-800 hover:border-zinc-600 rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-700 focus:border-zinc-400 outline-none transition-colors"
              />
            </div>

            <div className="w-[180px]">
              <HoldButton
                backgroundColor="#18181b"
                fillColor="#f4f4f5"
                fillTextColor="#09090b"
                textColor="#a1a1aa"
                holdTime={1000}
                onHold={() => handleSendOffer()}
                doneLabel="OFFER SENT"
                size="sm"
                className="font-mono text-[10px] tracking-[0.2em] border border-zinc-700 hover:border-zinc-500 w-full"
              >
                HOLD TO OFFER
              </HoldButton>
            </div>
          </div>
        )}

        {/* Post-Offer Counterparty Chat Input (if offer active) */}
        {dealOffer && dealOffer.status !== 'ACCEPTED' && (
          <form onSubmit={handleSendChat} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newChatText}
              onChange={(e) => setNewChatText(e.target.value)}
              placeholder="TRANSMIT COUNTER-OFFER REASONING..."
              className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-[#121214] border border-zinc-800 text-zinc-200 placeholder-zinc-700 focus:border-zinc-600 outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-semibold uppercase tracking-wider border border-zinc-700 transition-colors cursor-pointer"
            >
              Send
            </button>
          </form>
        )}

        <div className="text-center text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
          Razorpay Escrow Vault • Funds locked until verification
        </div>
      </div>
    </div>
  );
}

export const OfferModal = BargainModal;
export default BargainModal;
