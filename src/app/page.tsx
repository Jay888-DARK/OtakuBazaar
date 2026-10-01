import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import VaultHero from '@/presentation/components/home/VaultHero';
import { CatalogView } from '@/presentation/components/home/CatalogView';
import { VisualCategoryBar } from '@/presentation/components/navigation/VisualCategoryBar';
import { CuratedEditorialCollection } from '@/presentation/components/home/CuratedEditorialCollection';

export const metadata: Metadata = {
  title: 'OtakuBazaar — Authentic Japanese Collectibles & Escrow Marketplace',
  description:
    'Direct Indian anime collectibles marketplace. Authenticated scale figures, manga sets, and rare grails backed by 48-hour inspection escrow protection.',
};

export default async function HomePage(props?: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedParams = props?.searchParams ? await props.searchParams : {};
  const query = typeof resolvedParams.q === 'string'
    ? resolvedParams.q
    : typeof resolvedParams.search === 'string'
    ? resolvedParams.search
    : '';

  if (query.trim()) {
    redirect(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* 1. Visual Category Navigation */}
      <VisualCategoryBar />

      {/* 2. Hero Exhibition */}
      <VaultHero />

      {/* 3. Primary Featured Collection: The Berserk Collection */}
      <CuratedEditorialCollection />

      {/* 4. Interactive Marketplace Catalog View */}
      <CatalogView />

      {/* Buyer Protection & Escrow Section (#escrow-vault) */}
      <section id="escrow-vault" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 select-none">
        <div className="bg-[#0c0c0e] border border-[#27272a]">
          {/* Section Masthead */}
          <div className="p-6 sm:p-10 border-b border-[#27272a] bg-[#0a0a0c]">
            <span className="text-[10px] font-bold tracking-[0.25em] text-zinc-500 uppercase block mb-1">
              Buyer Protection • Secure Escrow
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100 uppercase tracking-tight leading-none">
              Authenticity Guarantee &amp; 48-Hour Inspection Period
            </h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-2xl leading-relaxed font-sans">
              100% authentic guaranteed. Your payment is held safely in escrow until you receive and inspect your item.
            </p>
          </div>

          {/* Stark 2-Up Editorial Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#27272a]">
            {/* Primary Dominant Hero Block: Step 01 */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#27272a] bg-[#09090b]">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 border border-[#27272a] bg-[#111114] px-2.5 py-1 font-bold">
                    STEP 01
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold">
                    Order Protection • Reserve Lock
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-zinc-100 mb-2">
                  15-Minute Reservation Lock
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-xl font-sans">
                  When your order begins, the item is reserved exclusively for you for 15 minutes while you complete payment into secure escrow.
                </p>
              </div>

              {/* Protection Indicators */}
              <div className="mt-8 pt-6 border-t border-[#27272a] grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border border-[#27272a] bg-[#0c0c0e] p-3">
                  <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Lock Duration</span>
                  <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider block mt-0.5">15 Minutes</span>
                </div>
                <div className="border border-[#27272a] bg-[#0c0c0e] p-3">
                  <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Payment Security</span>
                  <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider block mt-0.5">Escrow Protected</span>
                </div>
                <div className="border border-[#27272a] bg-[#0c0c0e] p-3">
                  <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Refund Policy</span>
                  <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider block mt-0.5">100% Refundable</span>
                </div>
              </div>
            </div>

            {/* Secondary Stacked Column: Step 02 & Step 03 */}
            <div className="lg:col-span-5 flex flex-col divide-y divide-[#27272a] bg-[#0e0e11]">
              {/* Step 02 */}
              <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 border border-[#27272a] bg-[#111114] px-2 py-0.5 font-bold">
                      STEP 02
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                      Insured Shipping
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold uppercase tracking-tight text-zinc-200 mb-1.5">
                    Tracked Express Delivery
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    Packed securely with collector-grade bubble wrap and shipped via insured express courier with real-time end-to-end tracking.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                  <span>Transit Insurance</span>
                  <span className="text-zinc-300 font-bold">Covered In Full</span>
                </div>
              </div>

              {/* Step 03 */}
              <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 border border-[#27272a] bg-[#111114] px-2 py-0.5 font-bold">
                      STEP 03
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                      Delivery &amp; Approval
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold uppercase tracking-tight text-zinc-200 mb-1.5">
                    48-Hour Inspection Window
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    Inspect your collectible when it arrives. Satisfied? Funds are released to the seller. Disputed? Get a 100% refund.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                  <span>Inspection Window</span>
                  <span className="text-zinc-300 font-bold">48 Hours Post-Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Footer */}
      <footer className="mt-20 py-12 px-4 sm:px-6 lg:px-8 text-center text-xs border-t border-zinc-800 text-zinc-500 bg-[#09090b]">
        <p className="text-xs mb-2 font-bold text-zinc-200 uppercase tracking-[0.25em]">
          OtakuBazaar Collectibles
        </p>
        <p className="mb-4 text-[11px] uppercase tracking-wider text-zinc-500">
          Direct Indian Anime Collectibles Marketplace • Secure Payment Protected
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium uppercase tracking-wider">
          <Link href="/vault" className="hover:text-zinc-300 transition-none no-underline text-zinc-400 brutalist-btn p-0.5">
            [ Collection ]
          </Link>
          <span>•</span>
          <Link href="/verify" className="hover:text-zinc-300 transition-none no-underline text-zinc-400 brutalist-btn p-0.5">
            [ Authenticate ]
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-zinc-300 transition-none no-underline text-zinc-500">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-zinc-300 transition-none no-underline text-zinc-500">
            Terms of Service
          </Link>
        </div>
      </footer>
    </main>
  );
}