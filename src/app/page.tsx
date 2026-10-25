import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import VaultHero from '@/presentation/components/home/VaultHero';
import { MarketplaceFilterNav } from '@/presentation/components/navigation/MarketplaceFilterNav';
import { ArchivalMerchandisingBanners } from '@/presentation/components/home/ArchivalMerchandisingBanners';
import { CatalogView } from '@/presentation/components/home/CatalogView';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';

export const metadata: Metadata = {
  title: 'OtakuBazaar — Escrow-Authenticated Japanese Archival Marketplace',
  description:
    'Direct Japanese scale figures, statues, and rare grails backed by 48-hour inspection escrow protection and climate-controlled Tokyo vault custody.',
};

export default async function HomePage(props?: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = props?.searchParams ? await props.searchParams : {};
  const query =
    typeof resolvedParams.q === 'string'
      ? resolvedParams.q
      : typeof resolvedParams.search === 'string'
      ? resolvedParams.search
      : '';

  if (query.trim()) {
    redirect(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#F2EFE9]">
      {/* STAGE 1: Full-Viewport Hero Animation */}
      <VaultHero />

      {/* STAGE 2: Scroll-Revealed Criteria, Curated Collections & Catalog */}
      <div id="stage-2" className="relative w-full bg-[#080808]">
        {/* 1. Sticky Criteria & Category Bar (pins below 80px navbar at top-20) */}
        <MarketplaceFilterNav />

        {/* 2. 4-Column Curated Archival Merchandising Banners */}
        <ArchivalMerchandisingBanners />

        {/* 3. Main Catalog Layout (Left 260px Facet Sidebar + Right 4-Column Product Grid) */}
        <CatalogView />

        {/* Buyer Protection & Escrow Section */}
        <section id="escrow-vault" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-20 select-none">
          <div className="bg-[#0C0C0C] border border-[#1F1F1F]">
            {/* Section Masthead */}
            <div className="p-6 sm:p-8 border-b border-[#1F1F1F] bg-[#080808]">
              <span className="block mb-1.5 font-sans text-[10px] tracking-[0.15em] text-[#777777] uppercase font-semibold">
                BUYER PROTECTION • CUSTODIAL ESCROW
              </span>
              <h2 className="font-serif text-[24px] sm:text-[28px] text-[#F2EFE9] uppercase tracking-[0.06em] leading-tight">
                Authenticity Guarantee &amp; 48-Hour Inspection Period
              </h2>
              <p className="mt-2 max-w-2xl font-sans text-[13px] text-[#8E8E8E] leading-relaxed">
                100% authentic Japanese collectibles guaranteed. Your payment is held safely in escrow until you physically receive and inspect your specimen.
              </p>
            </div>

            {/* Stark 2-Up Editorial Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#161616]">
              {/* Primary Dominant Hero Block: Step 01 */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 border-[#1F1F1F] bg-[#080808]">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-[#F2EFE9] border border-[#1F1F1F] bg-[#0C0C0C] px-2.5 py-1 font-sans text-[10px] tracking-[0.15em] uppercase font-semibold">
                      STEP 01
                    </span>
                    <span className="font-sans text-[10px] tracking-[0.15em] text-[#777777] uppercase font-semibold">
                      ORDER PROTECTION • RESERVE LOCK
                    </span>
                  </div>
                  <h3 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.06em] mb-2">
                    15-Minute Reservation Lock
                  </h3>
                  <p className="max-w-xl font-sans text-[13px] text-[#8E8E8E] leading-relaxed">
                    When checkout begins, the lot is reserved exclusively for you for 15 minutes while payment is verified into secure custodial escrow.
                  </p>
                </div>

                {/* Protection Indicators */}
                <div className="mt-8 pt-6 border-t border-[#161616] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-3">
                    <span className="block font-sans text-[10px] tracking-[0.15em] text-[#777777] uppercase font-semibold">
                      LOCK DURATION
                    </span>
                    <span className="text-[#F2EFE9] block mt-1 font-sans text-[11px] tracking-[0.08em] uppercase font-medium">
                      15 MINUTES
                    </span>
                  </div>
                  <div className="border border-[#193829] bg-[#091812] p-3">
                    <span className="block font-sans text-[10px] tracking-[0.15em] text-[#10B981] uppercase font-semibold">
                      ESCROW STATUS
                    </span>
                    <span className="text-[#10B981] block mt-1 font-sans text-[11px] tracking-[0.08em] uppercase font-bold">
                      ESCROW PROTECTED
                    </span>
                  </div>
                  <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-3">
                    <span className="block font-sans text-[10px] tracking-[0.15em] text-[#777777] uppercase font-semibold">
                      REFUND POLICY
                    </span>
                    <span className="text-[#F2EFE9] block mt-1 font-sans text-[11px] tracking-[0.08em] uppercase font-medium">
                      100% REFUNDABLE
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Stacked Column: Step 02 & Step 03 */}
              <div className="lg:col-span-5 flex flex-col divide-y divide-[#161616] bg-[#0C0C0C]">
                {/* Step 02 */}
                <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <span className="text-[#F2EFE9] border border-[#1F1F1F] bg-[#080808] px-2.5 py-0.5 font-sans text-[10px] tracking-[0.15em] uppercase font-semibold">
                        STEP 02
                      </span>
                      <span className="font-sans text-[10px] tracking-[0.15em] text-[#777777] uppercase font-semibold">
                        INSURED TRANSIT
                      </span>
                    </div>
                    <h3 className="font-serif text-[17px] text-[#F2EFE9] uppercase tracking-[0.06em] mb-2">
                      Tracked Express Flight Custody
                    </h3>
                    <p className="font-sans text-[13px] text-[#8E8E8E] leading-relaxed">
                      Packed in reinforced foam flight crates and dispatched via tracked insured express courier directly from Tokyo.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#161616] flex items-center justify-between font-sans text-[10px] tracking-[0.15em] uppercase text-[#777777]">
                    <span>TRANSIT INSURANCE</span>
                    <span className="text-[#10B981] font-bold">COVERED IN FULL</span>
                  </div>
                </div>

                {/* Step 03 */}
                <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <span className="text-[#F2EFE9] border border-[#1F1F1F] bg-[#080808] px-2.5 py-0.5 font-sans text-[10px] tracking-[0.15em] uppercase font-semibold">
                        STEP 03
                      </span>
                      <span className="font-sans text-[10px] tracking-[0.15em] text-[#777777] uppercase font-semibold">
                        APPROVAL &amp; SETTLEMENT
                      </span>
                    </div>
                    <h3 className="font-serif text-[17px] text-[#F2EFE9] uppercase tracking-[0.06em] mb-2">
                      48-Hour Inspection Window
                    </h3>
                    <p className="font-sans text-[13px] text-[#8E8E8E] leading-relaxed">
                      Inspect your figure under natural light. Verified authentic? Escrow releases funds to seller. Any discrepancies? Immediate 100% refund.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#161616] flex items-center justify-between font-sans text-[10px] tracking-[0.15em] uppercase text-[#777777]">
                    <span>INSPECTION WINDOW</span>
                    <span className="text-[#F2EFE9] font-bold">48 HOURS POST-DELIVERY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Archival Footer with Verifiable Legal & Compliance Links */}
        <ArchivalFooter />
      </div>
    </div>
  );
}