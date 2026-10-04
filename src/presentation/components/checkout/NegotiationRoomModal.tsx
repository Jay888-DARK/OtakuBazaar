'use client';

/**
 * @file src/presentation/components/checkout/NegotiationRoomModal.tsx
 *
 * Feature 1: The Escrow Negotiation Room (Full-Screen Checkout Flow).
 * Replaces the standard slide-out cart drawer with a full-screen 50/50 vertical split-screen.
 *
 * Requirements:
 * - Instant harsh cut (0ms transition time, no fades/slides).
 * - Left half: Product 1px grid data, image, condition, lot reference, and specs.
 * - Right half: Payment gateway (Razorpay Escrow / UPI) & escrow terms formatted as a structured legal document.
 * - Enforces brutalist state inversions (#f4f4f4 background, black text on click/focus).
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { openProvenanceManifest } from '@/presentation/components/provenance/ProvenanceManifestModal';

export interface NegotiationRoomItem {
  id: string;
  title: string;
  price: number;
  lotRef: string;
  condition: string;
  imageUrl: string;
  series: string;
  fabricator: string;
}

const DEFAULT_ROOM_ITEM: NegotiationRoomItem = {
  id: 'lot-0482',
  title: 'GUTS BERSERKER ARMOR UNLEASHED 1/4 SCALE',
  price: 89000,
  lotRef: 'LOT-0482',
  condition: 'S-RANK FACTORY SEALED',
  imageUrl: '/showcase/guts_berserker_statue.jpg',
  series: 'BERSERK • KENTARO MIURA MEMORIAL',
  fabricator: 'PRIME 1 STUDIO',
};

export function openNegotiationRoom(item?: Partial<NegotiationRoomItem>) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('otaku_open_negotiation_room', { detail: item })
    );
  }
}

export function NegotiationRoomModal(): React.JSX.Element | null {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [roomItem, setRoomItem] = useState<NegotiationRoomItem>(DEFAULT_ROOM_ITEM);
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    // Intercept both custom negotiation room open and cart drawer open
    const handleOpenRoom = (e: Event) => {
      const customEvent = e as CustomEvent<Partial<NegotiationRoomItem>>;
      if (customEvent.detail) {
        setRoomItem({ ...DEFAULT_ROOM_ITEM, ...customEvent.detail });
      }
      setIsOpen(true);
    };

    const handleCartDrawer = () => {
      setIsOpen(true);
    };

    window.addEventListener('otaku_open_negotiation_room', handleOpenRoom);
    window.addEventListener('otaku-open-cart-drawer', handleCartDrawer);

    return () => {
      window.removeEventListener('otaku_open_negotiation_room', handleOpenRoom);
      window.removeEventListener('otaku-open-cart-drawer', handleCartDrawer);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecuteEscrowLock = () => {
    setPaymentProcessing(true);
    // Instant 0ms redirection to Razorpay checkout workflow
    router.push(`/checkout?productId=${roomItem.id}&amount=${roomItem.price}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Escrow Negotiation Room"
      className="fixed inset-0 z-[99998] bg-[#09090b] text-[#f4f4f5] select-none overflow-y-auto"
      style={{ transition: 'none' }}
    >
      {/* Top Header Bar */}
      <div className="border-b border-[#27272a] bg-[#0a0a0c] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 border border-zinc-700 bg-zinc-900 text-[9px] uppercase tracking-[0.25em] font-bold text-zinc-300">
            CHECKOUT // BUYER PROTECTION
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium hidden sm:inline">
            100% BUYER PROTECTION GUARANTEE
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close negotiation room"
          className="w-8 h-8 border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 50/50 Stark Vertical Split-Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-65px)] divide-y lg:divide-y-0 lg:divide-x divide-[#27272a]">
        {/* LEFT HALF (50%): Product Grid Data, Image & Details */}
        <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-[#09090b]">
          <div className="relative border border-[#27272a] bg-[#070709] p-6 mb-8">
            <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.2em] text-zinc-600">
              ITEM ID // {roomItem.lotRef}
            </span>
            <span className="absolute bottom-2 right-2 text-[9px] uppercase tracking-[0.2em] text-zinc-600">
              VERIFIED AUTHENTIC
            </span>

            <div className="relative w-full aspect-square max-h-[380px] mx-auto flex items-center justify-center overflow-hidden my-4">
              <Image
                src={roomItem.imageUrl}
                alt={roomItem.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-4 contrast-110"
                priority
              />
            </div>
          </div>

          {/* Left Grid Data Table */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold">
                  {roomItem.series}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold border border-emerald-900/60 bg-emerald-950/40 px-2 py-0.5">
                  [{roomItem.condition}]
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-zinc-100">
                {roomItem.title}
              </h2>
            </div>

            {/* 4-Cell Specifications Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="border border-zinc-800 bg-[#0e0e11] p-3">
                <span className="block text-[8px] uppercase tracking-widest text-zinc-500">Manufacturer</span>
                <span className="text-[11px] font-bold uppercase text-zinc-300">{roomItem.fabricator}</span>
              </div>
              <div className="border border-zinc-800 bg-[#0e0e11] p-3">
                <span className="block text-[8px] uppercase tracking-widest text-zinc-500">Item Ref</span>
                <span className="text-[11px] font-bold uppercase text-zinc-300">{roomItem.lotRef}</span>
              </div>
              <div className="border border-zinc-800 bg-[#0e0e11] p-3">
                <span className="block text-[8px] uppercase tracking-widest text-zinc-500">Inspection</span>
                <span className="text-[11px] font-bold uppercase text-zinc-300">Grade S (Passed)</span>
              </div>
              <div className="border border-zinc-800 bg-[#0e0e11] p-3">
                <span className="block text-[8px] uppercase tracking-widest text-zinc-500">Protection</span>
                <span className="text-[11px] font-bold uppercase text-zinc-300">48-Hour Escrow</span>
              </div>
            </div>

            {/* Provenance Trigger */}
            <button
              type="button"
              onClick={() =>
                openProvenanceManifest({
                  lotRef: roomItem.lotRef,
                  itemTitle: roomItem.title,
                })
              }
              className="w-full p-3 border border-zinc-800 bg-[#0c0c0e] hover:border-zinc-500 text-left flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-400 brutalist-btn cursor-pointer"
            >
              <span>[ VIEW CERTIFICATE OF AUTHENTICITY ]</span>
              <span className="text-zinc-200">→</span>
            </button>
          </div>
        </div>

        {/* RIGHT HALF (50%): Payment Gateway & Terms */}
        <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-[#0c0c0e]">
          <div className="space-y-6">
            <div className="border-b border-[#27272a] pb-4">
              <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-1">
                BUYER PROTECTION GUARANTEE
              </span>
              <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-100">
                Order Terms &amp; Guarantees
              </h3>
            </div>

            {/* Document Clauses */}
            <div className="space-y-4 text-xs uppercase tracking-wider text-zinc-400 leading-relaxed max-h-[320px] overflow-y-auto pr-2 border-l border-zinc-800 pl-4">
              <div>
                <span className="text-zinc-200 font-bold block mb-1">1. 15-MINUTE RESERVATION LOCK</span>
                <p className="text-[11px] text-zinc-500">
                  When you begin checkout, this item is reserved exclusively for you for 15 minutes.
                </p>
              </div>

              <div>
                <span className="text-zinc-200 font-bold block mb-1">2. SECURE ESCROW PAYMENT</span>
                <p className="text-[11px] text-zinc-500">
                  Your payment is held safely in escrow. The seller is only paid after you receive and approve the item.
                </p>
              </div>

              <div>
                <span className="text-zinc-200 font-bold block mb-1">3. 48-HOUR INSPECTION WINDOW</span>
                <p className="text-[11px] text-zinc-500">
                  You have 48 hours after delivery to inspect your item. If there is any issue or damage, you receive a 100% refund.
                </p>
              </div>

              <div>
                <span className="text-zinc-200 font-bold block mb-1">4. INSURED SHIPPING</span>
                <p className="text-[11px] text-zinc-500">
                  All transit is fully insured and tracked door-to-door.
                </p>
              </div>
            </div>

            {/* Price Breakdown Matrix */}
            <div className="border border-zinc-800 bg-[#09090b] p-4 divide-y divide-zinc-800/80 text-xs">
              <div className="flex justify-between pb-2">
                <span className="text-zinc-500 uppercase tracking-wider">ITEM PRICE</span>
                <span className="text-zinc-100 font-bold">₹{roomItem.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-500 uppercase tracking-wider">ESCROW PROTECTION</span>
                <span className="text-emerald-400 font-bold">FREE (₹0)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-500 uppercase tracking-wider">INSURED SHIPPING</span>
                <span className="text-zinc-300">INCLUDED IN FULL</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold">
                <span className="text-zinc-200 uppercase tracking-wider">TOTAL AMOUNT</span>
                <span className="text-zinc-100">₹{roomItem.price.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Bottom Execution Action Cell */}
          <div className="pt-6 border-t border-[#27272a] space-y-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAgreedToTerms}
                onChange={(e) => setIsAgreedToTerms(e.target.checked)}
                className="mt-0.5 accent-zinc-100 rounded-none w-4 h-4 cursor-pointer"
              />
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 leading-normal">
                I agree to the 48-hour inspection period and authorize secure payment into escrow.
              </span>
            </label>

            <button
              type="button"
              onClick={handleExecuteEscrowLock}
              disabled={!isAgreedToTerms || paymentProcessing}
              className="w-full py-4 px-6 bg-[#f4f4f4] hover:bg-white text-black font-bold text-xs uppercase tracking-[0.22em] border border-[#f4f4f4] disabled:opacity-40 transition-none cursor-pointer brutalist-btn block text-center"
            >
              {paymentProcessing
                ? 'PROCESSING CHECKOUT...'
                : `BUY NOW (₹${roomItem.price.toLocaleString('en-IN')}) →`}
            </button>

            <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-zinc-500">
              <span>GATEWAY: RAZORPAY ESCROW / UPI DIRECT</span>
              <span>256-BIT ENCRYPTION</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NegotiationRoomModal;
