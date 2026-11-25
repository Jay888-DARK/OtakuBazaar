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

  // Instant Indian Mobile & Pincode Validation
  const isPincodeValid = useMemo(() => {
    return /^[1-9]\d{5}$/.test(pincode.trim());
  }, [pincode]);

  const isPhoneValid = useMemo(() => {
    return /^(?:\+91|0)?[6-9]\d{9}$/.test(phone.trim().replace(/[\s-]/g, ''));
  }, [phone]);

  const isFormValid = isPincodeValid && isPhoneValid && fullName.trim().length > 0 && address.trim().length > 0 && city.trim().length > 0;

  const [orderTimestampIST, setOrderTimestampIST] = useState<string>('');

  const handleEscrowPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unboxingConfirmed || !isFormValid) return;

    setIsProcessing(true);
    setTimeout(() => {
      const generatedOrderId = `OKB-ESC-${Date.now().toString().slice(-6)}`;
      const nowIST = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date());

      setOrderReference(generatedOrderId);
      setOrderTimestampIST(nowIST);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#1F1F1F] bg-[#080808] text-[#9CA3AF] text-[10px] tracking-wider uppercase mb-3 font-semibold">
            <span>48-Hour Inspection Guarantee</span>
            <span>•</span>
            <span className="text-[#10B981]">Safe Escrow</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-[0.06em] text-[#F2EFE9]">
            Secure Escrow Checkout
          </h1>
          <p className="text-[13px] text-[#A1A1AA] leading-relaxed max-w-2xl mt-1">
            We hold your payment until you check your order. The seller receives payout only after your 48-hour physical inspection period completes with zero transit damage or authenticity issues.
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-[#9CA3AF]">
            <span className="w-1.5 h-1.5 bg-[#10B981] inline-block" />
            <span>We currently deliver only within India. All prices are in ₹ (INR).</span>
          </div>
        </div>

        {isLoadingLot ? (
          <div className="p-16 border border-[#1F1F1F] bg-[#0C0C0C] text-center">
            <div className="font-mono text-[10px] text-[#9CA3AF] tracking-wider uppercase animate-pulse">
              Loading item details...
            </div>
          </div>
        ) : !lotItem ? (
          <div className="p-12 sm:p-16 border border-[#1F1F1F] bg-[#0C0C0C] text-center space-y-4">
            <h2 className="text-base sm:text-lg font-serif uppercase tracking-wider text-[#F2EFE9]">
              No Item Selected for Checkout
            </h2>
            <p className="text-xs text-[#A1A1AA] max-w-md mx-auto leading-relaxed">
              Please select a collectible from the catalog to proceed with checkout.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block px-5 py-2.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-wider no-underline transition-none rounded-none"
              >
                Browse All Items
              </Link>
            </div>
          </div>
        ) : isEscrowLocked ? (
          <div className="p-8 bg-[#091812] border border-[#193829] text-center space-y-4">
            <span className="text-[10px] tracking-wider text-[#10B981] uppercase font-bold block">
              Payment Secured in Escrow
            </span>
            <h2 className="font-serif text-[26px] text-[#F2EFE9] uppercase tracking-[0.06em]">
              Order #{orderReference} Confirmed
            </h2>
            {orderTimestampIST && (
              <p className="text-xs text-[#9CA3AF] font-mono">
                Order Placed (IST): {orderTimestampIST}
              </p>
            )}
            <p className="text-[13px] text-[#A1A1AA] max-w-xl mx-auto leading-relaxed">
              Consigning seller <span className="text-[#F2EFE9] font-medium">{lotItem.sellerHandle}</span> has been notified to pack and courier this item via BlueDart / Delhivery within 48 hours.
            </p>
            <div className="p-4 bg-[#080808] border border-[#1F1F1F] max-w-md mx-auto text-[11px] text-[#CCCCCC] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Amount Held in Escrow:</span>
                <span className="font-serif text-[#F2EFE9] font-bold">₹{lotItem.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Inspection Period:</span>
                <span className="text-[#10B981] font-semibold">48 Hours from Delivery</span>
              </div>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={invoiceLoading}
                className="px-6 py-2.5 bg-[#080808] border border-[#1F1F1F] hover:border-[#3A3A3A] text-[#CCCCCC] text-[11px] font-semibold uppercase tracking-wider transition-none cursor-pointer rounded-none disabled:opacity-50"
              >
                {invoiceLoading ? 'Generating invoice...' : 'Download Tax Invoice (PDF)'}
              </button>
              <Link
                href="/vault"
                className="inline-block px-6 py-2.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-wider no-underline transition-none rounded-none"
              >
                View in Your Dashboard
              </Link>
            </div>
          </div>
        ) : null}

        {!isEscrowLocked && lotItem && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (7 cols): Address & 4-Stage Protocol */}
            <div className="lg:col-span-7 space-y-6">
              {/* Form 01: Indian Delivery Address */}
              <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-4">
                <div className="border-b border-[#161616] pb-3 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-semibold">
                    01. Delivery Address (India Only)
                  </span>
                  <span className="text-[10px] text-[#10B981] font-semibold uppercase tracking-wider">
                    Pan-India
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 font-medium">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-[#080808] border border-[#1F1F1F] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 font-medium">
                      Mobile Number (+91) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className={`w-full bg-[#080808] border px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none ${phone.length > 0 && !isPhoneValid ? 'border-[#EF4444]' : 'border-[#1F1F1F]'
                        }`}
                    />
                    {phone.length > 0 && !isPhoneValid && (
                      <span className="text-[10px] text-[#EF4444] mt-1 block">
                        Enter a valid 10-digit Indian mobile number (+91)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 font-medium">
                    6-Digit Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 400001"
                    className={`w-full bg-[#080808] border px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none ${pincode.length > 0 && !isPincodeValid ? 'border-[#EF4444]' : 'border-[#1F1F1F]'
                      }`}
                  />
                  {pincode.length > 0 && !isPincodeValid && (
                    <span className="text-[10px] text-[#EF4444] mt-1 block">
                      Enter a valid 6-digit Indian PIN code (digits only)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 font-medium">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House / Flat / Street"
                      className="w-full bg-[#080808] border border-[#1F1F1F] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 font-medium">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full bg-[#080808] border border-[#1F1F1F] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 font-medium">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full bg-[#080808] border border-[#1F1F1F] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none"
                    />
                  </div>
                </div>

                {/* Instant Serviceability Indicator */}
                <div className="p-3 bg-[#080808] border border-[#1F1F1F] flex items-center justify-between text-[10px] tracking-wider uppercase">
                  <span className="text-[#9CA3AF]">Delivery Service:</span>
                  <span className={isPincodeValid ? 'text-[#10B981] font-semibold' : 'text-[#F87171]'}>
                    {isPincodeValid
                      ? 'BlueDart Air & Delhivery Express delivery available'
                      : 'Enter a valid 6-digit Indian PIN code to verify delivery'}
                  </span>
                </div>
              </div>

              {/* Block 02: 48-Hour Escrow Protection */}
              <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-5">
                <div className="border-b border-[#161616] pb-3 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-semibold">
                    02. How Escrow Works
                  </span>
                  <span className="text-[10px] text-[#10B981] font-semibold uppercase tracking-wider">
                    Buyer Protected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#080808] border border-[#1F1F1F] space-y-1">
                    <span className="text-[9px] text-[#9CA3AF] uppercase tracking-wider block">Step 01</span>
                    <span className="text-[11px] text-[#F2EFE9] font-semibold uppercase block">Payment Held</span>
                    <p className="text-[9px] text-[#A1A1AA] leading-relaxed">
                      Your payment is held safely in escrow. The seller cannot withdraw it yet.
                    </p>
                  </div>

                  <div className="p-3 bg-[#080808] border border-[#1F1F1F] space-y-1">
                    <span className="text-[9px] text-[#9CA3AF] uppercase tracking-wider block">Step 02</span>
                    <span className="text-[11px] text-[#F2EFE9] font-semibold uppercase block">Shipped</span>
                    <p className="text-[9px] text-[#A1A1AA] leading-relaxed">
                      Seller dispatches via tracked express courier within India.
                    </p>
                  </div>

                  <div className="p-3 bg-[#080808] border border-[#1F1F1F] space-y-1">
                    <span className="text-[9px] text-[#9CA3AF] uppercase tracking-wider block">Step 03</span>
                    <span className="text-[11px] text-[#F2EFE9] font-semibold uppercase block">48-Hour Check</span>
                    <p className="text-[9px] text-[#A1A1AA] leading-relaxed">
                      You have 48 hours from delivery to inspect the item and condition.
                    </p>
                  </div>

                  <div className="p-3 bg-[#080808] border border-[#1F1F1F] space-y-1">
                    <span className="text-[9px] text-[#9CA3AF] uppercase tracking-wider block">Step 04</span>
                    <span className="text-[11px] text-[#F2EFE9] font-semibold uppercase block">Settlement</span>
                    <p className="text-[9px] text-[#A1A1AA] leading-relaxed">
                      Once confirmed, payout is released to the seller.
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
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 border transition-none flex items-center justify-center ${unboxingConfirmed
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
                disabled={!unboxingConfirmed || isProcessing || !isFormValid}
                className="w-full py-3.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-xs font-semibold uppercase tracking-wider transition-none cursor-pointer rounded-none disabled:opacity-30 flex items-center justify-center font-sans"
              >
                {isProcessing
                  ? 'Securing escrow...'
                  : 'Pay via Razorpay (Escrow Protected)'}
              </button>

              {!unboxingConfirmed && (
                <p className="text-[10px] text-[#9CA3AF] text-center leading-relaxed">
                  Please accept the unboxing video declaration to unlock payment
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
