import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import VaultHero from '@/presentation/components/home/VaultHero';
import FeaturedGrailSpotlight from '@/presentation/components/home/FeaturedGrailSpotlight';
import { CatalogView } from '@/presentation/components/home/CatalogView';

export const metadata: Metadata = {
  title: 'OtakuBazaar — Authentic Japanese Collectibles & Escrow Marketplace',
  description:
    'Direct Indian anime collectibles marketplace. Authenticated scale figures, manga sets, and rare grails backed by 48-hour inspection escrow protection.',
};

export default function HomePage(_props?: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* 3D Kinetic Vault Exhibition Hero */}
      <VaultHero />

      {/* Featured Grail Spotlight (3D Depth Card Spotlight with Escrow Bargain Modal) */}
      <FeaturedGrailSpotlight />

      {/* Interactive Marketplace Catalog View (Client Component) */}
      <CatalogView />

      {/* Escrow Trust Vault Section (#escrow-vault) */}
      <section id="escrow-vault" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-[#0e0e10] border border-zinc-800/80 rounded-2xl p-8 sm:p-10">
          <div className="mb-8">
            <span className="text-[10px] font-mono tracking-[0.25em] text-zinc-500 uppercase block mb-1">
              Consumer Protection Shield
            </span>
            <h2 className="text-base font-mono font-bold text-zinc-100 uppercase tracking-wide">
              Authenticity Vault & 48-Hour Inspection Escrow
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Zero bootleg risk. Funds are held in double-entry escrow until physical unboxing and holographic verification concludes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
            <div className="bg-[#121214] border border-zinc-800/80 rounded-xl p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 rounded inline-block mb-3">
                STEP 01
              </span>
              <h3 className="text-xs font-bold uppercase mb-1.5 text-zinc-200">
                15-Minute Safe Lock
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When the seller accepts your offer, the item is exclusively locked for 15 minutes. UPI payment is deposited directly into the escrow vault.
              </p>
            </div>

            <div className="bg-[#121214] border border-zinc-800/80 rounded-xl p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 rounded inline-block mb-3">
                STEP 02
              </span>
              <h3 className="text-xs font-bold uppercase mb-1.5 text-zinc-200">
                Inspected Express Dispatch
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Seller packs with collector-grade bubble wrap and ships via insured express courier with real-time end-to-end telemetry.
              </p>
            </div>

            <div className="bg-[#121214] border border-zinc-800/80 rounded-xl p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 rounded inline-block mb-3">
                STEP 03
              </span>
              <h3 className="text-xs font-bold uppercase mb-1.5 text-zinc-200">
                48-Hour Unboxing Protection
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Inspect manufacturer holographic seals and figure joints. Satisfied? Funds disburse to the seller. Disputed? 100% refund guaranteed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Footer */}
      <footer className="mt-20 py-10 px-4 sm:px-6 lg:px-8 text-center text-xs border-t border-zinc-800/60 text-zinc-500">
        <p className="text-sm mb-2 font-bold font-mono text-zinc-300 uppercase tracking-wider">
          OtakuBazaar
        </p>
        <p className="mb-3 text-[11px] font-mono">Direct Indian Anime Collectibles Marketplace • Double-Entry Escrow Protected</p>
        <div className="flex items-center justify-center gap-4 text-[11px] font-medium font-mono">
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors no-underline text-zinc-500">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-zinc-300 transition-colors no-underline text-zinc-500">
            Terms of Service
          </Link>
        </div>
      </footer>
    </main>
  );
}