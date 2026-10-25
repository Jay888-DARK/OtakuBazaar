'use client';

/**
 * @file src/presentation/components/home/ArchivalMerchandisingBanners.tsx
 *
 * 4-Column Curated Archival Merchandising Showcase — Museum Mat Layout.
 *
 * Strict Architectural Rules:
 * - Outer 1px solid #1F1F1F card frame with p-6 bg-[#080808].
 * - Kicker (#777777) and editorial serif title (#F2EFE9) at the top.
 * - Padded aspect-[16/10] studio well (p-2 bg-[#0C0C0C] border border-[#1A1A1A]).
 * - ZERO overlay pills covering the collectible photography.
 * - Clean bottom hairline row (border-t border-[#161616] pt-4 mt-4 flex justify-between items-center)
 *   with curation spec on left (#777777) and bracketed link on right ([ VIEW LOT INDEX ]).
 * - ZERO hover animations, scale transforms, or animated arrows.
 */

import React from 'react';
import Image from 'next/image';

interface BannerData {
  id: string;
  header: string;
  subtitle: string;
  spec: string;
  image: string;
  filterType: 'filter' | 'category';
  filterValue: string;
}

const BANNERS: BannerData[] = [
  {
    id: 'b-under30k',
    header: 'UNDER ₹30,000 GRAILS',
    subtitle: 'AUTHENTIC JAPANESE LOTS',
    spec: 'ENTRY-LEVEL ESCROW VERIFIED',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=85',
    filterType: 'filter',
    filterValue: 'UNDER_30K',
  },
  {
    id: 'b-srank',
    header: 'S-RANK FACTORY SEALED',
    subtitle: 'UNOPENED COLLECTOR VAULT',
    spec: 'PRISTINE TOKYO CUSTODY',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=85',
    filterType: 'filter',
    filterValue: 'FACTORY_SEALED',
  },
  {
    id: 'b-prime1',
    header: 'PRIME 1 STUDIO RESIN',
    subtitle: 'POLYSTONE MONUMENTS',
    spec: '1/4 SCALE MASTERPIECE',
    image: '/showcase/guts_berserker_statue.jpg',
    filterType: 'filter',
    filterValue: 'PRIME_1',
  },
  {
    id: 'b-manga',
    header: 'VERIFIED MANGA BOX SETS',
    subtitle: 'COMPLETE ARCHIVAL EDITIONS',
    spec: 'ACID-FREE LEATHERETTE',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=85',
    filterType: 'category',
    filterValue: 'Manga Sets',
  },
];

export function ArchivalMerchandisingBanners(): React.JSX.Element {
  const handleBannerClick = (banner: BannerData) => {
    if (typeof window !== 'undefined') {
      if (banner.filterType === 'filter') {
        window.dispatchEvent(
          new CustomEvent('otaku_filter_select', {
            detail: { filter: banner.filterValue },
          })
        );
      } else {
        window.dispatchEvent(
          new CustomEvent('otaku_category_select', {
            detail: { category: banner.filterValue },
          })
        );
      }

      const catalogElement = document.getElementById('catalog');
      if (catalogElement) {
        catalogElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="w-full bg-[#080808] border-b border-[#1F1F1F] py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 border-b border-[#1F1F1F] pb-3">
          <span className="font-sans text-[10px] tracking-[0.18em] text-[#777777] uppercase font-semibold">
            CURATED ARCHIVAL MERCHANDISING • 4-STAGE LOT FOCUS
          </span>
          <span className="font-sans text-[10px] tracking-[0.15em] text-[#10B981] uppercase font-semibold">
            48H ESCROW BACKED
          </span>
        </div>

        {/* 4-Column Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BANNERS.map((banner) => (
            <div
              key={banner.id}
              onClick={() => handleBannerClick(banner)}
              className="bg-[#080808] border border-[#1F1F1F] hover:border-[#3A3A3A] hover:bg-[#0A0A0A] transition-colors flex flex-col justify-between p-6 group rounded-none cursor-pointer"
            >
              <div>
                {/* 1. Category Kicker & Editorial Serif Title at Top */}
                <span className="block font-sans text-[10px] tracking-[0.16em] text-[#777777] uppercase mb-1.5 font-medium">
                  {banner.subtitle}
                </span>
                <h3 className="font-serif text-[17px] text-[#F2EFE9] uppercase tracking-[0.06em] leading-snug mb-4 group-hover:text-white transition-colors">
                  {banner.header}
                </h3>

                {/* 2. Padded Studio Well (Zero Overlaid Text Pills) */}
                <div className="relative w-full aspect-[16/10] p-2 bg-[#0C0C0C] border border-[#1A1A1A] overflow-hidden flex items-center justify-center">
                  <div className="relative w-full h-full bg-[#111111]">
                    <Image
                      src={banner.image}
                      alt={banner.header}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center w-full h-full"
                      unoptimized={banner.image.startsWith('http')}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Clean Bottom Hairline Row with Spec and Link */}
              <div className="border-t border-[#161616] pt-4 mt-4 flex justify-between items-center font-sans">
                <span className="text-[10px] tracking-[0.14em] text-[#777777] uppercase">
                  {banner.spec}
                </span>
                <span className="text-[11px] tracking-[0.14em] text-[#F2EFE9] group-hover:text-white uppercase transition-colors">
                  [ VIEW LOT INDEX ]
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ArchivalMerchandisingBanners;
