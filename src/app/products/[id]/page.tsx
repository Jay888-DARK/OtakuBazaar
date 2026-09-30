'use client';

/**
 * @file src/app/products/[id]/page.tsx
 *
 * Unified Product Detail Page (PDP) for OtakuBazaar.
 * Strict, editorial "Auction Archive" grid layout globally applied to all product pages.
 *
 * ARCHITECTURAL SPECIFICATION:
 * 1. Strict Grid Structure:
 *    - Structured data table / technical schematic appearance.
 *    - 0px border-radius rectangular cells separated by 1px solid dark gray/charcoal lines (#27272a).
 *    - STRICTLY NO Bento grids, no soft corners.
 * 2. The Hero Cell (Left Side, 65-70% width):
 *    - Dedicated primary product media stage (interactive 360° turnaround, 60fps video, or physical photography).
 *    - ANCHORED AT THE BOTTOM OF THE CELL: Main product title, material casting details, specifications matrix,
 *      and primary archival valuation/price.
 * 3. The Context Column (Right Side, 30-35% width):
 *    - Vertically stacked context column divided by 1px borders.
 *    - Top Row: Acquisition Action Block (15-min safe lock escrow trigger & proceed buttons).
 *    - Middle Rows: "SUPPORTING SPECIMEN" cells (smaller high-contrast thumbnails of secondary relics/accessories with price & lot refs).
 *    - Bottom Row: "CURATORIAL NOTE" cell (detailed optical inspection log, joint tolerances, tamper seals, and provenance).
 * 4. Global Style Enforcement:
 *    - High-end editorial typography with all-caps overline telemetry labels.
 *    - Completely flat UI (no drop shadows, glassmorphism, or hover animations).
 *    - All backend logic, routing, and checkout actions preserved intact.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MOCK_PRODUCTS } from '@/infrastructure/data/mockProducts';
import { ProductDemoGallery } from '@/presentation/components/products/ProductDemoGallery';
import { ProductDetailSkeleton } from '@/presentation/components/ui/SkeletonLoaders';
import { openProvenanceManifest } from '@/presentation/components/provenance/ProvenanceManifestModal';

interface ProductDetailsProps {
  params: Promise<{ id: string }> | { id: string };
}

// Supporting specimen archive items for the context column
const SUPPORTING_SPECIMENS = [
  {
    ref: 'REF BK-042',
    title: 'Forged 1:6 Diecast Dragon Slayer Relic',
    price: 28500,
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&h=300&q=85',
    spec: 'Battle-Weathered Patina • Prime 1 Artisans',
  },
  {
    ref: 'REF BK-089',
    title: 'Berserk Deluxe Vol. 1–14 Leatherbound Set',
    price: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=300&h=300&q=85',
    spec: 'Foil-Embossed Black Leatherette • Archival Acid-Free',
  },
  {
    ref: 'REF BK-104',
    title: 'Tamper-Evident Holographic Authentication Tag',
    price: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&h=300&q=85',
    spec: 'Double-Entry Custody Ledger Serial Token',
  },
];

export default function ProductDetailsPage({ params }: ProductDetailsProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.resolve(params).then((p) => {
      setResolvedParams(p);
      const timer = setTimeout(() => setIsLoading(false), 200);
      return () => clearTimeout(timer);
    });
  }, [params]);

  const rawId = resolvedParams?.id || 'lot-0482';
  const currentProduct =
    MOCK_PRODUCTS.find((p) => p.id.toLowerCase() === rawId.toLowerCase()) ||
    MOCK_PRODUCTS[1] ||
    MOCK_PRODUCTS[0];

  const lotDisplayId = currentProduct?.lotNumber
    ? `LOT-${currentProduct.lotNumber}`
    : rawId.toUpperCase();

  const formattedPrice = currentProduct?.price
    ? `₹${currentProduct.price.toLocaleString('en-IN')}`
    : '₹89,000';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="h-4 w-48 bg-[#141418] border border-zinc-800" />
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Navigation Breadcrumbs & System Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#27272a] pb-3 gap-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">
            <Link href="/" className="hover:text-zinc-300 transition-colors no-underline text-zinc-500">
              Vault Home
            </Link>
            <span>/</span>
            <Link href="/#catalog" className="hover:text-zinc-300 transition-colors no-underline text-zinc-500">
              Archival Lots
            </Link>
            <span>/</span>
            <span className="text-zinc-300 font-bold">{lotDisplayId}</span>
          </div>

          <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-zinc-500">
            <span className="inline-block w-1.5 h-1.5 bg-zinc-400" />
            <span>ESCROW LEDGER STATUS: ACTIVE (DOUBLE-ENTRY VAULT)</span>
          </div>
        </div>

        {/* 1. The Strict Grid Structure: Data Table / Technical Schematic Layout */}
        <div className="border border-[#27272a] bg-[#0c0c0e]">
          {/* Top Archival Header Bar */}
          <div className="border-b border-[#27272a] p-4 sm:p-6 bg-[#0a0a0c] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-bold border border-zinc-700 bg-zinc-900 px-2 py-0.5">
                  ACCESSION #{currentProduct?.lotNumber || '0482'}
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-medium">
                  CATEGORY: {currentProduct?.category?.toUpperCase() || 'SCALE FIGURE'}
                </span>
              </div>
              <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider block">
                AUTHENTICATED JAPANESE CUSTODY ARCHIVE • TOKYO/MUMBAI VAULT
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-semibold">
                CONDITION:
              </span>
              <span className="border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-[10px] font-bold text-zinc-200 tracking-wider uppercase">
                [{currentProduct?.condition === 'NEW' ? 'S-RANK' : 'A-RANK'}] FACTORY SEALED
              </span>
            </div>
          </div>

          {/* 2-Column Technical Schematic Grid (68% Hero Left / 32% Stacked Context Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#27272a]">
            {/* 2. THE HERO CELL (LEFT SIDE, 68% Width / 8 of 12 cols) */}
            <div className="lg:col-span-8 flex flex-col justify-between bg-[#09090b]">
              {/* Primary Interactive Media Stage (Turnaround / 60fps Video / Factory Stills) */}
              <div className="border-b border-[#27272a] bg-[#070709]">
                <ProductDemoGallery
                  initialTitle={currentProduct?.title}
                  lotId={lotDisplayId}
                />
              </div>

              {/* ANCHORED AT THE BOTTOM OF THE HERO CELL: Title, Material Details, & Valuation */}
              <div className="p-6 sm:p-8 space-y-6 bg-[#0c0c0e]">
                {/* Main Product Title & Valuation Row */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#27272a] pb-6 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block">
                      MASTER POLYSILICONE CASTING • PRIVATE COLLECTION
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-100">
                      {currentProduct?.title || 'Guts Berserker Armor Unleashed 1/4 Scale'}
                    </h1>
                    <p className="text-xs text-zinc-400 max-w-xl leading-relaxed pt-1">
                      Factory sealed museum-grade import. Backed by 48-hour unboxing inspection escrow, holographic tamper seal verification, and insured courier transit.
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-1">
                      PRIMARY VALUATION
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-zinc-100 block">
                      {formattedPrice}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-medium mt-0.5 block">
                      TAXES &amp; TRANSIT INCLUDED
                    </span>
                  </div>
                </div>

                {/* Technical Specifications Matrix (4 Rectangular Cells) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="border border-zinc-800 bg-[#09090b] p-3">
                    <span className="block text-[8px] uppercase tracking-widest text-zinc-500">
                      Manufacturer
                    </span>
                    <span className="text-[11px] font-bold uppercase text-zinc-300">
                      Prime 1 / Kadokawa
                    </span>
                  </div>
                  <div className="border border-zinc-800 bg-[#09090b] p-3">
                    <span className="block text-[8px] uppercase tracking-widest text-zinc-500">
                      Scale &amp; Mass
                    </span>
                    <span className="text-[11px] font-bold uppercase text-zinc-300">
                      1/4 Scale • 18.4 KG
                    </span>
                  </div>
                  <div className="border border-zinc-800 bg-[#09090b] p-3">
                    <span className="block text-[8px] uppercase tracking-widest text-zinc-500">
                      Tamper Seal
                    </span>
                    <span className="text-[11px] font-bold uppercase text-zinc-300 font-mono">
                      OKB-2026-X
                    </span>
                  </div>
                  <div className="border border-zinc-800 bg-[#09090b] p-3">
                    <span className="block text-[8px] uppercase tracking-widest text-zinc-500">
                      Escrow Window
                    </span>
                    <span className="text-[11px] font-bold uppercase text-zinc-300">
                      48 Hours Inspection
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. THE CONTEXT COLUMN (RIGHT SIDE, 32% Width / 4 of 12 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between divide-y divide-[#27272a] bg-[#0e0e11]">
              {/* Row 1: Acquisition Action Cell */}
              <div className="p-6 space-y-4 bg-[#0a0a0c]">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-1">
                    ACQUISITION PROTOCOL
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold uppercase tracking-wider text-zinc-100">
                      {formattedPrice}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-semibold border border-zinc-700 bg-zinc-900 px-2 py-0.5">
                      ESCROW PROTECTED
                    </span>
                  </div>
                </div>

                {/* Primary Safe Lock CTA */}
                <Link href="/checkout" className="block w-full no-underline">
                  <button
                    type="button"
                    id="add-to-cart-btn"
                    data-testid="add-to-cart"
                    className="w-full py-3.5 px-4 font-bold text-xs uppercase tracking-[0.2em] text-black bg-zinc-100 hover:bg-white border border-zinc-100 transition-colors cursor-pointer block rounded-none text-center"
                  >
                    Acquire via 15-Min Safe Lock →
                  </button>
                </Link>

                {/* Secondary Escrow Checkout */}
                <Link
                  href="/checkout"
                  id="go-to-checkout"
                  data-testid="checkout-button"
                  className="w-full py-2.5 px-4 font-semibold text-xs uppercase tracking-[0.18em] text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 bg-zinc-900/60 text-center transition-colors block no-underline rounded-none"
                >
                  Proceed to Escrow Checkout
                </Link>

                {/* Protection Bulletpoints */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-zinc-400" />
                    <span>Funds held in double-entry escrow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-zinc-400" />
                    <span>Courier transit insurance included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-zinc-400" />
                    <span>100% refund if inspection fails</span>
                  </div>
                </div>
              </div>

              {/* Row 2: SUPPORTING SPECIMENS (Stacked cells with smaller thumbnails & refs) */}
              <div className="divide-y divide-[#27272a]">
                <div className="px-6 py-3 bg-[#0c0c0e]">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-bold block">
                    SUPPORTING SPECIMENS &amp; ARCHIVAL ACCESSORIES
                  </span>
                </div>

                {SUPPORTING_SPECIMENS.map((specimen) => (
                  <div key={specimen.ref} className="p-4 sm:p-5 flex items-center gap-4 bg-[#09090b]">
                    {/* Small Photographic Specimen Cell */}
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 aspect-square bg-[#0c0c0e] border border-[#27272a] shrink-0 overflow-hidden">
                      <Image
                        src={specimen.imageUrl}
                        alt={specimen.title}
                        fill
                        sizes="72px"
                        className="object-cover grayscale contrast-125"
                        unoptimized={true}
                      />
                    </div>

                    {/* Specimen Telemetry */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                          {specimen.ref}
                        </span>
                        <span className="text-[11px] font-bold text-zinc-200">
                          ₹{specimen.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 line-clamp-1">
                        {specimen.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 line-clamp-1">
                        {specimen.spec}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 3: CURATORIAL NOTE (Bottom Cell: Detailed optical inspection log & provenance) */}
              <div className="p-6 space-y-3 bg-[#0a0a0c] relative">
                <span className="marginal-metadata marginal-tl text-zinc-600">
                  PROTOCOL: CUSTODY RELEASE
                </span>
                <span className="marginal-metadata marginal-br text-zinc-600">
                  SEAL: OKB-2026-X
                </span>

                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-bold">
                    CURATORIAL NOTE &amp; PROVENANCE LOG
                  </span>
                  <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase">
                    INSPECTION #OKB-994
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Specimen custody verified at Mumbai Staging Terminal Bay 04. Optical calibration checks verified zero paint bleed across facial sculpt contours. Joint torque tolerances measured at 0.02mm deviation from Japanese factory master spec. Micro-fiber packaging sealed under dry nitrogen containment.
                </p>

                {/* Feature 3: Interactive Trigger for Expanded Provenance Manifest */}
                <button
                  type="button"
                  onClick={() =>
                    openProvenanceManifest({
                      lotRef: lotDisplayId,
                      itemTitle: currentProduct?.title,
                      series: currentProduct?.category,
                      fabricator: 'PRIME 1 STUDIO / KADOKAWA',
                    })
                  }
                  className="w-full p-2.5 bg-[#09090b] border border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-300 brutalist-btn cursor-pointer flex items-center justify-between"
                >
                  <span className="font-bold">[ VIEW FULL IMMUTABLE COA MANIFEST &amp; LEDGER HASH ]</span>
                  <span>→</span>
                </button>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[9px] uppercase tracking-widest text-zinc-500">
                  <span>Lead Authenticator</span>
                  <span className="text-zinc-300 font-semibold">T. Yagi (Senior Verifier)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
