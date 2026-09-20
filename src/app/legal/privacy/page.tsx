/**
 * @file src/app/legal/privacy/page.tsx
 *
 * Privacy Policy & Data Protection Charter for OtakuBazaar.
 * Styled with Japanese Cypress Dark-Wood Craftsman Aesthetic (#0a0806, #140F0B, #F85B1A).
 * 
 * Compliance Mandates:
 * - Explicit affirmation that user data is NEVER sold to third parties.
 * - Integration specifics for Razorpay (escrow payment aggregator) and Shiprocket (logistics provider).
 * - Cryptographic session and cookie management.
 * - Centralized Support & Grievance Footer.
 */

import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { LegalSupportFooter } from '@/presentation/components/compliance/LegalSupportFooter';

export const metadata: Metadata = {
  title: 'Privacy Policy — OtakuBazaar Escrow Marketplace',
  description:
    'OtakuBazaar data handling policy, session authentication, double-entry escrow records, Razorpay payment processing, and Shiprocket logistics protection.',
};

export default function PrivacyPolicyPage() {
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
              Legal & Privacy Charter
            </span>
            <span className="text-xs text-stone-400 font-mono">
              Last Updated: March 2026 • Production Edition
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 uppercase tracking-wider mb-3">
            Privacy Policy & Data Sovereignty
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
            OtakuBazaar is engineered to protect collector anonymity and transactional integrity. We uphold the strictest standards of data minimization, transparent processing, and zero third-party data monetization.
          </p>
        </header>

        {/* Policy Content Sections */}
        <div className="space-y-6 text-sm text-stone-200 leading-relaxed">
          {/* Strict Data Sharing Guarantee Banner */}
          <section className="p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/20 shadow-lg">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xl" aria-hidden="true">🛡️</span>
              <h2 className="text-base sm:text-lg font-black text-emerald-300 m-0">
                Data Sharing Constraint: We Never Sell Your Data
              </h2>
            </div>
            <p className="text-stone-200 m-0 leading-relaxed">
              <strong>OtakuBazaar does not sell, rent, license, or monetize your personal data to advertisers, data brokers, or third parties under any circumstances.</strong> Personal information is strictly utilized to authenticate your identity, facilitate peer-to-peer escrow settlements, schedule verified couriers, and arbitrate physical inspection disputes.
            </p>
          </section>

          {/* Section 1: Information We Collect */}
          <section className="p-6 rounded-2xl bg-[#140F0B]/90 border border-amber-900/30">
            <h2 className="text-base sm:text-lg font-black text-[#E8C36A] mb-3 flex items-center gap-2">
              <span>1.</span> Information We Collect
            </h2>
            <div className="space-y-3">
              <p>
                We minimize data collection to what is essential to secure authentic anime collectible trades:
              </p>
              <ul className="list-disc list-inside space-y-2 text-stone-300 pl-2">
                <li>
                  <strong className="text-white">Account & Profile Identity:</strong> OAuth authentication records provided through NextAuth (Discord, Google) including name, avatar, and email address.
                </li>
                <li>
                  <strong className="text-white">Escrow & Transaction Data:</strong> Double-entry ledger entries, negotiated offer amounts, 15-minute checkout reservation locks, and cryptographic order tokens.
                </li>
                <li>
                  <strong className="text-white">Dispute Verification Media:</strong> Unboxing inspection videos, photos, and condition assessments submitted during the 48-hour escrow window.
                </li>
                <li>
                  <strong className="text-white">Collector Communication:</strong> Real-time post-bid messages exchanged between buyers and sellers within the platform chat.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Third-Party Service Providers */}
          <section className="p-6 rounded-2xl bg-[#140F0B]/90 border border-amber-900/30">
            <h2 className="text-base sm:text-lg font-black text-[#E8C36A] mb-3 flex items-center gap-2">
              <span>2.</span> Integrated Infrastructure: Razorpay & Shiprocket
            </h2>
            <div className="space-y-3">
              <p>
                To provide institutional-grade escrow and secure fulfillment, OtakuBazaar integrates with regulated external service partners:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#1A1410] border border-stone-800">
                  <h3 className="text-xs font-black uppercase text-[#F85B1A] mb-1">
                    Razorpay Payment Aggregator
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed m-0">
                    Payment processing, UPI payouts, and escrow fund holding are handled via PCI-DSS compliant Razorpay APIs. OtakuBazaar never stores raw credit card details or bank account passwords on internal servers.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#1A1410] border border-stone-800">
                  <h3 className="text-xs font-black uppercase text-[#F85B1A] mb-1">
                    Shiprocket Logistics Network
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed m-0">
                    Insured shipping labels, courier tracking AWBs, and automated reverse pickup for verified dispute returns are orchestrated through Shiprocket. Only delivery address and contact name are transmitted to fulfill transit.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Cookies & Consent Architecture */}
          <section className="p-6 rounded-2xl bg-[#140F0B]/90 border border-amber-900/30">
            <h2 className="text-base sm:text-lg font-black text-[#E8C36A] mb-3 flex items-center gap-2">
              <span>3.</span> Cookies & Tracking Consent
            </h2>
            <p>
              OtakuBazaar utilizes cookies solely for essential session integrity, concurrent reservation lock prevention, and user preference storage (such as theme and Katana sound effects). We adhere to explicit opt-in standards: analytical cookies require your express &apos;Accept&apos; choice via our compliance banner. You may decline non-essential cookies without losing access to browse or purchase.
            </p>
          </section>

          {/* Section 4: User Data Deletion & The Right to be Forgotten */}
          <section className="p-6 rounded-2xl bg-[#140F0B]/90 border border-amber-900/30">
            <h2 className="text-base sm:text-lg font-black text-[#E8C36A] mb-3 flex items-center gap-2">
              <span>4.</span> Data Deletion & Permanent Erasure
            </h2>
            <p>
              Every collector has the unencumbered right to request permanent erasure of their account data. Initiating the &apos;Delete Account Data&apos; procedure from the Settings Modal or Profile Hub executes an atomic deletion across our PostgreSQL database, wiping chat history, session tokens, and personal credentials in compliance with applicable data protection laws.
            </p>
          </section>
        </div>

        {/* Centralized Contact Support Footer */}
        <LegalSupportFooter />
      </div>
    </div>
  );
}
