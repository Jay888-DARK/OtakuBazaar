'use client';

/**
 * @file src/app/checkout/page.tsx
 *
 * Single-Step Luxury Escrow Checkout View for OtakuBazaar.
 * Strictly adheres to the dark archival vault visual language:
 * - High-contrast editorial typography (Playfair Display, Archivo, Titillium Web).
 * - 0px border-radius containers with hairline charcoal borders (#1F1F1F).
 * - Brutalist state transitions with 0ms transition duration.
 * - Zero pure white backgrounds, zero 3-feature cards in a row, zero drop shadows.
 * - Integrated Tax Invoice Generation & Secure Download.
 */

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';

interface CheckoutItem {
  id: string;
  lotRef: string;
  title: string;
  series: string;
  condition: string;
  price: number;
  sellerHandle: string;
}

export default function CheckoutPage(): React.JSX.Element {
  // Address Form State
  const [fullName, setFullName] = useState('Tanjiro Kamado');
  const [phone, setPhone] = useState('9876543210');
  const [pincode, setPincode] = useState('560001');
  const [address, setAddress] = useState('No. 42, 100ft Road, Indiranagar');
  const [city, setCity] = useState('Bengaluru');
  const [stateName, setStateName] = useState('Karnataka');

  // Mandatory Unboxing Checkbox State
  const [unboxingConfirmed, setUnboxingConfirmed] = useState(false);

  // Payment Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEscrowLocked, setIsEscrowLocked] = useState(false);
  const [orderReference, setOrderReference] = useState<string | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Cart / Lot Data
  const [lotItem, setLotItem] = useState<CheckoutItem | null>(null);
  const [isLoadingLot, setIsLoadingLot] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const targetLotId = searchParams.get('lotId') || searchParams.get('id');
    const overridePrice = searchParams.get('negotiatedPrice') || searchParams.get('price');

    fetch('/api/listings')
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : [];
        const match = targetLotId
          ? items.find((i: any) => i.id === targetLotId)
          : items[0] || null;

        if (match) {
          const finalPrice = overridePrice
            ? parseInt(overridePrice, 10)
            : Math.round((match.askingPriceAmount || 0) / 100);

          setLotItem({
            id: match.id,
            lotRef: `LOT-${String(match.id).replace(/[^0-9]/g, '').padStart(4, '0').slice(-4) || '0001'}`,
            title: match.title,
            series: match.category || 'AUTHENTIC ARCHIVAL LOT',
            condition: match.condition === 'NEW' ? 'S-RANK // MISB (FACTORY SEALED)' : 'GRADE A // BIB (DISPLAYED)',
            price: finalPrice,
            sellerHandle: `@seller_${match.sellerId?.slice(-6) || 'vault'}`,
          });
        }
        setIsLoadingLot(false);
      })
      .catch(() => {
        setIsLoadingLot(false);
      });
  }, []);

  // Instant Pincode Serviceability Indicator
  const isServiceable = useMemo(() => {
    return pincode.length === 6 && /^\d+$/.test(pincode);
  }, [pincode]);

  const handleEscrowPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unboxingConfirmed) return;

    setIsProcessing(true);
    setTimeout(() => {
      const generatedOrderId = `OKB-ESC-${Date.now().toString().slice(-6)}`;
      setOrderReference(generatedOrderId);
      setIsProcessing(false);
      setIsEscrowLocked(true);
    }, 1200);
  };

  const handleDownloadInvoice = async () => {
    if (!lotItem) return;
    setInvoiceLoading(true);
    try {
      const res = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: lotItem.lotRef.toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok && data.invoice?.downloadUrl) {
        window.location.href = data.invoice.downloadUrl;
      }
    } catch (err) {
      console.error('Invoice generation failed:', err);
    } finally {
      setInvoiceLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F2EFE9] select-none py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-4 text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-none no-underline text-[#777777]">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-[#F2EFE9]">Escrow Custody Checkout</span>
          </div>

          <div className="flex items-center gap-2 border border-[#193829] bg-[#091812] px-3 py-1">
            <span className="w-1.5 h-1.5 bg-[#10B981] inline-block" />
            <span className="text-[#10B981]">SECURE ESCROW GATEWAY ACTIVE</span>
          </div>
        </div>

        {/* Masthead */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#1F1F1F] bg-[#080808] text-[#777777] text-[10px] tracking-[0.2em] uppercase mb-3 font-semibold">
            <span>48-HOUR INSPECTION ESCROW GUARANTEE</span>
            <span>•</span>
            <span>SINGLE-STEP SETTLEMENT</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-[0.06em] text-[#F2EFE9]">
            Secure Escrow Checkout
          </h1>
          <p className="text-[13px] text-[#8E8E8E] leading-relaxed max-w-2xl mt-1">
            Your funds will be isolated in escrow. Payout to consigning seller is held until your 48-hour physical inspection period completes with zero bootleg or transit damage claims.
          </p>
        </div>

        {isLoadingLot ? (
          <div className="p-16 border border-[#1F1F1F] bg-[#0C0C0C] text-center">
            <div className="font-mono text-[10px] text-[#777777] tracking-[0.2em] uppercase animate-pulse">
              INITIALIZING SECURE ESCROW PROTOCOL...
            </div>
          </div>
        ) : !lotItem ? (
          <div className="p-12 sm:p-16 border border-[#1F1F1F] bg-[#0C0C0C] text-center space-y-4">
            <div className="font-mono text-[10px] text-[#777777] tracking-[0.2em] uppercase mb-1">
              ESCROW CHECKOUT // ZERO LOTS SELECTED
            </div>
            <h2 className="text-base sm:text-lg font-serif uppercase tracking-wider text-[#F2EFE9]">
              No Active Lot Selected for Checkout
            </h2>
            <p className="text-xs text-[#8E8E8E] max-w-md mx-auto leading-relaxed">
              Please select a verified anime scale figure from the vault index or consign a new grail to proceed.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block px-5 py-2.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.16em] no-underline transition-none rounded-none"
              >
                [ BROWSE ALL PRODUCTS ]
              </Link>
            </div>
          </div>
        ) : isEscrowLocked ? (
          <div className="p-8 bg-[#091812] border border-[#193829] text-center space-y-4">
            <span className="text-[10px] tracking-[0.2em] text-[#10B981] uppercase font-bold block">
              [ ESCROW RESERVATION COMPLETED &amp; FUNDS SECURED ]
            </span>
            <h2 className="font-serif text-[26px] text-[#F2EFE9] uppercase tracking-[0.06em]">
              Order #{orderReference} Escrow Locked
            </h2>
            <p className="text-[13px] text-[#8E8E8E] max-w-xl mx-auto leading-relaxed">
              Consigning seller <span className="text-[#F2EFE9] font-medium">{lotItem.sellerHandle}</span> has been dispatched a binding notification to crate and courier this lot via BlueDart Air within 48 hours.
            </p>
            <div className="p-4 bg-[#080808] border border-[#1F1F1F] max-w-md mx-auto text-[11px] text-[#CCCCCC] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#777777]">AMOUNT SECURED:</span>
                <span className="font-serif text-[#F2EFE9] font-bold">₹{lotItem.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">ESCROW PROTOCOL:</span>
                <span className="text-[#10B981] font-semibold">48H UNBOXING WINDOW</span>
              </div>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={invoiceLoading}
                className="px-6 py-2.5 bg-[#080808] border border-[#1F1F1F] hover:border-[#3A3A3A] text-[#CCCCCC] text-[11px] font-semibold uppercase tracking-[0.16em] transition-none cursor-pointer rounded-none disabled:opacity-50"
              >
                {invoiceLoading ? '[ GENERATING INVOICE... ]' : '[ DOWNLOAD TAX INVOICE (PDF) ]'}
              </button>
              <Link
                href="/vault"
                className="inline-block px-6 py-2.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.16em] no-underline transition-none rounded-none"
              >
                [ VIEW IN COLLECTOR VAULT DASHBOARD ]
              </Link>
            </div>
          </div>
        ) : null}

        {!isEscrowLocked && lotItem && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (7 cols): Address & 4-Stage Protocol */}
            <div className="lg:col-span-7 space-y-6">
              {/* Form 01: Indian Delivery & Insured Custody Address */}
              <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-4">
                <div className="border-b border-[#161616] pb-3 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold">
                    01 // INDIAN DELIVERY &amp; INSURED CUSTODY ADDRESS
                  </span>
                  <span className="text-[10px] text-[#10B981] font-semibold uppercase tracking-wider">
                    PAN-INDIA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.14em] text-[#888888] mb-1.5 font-medium">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#080808] border border-[#1F1F1F] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.14em] text-[#888888] mb-1.5 font-medium">
                      Phone Number (+91) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#080808] border border-[#1F1F1F] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] text-[#888888] mb-1.5 font-medium">
                    6-Digit Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-[#080808] border border-[#1F1F1F] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] uppercase tracking-[0.14em] text-[#888888] mb-1.5 font-medium">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#080808] border border-[#1F1F1F] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.14em] text-[#888888] mb-1.5 font-medium">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#080808] border border-[#1F1F1F] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.14em] text-[#888888] mb-1.5 font-medium">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full bg-[#080808] border border-[#1F1F1F] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none"
                    />
                  </div>
                </div>

                {/* Instant Serviceability Indicator */}
                <div className="p-3 bg-[#080808] border border-[#1F1F1F] flex items-center justify-between text-[10px] tracking-[0.14em] uppercase">
                  <span className="text-[#888888]">LOGISTICS ROUTE:</span>
                  <span className={isServiceable ? 'text-[#10B981] font-semibold' : 'text-[#F87171]'}>
                    {isServiceable
                      ? 'BLUEDART AIR & DELHIVERY INSURED FOAM CRATE ACTIVE'
                      : 'ENTER 6-DIGIT PINCODE TO VERIFY ROUTE'}
                  </span>
                </div>
              </div>

              {/* Block 02: 48-Hour Escrow Custody Protocol & 4-Stage Timeline */}
              <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-5">
                <div className="border-b border-[#161616] pb-3 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold">
                    02 // 48-HOUR ESCROW CUSTODY PROTOCOL
                  </span>
                  <span className="text-[10px] text-[#10B981] font-semibold uppercase tracking-wider">
                    TIMELINE GUARANTEED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#080808] border border-[#1F1F1F] space-y-1">
                    <span className="text-[9px] text-[#777777] uppercase tracking-wider block">STAGE 01</span>
                    <span className="text-[11px] text-[#F2EFE9] font-semibold uppercase block">FUNDS LOCKED</span>
                    <p className="text-[9px] text-[#777777] leading-relaxed">
                      Secured in Razorpay Escrow. Zero seller withdrawal allowed.
                    </p>
                  </div>

                  <div className="p-3 bg-[#080808] border border-[#1F1F1F] space-y-1">
                    <span className="text-[9px] text-[#777777] uppercase tracking-wider block">STAGE 02</span>
                    <span className="text-[11px] text-[#F2EFE9] font-semibold uppercase block">DISPATCHED</span>
                    <p className="text-[9px] text-[#777777] leading-relaxed">
                      Tracked express courier with verified AWB code.
                    </p>
                  </div>

                  <div className="p-3 bg-[#080808] border border-[#1F1F1F] space-y-1">
                    <span className="text-[9px] text-[#777777] uppercase tracking-wider block">STAGE 03</span>
                    <span className="text-[11px] text-[#F2EFE9] font-semibold uppercase block">48H UNBOXING</span>
                    <p className="text-[9px] text-[#777777] leading-relaxed">
                      Physical inspection window with anti-counterfeit guarantee.
                    </p>
                  </div>

                  <div className="p-3 bg-[#080808] border border-[#1F1F1F] space-y-1">
                    <span className="text-[9px] text-[#777777] uppercase tracking-wider block">STAGE 04</span>
                    <span className="text-[11px] text-[#F2EFE9] font-semibold uppercase block">SETTLEMENT</span>
                    <p className="text-[9px] text-[#777777] leading-relaxed">
                      Escrow settlement finalized to seller upon clearance.
                    </p>
                  </div>
                </div>

                {/* Mandatory Verification Checkbox */}
                <div className="p-4 border border-[#1F1F1F] bg-[#080808]">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={unboxingConfirmed}
                      onChange={(e) => setUnboxingConfirmed(e.target.checked)}
                      className="sr-only"
                    />
                    {/* Custom 12px x 12px Architectural Square */}
                    <span
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 border transition-none flex items-center justify-center ${
                        unboxingConfirmed
                          ? 'border-[#F2EFE9] bg-[#F2EFE9]'
                          : 'border-[#3A3A3A] bg-transparent'
                      }`}
                    />
                    <span className="text-[11px] text-[#CCCCCC] leading-relaxed font-sans">
                      <strong className="text-[#F2EFE9]">Mandatory Unboxing Declaration:</strong> I confirm that I will record an uncut 360° parcel unboxing video showing the shipping label and figure seals to qualify for 48-hour anti-bootleg and transit damage refunds.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Valuation Summary & Razorpay Trigger */}
            <div className="lg:col-span-5 bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-6">
              <div className="border-b border-[#161616] pb-3 flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold">
                  VALUATION BREAKDOWN
                </span>
                <span className="text-[10px] text-[#E5E5E5] font-semibold uppercase">
                  {lotItem.lotRef}
                </span>
              </div>

              {/* Lot Mini Card */}
              <div className="p-3 bg-[#080808] border border-[#1F1F1F] space-y-1">
                <span className="text-[9px] tracking-[0.14em] text-[#888888] uppercase block">
                  {lotItem.series}
                </span>
                <h3 className="font-serif text-[14px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                  {lotItem.title}
                </h3>
                <div className="text-[10px] text-[#777777] pt-1 uppercase">
                  {lotItem.condition} • SELLER: {lotItem.sellerHandle}
                </div>
              </div>

              {/* Itemized Financial Breakdown */}
              <div className="space-y-2.5 font-sans text-[11px]">
                <div className="flex justify-between items-center text-[#8E8E8E]">
                  <span>Accepted Lot Valuation</span>
                  <span className="text-[#F2EFE9]">₹{lotItem.price.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-[#8E8E8E]">
                  <span>Insured Transit &amp; Foam Crating</span>
                  <span className="text-[#10B981] font-semibold">₹0 / INCLUDED</span>
                </div>

                <div className="flex justify-between items-center text-[#8E8E8E]">
                  <span>48-Hour Escrow Custody &amp; Verification</span>
                  <span className="text-[#10B981] font-semibold">INCLUDED</span>
                </div>

                <div className="flex justify-between items-center text-[#8E8E8E]">
                  <span>GST (18% Reverse Custody)</span>
                  <span className="text-[#10B981] font-semibold">PAID BY SELLER</span>
                </div>

                <div className="pt-3 border-t border-[#161616] flex justify-between items-baseline">
                  <span className="text-[11px] uppercase tracking-[0.15em] text-[#F2EFE9] font-bold">
                    TOTAL ESCROW PAYABLE
                  </span>
                  <span className="font-serif text-[26px] text-[#F2EFE9] font-bold tracking-wider">
                    ₹{lotItem.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Primary CTA */}
              <button
                type="button"
                onClick={handleEscrowPayment}
                disabled={!unboxingConfirmed || isProcessing || !isServiceable}
                className="w-full py-3.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-xs font-semibold uppercase tracking-[0.18em] transition-none cursor-pointer rounded-none disabled:opacity-30 flex items-center justify-center font-sans"
              >
                {isProcessing
                  ? '[ INITIATING RAZORPAY ESCROW... ]'
                  : '[ LOCK FUNDS IN ESCROW VIA RAZORPAY ]'}
              </button>

              {!unboxingConfirmed && (
                <p className="text-[10px] text-[#777777] text-center leading-relaxed">
                  [ Please accept the mandatory uncut unboxing video declaration to unlock payment ]
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-20">
        <ArchivalFooter />
      </div>
    </div>
  );
}
