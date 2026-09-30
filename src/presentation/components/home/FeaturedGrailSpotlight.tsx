'use client';

/**
 * @file src/presentation/components/home/FeaturedGrailSpotlight.tsx
 *
 * Feature: Archival Grail of the Cycle (Secondary Spotlight Lot).
 * Tactile Brutalist & High-End Editorial Architecture:
 * - Data Separation: Strictly re-mapped to non-Berserk assets (e.g. Saber Altria Pendragon / Gojo).
 *   The Guts lot (BK-001 / lot-0482) is exclusively reserved for "THE BERSERK ARCHIVE" drop.
 * - Tactile Brutalism: 1px dark charcoal borders (#27272a), global 0px border-radius,
 *   deep dark off-black theme (#09090b, #0c0c0e, #0a0a0c, #0e0e11).
 *   Zero pure white backgrounds, zero drop shadows, zero glassmorphism, zero purple/black palettes.
 * - Editorial Typography: Deliberately oversized scale-driven headers with high-contrast
 *   editorial sans-serif. Zero monospaced / coding fonts, zero Inter, Geist, or Space Grotesk.
 * - Structural Interactivity & Performance: Dark-gray geometric skeleton loader during
 *   data fetch. 0ms instant brutalist color state inversions (#f4f4f4 / black) on interaction.
 *   Zero smooth hover animations, animated arrows, or sparkle icons.
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BargainModal } from '@/presentation/components/BargainModal';
import { ProductDetailSkeleton } from '@/presentation/components/ui/SkeletonLoaders';

export interface FeaturedGrailItem {
  id: string;
  title: string;
  series: string;
  manufacturer: string;
  scale: string;
  edition: string;
  condition: string;
  askingPrice: number;
  timeRemaining: string;
  imageUrl: string;
}

/**
 * Strictly non-Berserk secondary archival assets.
 * Guts Berserker Armor (BK-001 / lot-0482) is completely excluded to guarantee zero duplication.
 */
const DEFAULT_FALLBACK_GRAIL: FeaturedGrailItem = {
  id: 'lot-0484',
  title: 'Saber Altria Pendragon 1/7 Deluxe',
  series: 'Fate/Stay Night • Type-Moon Archival',
  manufacturer: 'Aniplex+ / Stronger Studio',
  scale: '1/7 Scale Pre-Painted PVC & ABS',
  edition: '118 / 500 Worldwide',
  condition: 'S-Rank Mint in Box',
  askingPrice: 24500,
  timeRemaining: '08H : 15M',
  imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=85',
};

const FALLBACK_FEATURED_GRAILS: FeaturedGrailItem[] = [
  DEFAULT_FALLBACK_GRAIL,
  {
    id: 'lot-0485',
    title: 'Satoru Gojo Hollow Purple 1/7 Scramble',
    series: 'Jujutsu Kaisen • MAPPA Shibuya Special',
    manufacturer: 'eStream Shibuya Scramble Figure',
    scale: '1/7 Scale Clear Resin Effect Polystone',
    edition: '089 / 400 Worldwide',
    condition: 'S-Rank Factory Sealed',
    askingPrice: 36000,
    timeRemaining: '19H : 40M',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'lot-0486',
    title: 'EVA Unit-01 Test Type Metal Build',
    series: 'Neon Genesis Evangelion • Khara Studio',
    manufacturer: 'Bandai Spirits Tamashii Nations',
    scale: 'Diecast Metal & Composite ABS/PVC',
    edition: 'First Release Edition',
    condition: 'S-Rank Factory Sealed',
    askingPrice: 42000,
    timeRemaining: '05H : 50M',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'lot-0481',
    title: 'Kyojuro Rengoku 1/8 Flame Breathing',
    series: 'Demon Slayer • Ufotable Archival',
    manufacturer: 'Aniplex+ / Wing Studio',
    scale: '1/8 Scale Pre-Painted ABS/PVC',
    edition: '204 / 600 Worldwide',
    condition: 'S-Rank Factory Sealed',
    askingPrice: 28500,
    timeRemaining: '12H : 45M',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=85',
  },
];

interface FeaturedGrailProps {
  onOpenOfferModal?: (lot: FeaturedGrailItem) => void;
}

