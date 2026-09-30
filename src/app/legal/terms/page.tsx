/**
 * @file src/app/legal/terms/page.tsx
 *
 * Terms of Service & Escrow Marketplace Charter for OtakuBazaar.
 * Styled with Japanese Cypress Dark-Wood Craftsman Aesthetic (#0a0806, #140F0B, #F85B1A).
 *
 * Details:
 * - 15-Minute Concurrency Checkout Reservation Locks
 * - Double-Entry Escrow Vault (Razorpay Route)
 * - Shiprocket Insured Logistics & Strict 48-Hour Inspection Window
 * - Counterfeit Zero-Tolerance Policy & Payout Protocols
 * - Centralized Support & Grievance Footer Block
 */

import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { LegalSupportFooter } from '@/presentation/components/compliance/LegalSupportFooter';

export const metadata: Metadata = {
  title: 'Terms of Service — OtakuBazaar Escrow Marketplace',
  description:
    'OtakuBazaar Terms of Service: Escrow architecture, 15-minute concurrency checkout locks, 48-hour unboxing inspection guarantee, Razorpay settlement, and Shiprocket delivery policies.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#0a0806] text-[#F0E8DA]">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb / Return Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-amber-200 hover:text-white bg-[#1A1410] hover:bg-[#F85B1A] border border-amber-900/40 hover:border-[#F85B1A] transition-all shadow-md group cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F85B1A] focus-visible:outline-none"
            aria-label="Return to OtakuBazaar Marketplace"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200" aria-hidden="true">
              ←
            </span>
            <span>Return to Marketplace</span>
          </Link>
        </div>

        {/* Header Plaque */}
        <header className="p-8 sm:p-10 bg-[#111114] border border-zinc-800 mb-8 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-[0.2em]">
              Marketplace Charter
            </span>
            <span className="text-xs text-zinc-400 uppercase tracking-wider">
              Effective: March 2026 • Verified Escrow
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 uppercase tracking-[0.15em] mb-3">
            Terms of Service & Escrow Rules
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl font-normal">
            OtakuBazaar is a peer-to-peer anime collectibles marketplace engineered to eradicate counterfeits through cryptographic escrow locking, insured delivery, and guaranteed unboxing inspection windows.
          </p>
        </header>

        {/* Terms Content Sections */}
        <div className="space-y-6 text-sm text-stone-200 leading-relaxed">
          {/* Section 1: Escrow Architecture */}
          <section className="p-6 rounded-2xl bg-[#140F0B]/90 border border-amber-900/30">
            <h2 className="text-base sm:text-lg font-black text-[#E8C36A] mb-3 flex items-center gap-2">
              <span>1.</span> Double-Escrow Financial Architecture
            </h2>
            <div className="space-y-3">
              <p>
                When a buyer initiates a checkout, funds are captured via our payment partner <strong className="text-white">Razorpay</strong> into an isolated Escrow Liability Account. Funds remain locked in escrow and are never released to the seller until:
              </p>
              <ul className="list-disc list-inside space-y-2 text-stone-300 pl-2">
                <li>
                  <strong className="text-white">Verified Delivery:</strong> Shiprocket transmits a verified delivery timestamp.
                </li>
                <li>
                  <strong className="text-white">Inspection Clearance:</strong> The buyer explicitly marks the item as authentic or the mandatory 48-Hour Inspection Window elapses without an active dispute.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: 15-Minute Checkout Concurrency Lock */}
          <section className="p-6 bg-[#111114] border border-zinc-800">
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>2.</span> 15-Minute Concurrency Reservation Lock
            </h2>
            <p>
              When a seller accepts a bargain offer or a buyer clicks &apos;Reserve Grail&apos;, the listing enters a locked state (<code className="text-zinc-100 bg-zinc-900 px-1.5 py-0.5 border border-zinc-700 text-xs uppercase tracking-wider font-semibold">RESERVED</code>) for precisely 900 seconds (15 minutes). During this window, no other buyer may purchase or counter-bid. If payment is not completed within 15 minutes, the lock expires automatically and the item is restored to public market circulation.
            </p>
          </section>

          {/* Section 3: Strict Zero-Bootleg & Authenticity Standard */}
          <section className="p-6 bg-[#111114] border border-zinc-800">
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>3.</span> Authenticity Standards & Bootleg Prohibition
            </h2>
            <p>
              OtakuBazaar enforces a zero-tolerance policy against unlicensed reproductions, bootlegs, and unauthorized recast statues. Sellers must accurately declare manufacturer stickers (e.g., Toei Animation golden cat sticker, Kodansha seal) and disclose any box blemishes or paint flaws. Sellers attempting to distribute counterfeit items face permanent banishment and forfeiture of escrow holdings.
            </p>
          </section>

          {/* Section 4: Logistics & Shiprocket Dispatch */}
          <section className="p-6 rounded-2xl bg-[#140F0B]/90 border border-amber-900/30">
            <h2 className="text-base sm:text-lg font-black text-[#E8C36A] mb-3 flex items-center gap-2">
              <span>4.</span> Shipping, Transit Insurance & Dispatch
            </h2>
            <div className="space-y-3">
              <p>
                Sellers must package collectibles with collector-grade protection (bubble wrap, corner guards, and rigid double-boxing). All parcels are scheduled and insured via <strong className="text-white">Shiprocket</strong> courier networks. Sellers must hand over the parcel within 3 business days of order confirmation. Failure to dispatch results in automatic cancellation and full escrow refund to the buyer.
              </p>
            </div>
          </section>

          {/* Section 5: Dispute Arbitration */}
          <section className="p-6 rounded-2xl bg-[#140F0B]/90 border border-amber-900/30">
            <h2 className="text-base sm:text-lg font-black text-[#E8C36A] mb-3 flex items-center gap-2">
              <span>5.</span> Dispute Arbitration & Payout Release
            </h2>
            <p>
              Buyers must report any discrepancy (broken parts, box crush, fake authentication) within 48 hours of delivery accompanied by an uninterrupted unboxing video. OtakuBazaar Escrow Arbiter reviews claims within 24 business hours. If approved, reverse pickup is initiated via Shiprocket and funds are refunded via Razorpay. If no dispute is raised within 48 hours, payout is settled to the seller&apos;s verified UPI VPA.
            </p>
          </section>
        </div>

        {/* Centralized Contact Support Footer */}
        <LegalSupportFooter />
      </div>
    </div>
  );
}
