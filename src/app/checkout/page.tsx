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
  } else if (amount && !isNaN(Number(amount))) {
    finalAmount = Number(amount);
  }

  const itemTitle = dealOffer?.product?.title || 'OtakuBazaar Authentic Collectible';

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 py-10 px-4 sm:px-6 lg:px-8 pb-24">
      {/* Client-side Razorpay SDK Loader */}
      <RazorpayScript />

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <Link href="/" className="hover:text-zinc-300 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-300">Checkout</span>
        </div>

        {/* Header Panel */}
        <div className="bg-[#121214] border border-zinc-800/80 rounded-xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700 font-mono text-[10px] uppercase tracking-wider">
              🛡️ 48-Hour Escrow Protection
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-mono font-bold text-zinc-100 uppercase tracking-widest">
            Complete Secure Checkout
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-2">
            Payment is held securely in escrow until physical unboxing inspection concludes.
          </p>
        </div>

        {/* Offer Status Banners */}
        {isOfferLocked && (
          <div className="p-4 rounded-xl bg-[#121214] border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-3 shadow-lg">
            <span className="text-2xl">🔒</span>
            <div>
              <span className="font-bold text-sm block mb-1">Escrow Payment Locked</span>
              <span className="text-zinc-400">
                Your bargain offer of ₹{finalAmount.toLocaleString('en-IN')} is awaiting seller acceptance (Status: {currentStatus || 'PENDING'}). Razorpay Escrow payment will unlock ONLY when the seller accepts your offer.
              </span>
            </div>
          </div>
        )}

        {isOfferAccepted && (
          <div className="p-4 rounded-xl bg-[#121214] border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-3 shadow-lg">
            <span className="text-2xl">✓</span>
            <div>
              <span className="font-bold text-sm block mb-1">Bargain Offer Accepted</span>
              <span className="text-zinc-400">
                The seller agreed to ₹{finalAmount.toLocaleString('en-IN')}. Razorpay Escrow payment is unlocked and ready for funding.
              </span>
            </div>
          </div>
        )}

        {/* Order Summary & Payment Card */}
        <div className="bg-[#121214] border border-zinc-800/80 rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-widest border-b border-zinc-800/80 pb-3">
            Order Breakdown
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center text-zinc-300">
              <span className="truncate max-w-md">{itemTitle}</span>
              <span className="font-bold text-zinc-100">₹{finalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>Escrow Liability Trust Fee</span>
              <span className="text-emerald-400 font-medium">FREE (₹0)</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>Inspected Express Courier Dispatch</span>
              <span className="text-emerald-400 font-medium">FREE (₹0)</span>
            </div>
            <div className="border-t border-zinc-800/80 pt-3 flex justify-between items-baseline font-mono">
              <span className="text-sm uppercase tracking-wider text-zinc-300">Total Due (INR):</span>
              <span className="text-xl font-bold text-zinc-100">₹{finalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Secure Payment Trigger: Universal Button Token */}
          <div className="pt-6 border-t border-zinc-800/80 flex flex-col items-center justify-center space-y-3">
            <CheckoutButton
              productId={productId}
              lotId={productId}
              dealOfferId={dealOfferId}
              amount={finalAmount}
              title={itemTitle}
              description={isOfferAccepted ? 'Accepted Bargain Escrow' : 'Escrow Protected Checkout'}
              disabled={isOfferLocked}
              className="w-full max-w-md mx-auto py-3 bg-zinc-900 hover:bg-zinc-100 text-zinc-300 hover:text-black border border-zinc-700 hover:border-zinc-100 font-mono text-xs font-semibold uppercase tracking-[0.2em] rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none"
            />
            {isOfferLocked ? (
              <p className="text-[11px] font-mono text-amber-400/90 text-center max-w-sm">
                🔒 Button locked until offer is ACCEPTED by seller.
              </p>
            ) : (
              <p className="text-[11px] font-mono text-zinc-500 text-center max-w-sm">
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