export default function FeaturedGrailSpotlight({ onOpenOfferModal }: FeaturedGrailProps): React.JSX.Element {
  const [grails, setGrails] = useState<FeaturedGrailItem[]>(FALLBACK_FEATURED_GRAILS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Dynamic fetch to reconcile with active database listings while strictly enforcing no Guts duplication
  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;

    async function loadSecondaryGrailData(): Promise<void> {
      try {
        const response = await fetch('/api/listings');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data?.items) && data.items.length > 0) {
            // STRICT FILTER: Absolutely eliminate Guts / Berserk / BK-001 / lot-0482 to prevent data duplication
            const filteredDbLots = data.items
              .filter((item: { id?: string; title?: string }) => {
                const id = (item.id || '').toLowerCase();
                const title = (item.title || '').toLowerCase();
                return (
                  id !== 'lot-0482' &&
                  id !== 'bk-001' &&
                  !id.includes('berserk') &&
                  !title.includes('berserk') &&
                  !title.includes('guts')
                );
              })
              .map((item: {
                id: string;
                title: string;
                category?: string;
                condition?: string;
                askingPriceAmount?: number;
                imageUrls?: string[] | string;
                imageUrl?: string;
              }): FeaturedGrailItem => {
                let img = DEFAULT_FALLBACK_GRAIL.imageUrl;
                if (Array.isArray(item.imageUrls) && item.imageUrls[0]) {
                  img = item.imageUrls[0];
                } else if (typeof item.imageUrl === 'string' && item.imageUrl) {
                  img = item.imageUrl;
                }

                return {
                  id: item.id,
                  title: item.title,
                  series: `${item.category || 'Archival Vault'} • Verified Specimen`,
                  manufacturer: 'Verified Japanese Artisan Studio',
                  scale: 'Museum Grade Pre-Painted',
                  edition: 'Direct Import Batch',
                  condition: item.condition === 'NEW' ? 'S-Rank Factory Sealed' : 'A-Rank Inspected',
                  askingPrice: item.askingPriceAmount ? Math.round(item.askingPriceAmount / 100) : 24500,
                  timeRemaining: '08H : 15M',
                  imageUrl: img,
                };
              });

            if (isMounted && filteredDbLots.length > 0) {
              // Combine DB items with fallback non-Berserk grails
              const merged = [
                ...filteredDbLots,
                ...FALLBACK_FEATURED_GRAILS.filter(
                  (fb) => !filteredDbLots.some((db: FeaturedGrailItem) => db.id === fb.id)
                ),
              ];
              setGrails(merged);
            }
          }
        }
      } catch {
        // Fallback cleanly to curated non-Berserk list
      } finally {
        if (isMounted) {
          // Instant perceived performance: brief geometric skeleton flash
          timer = setTimeout(() => setIsLoading(false), 140);
        }
      }
    }

    loadSecondaryGrailData();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const featuredLot: FeaturedGrailItem = grails[currentIndex] ?? grails[0] ?? DEFAULT_FALLBACK_GRAIL;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % grails.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + grails.length) % grails.length);
  };

  if (isLoading) {
    return (
      <section
        aria-label="Spotlight Archival Lot Loading"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 select-none"
      >
        <ProductDetailSkeleton />
      </section>
    );
  }

  return (
    <section
      aria-label="Spotlight Archival Lot"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 select-none"
    >
      {/* 1. Strict Grid Structure: Connected 1px Charcoal Borders (#27272a) */}
      <div className="border border-[#27272a] bg-[#0c0c0e]">
        {/* Top Masthead Row: Accession, Status & Pagination Stepper */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#27272a] bg-[#0a0a0c] p-6 sm:p-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-bold border border-[#27272a] bg-[#111114] px-2.5 py-1">
                SPOTLIGHT ACCESSION #{featuredLot.id.toUpperCase()}
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-semibold">
                {featuredLot.condition.toUpperCase()}
              </span>
            </div>
            {/* Deliberately Oversized Section Header for Harsh Confident Hierarchy */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100 uppercase tracking-tight leading-none">
              Archival Grail of the Cycle
            </h2>
          </div>

          <div className="flex items-center space-x-3 text-xs uppercase tracking-wider">
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-zinc-500 tracking-widest text-[10px] font-bold">CLOSING WINDOW:</span>
              <span className="border border-[#27272a] bg-[#09090b] text-zinc-200 px-3 py-1.5 text-[10px] font-bold tracking-widest">
                {featuredLot.timeRemaining}
              </span>
            </div>

            {/* Brutalist Stepper Controls (0ms transition) */}
            <div className="flex items-center space-x-2 pl-3 border-l border-[#27272a]">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Grail Lot"
                className="p-2 border border-[#27272a] bg-[#09090b] hover:bg-[#f4f4f4] hover:text-black hover:border-[#f4f4f4] text-zinc-400 cursor-pointer rounded-none duration-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="text-[10px] text-zinc-500 px-2 select-none font-bold tracking-widest">
                {currentIndex + 1} / {grails.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Grail Lot"
                className="flex items-center space-x-2 px-3 py-2 border border-[#27272a] bg-[#09090b] hover:bg-[#f4f4f4] hover:text-black hover:border-[#f4f4f4] text-zinc-300 text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer rounded-none duration-0"
              >
                <span>NEXT LOT</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Technical Schematic Grid (68% Left / 32% Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#27272a]">
          {/* RULE 1: HERO CELL (LEFT SIDE, 68% WIDTH) */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-[#09090b]">
            {/* Massive Primary Image Display */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-[#070709] border-b border-[#27272a] overflow-hidden flex items-center justify-center p-6">
              <Image
                key={featuredLot.id}
                src={featuredLot.imageUrl}
                alt={featuredLot.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-contain p-6 contrast-110"
              />
              <div className="absolute top-4 left-4 bg-[#09090b] border border-[#27272a] px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-300">
                {featuredLot.edition}
              </div>
            </div>

            {/* ANCHORED AT THE ABSOLUTE BOTTOM OF THIS HERO CELL: Title, Subtitle, & Primary Valuation */}
            <div className="p-6 sm:p-8 space-y-6 bg-[#0c0c0e]">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#27272a] pb-6 gap-6">
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block">
                    {featuredLot.series}
                  </span>
                  {/* Harsh oversized title hierarchy */}
                  <h3 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-zinc-100 leading-none">
                    {featuredLot.title}
                  </h3>
                  <span className="text-xs text-zinc-400 block pt-1 font-semibold uppercase tracking-wider">
                    {featuredLot.manufacturer} • {featuredLot.scale}
                  </span>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-1">
                    PRIMARY ARCHIVAL VALUATION
                  </span>
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-zinc-100 block">
                    ₹{featuredLot.askingPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mt-1 block">
                    TAXES &amp; TRANSIT INCLUDED
                  </span>
                </div>
              </div>

              {/* 4-Cell Specifications Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="border border-[#27272a] bg-[#09090b] p-3">
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Fabricator</span>
                  <span className="text-[11px] font-bold uppercase text-zinc-300 truncate block mt-0.5">
                    {featuredLot.manufacturer.split(' ')[0]} Studio
                  </span>
                </div>
                <div className="border border-[#27272a] bg-[#09090b] p-3">
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Scale / Spec</span>
                  <span className="text-[11px] font-bold uppercase text-zinc-300 truncate block mt-0.5">
                    {featuredLot.scale.split(' ')[0]} Scale
                  </span>
                </div>
                <div className="border border-[#27272a] bg-[#09090b] p-3">
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Edition Token</span>
                  <span className="text-[11px] font-bold uppercase text-zinc-300 truncate block mt-0.5">
                    {featuredLot.edition.split(' ')[0]}
                  </span>
                </div>
                <div className="border border-[#27272a] bg-[#09090b] p-3">
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Custody Protocol</span>
                  <span className="text-[11px] font-bold uppercase text-zinc-300 truncate block mt-0.5">
                    Double-Vault Escrow
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RULE 2: THE CONTEXT COLUMN (RIGHT SIDE, 32% WIDTH) */}
          <div className="lg:col-span-4 flex flex-col justify-between divide-y divide-[#27272a] bg-[#0e0e11]">
            {/* ROW 1: Acquisition Action Cell with Brutalist State Inversion */}
            <div className="p-6 space-y-4 bg-[#0a0a0c]">
              <div>
                <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-1">
                  ACQUISITION PROTOCOL
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold uppercase tracking-tight text-zinc-100">
                    ₹{featuredLot.askingPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-300 font-bold border border-[#27272a] bg-[#111114] px-2.5 py-1">
                    ESCROW PROTECTED
                  </span>
                </div>
              </div>

              {/* Action Buttons: Brutalist 0ms Snap Inversion */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenOfferModal) {
                      onOpenOfferModal(featuredLot);
                    } else {
                      setIsOfferModalOpen(true);
                    }
                  }}
                  className="w-full py-4 px-6 bg-[#f4f4f4] hover:bg-black hover:text-[#f4f4f4] text-black text-center text-xs font-bold uppercase tracking-[0.2em] border border-[#f4f4f4] hover:border-[#27272a] transition-none cursor-pointer block rounded-none duration-0"
                >
                  [ ENTER ESCROW NEGOTIATION ROOM ]
                </button>

                <Link
                  href={`/products/${featuredLot.id}`}
                  className="w-full py-3 px-6 bg-transparent hover:bg-[#f4f4f4] text-zinc-300 hover:text-black hover:border-[#f4f4f4] text-center text-xs font-bold uppercase tracking-[0.2em] border border-[#27272a] transition-none block no-underline rounded-none duration-0"
                >
                  [ INSPECT ARCHIVAL DOSSIER ]
                </Link>
              </div>

              <div className="pt-3 border-t border-[#27272a] space-y-2 text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-zinc-400" />
                  <span>Double-Entry Escrow Vault Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-zinc-400" />
                  <span>Insured Express Courier Dispatch</span>
                </div>
              </div>
            </div>

            {/* ROW 2: SUPPORTING SPECIMENS */}
            <div className="divide-y divide-[#27272a]">
              <div className="px-6 py-3 bg-[#0c0c0e]">
                <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-bold block">
                  SUPPORTING SPECIMEN DATA
                </span>
              </div>

              {/* Specimen 01 */}
              <div className="p-4 sm:p-5 flex items-center gap-4 bg-[#09090b]">
                <div className="relative w-16 h-16 aspect-square bg-[#0c0c0e] border border-[#27272a] shrink-0 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&h=300&q=85"
                    alt="Supporting Specimen A-01"
                    fill
                    sizes="64px"
                    className="object-cover grayscale contrast-125"
                    unoptimized={true}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                      REF SPEC-01
                    </span>
                    <span className="text-[10px] font-bold text-zinc-200">INCLUDED</span>
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 line-clamp-1">
                    Museum-Grade Display Base &amp; Stand
                  </h4>
                  <p className="text-[10px] text-zinc-500 line-clamp-1">
                    Weighted Acrylic Plaque with Engraved Serial
                  </p>
                </div>
              </div>

              {/* Specimen 02 */}
              <div className="p-4 sm:p-5 flex items-center gap-4 bg-[#09090b]">
                <div className="relative w-16 h-16 aspect-square bg-[#0c0c0e] border border-[#27272a] shrink-0 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&h=300&q=85"
                    alt="Supporting Specimen B-02"
                    fill
                    sizes="64px"
                    className="object-cover grayscale contrast-125"
                    unoptimized={true}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                      REF COA-02
                    </span>
                    <span className="text-[10px] font-bold text-zinc-200">VERIFIED</span>
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 line-clamp-1">
                    Cryptographic Ledger Token Card
                  </h4>
                  <p className="text-[10px] text-zinc-500 line-clamp-1">
                    Tamper-Evident RFID Embedded Chip
                  </p>
                </div>
              </div>
            </div>

            {/* ROW 3: CURATORIAL NOTE & IMMUTABLE COA RECORD */}
            <div className="p-6 space-y-3 bg-[#0a0a0c]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-bold">
                  CURATORIAL NOTE &amp; COA LOG
                </span>
                <span className="text-[8px] tracking-widest text-emerald-400 uppercase font-bold">
                  IMMUTABLE RECORD VALID
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Optical calibration check concluded under Leica macro sensors. All factory seals intact with zero joint relaxation. Cryptographic hash recorded on private ledger prior to vault staging:
              </p>

              <div className="p-2.5 bg-[#070709] border border-[#27272a] text-[9px] text-zinc-400 flex items-center justify-between font-semibold">
                <span className="text-zinc-500 font-bold">HASH:</span>
                <span className="text-zinc-300 truncate ml-2">0x8F4A9B23C7E10842B99C</span>
              </div>

              <div className="pt-2 border-t border-[#27272a] flex items-center justify-between text-[9px] uppercase tracking-widest text-zinc-500 font-bold">
                <span>Verification Authority</span>
                <span className="text-zinc-300 font-semibold">Prime Inspection Escrow</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Bargain Modal */}
      {isOfferModalOpen && (
        <BargainModal
          productId={featuredLot.id}
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          askingPriceINR={featuredLot.askingPrice}
          productTitle={featuredLot.title}
        />
      )}
    </section>
  );
}
