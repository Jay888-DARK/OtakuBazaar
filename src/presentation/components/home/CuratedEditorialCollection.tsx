'use client';

/**
 * @file src/presentation/components/home/CuratedEditorialCollection.tsx
 *
 * Feature: Curated Editorial Collection for OtakuBazaar.
 * Primary featured collection drop for "The Berserk Collection" featuring Guts (lot-0482).
 *
 * Strict Design System:
 * - 0px border-radius throughout.
 * - 1px solid dark borders (#27272a).
 * - Flat dark backgrounds (#09090b, #0c0c0e, #0a0a0c, #0e0e11).
 * - Simple, clear, standard e-commerce English.
 * - Prominent "Buy Now" button with integrated instant checkout.
 */

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { InstantCheckoutDrawer } from '@/presentation/components/checkout/InstantCheckoutDrawer';

export function CuratedEditorialCollection(): React.JSX.Element {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <section
      aria-label="Featured Collection — The Berserk Collection"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16 select-none"
    >
      <div className="border border-[#27272a] bg-[#0c0c0e]">
        {/* Section Header */}
        <div className="border-b border-[#27272a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-[#0a0a0c]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-bold border border-[#27272a] bg-[#111114] px-2.5 py-1">
                FEATURED COLLECTION
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-semibold">
                ITEM NO. BK-1989-M
              </span>
            </div>
            {/* Deliberately Oversized Section Header */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-100 uppercase tracking-tight leading-none">
              The Berserk Collection
            </h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-xl leading-relaxed font-sans">
              Kentaro Miura’s dark fantasy masterpiece in high-grade polystone, forged steel, and hardcover volumes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold">
              STATUS:
            </span>
            <span className="border border-[#27272a] bg-[#09090b] px-3 py-1.5 text-[10px] font-bold text-zinc-200 tracking-wider uppercase">
              IN STOCK (1 OF 1)
            </span>
          </div>
        </div>

        {/* Asymmetrical 2-Column Layout (7:5 Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Dominant Hero Column (Left Side, 7 cols): Main Image with Details */}
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#27272a] bg-[#09090b] flex flex-col justify-between relative">
            <span className="marginal-metadata marginal-tl text-zinc-600">
              INSPECTED: 2026-09-28
            </span>
            <span className="marginal-metadata marginal-br text-zinc-600">
              CONDITION: S-RANK (MINT)
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
              <div className="absolute top-4 left-4 bg-[#09090b] border border-[#27272a] px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-300">
                ITEM ID: BK-001 • PRIME 1 STUDIO
              </div>
              <div className="absolute bottom-4 right-4 bg-[#09090b] border border-[#27272a] px-3 py-1.5 text-[9px] font-bold tracking-widest text-zinc-400 uppercase">
                EDITION: 042 / 350
              </div>
            </div>

            {/* Main Product Info & Specs */}
            <div className="p-6 sm:p-8 space-y-4 bg-[#0c0c0e]">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#27272a] pb-4">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-1">
                    PRE-PAINTED POLYSTONE STATUE
                  </span>
                  <h3 className="text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-100">
                    Guts Berserker Armor 1/4 Scale Statue
                  </h3>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-1">
                    PRICE
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
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Authenticity Seal</span>
                  <span className="text-[11px] font-bold uppercase text-zinc-300 block mt-0.5">Hologram S-01</span>
                </div>
                <div className="border border-[#27272a] bg-[#09090b] p-3">
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Origin</span>
                  <span className="text-[11px] font-bold uppercase text-zinc-300 block mt-0.5">Tokyo, Japan</span>
                </div>
                <div className="border border-[#27272a] bg-[#09090b] p-3">
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Condition</span>
                  <span className="text-[11px] font-bold uppercase text-zinc-300 block mt-0.5">Grade S (Mint)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Context Column (Right Side, 5 cols): Included Items & Purchase CTA */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#0e0e11] divide-y divide-[#27272a]">
            {/* Included Item 01 */}
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold">
                INCLUDED ACCESSORY • ITEM A-01
              </span>
              <div className="grid grid-cols-3 gap-3 items-center">
                <div className="relative aspect-square bg-[#08080a] border border-[#27272a] overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&h=300&q=85"
                    alt="Berserk Dragon Slayer Relic"
                    fill
                    sizes="120px"
                    className="object-cover grayscale contrast-125"
                    unoptimized={true}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Hand-Forged Dragon Slayer 1:6 Diecast Replica
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                    Includes weighted display base and detailed weathered battle finish by Prime 1 artisans.
                  </p>
                  <span className="text-[10px] font-bold text-zinc-400 block pt-1">
                    INR ₹28,500 • ITEM REF #BK-042
                  </span>
                </div>
              </div>
            </div>

            {/* Included Item 02 */}
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold">
                INCLUDED ACCESSORY • ITEM B-02
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
                    INR ₹42,000 • ITEM REF #BK-089
                  </span>
                </div>
              </div>
            </div>

            {/* Product Note & Primary Buy Actions */}
            <div className="p-6 sm:p-8 space-y-4 bg-[#0a0a0c]">
              <div>
                <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-1">
                  PRODUCT NOTE
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Every item in this collection has been inspected in our staging facility. Sculptural tolerances, joint stability, and official holographic authenticity stamps are verified before packaging.
                </p>
              </div>

              {/* Action Buttons: Clean & High-Contrast (0ms Snap Inversion) */}
              <div className="space-y-2 pt-2">
                {/* Primary Buy Now Button */}
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-4 px-6 bg-[#f4f4f4] hover:bg-white text-black text-center text-xs font-extrabold uppercase tracking-[0.2em] border border-[#f4f4f4] cursor-pointer block rounded-none transition-none"
                >
                  [ BUY NOW — ₹1,24,000 ]
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <Link
                    href="/products/lot-0482"
                    className="w-full sm:flex-1 py-3 px-4 bg-transparent hover:bg-[#18181b] text-zinc-300 hover:text-white text-center text-xs font-bold uppercase tracking-[0.18em] border border-[#27272a] transition-none no-underline block rounded-none"
                  >
                    [ VIEW DETAILS ]
                  </Link>
                  <a
                    href="#catalog"
                    className="w-full sm:w-auto py-3 px-4 bg-transparent hover:bg-[#18181b] text-zinc-400 hover:text-white text-center text-xs font-bold uppercase tracking-[0.16em] border border-[#27272a] transition-none no-underline block whitespace-nowrap rounded-none"
                  >
                    [ VIEW CATALOG ]
                  </a>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="pt-3 border-t border-[#27272a] flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 bg-zinc-400" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 bg-zinc-400" />
                  <span>Insured Shipping</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 bg-zinc-400" />
                  <span>48-Hour Inspection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instant Checkout Drawer for Direct Purchases */}
      {isCheckoutOpen && (
        <InstantCheckoutDrawer
          productId="lot-0482"
          lotId="lot-0482"
          price={124000}
          itemTitle="Guts Berserker Armor 1/4 Scale Statue"
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </section>
  );
}

export default CuratedEditorialCollection;
