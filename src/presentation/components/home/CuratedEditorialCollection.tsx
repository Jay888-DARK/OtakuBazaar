'use client';

/**
 * @file src/presentation/components/home/CuratedEditorialCollection.tsx
 *
 * Feature 3: Curated Editorial Collections for OtakuBazaar.
 * High-end dark "archival vault" drop for "THE BERSERK ARCHIVE".
 *
 * STRICT CONSTRAINTS:
 * - Asymmetrical layout: One massive hero image paired with smaller, starkly aligned supporting images and typography.
 * - Strictly NO Bento grid.
 * - Strictly NO 3 feature cards in a row.
 * - 0px border-radius globally, 1px solid borders, no icons/emojis, no gradients, flat UI.
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function CuratedEditorialCollection(): React.JSX.Element {
  return (
    <section
      aria-label="Curated Editorial Drop — The Berserk Archive"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16 select-none"
    >
      <div className="border border-[#27272a] bg-[#0c0c0e]">
        {/* Curatorial Masthead */}
        <div className="border-b border-[#27272a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-[#0a0a0c]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-bold border border-zinc-700 bg-zinc-900 px-2 py-0.5">
                CURATED DROP #04
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-medium">
                ACCESSION NO. BK-1989-M
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 uppercase tracking-tight">
              The Berserk Archive
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
              Kentaro Miura’s dark fantasy legacy preserved in prime polystone, forged die-cast steel, and limited first-run hardcover pressings.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-semibold">
              ACQUISITION STATUS:
            </span>
            <span className="border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-[10px] font-bold text-zinc-200 tracking-wider uppercase">
              ESCROW LOCKED (1 OF 1)
            </span>
          </div>
        </div>

        {/* Asymmetrical 2-Column Archival Layout (7:5 Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Dominant Hero Col (7 cols): Massive Hero Image with Physical Provenance Plaque */}
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#27272a] bg-[#09090b] flex flex-col justify-between">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-[#060608] overflow-hidden border-b border-[#27272a]">
              <Image
                src="/showcase/guts_berserker_statue.jpg"
                alt="Prime 1 Studio Berserk Guts in Berserker Armor Masterpiece"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover contrast-115 grayscale hover:grayscale-0 transition-all duration-500"
                priority
              />
              {/* Monochromatic Corner Watermark */}
              <div className="absolute top-4 left-4 bg-[#09090b]/90 border border-zinc-700 px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-300">
                LOT ID: BK-001 • PRIME 1 STUDIO
              </div>
              <div className="absolute bottom-4 right-4 bg-[#09090b]/90 border border-zinc-700 px-2.5 py-1 text-[9px] font-mono tracking-widest text-zinc-400 uppercase">
                EDITION: 042 / 350
              </div>
            </div>

            {/* Hero Detail Plaque */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 block">
                    MASTER POLYSILICONE CASTING
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-zinc-100">
                    Guts Berserker Armor 1/4 Scale Uncut Edition
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 block">
                    CURRENT VALUATION
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold uppercase tracking-wider text-zinc-100">
                    ₹1,24,000
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#27272a]">
                <div className="border border-zinc-800 bg-[#0e0e11] p-2.5">
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500">Weight</span>
                  <span className="text-[11px] font-bold uppercase text-zinc-300">18.4 KG</span>
                </div>
                <div className="border border-zinc-800 bg-[#0e0e11] p-2.5">
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500">Seal</span>
                  <span className="text-[11px] font-bold uppercase text-zinc-300">Hologram S-01</span>
                </div>
                <div className="border border-zinc-800 bg-[#0e0e11] p-2.5">
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500">Provenance</span>
                  <span className="text-[11px] font-bold uppercase text-zinc-300">Tokyo Vault</span>
                </div>
                <div className="border border-zinc-800 bg-[#0e0e11] p-2.5">
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500">Inspection</span>
                  <span className="text-[11px] font-bold uppercase text-zinc-300">Pass (Grade S)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stark Detail Col (5 cols): Stacked Archival Elements + Curatorial Essay */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#0e0e11] divide-y divide-[#27272a]">
            {/* Supporting Artifact 01: Detail Macro Frame */}
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-semibold">
                SUPPORTING SPECIMEN • REF A-01
              </span>
              <div className="grid grid-cols-3 gap-3 items-center">
                <div className="relative aspect-square bg-[#08080a] border border-[#27272a] overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&h=300&q=85"
                    alt="Berserk Dragon Slayer Relic Macro"
                    fill
                    sizes="120px"
                    className="object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
                    unoptimized={true}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Hand-Forged Dragon Slayer 1:6 Diecast Relic
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Includes weighted base and battle-weathered blood splatter patina applied by Prime 1 artisans.
                  </p>
                  <span className="text-[10px] font-semibold text-zinc-400 block pt-1">
                    INR ₹28,500 • LOT REF #BK-042
                  </span>
                </div>
              </div>
            </div>

            {/* Supporting Artifact 02: Hardcover Archival Set */}
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-semibold">
                SUPPORTING SPECIMEN • REF B-02
              </span>
              <div className="grid grid-cols-3 gap-3 items-center">
                <div className="relative aspect-square bg-[#08080a] border border-[#27272a] overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=300&h=300&q=85"
                    alt="Berserk Deluxe Edition 1-14 Hardcover Set"
                    fill
                    sizes="120px"
                    className="object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
                    unoptimized={true}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Berserk Deluxe Vol. 1–14 Complete Leatherbound Set
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Foil-embossed black leatherette covers, oversized 7x10 format, archival acid-free paper.
                  </p>
                  <span className="text-[10px] font-semibold text-zinc-400 block pt-1">
                    INR ₹42,000 • LOT REF #BK-089
                  </span>
                </div>
              </div>
            </div>

            {/* Curatorial Essay & Inspection Pledge */}
            <div className="p-6 sm:p-8 space-y-4 bg-[#0a0a0c]">
              <div>
                <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-semibold block mb-1">
                  CURATORIAL NOTE
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Every specimen in Drop #04 has undergone optical micro-inspection in our Mumbai staging facility. Sculptural tolerances, joint tensile strength, and holographic provenance stamps are logged on our tamper-evident ledger prior to packaging.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Link
                  href="/products/lot-001"
                  className="w-full sm:flex-1 py-3 px-4 bg-zinc-100 hover:bg-white text-black text-center text-[11px] font-bold uppercase tracking-[0.2em] border border-zinc-100 transition-colors no-underline block"
                >
                  Inspect Berserk Lot →
                </Link>
                <a
                  href="#catalog"
                  className="w-full sm:w-auto py-3 px-4 bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white text-center text-[11px] font-semibold uppercase tracking-[0.18em] border border-zinc-800 transition-colors no-underline block whitespace-nowrap"
                >
                  View Full Catalog
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CuratedEditorialCollection;
