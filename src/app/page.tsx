import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import VaultHero from '@/presentation/components/home/VaultHero';
import FeaturedGrailSpotlight from '@/presentation/components/home/FeaturedGrailSpotlight';
import { CatalogView } from '@/presentation/components/home/CatalogView';
import { VisualCategoryBar } from '@/presentation/components/navigation/VisualCategoryBar';
import { CuratedEditorialCollection } from '@/presentation/components/home/CuratedEditorialCollection';

export const metadata: Metadata = {
  title: 'OtakuBazaar — Authentic Japanese Collectibles & Escrow Marketplace',
  description:
    'Direct Indian anime collectibles marketplace. Authenticated scale figures, manga sets, and rare grails backed by 48-hour inspection escrow protection.',
};

export default function HomePage(_props?: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* 1. Visual Category Navigation: Horizontally scrollable square photography bar directly below sticky header */}
      <VisualCategoryBar />

      {/* 3D Kinetic Vault Exhibition Hero */}
      <VaultHero />

      {/* 3. Curated Editorial Drop: The Berserk Archive (Asymmetrical layout, no Bento, no 3 cards in a row) */}
      <CuratedEditorialCollection />

      {/* Featured Grail Spotlight (3D Depth Card Spotlight with Escrow Bargain Modal) */}
      <FeaturedGrailSpotlight />

      {/* Interactive Marketplace Catalog View (Client Component with Skeletons & Filter Pills) */}
      <CatalogView />

      {/* Escrow Trust Vault Section (#escrow-vault) */}
      <section id="escrow-vault" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 select-none">
        <div className="bg-[#0c0c0e] border border-[#27272a]">
          {/* Editorial Section Masthead */}
          <div className="p-6 sm:p-10 border-b border-[#27272a] bg-[#0a0a0c]">
            <span className="text-[10px] font-bold tracking-[0.25em] text-zinc-500 uppercase block mb-1">
              Consumer Protection Shield • Protocol Escrow
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100 uppercase tracking-tight leading-none">
              Authenticity Vault &amp; 48-Hour Inspection Escrow
            </h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-2xl leading-relaxed font-sans">
              Zero bootleg risk. Funds are held in double-entry escrow until physical unboxing and holographic verification concludes.
            </p>
          </div>

          {/* Stark Disproportionate 2-Up Editorial Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#27272a]">
            {/* Primary Dominant Hero Block: Step 01 */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#27272a] bg-[#09090b]">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 border border-[#27272a] bg-[#111114] px-2.5 py-1 font-bold">
                    STEP 01
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold">
                    Acquisition Gate • Safe Lock
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-zinc-100 mb-2">
                  15-Minute Safe Lock
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-xl font-sans">
                  When the seller accepts your offer, the item is exclusively locked for 15 minutes. UPI payment is deposited directly into the escrow vault.
                </p>
              </div>

              {/* Protocol Telemetry Indicators */}
              <div className="mt-8 pt-6 border-t border-[#27272a] grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border border-[#27272a] bg-[#0c0c0e] p-3">
                  <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Lock Duration</span>
                  <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider block mt-0.5">15 Minutes</span>
                </div>
                <div className="border border-[#27272a] bg-[#0c0c0e] p-3">
                  <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Vault Security</span>
                  <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider block mt-0.5">Double-Entry</span>
                </div>
                <div className="border border-[#27272a] bg-[#0c0c0e] p-3">
                  <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Reversibility</span>
                  <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider block mt-0.5">100% Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Secondary Stacked Editorial Column: Step 02 & Step 03 */}
            <div className="lg:col-span-5 flex flex-col divide-y divide-[#27272a] bg-[#0e0e11]">
              {/* Stacked Block 01: Step 02 */}
              <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 border border-[#27272a] bg-[#111114] px-2 py-0.5 font-bold">
                      STEP 02
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                      Logistics Telemetry
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold uppercase tracking-tight text-zinc-200 mb-1.5">
                    Inspected Express Dispatch
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    Seller packs with collector-grade bubble wrap and ships via insured express courier with real-time end-to-end telemetry.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                  <span>Transit Insurance</span>
                  <span className="text-zinc-300 font-bold">Covered In Full</span>
                </div>
              </div>

              {/* Stacked Block 02: Step 03 */}
              <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 border border-[#27272a] bg-[#111114] px-2 py-0.5 font-bold">
                      STEP 03
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                      Custody Release
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold uppercase tracking-tight text-zinc-200 mb-1.5">
                    48-Hour Unboxing Protection
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    Inspect manufacturer holographic seals and figure joints. Satisfied? Funds disburse to the seller. Disputed? 100% refund guaranteed.
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
          OtakuBazaar Archival Repository
        </p>
        <p className="mb-4 text-[11px] uppercase tracking-wider text-zinc-500">
          Direct Indian Anime Collectibles Marketplace • Double-Entry Escrow Protected
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium uppercase tracking-wider">
          <Link href="/vault" className="hover:text-zinc-300 transition-none no-underline text-zinc-400 brutalist-btn p-0.5">
            [ Vault Custody ]
          </Link>
          <span>•</span>
          <Link href="/verify" className="hover:text-zinc-300 transition-none no-underline text-zinc-400 brutalist-btn p-0.5">
            [ Hardware NFC Verify ]
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