'use client';

import React, { useState } from 'react';
import { DepthCard } from '../ui/DepthCard';
import { AuthenticityLedger } from '../ui/AuthenticityLedger';
import { BargainModal } from '@/presentation/components/BargainModal';

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

const FEATURED_GRAILS: FeaturedGrailItem[] = [
  {
    id: 'lot-0482',
    title: 'Guts Berserker Armor Unleashed 1/4',
    series: 'Berserk // Kentaro Miura Memorial Edition',
    manufacturer: 'Prime 1 Studio Ultimate Premium Masterline',
    scale: '1/4 Scale Hand-Finished Polystone',
    edition: '042 / 350 Worldwide',
    condition: 'S-Rank Factory Sealed',
    askingPrice: 89000,
    timeRemaining: '14H : 32M',
    imageUrl: '/showcase/guts_berserker_statue.jpg',
  },
  {
    id: 'lot-0484',
    title: 'Saber Altria Pendragon 1/7 Deluxe',
    series: 'Fate/Stay Night // Type-Moon Archival',
    manufacturer: 'Aniplex+ / Stronger Studio',
    scale: '1/7 Scale Pre-Painted PVC & ABS',
    edition: '118 / 500 Worldwide',
    condition: 'S-Rank Mint in Box',
    askingPrice: 24500,
    timeRemaining: '08H : 15M',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'lot-0485',
    title: 'Satoru Gojo Hollow Purple 1/7 Scramble',
    series: 'Jujutsu Kaisen // MAPPA Shibuya Special',
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
    series: 'Neon Genesis Evangelion // Khara Studio',
    manufacturer: 'Bandai Spirits Tamashii Nations',
    scale: 'Diecast Metal & Composite ABS/PVC',
    edition: 'First Release Edition',
    condition: 'S-Rank Factory Sealed',
    askingPrice: 42000,
    timeRemaining: '05H : 50M',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=85',
  },
];

interface FeaturedGrailProps {
  onOpenOfferModal?: (lot: FeaturedGrailItem) => void;
}

export default function FeaturedGrailSpotlight({ onOpenOfferModal }: FeaturedGrailProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const featuredLot: FeaturedGrailItem = FEATURED_GRAILS[currentIndex] ?? FEATURED_GRAILS[0]!;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % FEATURED_GRAILS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + FEATURED_GRAILS.length) % FEATURED_GRAILS.length);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header with Next Grail Pagination Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 pb-3 mb-8 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-zinc-500 uppercase block">
            SPOTLIGHT LOT // {featuredLot.id.toUpperCase()}
          </span>
          <h2 className="text-lg font-mono font-bold text-zinc-100 uppercase tracking-wide mt-1">
            Archival Grail of the Cycle
          </h2>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-zinc-500 uppercase tracking-widest">Closing Window:</span>
            <span className="border border-zinc-800 bg-zinc-900/80 text-zinc-200 px-2.5 py-1 rounded">
              {featuredLot.timeRemaining}
            </span>
          </div>

          {/* Next Grail Pagination Controls */}
          <div className="flex items-center space-x-2 pl-2 border-l border-zinc-800/80">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Grail"
              className="p-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span className="text-[10px] font-mono text-zinc-500 px-1 select-none">
              {currentIndex + 1} / {FEATURED_GRAILS.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Grail"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-md border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-100 text-zinc-300 hover:text-black font-mono text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer"
            >
              <span>Next Grail</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Depth Card Container */}
      <div className="flex justify-center">
        <DepthCard
          className="w-full max-w-5xl bg-[#121214] border border-zinc-800/80 hover:border-zinc-600 rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl transition-colors"
          maxTilt={7}
          perspective={1400}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Column: Figure Presentation Stage with Jeweler's Loupe Image Zoom */}
            <div className="relative h-80 sm:h-96 w-full flex items-center justify-center bg-[#0a0a0c] rounded-xl border border-zinc-800/60 p-6 overflow-hidden group/loupe cursor-crosshair">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)] pointer-events-none" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={featuredLot.id}
                src={featuredLot.imageUrl}
                alt={featuredLot.title}
                className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] transition-transform duration-700 ease-out group-hover/loupe:scale-125"
                loading="eager"
              />
            </div>

            {/* Right Column: Provenance, Telemetry, COA & Escrow Trigger */}
            <div className="flex flex-col justify-between h-full py-1">
              <div>
                <div className="flex items-center space-x-3 text-[10px] font-mono text-zinc-400 mb-3">
                  <span className="text-zinc-200 border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 rounded uppercase font-semibold">
                    {featuredLot.condition}
                  </span>
                  <span>// EDITION: {featuredLot.edition}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-mono font-bold text-zinc-100 uppercase tracking-tight">
                  {featuredLot.title}
                </h3>
                <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">
                  {featuredLot.series}
                </p>

                <div className="mt-4 pt-4 border-t border-zinc-800/60 space-y-1.5 text-xs font-mono text-zinc-400">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Fabricator</span>
                    <span className="text-zinc-300">{featuredLot.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Scale / Material</span>
                    <span className="text-zinc-300">{featuredLot.scale}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Custody Protocol</span>
                    <span className="text-zinc-300">Double-Vault Escrow Guaranteed</span>
                  </div>
                </div>

                {/* Digital Certificate of Authenticity (COA) Component */}
                <div className="mt-4">
                  <AuthenticityLedger
                    lotId={featuredLot.id.toUpperCase()}
                    grader="Prime Inspection Escrow"
                    hash="0x8F4A...B99C"
                  />
                </div>
              </div>

              {/* Transaction Action */}
              <div className="mt-6 border-t border-zinc-800/80 pt-4">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                    Archival Valuation
                  </span>
                  <span className="text-xl font-bold font-mono text-zinc-100">
                    ₹{featuredLot.askingPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenOfferModal) {
                      onOpenOfferModal(featuredLot);
                    } else {
                      setIsOfferModalOpen(true);
                    }
                  }}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-100 text-zinc-300 hover:text-black border border-zinc-700 hover:border-zinc-100 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] rounded-lg transition-all duration-300 cursor-pointer"
                >
                  Enter Escrow Negotiation Room
                </button>
              </div>
            </div>
          </div>
        </DepthCard>
      </div>

      {/* Internal Live Bargain Modal for Spotlight Grail */}
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
