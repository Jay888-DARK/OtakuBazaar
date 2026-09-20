/**
 * @file src/presentation/components/compliance/LegalSupportFooter.tsx
 *
 * Reusable Contact Support & Business Information block for legal pages.
 * Complies with Indian E-Commerce, IT Rules, and payment aggregator requirements:
 * - Registered Corporate Entity Name & Address
 * - Grievance Officer contact details
 * - Support desk email & response turnaround times
 * - Integrated payment and logistics escrow notices
 */

import React from 'react';
import Link from 'next/link';

export function LegalSupportFooter(): React.JSX.Element {
  return (
    <footer
      role="contentinfo"
      aria-label="Legal and Customer Support Information"
      className="mt-12 rounded-2xl border border-amber-900/40 bg-[#140F0B]/95 p-6 sm:p-8 backdrop-blur-md shadow-2xl text-[#F0E8DA]"
      style={{
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.85), 0 0 25px rgba(201, 148, 62, 0.15)',
      }}
    >
      <div className="flex flex-col lg:flex-row gap-8 justify-between items-start">
        {/* Company & Support Overview */}
        <div className="max-w-md space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">⛩️</span>
            <h2 className="font-mono text-base sm:text-lg font-bold tracking-wider text-zinc-100 uppercase m-0">
              OtakuBazaar Support Desk
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            OtakuBazaar operates as a verified collector marketplace featuring 15-minute concurrency locks, 48-hour inspection escrow vaults, and insured end-to-end logistics.
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-stone-900/80 border border-stone-700 text-stone-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
              Razorpay Escrow Verified
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-stone-900/80 border border-stone-700 text-stone-300">
              <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
              Shiprocket Insured Transit
            </span>
          </div>
        </div>

        {/* Business Details & Grievance Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full lg:w-auto text-xs text-stone-300">
          {/* Business Entity Details */}
          <div className="space-y-1.5 bg-[#1A1410]/80 p-4 rounded-xl border border-stone-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#C9943E] m-0">
              Registered Corporate Entity
            </h3>
            <p className="font-semibold text-white m-0">
              OtakuBazaar Technologies Pvt. Ltd.
            </p>
            <p className="text-stone-300 m-0 leading-relaxed">
              4th Floor, Akihabara Gateway Arcade,<br />
              100-Ft Road, Indiranagar,<br />
              Bengaluru, Karnataka 560038, India
            </p>
            <p className="text-[11px] font-mono text-stone-400 pt-1 m-0">
              CIN: U72900KA2026PTC184920
            </p>
          </div>

          {/* Grievance & Support Contacts */}
          <div className="space-y-1.5 bg-[#1A1410]/80 p-4 rounded-xl border border-stone-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#C9943E] m-0">
              Contact & Grievance Redressal
            </h3>
            <p className="m-0">
              <strong className="text-white">Customer Support:</strong>{' '}
              <a
                href="mailto:support@otakubazaar.com"
                className="text-[#F85B1A] hover:text-amber-300 underline font-medium focus-visible:ring-2 focus-visible:ring-[#F85B1A] focus-visible:outline-none rounded px-0.5"
                aria-label="Email Customer Support at support@otakubazaar.com"
              >
                support@otakubazaar.com
              </a>
            </p>
            <p className="m-0">
              <strong className="text-white">Grievance Officer:</strong>{' '}
              <span className="text-stone-300">Haruki Tanaka</span>
            </p>
            <p className="m-0">
              <strong className="text-white">Grievance Desk:</strong>{' '}
              <a
                href="mailto:grievance@otakubazaar.com"
                className="text-[#F85B1A] hover:text-amber-300 underline font-medium focus-visible:ring-2 focus-visible:ring-[#F85B1A] focus-visible:outline-none rounded px-0.5"
                aria-label="Email Grievance Officer at grievance@otakubazaar.com"
              >
                grievance@otakubazaar.com
              </a>
            </p>
            <p className="text-[11px] text-stone-400 pt-1 m-0">
              Response Turnaround: Within 24-48 Business Hours
            </p>
          </div>
        </div>
      </div>

      {/* Cross-Legal Links */}
      <div className="mt-6 pt-5 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-stone-400">
          <Link
            href="/legal/privacy"
            className="hover:text-[#E8C36A] transition-colors focus-visible:ring-2 focus-visible:ring-[#F85B1A] focus-visible:outline-none rounded px-1"
            aria-label="Navigate to Privacy Policy"
          >
            Privacy Policy
          </Link>
          <span>•</span>
          <Link
            href="/legal/terms"
            className="hover:text-[#E8C36A] transition-colors focus-visible:ring-2 focus-visible:ring-[#F85B1A] focus-visible:outline-none rounded px-1"
            aria-label="Navigate to Terms of Service"
          >
            Terms of Service
          </Link>
          <span>•</span>
          <Link
            href="/legal/refunds"
            className="hover:text-[#E8C36A] transition-colors focus-visible:ring-2 focus-visible:ring-[#F85B1A] focus-visible:outline-none rounded px-1"
            aria-label="Navigate to Refund and Escrow Policy"
          >
            Refund & Escrow Policy
          </Link>
        </div>

        <span className="text-[11px] text-stone-400 font-mono">
          © {new Date().getFullYear()} OtakuBazaar Technologies Pvt. Ltd. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

export default LegalSupportFooter;
