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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* STAGE 1: Full-Viewport Hero Animation (100vh) */}
      <VaultHero />

      {/* STAGE 2: Scroll-Revealed Criteria, Curated Collections & Catalog */}
      <div id="stage-2" className="relative w-full bg-[#0a0a0a]">
        {/* 1. Sticky Criteria & Category Bar (Pills + Thumbnail Strip, sticks below navbar at top-14) */}
        <MarketplaceFilterNav />

        {/* 2. 4-Column Curated Archival Merchandising Banners */}
        <ArchivalMerchandisingBanners />

        {/* 3. Main Catalog Layout (Left 260px Facet Sidebar + Right 4-Column Product Grid) */}
        <CatalogView />

        {/* Buyer Protection & Escrow Section */}
        <section id="escrow-vault" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16 select-none">
          <div className="bg-[#141414] border border-[#262626]">
            {/* Section Masthead */}
            <div className="p-6 sm:p-8 border-b border-[#262626] bg-[#0a0a0a]">
              <span
                style={{
                  fontFamily: 'var(--font-swiss), sans-serif',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#8a8a8a',
                }}
                className="uppercase block mb-1 font-swiss"
              >
                BUYER PROTECTION • CUSTODIAL ESCROW
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-headline), sans-serif',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                }}
                className="font-headline uppercase tracking-tight leading-tight"
              >
                Authenticity Guarantee &amp; 48-Hour Inspection Period
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-swiss), sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: 400,
                  color: '#d4d4d4',
                  lineHeight: 1.5,
                }}
                className="mt-2 max-w-2xl font-swiss"
              >
                100% authentic Japanese collectibles guaranteed. Your payment is held safely in escrow until you physically receive and inspect your specimen.
              </p>
            </div>

            {/* Stark 2-Up Editorial Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#262626]">
              {/* Primary Dominant Hero Block: Step 01 */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 border-[#262626] bg-[#0a0a0a]">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span
                      style={{
                        fontFamily: 'var(--font-swiss), sans-serif',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                      }}
                      className="text-white border border-[#262626] bg-[#141414] px-2.5 py-1 font-swiss"
                    >
                      STEP 01
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-swiss), sans-serif',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: '#8a8a8a',
                      }}
                      className="font-swiss"
                    >
                      ORDER PROTECTION • RESERVE LOCK
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-mechanical), sans-serif',
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#ffffff',
                    }}
                    className="mb-2 font-mechanical"
                  >
                    15-Minute Reservation Lock
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-swiss), sans-serif',
                      fontSize: '0.82rem',
                      fontWeight: 400,
                      color: '#d4d4d4',
                      lineHeight: 1.5,
                    }}
                    className="max-w-xl font-swiss"
                  >
                    When checkout begins, the lot is reserved exclusively for you for 15 minutes while payment is verified into secure custodial escrow.
                  </p>
                </div>

                {/* Protection Indicators */}
                <div className="mt-8 pt-6 border-t border-[#262626] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="border border-[#262626] bg-[#141414] p-3">
                    <span
                      style={{
                        fontFamily: 'var(--font-swiss), sans-serif',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        letterSpacing: '0.16em',
                        color: '#8a8a8a',
                        textTransform: 'uppercase',
                      }}
                      className="block font-swiss"
                    >
                      LOCK DURATION
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-swiss), sans-serif',
                        fontVariantNumeric: 'tabular-nums',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                      className="text-zinc-100 block mt-1 font-swiss"
                    >
                      15 MINUTES
                    </span>
                  </div>
                  <div className="border border-[#262626] bg-[#141414] p-3">
                    <span
                      style={{
                        fontFamily: 'var(--font-swiss), sans-serif',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        letterSpacing: '0.16em',
                        color: '#8a8a8a',
                        textTransform: 'uppercase',
                      }}
                      className="block font-swiss"
                    >
                      ESCROW STATUS
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-swiss), sans-serif',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#10b981',
                      }}
                      className="block mt-1 font-swiss"
                    >
                      ESCROW PROTECTED
                    </span>
                  </div>
                  <div className="border border-[#262626] bg-[#141414] p-3">
                    <span
                      style={{
                        fontFamily: 'var(--font-swiss), sans-serif',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        letterSpacing: '0.16em',
                        color: '#8a8a8a',
                        textTransform: 'uppercase',
                      }}
                      className="block font-swiss"
                    >
                      REFUND POLICY
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-swiss), sans-serif',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                      className="text-zinc-100 block mt-1 font-swiss"
                    >
                      100% REFUNDABLE
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Stacked Column: Step 02 & Step 03 */}
              <div className="lg:col-span-5 flex flex-col divide-y divide-[#262626] bg-[#141414]">
                {/* Step 02 */}
                <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <span
                        style={{
                          fontFamily: 'var(--font-swiss), sans-serif',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                        }}
                        className="text-white border border-[#262626] bg-[#0a0a0a] px-2 py-0.5 font-swiss"
                      >
                        STEP 02
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-swiss), sans-serif',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: '#8a8a8a',
                        }}
                        className="font-swiss"
                      >
                        INSURED TRANSIT
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-mechanical), sans-serif',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: '#ffffff',
                      }}
                      className="mb-1.5 font-mechanical"
                    >
                      Tracked Express Flight Custody
                    </h3>
                    <p
                      style={{
                        fontFamily: 'var(--font-swiss), sans-serif',
                        fontSize: '0.82rem',
                        fontWeight: 400,
                        color: '#d4d4d4',
                        lineHeight: 1.5,
                      }}
                      className="font-swiss"
                    >
                      Packed in reinforced foam flight crates and dispatched via tracked insured express courier directly from Tokyo.
                    </p>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-swiss), sans-serif',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: '#8a8a8a',
                    }}
                    className="mt-4 pt-3 border-t border-[#262626] flex items-center justify-between font-swiss"
                  >
                    <span>TRANSIT INSURANCE</span>
                    <span className="text-[#10b981] font-bold">COVERED IN FULL</span>
                  </div>
                </div>

                {/* Step 03 */}
                <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <span
                        style={{
                          fontFamily: 'var(--font-swiss), sans-serif',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                        }}
                        className="text-white border border-[#262626] bg-[#0a0a0a] px-2 py-0.5 font-swiss"
                      >
                        STEP 03
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-swiss), sans-serif',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: '#8a8a8a',
                        }}
                        className="font-swiss"
                      >
                        APPROVAL &amp; SETTLEMENT
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-mechanical), sans-serif',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: '#ffffff',
                      }}
                      className="mb-1.5 font-mechanical"
                    >
                      48-Hour Inspection Window
                    </h3>
                    <p
                      style={{
                        fontFamily: 'var(--font-swiss), sans-serif',
                        fontSize: '0.82rem',
                        fontWeight: 400,
                        color: '#d4d4d4',
                        lineHeight: 1.5,
                      }}
                      className="font-swiss"
                    >
                      Inspect your figure under natural light. Verified authentic? Escrow releases funds to seller. Any discrepancies? Immediate 100% refund.
                    </p>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-swiss), sans-serif',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: '#8a8a8a',
                    }}
                    className="mt-4 pt-3 border-t border-[#262626] flex items-center justify-between font-swiss"
                  >
                    <span>INSPECTION WINDOW</span>
                    <span className="text-zinc-200 font-bold">48 HOURS POST-DELIVERY</span>
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