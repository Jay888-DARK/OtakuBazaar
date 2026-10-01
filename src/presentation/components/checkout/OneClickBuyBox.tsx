/**
 * @file src/presentation/components/checkout/OneClickBuyBox.tsx
 *
 * Amazon 1-Click Mirror Buy Box for OtakuBazaar.
 * Tactile brutalist UI (0px border-radius, 1px solid dark gray borders, flat design).
 *
 * Features:
 * 1. Strict transparent pre-calculation data row (Item, Insured Courier, Escrow, Tax, Final All-Inclusive Total).
 * 2. Primary CTA: `[ 1-CLICK ACQUISITION ]` immediately opening Razorpay checkout overlay.
 * 3. Express payment wallets (Google Pay, Apple Pay, Saved Cards & Instant UPI) for instant biometric checkout.
 * 4. 0ms Brutalist Confirmation State Inversion: `[ ACQUISITION SECURED — CUSTODY TRANSFERRED ]`.
 *    Zero green checkmark bullets, animated arrows, or sparkles.
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InstantCheckoutDrawer } from './InstantCheckoutDrawer';

interface OneClickBuyBoxProps {
  productId: string;
  lotId?: string;
  price: number;
  itemTitle: string;
  dealOfferId?: string;
  className?: string;
}

export function OneClickBuyBox({
  productId,
  lotId,
  price,
  itemTitle,
  dealOfferId,
  className = '',
}: OneClickBuyBoxProps): React.JSX.Element {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedData, setConfirmedData] = useState<{
    orderId: string;
    paymentId: string;
  } | null>(null);

  const targetId = lotId || productId;
  const formattedPrice = `₹${price.toLocaleString('en-IN')}`;

  const openDrawerWithWallet = (wallet?: string) => {
    setSelectedWallet(wallet);
    setIsDrawerOpen(true);
  };

  const executeOneClickCheckout = async (preferredMethod?: string) => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // 1. Ensure Razorpay client SDK is ready
      if (typeof window !== 'undefined' && !(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          if ((window as any).Razorpay) {
            resolve();
            return;
          }
          const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
          if (existingScript) {
            existingScript.addEventListener('load', () => resolve());
            setTimeout(() => {
              if ((window as any).Razorpay) resolve();
              else reject(new Error('Payment SDK loading timed out. Please retry.'));
            }, 3500);
          } else {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load payment engine'));
            document.body.appendChild(script);
          }
        });
      }

      // 2. Authoritative server order generation
      const res = await fetch('/api/checkout/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotId: targetId,
          productId: targetId,
          dealOfferId,
          price,
          amount: price,
          receipt: `rcpt_1click_${targetId}_${Date.now()}`,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || orderData.error) {
        throw new Error(orderData.error || 'Failed to initialize 1-Click order.');
      }

      const orderId = orderData.order_id || orderData.id;
      const chargeAmountPaise = orderData.amount;

      if (!orderId) {
        throw new Error('Could not obtain server order token.');
      }

      // 3. Configure Razorpay Overlay with 1-Click parameters
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || orderData.key_id || 'rzp_test_TdBTiCyaOJ95KC',
        amount: chargeAmountPaise,
        currency: 'INR',
        name: 'OtakuBazaar Vault',
        description: `1-Click Escrow: ${itemTitle}`,
        order_id: orderId,
        prefill: {
          name: 'Verified Collector',
          email: 'collector@otakubazaar.dev',
          contact: '9999999999',
          method: preferredMethod || undefined,
        },
        theme: {
          color: '#09090b',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) {
          try {
            // Verify payment signature server-side
            const verifyRes = await fetch('/api/checkout/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                lotId: targetId,
                productId: targetId,
                dealOfferId,
                amount: chargeAmountPaise,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || verifyData.error) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            // 0ms Brutalist Confirmation State Inversion
            setConfirmedData({
              orderId,
              paymentId: response.razorpay_payment_id,
            });
            setLoading(false);
          } catch (err: any) {
            console.error('[1-Click] Signature error:', err);
            setErrorMessage(err.message || 'Signature verification error.');
            setLoading(false);
          }
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp: any) {
        setErrorMessage(resp.error?.description || '1-Click transaction failed. Please retry.');
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error('[1-Click Checkout Error]:', err);
      setErrorMessage(err.message || 'Failed to trigger 1-Click acquisition overlay.');
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. Instant Confirmation State (0ms Brutalist State Inversion)
  // Replaces the button instantly with stark monochromatic text:
  // [ ACQUISITION SECURED — CUSTODY TRANSFERRED ]
  // Zero green checkmark bullets, animated arrows, or sparkles.
  // ---------------------------------------------------------------------------
  if (confirmedData) {
    return (
      <div
        className={`w-full bg-[#f4f4f4] text-black border border-[#f4f4f4] p-6 select-none ${className}`}
        style={{
          borderRadius: '0px',
          boxShadow: 'none',
          transition: 'none',
          fontFamily: "'Satoshi', 'Cabinet Grotesk', sans-serif",
        }}
      >
        <div className="space-y-4">
          {/* Stark Monochromatic Success Title */}
          <div className="border-b border-black/20 pb-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-600 font-bold block mb-1">
              ESCROW SETTLEMENT PROTOCOL COMPLETE
            </span>
            <h3
              style={{ fontFamily: "'Clash Display', 'Syne', sans-serif" }}
              className="text-base sm:text-lg font-black uppercase tracking-[0.08em] text-black leading-tight"
            >
              [ ACQUISITION SECURED — CUSTODY TRANSFERRED ]
            </h3>
          </div>

          {/* High-Contrast Editorial Telemetry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium uppercase tracking-wider text-black">
            <div className="border border-black/15 bg-black/5 p-2.5">
              <span className="text-[9px] text-neutral-600 block font-semibold">CUSTODY STATUS</span>
              <span className="font-bold text-black mt-0.5 block">HELD IN ESCROW VAULT</span>
            </div>
            <div className="border border-black/15 bg-black/5 p-2.5">
              <span className="text-[9px] text-neutral-600 block font-semibold">INSPECTION WINDOW</span>
              <span className="font-bold text-black mt-0.5 block">48H POST-UNBOXING</span>
            </div>
            <div className="border border-black/15 bg-black/5 p-2.5">
              <span className="text-[9px] text-neutral-600 block font-semibold">ORDER REFERENCE</span>
              <span className="font-bold text-black mt-0.5 block truncate">{confirmedData.orderId}</span>
            </div>
            <div className="border border-black/15 bg-black/5 p-2.5">
              <span className="text-[9px] text-neutral-600 block font-semibold">PAYMENT IDENTIFIER</span>
              <span className="font-bold text-black mt-0.5 block truncate">{confirmedData.paymentId}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] font-semibold text-neutral-700">
            <span>INSURED DISPATCH COURIER SCHEDULED</span>
            <span className="text-black font-extrabold">DISPATCH T+1 DAY</span>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 1 & 2. Pre-Calculation Table + 1-Click CTA + Express Wallets
  // ---------------------------------------------------------------------------
  return (
    <div
      className={`w-full bg-[#0c0c0e] border border-[#27272a] p-4 sm:p-5 space-y-4 select-none ${className}`}
      style={{
        borderRadius: '0px',
        boxShadow: 'none',
        fontFamily: "'Satoshi', 'Cabinet Grotesk', sans-serif",
      }}
    >
      {/* 2. Transparent Pre-Calculation Data Table */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-1.5">
          <span>TRANSPARENT PRE-CALCULATION MATRIX</span>
          <span className="text-zinc-400">AUTHORITATIVE</span>
        </div>

        <div className="border border-[#27272a] bg-[#09090b] divide-y divide-[#1f1f23] text-[11px] uppercase tracking-wide">
          <div className="flex justify-between items-center px-3 py-1.5 text-zinc-400">
            <span>Base Archival Lot Valuation</span>
            <span className="text-zinc-200 font-medium">{formattedPrice}</span>
          </div>
          <div className="flex justify-between items-center px-3 py-1.5 text-zinc-500">
            <span>Insured Express Courier Dispatch</span>
            <span className="text-emerald-400 font-semibold tracking-wider">₹0 (INCLUDED)</span>
          </div>
          <div className="flex justify-between items-center px-3 py-1.5 text-zinc-500">
            <span>48-Hour Inspection Escrow Custody</span>
            <span className="text-emerald-400 font-semibold tracking-wider">₹0 (INCLUDED)</span>
          </div>
          <div className="flex justify-between items-center px-3 py-1.5 text-zinc-500">
            <span>Applicable Goods Tax (GST)</span>
            <span className="text-emerald-400 font-semibold tracking-wider">₹0 (INCLUDED)</span>
          </div>
          <div className="flex justify-between items-center px-3 py-2 bg-[#111114] text-zinc-100 font-bold border-t border-[#27272a]">
            <span className="text-xs uppercase tracking-[0.16em]">Final All-Inclusive Total</span>
            <span
              style={{ fontFamily: "'Clash Display', 'Syne', sans-serif" }}
              className="text-base font-extrabold tracking-wider text-zinc-100"
            >
              {formattedPrice}
            </span>
          </div>
        </div>
      </div>

      {/* 1. Primary CTA: [ INSTANT ACQUISITION ] */}
      <div className="space-y-2.5">
        <button
          type="button"
          id="instant-acquisition-btn"
          data-testid="instant-acquisition-button"
          aria-label="Instant Acquisition"
          onClick={() => setIsDrawerOpen(true)}
          disabled={loading}
          style={{ fontFamily: "'Clash Display', 'Syne', sans-serif" }}
          className="w-full py-3.5 px-4 bg-[#f4f4f4] hover:bg-white text-black font-extrabold text-xs sm:text-sm uppercase tracking-[0.2em] border border-[#f4f4f4] transition-none cursor-pointer flex items-center justify-center gap-2 rounded-none disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>OPENING INSTANT DRAWER...</span>
            </>
          ) : (
            <span>[ INSTANT ACQUISITION ]</span>
          )}
        </button>

        {errorMessage && (
          <p className="text-[10px] text-red-400 uppercase tracking-wider text-center font-medium">
            {errorMessage}
          </p>
        )}

        {/* Express Payment Wallets for Instant Biometric Checkout */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">
            <span>INSTANT BIOMETRIC WALLETS</span>
            <span>BYPASS CART</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => openDrawerWithWallet('google_pay')}
              disabled={loading}
              className="py-2 px-1 bg-[#111114] hover:bg-[#18181b] text-zinc-300 hover:text-white border border-[#27272a] text-[10px] font-bold uppercase tracking-wider transition-none cursor-pointer text-center rounded-none"
            >
              Google Pay
            </button>
            <button
              type="button"
              onClick={() => openDrawerWithWallet('apple_pay')}
              disabled={loading}
              className="py-2 px-1 bg-[#111114] hover:bg-[#18181b] text-zinc-300 hover:text-white border border-[#27272a] text-[10px] font-bold uppercase tracking-wider transition-none cursor-pointer text-center rounded-none"
            >
              Apple Pay
            </button>
            <button
              type="button"
              onClick={() => openDrawerWithWallet('card')}
              disabled={loading}
              className="py-2 px-1 bg-[#111114] hover:bg-[#18181b] text-zinc-300 hover:text-white border border-[#27272a] text-[10px] font-bold uppercase tracking-wider transition-none cursor-pointer text-center rounded-none"
            >
              Saved Cards
            </button>
          </div>

          {/* Standard Checkout Alternative */}
          <div className="pt-1.5 text-center">
            <a
              href={`/checkout?productId=${encodeURIComponent(targetId)}&amount=${price}`}
              className="no-underline block"
            >
              <button
                type="button"
                className="w-full py-1.5 bg-transparent hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 text-[9px] font-medium uppercase tracking-[0.15em] border border-zinc-900 hover:border-zinc-800 transition-none cursor-pointer rounded-none"
              >
                Buy Now (Standard Checkout Page) →
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Single-Step Guest Checkout Drawer */}
      <InstantCheckoutDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        productId={productId}
        lotId={lotId}
        price={price}
        itemTitle={itemTitle}
        initialWallet={selectedWallet}
        onSuccess={(paymentId, orderId) => {
          setConfirmedData({ paymentId, orderId });
        }}
      />
    </div>
  );
}

export default OneClickBuyBox;
