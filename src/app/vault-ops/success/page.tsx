'use client';

/**
 * @file src/app/vault-ops/success/page.tsx
 *
 * Clean Vault & Escrow Success Confirmation Page.
 * Displays confirmed order ID, cryptographic escrow lock verification,
 * and 48-hour buyer inspection protection.
 */

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || 'ORD-VERIFIED';

  return (
    <div
      className="max-w-2xl mx-auto border border-[#27272a] bg-[#0c0c0e] p-6 sm:p-10 space-y-8 select-none"
      style={{ fontFamily: "'Satoshi', sans-serif" }}
    >
      {/* Masthead */}
      <div className="border-b border-[#27272a] pb-6">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#A3A3A3] font-medium block mb-2">
          PAYMENT VERIFIED • ESCROW LOCKED
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white leading-tight">
          Acquisition Confirmed
        </h1>
        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          Your payment is held safely in escrow. The seller has been instructed to ship via tracked express courier.
        </p>
      </div>

      {/* Ledger Breakdown */}
      <div className="border border-[#27272a] bg-[#09090b] divide-y divide-[#1f1f23] text-xs uppercase tracking-wide">
        <div className="flex justify-between items-center p-4">
          <span className="text-zinc-500 font-medium">ORDER REFERENCE</span>
          <span className="text-white font-bold font-mono">{orderId}</span>
        </div>
        <div className="flex justify-between items-center p-4">
          <span className="text-zinc-500 font-medium">ESCROW PROTOCOL</span>
          <span className="text-emerald-400 font-bold">ACTIVE (48-HR INSPECTION)</span>
        </div>
        <div className="flex justify-between items-center p-4">
          <span className="text-zinc-500 font-medium">AUTHENTICITY</span>
          <span className="text-white font-bold">100% PRE-INSPECTED JAPANESE IMPORT</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <Link
          href="/"
          className="flex-1 py-3.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-[0.2em] text-center border border-white transition-none no-underline"
          style={{ borderRadius: '0px' }}
        >
          [ CONTINUE BROWSING ]
        </Link>
        <Link
          href="/#catalog"
          className="flex-1 py-3.5 bg-[#111114] hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-[0.2em] text-center border border-[#27272a] transition-none no-underline"
          style={{ borderRadius: '0px' }}
        >
          [ EXPLORE CATALOG ]
        </Link>
      </div>
    </div>
  );
}

export default function VaultSuccessPage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4 sm:p-8">
      <Suspense fallback={<div className="text-xs text-zinc-500 uppercase tracking-widest">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
