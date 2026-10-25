'use client';

/**
 * @file src/app/lot/[id]/page.tsx
 *
 * Dedicated Archival Lot Inspection & Bargaining View for OtakuBazaar.
 * Strictly adheres to the dark archival auction-house aesthetic:
 *
 * 1. 5-Slot Authenticity Macro Gallery:
 *    - Main 4:5 studio portrait well with 2.8X jeweler optical loupe.
 *    - 4 selectable macro slots: [ 01 // STUDIO SCULPT ], [ 02 // HOLOGRAM STICKER MACRO ],
 *      [ 03 // BASE COPYRIGHT STAMP ], [ 04 // HANDWRITTEN TIMESTAMP ].
 * 2. Dual Collector Condition Ledger:
 *    - Structured 1px bordered specification table: Figure Grade (MISB vs BIB vs Loose),
 *      Packaging / Blister Grade (Mint Box vs Minor Corner Wear), Provenance (Seller handle,
 *      Indian city, owner count, 48H insured BlueDart/Delhivery dispatch SLA).
 * 3. Interactive Escrow Bargaining & Acquisition Panel:
 *    - Direct Buy: [ ACQUIRE AT ASKING — ₹... ]
 *    - Make Escrow Offer: Input in ₹ INR with quick -5%, -10%, -15% presets & [ SUBMIT 24H ESCROW OFFER ].
 *    - Collection Bundle Option: [ VIEW SELLER'S FULL VAULT BUNDLE (SAVE 12%) ].
 * 4. Architectural Footer with verifiable compliance links.
 */

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MOCK_PRODUCTS, MockProduct, MacroSlotItem } from '@/lib/mockProducts';
import { addToCart } from '@/app/actions/dealActions';
import { openCartDrawer } from '@/presentation/components/cart/CartDrawer';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';

