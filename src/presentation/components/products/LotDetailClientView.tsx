'use client';

/**
 * @file src/presentation/components/products/LotDetailClientView.tsx
 *
 * Dedicated Client View for Product / Lot Inspection & Bargaining:
 * - 5-Slot Authenticity Macro Gallery with 2.8X Jeweler Optical Loupe.
 * - Dual Collector Condition Ledger with Seller Profile & Rating Placeholder.
 * - Fixed "Shrinkwrap Intact" wording for Books/Manga (Task 4).
 * - Interactive Shipping Estimate + 6-Digit Pincode Check Placeholder (Task 4).
 * - Interactive Escrow Bargaining & Cart Drawer Integration.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MockProduct, MacroSlotItem } from '@/lib/mockProducts';
import { addToCart } from '@/app/actions/dealActions';
import { openCartDrawer } from '@/presentation/components/cart/CartDrawer';
import { showVaultCartToast } from '@/presentation/components/cart/VaultCartToast';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';
import { SellerBadgeGroup } from '@/presentation/components/badges/SellerBadgeGroup';
import { NegotiationModal } from '@/presentation/components/negotiation/NegotiationModal';

interface LotDetailClientViewProps {
  product: MockProduct;
}

export function LotDetailClientView({ product }: LotDetailClientViewProps): React.JSX.Element {
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [zoomCoords, setZoomCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Bargaining Offer State
  const [offerInput, setOfferInput] = useState<string>('');
  const [isOfferSubmitted, setIsOfferSubmitted] = useState<boolean>(false);
  const [isAddingDirect, setIsAddingDirect] = useState<boolean>(false);
  const [showBundleModal, setShowBundleModal] = useState<boolean>(false);
  const [isNegotiationOpen, setIsNegotiationOpen] = useState<boolean>(false);

  // Pincode Shipping Estimate State (Task 4)
  const [pincodeInput, setPincodeInput] = useState<string>('');
  const [shippingEstimate, setShippingEstimate] = useState<string | null>(null);

  const handleCheckPincode = () => {
    if (!pincodeInput || pincodeInput.length !== 6) {
      setShippingEstimate('Please enter a valid 6-digit Indian pincode.');
      return;
    }
    const metroPrefixes = ['11', '40', '56', '70', '60', '50'];
    const isMetro = metroPrefixes.some((p) => pincodeInput.startsWith(p));
    if (isMetro) {
      setShippingEstimate('✓ Metro Express: Estimated 2–3 business days via BlueDart Air');
    } else {
      setShippingEstimate('✓ Standard Delivery: Estimated 4–6 business days via Delhivery Express');
    }
  };

  // Fixed Packaging Condition wording for Books/Manga (Task 4)
  const displayBoxCondition = useMemo(() => {
    const isBook =
      product.category === 'Manga Sets' ||
      product.category.toLowerCase().includes('manga') ||
      product.title.toLowerCase().includes('manga') ||
      product.title.toLowerCase().includes('vol');
    if (isBook) {
      return 'FACTORY SHRINKWRAP SEALED';
    }
    return product.boxCondition || 'MINT BOX (BLISTER INTACT)';
  }, [product]);

  // Construct standard 5-slot macro items (Main + 4 verification slots)
  const macroSlots: MacroSlotItem[] = useMemo(() => {
    if (product.macroSlots && product.macroSlots.length >= 4) {
      return [
        {
          slot: 'Main Photo',
          title: 'Full Collectible Elevation',
          src: product.imageUrl,
          description: 'Full elevation studio portrait of authenticated figure.',
        },
        ...product.macroSlots,
      ];
    }
    return [
      {
        slot: 'Main Photo',
        title: 'Full Collectible Elevation',
        src: product.imageUrl,
        description: 'Full elevation studio portrait of authenticated figure.',
      },
      {
        slot: 'Sculpt Detail',
        title: 'Studio Sculpt Macro',
        src: product.imageUrl,
        description: 'High magnification surface sculpt inspection and joint tolerances.',
      },
      {
        slot: 'Authenticity Hologram',
        title: 'Hologram Sticker Macro',
        src: '/showcase/bay3_clean.png',
        description: 'Tamper-evident holographic authenticity seal with sequential serial.',
      },
      {
        slot: 'Copyright Stamp',
        title: 'Base Copyright Stamp',
        src: '/showcase/bay1_clean.png',
        description: 'Debossed factory copyright stamp verification.',
      },
      {
        slot: 'Timestamp Proof',
        title: 'Handwritten Timestamp',
        src: '/showcase/bay2_clean.png',
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
    setZoomCoords({ x, y });
  };

  const handlePresetOffer = (discountPercent: number) => {
    const discounted = Math.round(product.price * (1 - discountPercent / 100));
    setOfferInput(String(discounted));
  };

  const handleDirectAcquisition = async () => {
    setIsAddingDirect(true);
    try {
      await addToCart(product.id);
      showVaultCartToast({
        lotNumber: product.lotNumber,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
      });
      openCartDrawer();
    } catch {
      window.location.href = `/checkout?lotId=${product.id}&amount=${product.price}`;
    } finally {
      setIsAddingDirect(false);
    }
  };

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerInput || isNaN(Number(offerInput))) return;
    setIsOfferSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F2EFE9] select-none py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1F1F1F] pb-4 gap-2 text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-none no-underline text-[#777777]">
              Marketplace
            </Link>
            <span>/</span>
            <Link href="/#stage-2" className="hover:text-white transition-none no-underline text-[#777777]">
              Catalog
            </Link>
            <span>/</span>
            <span className="text-[#F2EFE9]">LOT #{product.lotNumber}</span>
          </div>

          <div className="flex items-center gap-2 border border-[#193829] bg-[#091812] px-3 py-1">
            <span className="w-1.5 h-1.5 bg-[#10B981] inline-block" />
            <span className="text-[#10B981]">48-HOUR UNBOXING ESCROW VERIFIED</span>
          </div>
        </div>

        {/* Main 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): 5-Slot Authenticity Macro Gallery */}
          <div className="lg:col-span-7">
            <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-4 sm:p-6">
              {/* Primary 4:5 Studio Portrait Well with 2.8X Jeweler Optical Loupe */}
              <div className="relative w-full aspect-[4/5] bg-[#080808] border border-[#161616] overflow-hidden flex items-center justify-center">
                <div
                  className="w-full h-full relative cursor-crosshair select-none"
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleMouseMoveZoom}
                  onClick={() => setIsZoomed(!isZoomed)}
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
                        (e.currentTarget as HTMLImageElement).src = '/otakubazaar-logo.png';
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
                      : '[ HOVER/CLICK TO ACTIVATE 2.8X OPTICAL LOUPE ]'}
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
                              (e.currentTarget as HTMLImageElement).src = '/otakubazaar-logo.png';
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
                INSPECTION TELEMETRY • {activeMedia.slot}
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
              {/* Header Row: Lot ID & Origin */}
              <div className="flex items-center justify-between text-[10px] font-sans uppercase tracking-[0.15em] text-[#777777] mb-2 font-semibold">
                <span>LOT #{product.lotNumber} • {product.origin || 'IN-HAND VERIFIED'}</span>
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
                  OFFICIAL ASKING PRICE
                </span>
                <div className="font-serif text-[32px] text-[#F2EFE9] tracking-wider leading-none">
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
                <div className="mt-3 pt-3 border-t border-[#161616] flex justify-between items-center font-sans text-[10px] tracking-[0.14em] uppercase text-[#777777]">
                  <span>48H UNBOXING ESCROW</span>
                  <span className="text-[#10B981] font-semibold">ZERO BUYER FEE</span>
                </div>
              </div>

              {/* Shipping Estimate & Pincode Check (Task 4) */}
              <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] tracking-[0.18em] text-[#777777] uppercase font-semibold">
                    PAN-INDIA SHIPPING CHECK
                  </span>
                  <span className="text-[9px] text-[#10B981] font-semibold uppercase">
                    TRACKED COURIER
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-Digit Delivery Pincode"
                    className="flex-1 bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3 py-2 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleCheckPincode}
                    className="px-4 py-2 bg-[#F2EFE9] hover:bg-[#EAE6DF] text-[#080808] border border-[#F2EFE9] text-[10px] uppercase font-semibold tracking-wider cursor-pointer transition-none rounded-none"
                  >
                    [ CHECK PINCODE ]
                  </button>
                </div>
                {shippingEstimate && (
                  <div className="mt-3 pt-2 border-t border-[#161616] flex justify-between items-center text-[11px] text-[#10B981]">
                    <span>{shippingEstimate}</span>
                    <span className="text-[10px] text-[#888888] uppercase">PAN-INDIA</span>
                  </div>
                )}
              </div>

              {/* 2. DUAL COLLECTOR CONDITION LEDGER */}
              <div className="space-y-2 mb-6">
                <span className="font-sans text-[10px] tracking-[0.18em] text-[#777777] uppercase font-semibold block mb-2">
                  COLLECTOR CONDITION LEDGER
                </span>

                <div className="border border-[#1F1F1F] bg-[#0C0C0C] divide-y divide-[#161616] font-sans text-[11px]">
                  {/* Ledger Row 1: Figure Grade */}
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-[#9CA3AF] uppercase tracking-wider text-[10px]">Condition:</span>
                    <span className="text-[#F2EFE9] font-medium tracking-wide">
                      {product.figureGrade || 'New, sealed box'}
                    </span>
                  </div>

                  {/* Ledger Row 2: Packaging Grade (Fixed for Books/Manga) */}
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-[#9CA3AF] uppercase tracking-wider text-[10px]">Packaging:</span>
                    <span className="text-[#F2EFE9] font-medium tracking-wide">
                      {displayBoxCondition}
                    </span>
                  </div>

                  {/* Ledger Row 3: MFC Archival Record (if linked) */}
                  {product.mfcItemId && (
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-[#9CA3AF] uppercase tracking-wider text-[10px]">MFC Record:</span>
                      <a
                        href={product.mfcUrl || `https://myfigurecollection.net/item/${product.mfcItemId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#38BDF8]/40 bg-[#061118] text-[#38BDF8] hover:border-[#38BDF8] text-[10px] uppercase tracking-wider font-semibold no-underline"
                      >
                        <span>MFC #{product.mfcItemId} ↗</span>
                      </a>
                    </div>
                  )}

                  {/* Ledger Row 4: Original Japanese price (if available) */}
                  {product.originalPriceJPY && (
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-[#9CA3AF] uppercase tracking-wider text-[10px]">Original Japanese Price:</span>
                      <span className="text-[#E5E5E5] font-mono text-[11px]">
                        ¥{product.originalPriceJPY.toLocaleString('ja-JP')} <span className="text-[#A1A1AA] text-[9px]">(reference only)</span>
                      </span>
                    </div>
                  )}

                  {/* Ledger Row 5: Seller Profile Link & Real Reputation Badges */}
                  <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[#777777] uppercase tracking-[0.12em]">CONSIGNING SELLER:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href="/profile"
                        className="text-[#F2EFE9] hover:underline font-mono text-[11px] no-underline"
                      >
                        {product.sellerHandle}
                      </Link>
                      <SellerBadgeGroup
                        badges={product.sellerBadges as any}
                        isNewSeller={product.isNewSeller}
                      />
                    </div>
                  </div>

                  {/* Ledger Row 6: Indian City Dispatch */}
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-[#777777] uppercase tracking-[0.12em]">CUSTODY LOCATION:</span>
                    <span className="text-[#F2EFE9] font-medium tracking-wide">
                      {product.indianLocation || 'MUMBAI, MH'}
                    </span>
                  </div>

                  {/* Ledger Row 7: Owner Count */}
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-[#777777] uppercase tracking-[0.12em]">PROVENANCE:</span>
                    <span className="text-[#F2EFE9] font-medium tracking-wide">
                      {product.ownerCount || '1ST OWNER (OFFICIAL IMPORT)'}
                    </span>
                  </div>

                  {/* Ledger Row 8: Dispatch SLA */}
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-[#777777] uppercase tracking-[0.12em]">DISPATCH SLA:</span>
                    <span className="text-[#10B981] font-semibold tracking-wide">
                      {product.dispatchSla || '48H TRACKED EXPRESS COURIER'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. INTERACTIVE ESCROW BARGAINING & ACQUISITION PANEL */}
              <div className="space-y-4">
                {/* Direct Acquisition Button */}
                <button
                  type="button"
                  disabled={isAddingDirect}
                  onClick={handleDirectAcquisition}
                  className="w-full py-4 bg-[#F2EFE9] hover:bg-[#EAE6DF] text-[#080808] border border-[#F2EFE9] font-sans font-semibold text-[12px] uppercase tracking-wider transition-none cursor-pointer rounded-none disabled:opacity-50"
                >
                  {isAddingDirect
                    ? 'Adding to cart...'
                    : `Buy Now — ₹${product.price.toLocaleString('en-IN')}`}
                </button>

                {/* Real-Time Bargain Section */}
                <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-4 space-y-3 font-sans">
                  <div className="flex items-center justify-between text-[10px] tracking-wider uppercase">
                    <span className="text-[#CCCCCC] font-semibold">
                      Make an Offer (Safe Escrow)
                    </span>
                    <span className="text-[#9CA3AF]">
                      Floor: ₹{Math.round(product.price * 0.7).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                    We hold your payment until you check your order. Make an offer to negotiate directly with the seller in real time.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={offerInput}
                      onChange={(e) => setOfferInput(e.target.value)}
                      placeholder={`Offer in ₹ (e.g. ${Math.round(product.price * 0.85)})`}
                      className="flex-1 bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3 py-2 text-xs text-[#F2EFE9] placeholder-[#71717A] outline-none rounded-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setIsNegotiationOpen(true)}
                      className="px-4 py-2 bg-[#F2EFE9] hover:bg-white text-[#080808] text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer rounded-none"
                    >
                      Make Offer
                    </button>
                  </div>
                </div>

                {/* Collection Bundle Option */}
                {product.bundleItems && product.bundleItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowBundleModal(true)}
                    className="w-full py-2.5 bg-[#0C0C0C] hover:bg-[#141414] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#1F1F1F] text-[10px] uppercase tracking-wider font-semibold transition-none cursor-pointer rounded-none"
                  >
                    View Seller Bundle (Save 12%)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Bargain (Counter-Offer) Terminal Modal */}
      <NegotiationModal
        listingId={product.id}
        askingPriceINR={product.price}
        productTitle={product.title}
        isOpen={isNegotiationOpen}
        onClose={() => setIsNegotiationOpen(false)}
      />

      <div className="mt-20">
        <ArchivalFooter />
      </div>
    </div>
  );
}
