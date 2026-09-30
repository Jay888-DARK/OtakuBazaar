'use client';

/**
 * @file src/presentation/components/home/CuratedEditorialCollection.tsx
 *
 * Feature: Curated Editorial Collections for OtakuBazaar.
 * High-end dark "archival vault" drop for "THE BERSERK ARCHIVE" featuring the Guts lot (BK-001).
 *
 * STRICT CONSTRAINTS:
 * - Keeps "THE BERSERK ARCHIVE" as the exclusive primary curated drop section for Guts (BK-001 / lot-0482).
 * - Deliberately oversized section headers driven by scale contrast.
 * - Completely eliminate monospaced fonts and terminal styling.
 * - Absolute 1px dark charcoal borders (#27272a), global 0px border-radius.
 * - No smooth animations, no animated arrows, instant 0ms brutalist state inversions.
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
        <div className="border-b border-[#27272a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-[#0a0a0c]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-bold border border-[#27272a] bg-[#111114] px-2.5 py-1">
                CURATED DROP #04
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-semibold">
                ACCESSION NO. BK-1989-M
              </span>
            </div>
            {/* Deliberately Oversized Section Header */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-100 uppercase tracking-tight leading-none">
              The Berserk Archive
            </h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-xl leading-relaxed font-sans">
              Kentaro Miura’s dark fantasy legacy preserved in prime polystone, forged die-cast steel, and limited first-run hardcover pressings.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold">
              ACQUISITION STATUS:
            </span>
            <span className="border border-[#27272a] bg-[#09090b] px-3 py-1.5 text-[10px] font-bold text-zinc-200 tracking-wider uppercase">
              ESCROW LOCKED (1 OF 1)
            </span>
          </div>
        </div>

        {/* Asymmetrical 2-Column Archival Layout (7:5 Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Dominant Hero Col (7 cols): Massive Hero Image with Physical Provenance Plaque */}
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#27272a] bg-[#09090b] flex flex-col justify-between relative">
            {/* Marginal Micro-Typography in corners */}
            <span className="marginal-metadata marginal-tl text-zinc-600">
              LAST INSPECTED: 2026-09-28
            </span>
            <span className="marginal-metadata marginal-br text-zinc-600">
              VAULT TEMP: 18°C
            </span>

            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-[#060608] overflow-hidden border-b border-[#27272a]">
              <Image
                src="/showcase/guts_berserker_statue.jpg"
                alt="Prime 1 Studio Berserk Guts in Berserker Armor Masterpiece"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover contrast-115 grayscale"
                priority
              />
              {/* Monochromatic Corner Watermark */}
              <div className="absolute top-4 left-4 bg-[#09090b] border border-[#27272a] px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-300">
                LOT ID: BK-001 • PRIME 1 STUDIO
              </div>
              <div className="absolute bottom-4 right-4 bg-[#09090b] border border-[#27272a] px-3 py-1.5 text-[9px] font-bold tracking-widest text-zinc-400 uppercase">
                EDITION: 042 / 350
              </div>
            </div>

            {/* Hero Detail Plaque */}
            <div className="p-6 sm:p-8 space-y-4 bg-[#0c0c0e]">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#27272a] pb-4">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-1">
                    MASTER POLYSILICONE CASTING
                  </span>
                  <h3 className="text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-100">
                    Guts Berserker Armor 1/4 Scale Uncut Edition
                  </h3>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-1">
                    CURRENT VALUATION
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-100">
                    ₹1,24,000
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="border border-[#27272a] bg-[#09090b] p-3">
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Weight</span>
                  <span className="text-[11px] font-bold uppercase text-zinc-300 block mt-0.5">18.4 KG</span>
                </div>
                <div className="border border-[#27272a] bg-[#09090b] p-3">
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Seal</span>
                  <span className="text-[11px] font-bold uppercase text-zinc-300 block mt-0.5">Hologram S-01</span>
                </div>
                <div className="border border-[#27272a] bg-[#09090b] p-3">
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Provenance</span>
                  <span className="text-[11px] font-bold uppercase text-zinc-300 block mt-0.5">Tokyo Vault</span>
                </div>
                <div className="border border-[#27272a] bg-[#09090b] p-3">
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Inspection</span>
                  <span className="text-[11px] font-bold uppercase text-zinc-300 block mt-0.5">Pass (Grade S)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stark Detail Col (5 cols): Stacked Archival Elements + Curatorial Essay */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#0e0e11] divide-y divide-[#27272a]">
            {/* Supporting Artifact 01: Detail Macro Frame */}
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold">
                SUPPORTING SPECIMEN • REF A-01
              </span>
              <div className="grid grid-cols-3 gap-3 items-center">
                <div className="relative aspect-square bg-[#08080a] border border-[#27272a] overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&h=300&q=85"
                    alt="Berserk Dragon Slayer Relic Macro"
                    fill
                    sizes="120px"
                    className="object-cover grayscale contrast-125"
                    unoptimized={true}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Hand-Forged Dragon Slayer 1:6 Diecast Relic
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                    Includes weighted base and battle-weathered blood splatter patina applied by Prime 1 artisans.
                  </p>
                  <span className="text-[10px] font-bold text-zinc-400 block pt-1">
                    INR ₹28,500 • LOT REF #BK-042
                  </span>
                </div>
              </div>
            </div>

            {/* Supporting Artifact 02: Hardcover Archival Set */}
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold">
                SUPPORTING SPECIMEN • REF B-02
              </span>
              <div className="grid grid-cols-3 gap-3 items-center">
                <div className="relative aspect-square bg-[#08080a] border border-[#27272a] overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=300&h=300&q=85"
                    alt="Berserk Deluxe Edition 1-14 Hardcover Set"
                    fill
                    sizes="120px"
                    className="object-cover grayscale contrast-125"
                    unoptimized={true}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Berserk Deluxe Vol. 1–14 Complete Leatherbound Set
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                    Foil-embossed black leatherette covers, oversized 7x10 format, archival acid-free paper.
                  </p>
                  <span className="text-[10px] font-bold text-zinc-400 block pt-1">
                    INR ₹42,000 • LOT REF #BK-089
                  </span>
                </div>
              </div>
            </div>

            {/* Curatorial Essay & Inspection Pledge */}
            <div className="p-6 sm:p-8 space-y-4 bg-[#0a0a0c]">
              <div>
                <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-1">
                  CURATORIAL NOTE
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Every specimen in Drop #04 has undergone optical micro-inspection in our Mumbai staging facility. Sculptural tolerances, joint tensile strength, and holographic provenance stamps are logged on our tamper-evident ledger prior to packaging.
                </p>
              </div>

              {/* Action Buttons: Instant 0ms Snap Inversion */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Link
                  href="/products/lot-0482"
                  className="w-full sm:flex-1 py-3.5 px-5 bg-[#f4f4f4] hover:bg-black hover:text-[#f4f4f4] text-black text-center text-xs font-bold uppercase tracking-[0.2em] border border-[#f4f4f4] hover:border-[#27272a] transition-none no-underline block rounded-none duration-0"
                >
                  [ INSPECT BERSERK LOT ]
                </Link>
                <a
                  href="#catalog"
                  className="w-full sm:w-auto py-3.5 px-5 bg-transparent hover:bg-[#f4f4f4] text-zinc-300 hover:text-black hover:border-[#f4f4f4] text-center text-xs font-bold uppercase tracking-[0.18em] border border-[#27272a] transition-none no-underline block whitespace-nowrap rounded-none duration-0"
                >
                  [ VIEW CATALOG ]
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