interface LotPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function LotDetailPage({ params }: LotPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [zoomCoords, setZoomCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Bargaining Offer State
  const [offerInput, setOfferInput] = useState<string>('');
  const [isOfferSubmitted, setIsOfferSubmitted] = useState<boolean>(false);
  const [isAddingDirect, setIsAddingDirect] = useState<boolean>(false);
  const [showBundleModal, setShowBundleModal] = useState<boolean>(false);

  useEffect(() => {
    Promise.resolve(params).then((p) => {
      setResolvedParams(p);
    });
  }, [params]);

  const rawId = resolvedParams?.id || 'lot-0482';
  const product: MockProduct = useMemo(() => {
    return (
      MOCK_PRODUCTS.find(
        (p) =>
          p.id.toLowerCase() === rawId.toLowerCase() ||
          p.lotNumber.toLowerCase() === rawId.toLowerCase()
      ) || MOCK_PRODUCTS[0]!
    );
  }, [rawId]);

  // Construct standard 5-slot macro items (Main + 4 verification slots)
  const macroSlots: MacroSlotItem[] = useMemo(() => {
    if (product.macroSlots && product.macroSlots.length >= 4) {
      return [
        {
          slot: '[ 00 // MAIN SPECIMEN ]',
          title: 'Full Specimen Elevation',
          src: product.imageUrl,
          description: 'Full elevation studio portrait of authenticated specimen.',
        },
        ...product.macroSlots,
      ];
    }
    return [
      {
        slot: '[ 00 // MAIN SPECIMEN ]',
        title: 'Full Specimen Elevation',
        src: product.imageUrl,
        description: 'Full elevation studio portrait of authenticated specimen.',
      },
      {
        slot: '[ 01 // STUDIO SCULPT ]',
        title: 'Studio Sculpt Macro',
        src: product.imageUrl,
        description: 'High magnification surface sculpt inspection and joint tolerances.',
      },
      {
        slot: '[ 02 // HOLOGRAM STICKER MACRO ]',
        title: 'Hologram Sticker Macro',
        src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85',
        description: 'Tamper-evident holographic authenticity seal with sequential serial.',
      },
      {
        slot: '[ 03 // BASE COPYRIGHT STAMP ]',
        title: 'Base Copyright Stamp',
        src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85',
        description: 'Debossed factory copyright stamp verification.',
      },
      {
        slot: '[ 04 // HANDWRITTEN TIMESTAMP ]',
        title: 'Handwritten Timestamp',
        src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85',
        description: 'Physical ledger verification card with seller handle and date.',
      },
    ];
  }, [product]);

  const activeMedia = macroSlots[activeSlotIndex] || macroSlots[0]!;

  const handleMouseMoveZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomCoords({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  // Direct acquisition at asking price
  const handleAcquireDirect = async () => {
    setIsAddingDirect(true);
    try {
      await addToCart(product.id);
    } catch {
      // fallback
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('otaku_cart_updated'));
      openCartDrawer();
    }
    setIsAddingDirect(false);
  };

  // Percentage discount calculation for quick presets
  const applyDiscountPreset = (percentage: number) => {
    const discounted = Math.round(product.price * (1 - percentage / 100));
    setOfferInput(discounted.toString());
  };

  // Submit 24h Escrow Offer
  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const offerNum = parseInt(offerInput.replace(/,/g, ''), 10);
    if (!offerNum || offerNum <= 0) return;

    // Lock offer in localStorage and trigger cart synchronization
    const pendingOffer = {
      id: `offer_${Date.now()}`,
      productId: product.id,
      lotNumber: product.lotNumber,
      title: product.title,
      price: product.price,
      offeredPrice: offerNum,
      sellerHandle: product.sellerHandle || '@seller_vault',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('otaku_pending_offers') || '[]');
        localStorage.setItem('otaku_pending_offers', JSON.stringify([pendingOffer, ...stored]));
      } catch {
        // ignore
      }

      // Add to cart with pending offer state
      addToCart(product.id).catch(() => {});
      window.dispatchEvent(new CustomEvent('otaku_cart_updated'));
      setIsOfferSubmitted(true);
      setTimeout(() => {
        openCartDrawer();
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F2EFE9] select-none">
      {/* Top Breadcrumb Bar */}
      <div className="w-full border-b border-[#1F1F1F] bg-[#080808] px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-sans uppercase tracking-[0.14em]">
          <div className="flex items-center space-x-3 text-[#888888]">
            <Link
              href="/#stage-2"
              className="text-[#CCCCCC] hover:text-white transition-colors no-underline border border-[#1F1F1F] bg-[#0C0C0C] px-3 py-1 hover:border-[#F2EFE9]"
            >
              [ BACK TO ARCHIVAL INDEX ]
            </Link>
            <span className="text-[#333333]">/</span>
            <span className="text-[#888888]">{product.category.toUpperCase()}</span>
            <span className="text-[#333333]">/</span>
            <span className="text-[#F2EFE9] font-medium">LOT #{product.lotNumber}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 border border-[#193829] bg-[#091812] px-3 py-1">
            <span className="w-1.5 h-1.5 bg-[#10B981] inline-block" />
            <span className="text-[10px] text-[#10B981] font-semibold tracking-[0.15em]">
              {product.origin || 'INDIAN CUSTODY • ESCROW ACTIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Asymmetric Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#1F1F1F] bg-[#080808]">
          {/* Left Column (7 cols): 5-Slot Authenticity Macro Gallery */}
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#1F1F1F] bg-[#080808] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Media Kicker Bar */}
              <div className="flex items-center justify-between border-b border-[#161616] pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#F2EFE9] border border-[#1F1F1F] bg-[#0C0C0C] px-2.5 py-1 font-sans">
                    AUTHENTICITY STAGE
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#777777] font-sans">
                    2.8X MACRO OPTICAL VERIFICATION
                  </span>
                </div>
                <span className="text-[10px] font-sans tracking-[0.14em] text-[#10B981] uppercase font-semibold">
                  [ ANTI-BOOTLEG VERIFIED ]
                </span>
              </div>

              {/* Strict 4:5 Studio Portrait Well with Optical Loupe */}
              <div className="relative w-full aspect-[4/5] p-3 bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden flex items-center justify-center">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-[#141414] animate-pulse pointer-events-none" />
                )}

                <div
                  className="relative w-full h-full cursor-crosshair overflow-hidden"
                  onClick={() => setIsZoomed(!isZoomed)}
                  onMouseMove={handleMouseMoveZoom}
                >
                  {isZoomed ? (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${activeMedia.src})`,
                        backgroundPosition: `${zoomCoords.x}% ${zoomCoords.y}%`,
                        backgroundSize: '300%',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeMedia.src}
                      alt={`${product.title} — ${activeMedia.title}`}
                      onLoad={() => setImageLoaded(true)}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/Firefly_clean.png';
                        setImageLoaded(true);
                      }}
                      className={`w-full h-full object-cover object-center transition-opacity duration-150 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  )}

                  {/* Loupe State Overlay */}
                  <div className="absolute bottom-3 left-3 border border-[#1F1F1F] bg-[#080808]/90 px-3 py-1 font-sans text-[9px] uppercase tracking-[0.14em] text-[#CCCCCC] pointer-events-none">
                    {isZoomed
                      ? '[ 2.8X OPTICAL LOUPE ACTIVE — CLICK TO EXIT ]'
                      : '[ CLICK IMAGE TO ACTIVATE 2.8X OPTICAL LOUPE ]'}
                  </div>

                  <div className="absolute top-3 right-3 border border-[#1F1F1F] bg-[#080808]/90 px-2.5 py-1 font-sans text-[9px] uppercase tracking-[0.14em] text-[#888888] pointer-events-none">
                    SLOT {activeSlotIndex + 1} OF {macroSlots.length}
                  </div>
                </div>
              </div>

              {/* 5 Selectable Thumbnail Macro Slots */}
              <div className="mt-6 pt-5 border-t border-[#161616]">
                <div className="flex items-center justify-between mb-3 font-sans text-[10px] tracking-[0.16em] uppercase">
                  <span className="text-[#888888] font-semibold">
                    AUTHENTICITY MACRO SLOTS (5 ANGLES)
                  </span>
                  <span className="text-[#666666]">
                    TAP SLOT TO SWITCH INSPECTION FOCUS
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2.5">
                  {macroSlots.map((item, idx) => {
                    const isSelected = activeSlotIndex === idx;
                    return (
                      <button
                        key={`${item.slot}-${idx}`}
                        type="button"
                        onClick={() => {
                          setActiveSlotIndex(idx);
                          setImageLoaded(false);
                        }}
                        className={`p-1.5 border flex flex-col justify-between text-left transition-colors cursor-pointer rounded-none bg-[#0C0C0C] ${
                          isSelected
                            ? 'border-[#F2EFE9] bg-[#161616]'
                            : 'border-[#1F1F1F] hover:border-[#3A3A3A]'
                        }`}
                      >
                        <div className="relative aspect-[4/5] w-full bg-[#080808] border border-[#1A1A1A] overflow-hidden mb-1.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.src}
                            alt={item.title}
                            className="w-full h-full object-cover object-center"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/Firefly_clean.png';
                            }}
                          />
                        </div>
                        <span className="font-sans text-[8px] tracking-[0.1em] text-[#888888] uppercase truncate block">
                          {item.slot.replace(/\[\s*|\s*\]/g, '')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active Macro Description Card */}
            <div className="mt-5 p-4 bg-[#0C0C0C] border border-[#1F1F1F] font-sans">
              <div className="text-[10px] tracking-[0.16em] text-[#777777] uppercase font-semibold mb-1">
                ACTIVE TELEMETRY • {activeMedia.slot}
              </div>
              <div className="font-serif text-[14px] text-[#F2EFE9] uppercase tracking-[0.04em] mb-1">
                {activeMedia.title}
              </div>
              <p className="text-[12px] text-[#8E8E8E] leading-relaxed">
                {activeMedia.description}
              </p>
            </div>
          </div>

          {/* Right Column (5 cols): Dual Ledger & Interactive Bargaining Panel */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#080808] space-y-6">
            <div>
              {/* Header Row: Lot ID & Custody Origin */}
              <div className="flex items-center justify-between text-[10px] font-sans uppercase tracking-[0.15em] text-[#777777] mb-2 font-semibold">
                <span>LOT #{product.lotNumber} • {product.origin || 'MUMBAI, MH • IN-HAND'}</span>
                <span className="border border-[#2A2A2A] px-2 py-0.5 text-[10px] text-[#E5E5E5] bg-[#0C0C0C]">
                  {product.gradeCondition || '[S-RANK]'}
                </span>
              </div>

              {/* Collectible Title in Playfair Display Serif */}
              <h1 className="font-serif text-[24px] sm:text-[28px] text-[#F2EFE9] uppercase tracking-[0.06em] leading-snug mb-3">
                {product.title}
              </h1>

              {/* Franchise & Category */}
              <div className="text-[11px] font-sans tracking-[0.14em] text-[#888888] uppercase mb-5">
                FRANCHISE: {(product.franchise || product.series || 'ARCHIVAL JAPAN').toUpperCase()} • CATEGORY: {product.category.toUpperCase()}
              </div>

              {/* Valuation Box */}
              <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-4 mb-6">
                <span className="font-sans text-[10px] tracking-[0.16em] text-[#888888] uppercase block mb-1">
                  OFFICIAL ASKING VALUATION
                </span>
                <div className="font-serif text-[32px] text-[#F2EFE9] tracking-wider leading-none">
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
                <div className="mt-3 pt-3 border-t border-[#161616] flex justify-between items-center font-sans text-[10px] tracking-[0.14em] uppercase text-[#777777]">
                  <span>48H ESCROW CUSTODY</span>
                  <span className="text-[#10B981] font-semibold">INCLUDED IN FULL</span>
                </div>
              </div>

              {/* 2. DUAL COLLECTOR CONDITION LEDGER */}
              <div className="space-y-2 mb-6">
                <span className="font-sans text-[10px] tracking-[0.18em] text-[#777777] uppercase font-semibold block mb-2">
                  DUAL COLLECTOR CONDITION LEDGER
                </span>

                <div className="border border-[#1F1F1F] bg-[#0C0C0C] divide-y divide-[#161616] font-sans text-[11px]">
                  {/* Ledger Row 1: Figure Grade */}
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-[#777777] uppercase tracking-[0.12em]">FIGURE GRADE:</span>
                    <span className="text-[#F2EFE9] font-medium tracking-wide">
                      {product.figureGrade || 'MISB (FACTORY SEALED)'}
                    </span>
                  </div>

                  {/* Ledger Row 2: Packaging & Blister */}
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-[#777777] uppercase tracking-[0.12em]">PACKAGING GRADE:</span>
                    <span className="text-[#F2EFE9] font-medium tracking-wide">
                      {product.boxCondition || 'MINT BOX (BLISTER INTACT)'}
                    </span>
                  </div>

                  {/* Ledger Row 3: Provenance & Indian Custody */}
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-[#777777] uppercase tracking-[0.12em]">CUSTODY LOCATION:</span>
                    <span className="text-[#F2EFE9] font-medium tracking-wide">
                      {product.indianLocation || 'MUMBAI, MH'} • {product.ownerCount || '1ST OWNER'}
                    </span>
                  </div>

                  {/* Ledger Row 4: Verified Seller Handle */}
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-[#777777] uppercase tracking-[0.12em]">CONSIGNING SELLER:</span>
                    <span className="text-[#10B981] font-semibold tracking-wider">
                      {product.sellerHandle || '@verified_collector'}
                    </span>
                  </div>

                  {/* Ledger Row 5: Dispatch SLA */}
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-[#777777] uppercase tracking-[0.12em]">DISPATCH PROTOCOL:</span>
                    <span className="text-[#E5E5E5] font-medium tracking-wide">
                      {product.dispatchSla || '48H INSURED BLUEDART/DELHIVERY'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. INTERACTIVE ESCROW BARGAINING & ACQUISITION PANEL */}
              <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-[#161616] pb-3">
                  <span className="font-sans text-[10px] tracking-[0.18em] text-[#777777] uppercase font-semibold">
                    ESCROW ACQUISITION &amp; BARGAINING
                  </span>
                  <span className="font-sans text-[10px] tracking-[0.14em] text-[#10B981] uppercase font-semibold">
                    24H BINDING OFFERS
                  </span>
                </div>

                {/* Direct Acquisition Button */}
                <button
                  type="button"
                  onClick={handleAcquireDirect}
                  disabled={isAddingDirect}
                  className="w-full py-3.5 bg-[#F2EFE9] hover:bg-white text-[#080808] border border-[#F2EFE9] font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors cursor-pointer rounded-none"
                >
                  {isAddingDirect
                    ? '[ LOCKING ESCROW CUSTODY... ]'
                    : `[ ACQUIRE AT ASKING — ₹${product.price.toLocaleString('en-IN')} ]`}
                </button>

                {/* Make Escrow Offer Section */}
                <form onSubmit={handleSubmitOffer} className="space-y-3 pt-2 border-t border-[#161616]">
                  <div className="flex justify-between items-center text-[10px] font-sans uppercase tracking-[0.14em] text-[#888888]">
                    <span>MAKE REAL-TIME ESCROW OFFER (₹ INR)</span>
                    <span className="text-[#777777]">QUICK PRESETS:</span>
                  </div>

                  {/* Percentage Presets */}
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 15].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => applyDiscountPreset(pct)}
                        className="py-1.5 border border-[#1F1F1F] bg-[#080808] hover:border-[#F2EFE9] text-[#CCCCCC] hover:text-white font-sans text-[10px] uppercase tracking-[0.14em] transition-colors cursor-pointer rounded-none"
                      >
                        [ -{pct}% (₹{Math.round(product.price * (1 - pct / 100)).toLocaleString('en-IN')}) ]
                      </button>
                    ))}
                  </div>

                  {/* Offer Input & Submit */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#777777] font-sans">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={Math.round(product.price * 0.7)}
                        max={product.price}
                        value={offerInput}
                        onChange={(e) => setOfferInput(e.target.value)}
                        placeholder={`Offer (min ₹${Math.round(product.price * 0.7).toLocaleString('en-IN')})`}
                        className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] pl-7 pr-3 py-2.5 text-xs text-[#F2EFE9] placeholder-[#555555] font-sans outline-none rounded-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!offerInput}
                      className="px-4 py-2.5 border border-[#1F1F1F] bg-[#080808] hover:bg-[#F2EFE9] hover:text-[#080808] hover:border-[#F2EFE9] disabled:opacity-40 disabled:hover:bg-[#080808] disabled:hover:text-[#777777] disabled:hover:border-[#1F1F1F] text-[#F2EFE9] font-sans text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer rounded-none"
                    >
                      [ SUBMIT 24H ESCROW OFFER ]
                    </button>
                  </div>

                  {isOfferSubmitted && (
                    <div className="p-3 bg-[#091812] border border-[#193829] font-sans text-[10px] text-[#10B981] uppercase tracking-[0.12em] text-center font-semibold">
                      [ 24H ESCROW OFFER RECORDED // OPENING COLLECTOR CART ]
                    </div>
                  )}
                </form>

                {/* Collection Bundle Option */}
                {product.bundleItems && product.bundleItems.length > 0 && (
                  <div className="pt-2 border-t border-[#161616]">
                    <button
                      type="button"
                      onClick={() => setShowBundleModal(!showBundleModal)}
                      className="w-full py-2.5 border border-[#1F1F1F] bg-[#080808] hover:border-[#F2EFE9] text-[#888888] hover:text-[#F2EFE9] font-sans text-[10px] uppercase tracking-[0.14em] transition-colors cursor-pointer rounded-none text-center"
                    >
                      [ VIEW SELLER&apos;S FULL VAULT BUNDLE (SAVE 12%) ]
                    </button>

                    {showBundleModal && (
                      <div className="mt-3 p-3 bg-[#080808] border border-[#1F1F1F] space-y-2 font-sans text-[11px]">
                        <span className="text-[10px] tracking-[0.14em] text-[#777777] uppercase block font-semibold">
                          CONSIGNMENT SHELF BUNDLE:
                        </span>
                        {product.bundleItems.map((b, i) => (
                          <div key={i} className="flex justify-between text-[#8E8E8E]">
                            <span>{b.title}</span>
                            <span className="text-[#F2EFE9]">₹{b.price.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-[#161616] flex justify-between text-[#10B981] font-semibold text-[10px] tracking-wider uppercase">
                          <span>COMBINED BUNDLE DISCOUNT:</span>
                          <span>12% OFF ESCROW TOTAL</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structural Archival Footer */}
      <ArchivalFooter />
    </div>
  );
}
