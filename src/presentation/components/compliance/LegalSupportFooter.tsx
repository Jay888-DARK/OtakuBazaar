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
      className="mt-12 border border-zinc-800 bg-[#0e0e11] p-6 sm:p-8 text-zinc-100"
    >
      <div className="flex flex-col lg:flex-row gap-8 justify-between items-start">
        {/* Company & Support Overview */}
        <div className="max-w-md space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-[#E8C36A] uppercase px-2 py-0.5 border border-zinc-700 bg-zinc-900">
              DESK
            </span>
            <h2 className="text-base sm:text-lg font-extrabold tracking-[0.15em] text-zinc-100 uppercase m-0">
              OtakuBazaar Support Desk
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
            OtakuBazaar operates as a verified collector marketplace featuring 15-minute concurrency locks, 48-hour inspection escrow vaults, and insured end-to-end logistics.
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold bg-zinc-900 border border-zinc-700 text-zinc-300">
              <span className="w-2 h-2 bg-emerald-500" aria-hidden="true" />
              Razorpay Escrow Verified
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold bg-zinc-900 border border-zinc-700 text-zinc-300">
              <span className="w-2 h-2 bg-amber-500" aria-hidden="true" />
              Shiprocket Insured Transit
            </span>
          </div>
        </div>

        {/* Business Details & Grievance Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full lg:w-auto text-xs text-zinc-400">
          {/* Business Entity Details */}
          <div className="space-y-1.5 bg-[#111114] p-4 border border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 m-0">
              Registered Corporate Entity
            </h3>
            <p className="font-semibold text-zinc-100 m-0">
              OtakuBazaar Technologies Pvt. Ltd.
            </p>
            <p className="text-zinc-400 m-0 leading-relaxed">
              4th Floor, Akihabara Gateway Arcade,<br />
              100-Ft Road, Indiranagar,<br />
              Bengaluru, Karnataka 560038, India
            </p>
            <p className="text-[11px] text-zinc-500 pt-1 m-0 uppercase tracking-wider">
              CIN: U72900KA2026PTC184920
            </p>
          </div>

          {/* Grievance & Support Contacts */}
          <div className="space-y-1.5 bg-[#111114] p-4 border border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 m-0">
              Contact & Grievance Redressal
            </h3>
            <p className="m-0">
              <strong className="text-zinc-100">Customer Support:</strong>{' '}
              <a
                href="mailto:support@otakubazaar.com"
                className="text-zinc-300 hover:text-white underline font-medium focus-visible:outline-none px-0.5"
                aria-label="Email Customer Support at support@otakubazaar.com"
              >
                support@otakubazaar.com
              </a>
            </p>
            <p className="m-0">
              <strong className="text-zinc-100">Grievance Officer:</strong>{' '}
              <span className="text-zinc-400">Haruki Tanaka</span>
            </p>
            <p className="m-0">
              <strong className="text-zinc-100">Grievance Desk:</strong>{' '}
              <a
                href="mailto:grievance@otakubazaar.com"
                className="text-zinc-300 hover:text-white underline font-medium focus-visible:outline-none px-0.5"
                aria-label="Email Grievance Officer at grievance@otakubazaar.com"
              >
                grievance@otakubazaar.com
              </a>
            </p>
            <p className="text-[11px] text-zinc-500 pt-1 m-0 uppercase tracking-wider">
              Response Turnaround: Within 24-48 Business Hours
            </p>
          </div>
        </div>
      </div>

      {/* Cross-Legal Links */}
      <div className="mt-6 pt-5 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-zinc-400">
          <Link
            href="/legal/privacy"
            className="hover:text-zinc-100 transition-colors uppercase tracking-wider text-[11px] font-medium"
            aria-label="Navigate to Privacy Policy"
          >
            Privacy Policy
          </Link>
          <span>•</span>
          <Link
            href="/legal/terms"
            className="hover:text-zinc-100 transition-colors uppercase tracking-wider text-[11px] font-medium"
            aria-label="Navigate to Terms of Service"
          >
            Terms of Service
          </Link>
          <span>•</span>
          <Link
            href="/legal/refunds"
            className="hover:text-zinc-100 transition-colors uppercase tracking-wider text-[11px] font-medium"
            aria-label="Navigate to Refund and Escrow Policy"
          >
            Refund & Escrow Policy
          </Link>
        </div>

        <span className="text-[11px] text-zinc-500 uppercase tracking-widest">
          © {new Date().getFullYear()} OtakuBazaar Technologies Pvt. Ltd. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

export default LegalSupportFooter;
