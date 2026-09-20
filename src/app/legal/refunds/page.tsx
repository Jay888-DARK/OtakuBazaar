/**
 * @file src/app/legal/refunds/page.tsx
 *
 * Strict 48-Hour Escrow Refund & Dispute Policy for OtakuBazaar.
 * Styled with Japanese Cypress Dark-Wood Craftsman Aesthetic (#0a0806, #140F0B, #F85B1A).
 *
 * Requirements Met:
 * - Strict 48-Hour Escrow Inspection Window (starts on Shiprocket delivery scan)
 * - Mandatory continuous unboxing video requirement for damage/bootleg claims
 * - Escrow lock guarantee via Razorpay Vault
 * - Shiprocket reverse courier pickup & Razorpay refund reversal timeline
 * - Centralized Support & Grievance Footer Block
 */

import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { LegalSupportFooter } from '@/presentation/components/compliance/LegalSupportFooter';

export const metadata: Metadata = {
  title: 'Refund & Escrow Inspection Policy — OtakuBazaar',
  description:
    'OtakuBazaar strict 48-hour escrow refund policy: unboxing inspection guidelines, Razorpay fund reversals, and Shiprocket reverse pickup protocols.',
};

export default function RefundsPolicyPage() {
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
        <header className="p-8 sm:p-10 rounded-2xl bg-[#140F0B]/95 border border-amber-900/40 shadow-2xl backdrop-blur-md mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#F85B1A]/10 via-amber-700/5 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded bg-[#F85B1A]/20 border border-[#F85B1A]/40 text-[#F85B1A] text-xs font-mono font-bold uppercase tracking-wider">
              Escrow Protection
            </span>
            <span className="text-xs text-stone-400 font-mono">
              Strict 48-Hour Inspection Window
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 uppercase tracking-wider mb-3">
            Refund, Dispute & Escrow Policy
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
            Because genuine anime grails, scale figures, and resin statues are high-value collectibles, OtakuBazaar enforces a rigorous 48-hour escrow protection model designed to protect genuine buyers and sellers alike.
          </p>
        </header>

        {/* Policy Content Sections */}
        <div className="space-y-6 text-sm text-stone-200 leading-relaxed">
          {/* Strict 48-Hour Guarantee Card */}
          <section className="p-5 sm:p-6 rounded-2xl border-2 border-amber-500/40 bg-amber-950/20 shadow-lg">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xl" aria-hidden="true">⏱️</span>
              <h2 className="text-base sm:text-lg font-black text-amber-300 m-0">
                The Strict 48-Hour Inspection Clock
              </h2>
            </div>
            <p className="text-stone-200 m-0 leading-relaxed">
              The moment Shiprocket registers a successful delivery scan at your shipping address, an unalterable <strong className="text-white">48-hour inspection countdown timer</strong> begins. During these 48 hours, your funds remain safely secured inside the Razorpay Escrow Vault. The seller cannot withdraw these funds until the window closes or you approve the delivery.
            </p>
          </section>

          {/* Section 1: Conditions for Eligible Refunds */}
          <section className="p-6 rounded-2xl bg-[#140F0B]/90 border border-amber-900/30">
            <h2 className="text-base sm:text-lg font-black text-[#E8C36A] mb-3 flex items-center gap-2">
              <span>1.</span> Eligible Refund Grounds
            </h2>
            <div className="space-y-3">
              <p>
                Refunds are sanctioned exclusively under the following verified conditions:
              </p>
              <ul className="list-disc list-inside space-y-2 text-stone-300 pl-2">
                <li>
                  <strong className="text-white">Counterfeit / Bootleg Detection:</strong> Item is proven to be an unlicensed replica, lacking official holographic licensing seals or original manufacturer engravings.
                </li>
                <li>
                  <strong className="text-white">Undisclosed Damage or Broken Parts:</strong> Snapped limbs, missing accessories, severed joints, or major box crushing not disclosed in the seller&apos;s listing photos.
                </li>
                <li>
                  <strong className="text-white">Wrong Item Received:</strong> The parcel contains an entirely different figure or collectible.
                </li>
                <li>
                  <strong className="text-white">Transit Loss / Delivery Failure:</strong> The package is marked lost by Shiprocket or damaged beyond recognition in transit.
                </li>
              </ul>
              <p className="text-xs text-stone-400 italic pt-1">
                Note: Collector buyer&apos;s remorse or minor manufacturer paint variations normal for mass-produced PVC figures are not grounds for a refund.
              </p>
            </div>
          </section>

          {/* Section 2: Mandatory Unboxing Video Requirement */}
          <section className="p-6 rounded-2xl bg-[#140F0B]/90 border border-amber-900/30">
            <h2 className="text-base sm:text-lg font-black text-[#E8C36A] mb-3 flex items-center gap-2">
              <span>2.</span> Mandatory Unboxing Video Requirement
            </h2>
            <div className="space-y-3">
              <p>
                To prevent fraudulent claims and ensure objective dispute resolution, buyers claiming physical damage or counterfeit substitutions <strong className="text-white">must submit a single, continuous, uncut unboxing video</strong>.
              </p>
              <div className="p-4 rounded-xl bg-[#1A1410] border border-stone-800 space-y-2 text-xs text-stone-300">
                <p className="font-bold text-amber-300 m-0">The unboxing video must clearly depict:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>The Shiprocket shipping label and AWB tracking barcode prior to opening the outer box.</li>
                  <li>All 6 sides of the unopened shipping parcel showing seals intact.</li>
                  <li>The opening of the box, removal of bubble wrap, and initial inspection of the figure&apos;s seals and parts.</li>
                  <li>Clear visual focus on the claimed defect or broken joint.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Section 3: Reverse Logistics & Pickup */}
          <section className="p-6 rounded-2xl bg-[#140F0B]/90 border border-amber-900/30">
            <h2 className="text-base sm:text-lg font-black text-[#E8C36A] mb-3 flex items-center gap-2">
              <span>3.</span> Shiprocket Reverse Logistics
            </h2>
            <p>
              Once a dispute is validated by our arbitration team, an automated reverse pickup is generated through <strong className="text-white">Shiprocket</strong>. The courier will collect the package directly from your address. The item must be returned in the same condition with all original packaging, foam inserts, and accessories.
            </p>
          </section>

          {/* Section 4: Razorpay Refund Processing & Timelines */}
          <section className="p-6 rounded-2xl bg-[#140F0B]/90 border border-amber-900/30">
            <h2 className="text-base sm:text-lg font-black text-[#E8C36A] mb-3 flex items-center gap-2">
              <span>4.</span> Razorpay Escrow Reversal & Payout Timeline
            </h2>
            <div className="space-y-3">
              <p>
                As soon as the reverse shipment is confirmed in transit by Shiprocket, our system issues a full refund reversal command to <strong className="text-white">Razorpay</strong>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-[#1A1410] border border-stone-800">
                  <h3 className="text-xs font-black uppercase text-[#F85B1A] mb-1">
                    UPI & NetBanking
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed m-0">
                    Direct reversals to your originating VPA / bank account settle within <strong className="text-white">2 to 4 business hours</strong>.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#1A1410] border border-stone-800">
                  <h3 className="text-xs font-black uppercase text-[#F85B1A] mb-1">
                    Credit / Debit Cards
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed m-0">
                    Card issuers typically reflect the credit on your billing statement within <strong className="text-white">3 to 7 business days</strong>.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Centralized Contact Support Footer */}
        <LegalSupportFooter />
      </div>
    </div>
  );
}
