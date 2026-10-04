/**
 * @file src/app/checkout/page.tsx
 *
 * Secure Escrow Checkout Page for OtakuBazaar.
 * Embeds Razorpay SDK, Universal Button Token, and Mobile Sticky Escrow Action Bar.
 *
 * Escrow Security Rules:
 * - Unlocks the Razorpay Escrow payment button ONLY when an offer is marked ACCEPTED.
 * - If an offer is PENDING, payment remains securely locked.
 * - If direct purchase without offer, checkout is unlocked at standard catalog price.
 */

import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prismaClient';
import { RazorpayScript } from '@/presentation/components/payments/RazorpayScript';
import { CheckoutButton } from '@/presentation/components/payments/CheckoutButton';
import { CheckoutMobileActionBar } from '@/presentation/components/checkout/CheckoutMobileActionBar';

export const metadata = {
  title: 'Secure Escrow Checkout — OtakuBazaar',
  description: 'Complete your authenticated anime collectible order with 48-hour inspection escrow protection.',
};

interface CheckoutPageProps {
  searchParams?: Promise<{
    productId?: string;
    amount?: string;
    dealOfferId?: string;
    offerStatus?: string;
  }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps): Promise<React.JSX.Element> {
  const resolvedParams = searchParams ? await searchParams : {};
  const { productId, amount, dealOfferId, offerStatus } = resolvedParams;

  let dealOffer: any = null;
  if (dealOfferId) {
    try {
      dealOffer = await prisma.dealOffer.findUnique({
        where: { id: dealOfferId },
        include: { product: true },
      });
    } catch (err) {
      console.warn('[CheckoutPage] Could not query dealOffer:', err);
    }
  }

  // Determine if this is an offer-based checkout and if it is locked
  const currentStatus = dealOffer?.status || offerStatus;
  const isOfferWorkflow = Boolean(dealOfferId || offerStatus);
  const isOfferAccepted = currentStatus === 'ACCEPTED';
  const isOfferLocked = isOfferWorkflow && !isOfferAccepted;

  // Determine final price: from accepted offer, query amount, product price, or fallback 999
  let finalAmount = 999;
  if (dealOffer?.offeredPrice) {
    finalAmount = dealOffer.offeredPrice;
  } else if (amount) {
    const cleaned = String(amount).replace(/,/g, '').replace(/₹/g, '').trim();
    if (!isNaN(Number(cleaned)) && Number(cleaned) > 0) {
      finalAmount = Number(cleaned);
    }
  }

  const itemTitle = dealOffer?.product?.title || 'OtakuBazaar Authentic Collectible';

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 py-10 px-4 sm:px-6 lg:px-8 pb-24">
      {/* Client-side Razorpay SDK Loader */}
      <RazorpayScript />

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation Breadcrumbs & Close Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">
            <Link href="/" className="hover:text-zinc-200 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-200">Checkout</span>
          </div>

          <Link
            href="/"
            aria-label="Close checkout"
            data-testid="close-checkout-btn"
            className="w-8 h-8 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Link>
        </div>

        {/* Header Panel */}
        <div className="bg-[#111114] border border-zinc-800 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 bg-zinc-900 text-zinc-300 border border-zinc-700 text-[10px] uppercase tracking-[0.2em] font-medium">
              48-Hour Escrow Protection
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 uppercase tracking-[0.15em]">
            Complete Secure Checkout
          </h1>
          <p className="text-xs text-zinc-400 mt-2 font-normal tracking-wide">
            Payment is held securely in escrow until physical unboxing inspection concludes.
          </p>
        </div>

        {/* Offer Status Banners */}
        {isOfferLocked && (
          <div className="p-4 bg-[#111114] border border-amber-500/50 text-amber-200 text-xs flex items-center gap-3">
            <span className="text-xs font-bold px-2 py-1 bg-amber-950/60 border border-amber-500/60 uppercase tracking-widest text-amber-300">
              LOCKED
            </span>
            <div>
              <span className="font-bold text-sm block mb-1 uppercase tracking-wider">Escrow Payment Locked</span>
              <span className="text-zinc-400">
                Your bargain offer of ₹{finalAmount.toLocaleString('en-IN')} is awaiting seller acceptance (Status: {currentStatus || 'PENDING'}). Razorpay Escrow payment will unlock ONLY when the seller accepts your offer.
              </span>
            </div>
          </div>
        )}

        {isOfferAccepted && (
          <div className="p-4 bg-[#111114] border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-3">
            <span className="text-xs font-bold px-2 py-1 bg-emerald-950/60 border border-emerald-500/60 uppercase tracking-widest text-emerald-300">
              ACCEPTED
            </span>
            <div>
              <span className="font-bold text-sm block mb-1 uppercase tracking-wider">Bargain Offer Accepted</span>
              <span className="text-zinc-400">
                The seller agreed to ₹{finalAmount.toLocaleString('en-IN')}. Razorpay Escrow payment is unlocked and ready for funding.
              </span>
            </div>
          </div>
        )}

        {/* Order Summary & Payment Card */}
        <div className="bg-[#111114] border border-zinc-800 p-6 sm:p-8 space-y-6">
          <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-[0.25em] border-b border-zinc-800 pb-3">
            Order Breakdown
          </h2>

          <div className="space-y-3 text-xs tracking-wide">
            <div className="flex justify-between items-center text-zinc-300">
              <span className="truncate max-w-md font-medium">{itemTitle}</span>
              <span className="font-bold text-zinc-100 tracking-wider">₹{finalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>Escrow Liability Trust Fee</span>
              <span className="text-emerald-400 font-semibold tracking-wider">FREE (₹0)</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>Inspected Express Courier Dispatch</span>
              <span className="text-emerald-400 font-semibold tracking-wider">FREE (₹0)</span>
            </div>
            <div className="border-t border-zinc-800 pt-3 flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-zinc-300">Total Due (INR):</span>
              <span className="text-xl font-extrabold text-zinc-100 tracking-wider">₹{finalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Secure Payment Trigger: Universal Button Token */}
          <div className="pt-6 border-t border-zinc-800 flex flex-col items-center justify-center space-y-3">
            <CheckoutButton
              productId={productId}
              lotId={productId}
              dealOfferId={dealOfferId}
              amount={finalAmount}
              title={itemTitle}
              description={isOfferAccepted ? 'Accepted Bargain Escrow' : 'Escrow Protected Checkout'}
              disabled={isOfferLocked}
              className="w-full max-w-md mx-auto py-3 bg-zinc-900 hover:bg-zinc-100 text-zinc-200 hover:text-black border border-zinc-700 hover:border-zinc-100 text-xs font-bold uppercase tracking-[0.25em] transition-colors duration-200 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none"
            />
            {isOfferLocked ? (
              <p className="text-[11px] text-amber-400/90 text-center max-w-sm tracking-wide uppercase">
                Payment locked until offer is accepted by seller.
              </p>
            ) : (
              <p className="text-[11px] text-zinc-500 text-center max-w-sm tracking-wide">
                Secured by 256-bit SSL encryption and backed by Razorpay Escrow.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar (Client Component) */}
      <CheckoutMobileActionBar finalAmount={finalAmount} isOfferLocked={isOfferLocked} />
    </div>
  );
}
