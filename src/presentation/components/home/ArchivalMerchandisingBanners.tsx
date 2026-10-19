'use client';

/**
 * @file src/presentation/components/home/ArchivalMerchandisingBanners.tsx
 *
 * 4-Column Curated Archival Merchandising Banners for Stage 2.
 * Placed immediately below the sticky category strip.
 *
 * Strict Brutalist Architecture:
 * - 0px border-radius, hairline #262626 borders, elevated #141414 surface.
 * - 0ms instant border/background swaps.
 * - [ VIEW LOT INDEX ] trigger button with filter telemetry.
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
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    filterType: 'filter',
    filterValue: 'UNDER_30K',
  },
  {
    id: 'b-srank',
    header: 'S-RANK FACTORY SEALED',
    subtitle: 'UNOPENED COLLECTOR VAULT',
    spec: 'PRISTINE TOKYO CUSTODY',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    filterType: 'filter',
    filterValue: 'FACTORY_SEALED',
  },
  {
    id: 'b-prime1',
    header: 'PRIME 1 STUDIO RESIN',
    subtitle: 'POLYSTONE MONUMENTS',
    spec: '1/4 SCALE MUSEUM MASTERPIECE',
    image: '/showcase/guts_berserker_statue.jpg',
    filterType: 'filter',
    filterValue: 'PRIME_1',
  },
  {
    id: 'b-manga',
    header: 'VERIFIED MANGA BOX SETS',
    subtitle: 'COMPLETE ARCHIVAL EDITIONS',
    spec: 'ACID-FREE LEATHERETTE',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
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
    <section className="w-full bg-[#0a0a0a] border-b border-[#262626] py-6 px-4 sm:px-6 lg:px-8 select-none">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-4 border-b border-[#262626] pb-2">
          <span
            style={{
              fontFamily: 'var(--font-swiss), sans-serif',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#8a8a8a',
            }}
            className="uppercase font-swiss"
          >
            CURATED ARCHIVAL MERCHANDISING • 4-STAGE LOT FOCUS
          </span>
          <span
            style={{
              fontFamily: 'var(--font-swiss), sans-serif',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#8a8a8a',
            }}
            className="uppercase font-swiss"
          >
            48H ESCROW BACKED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BANNERS.map((banner) => (
            <div
              key={banner.id}
              className="bg-[#141414] border border-[#262626] hover:border-zinc-500 transition-none flex flex-col justify-between p-4 group rounded-none"
            >
              <div>
                {/* Visual Header */}
                <span
                  style={{
                    fontFamily: 'var(--font-swiss), sans-serif',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    color: '#8a8a8a',
                    textTransform: 'uppercase',
                  }}
                  className="block mb-1 font-swiss uppercase"
                >
                  {banner.subtitle}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-mechanical), sans-serif',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                  }}
                  className="mb-3 font-mechanical uppercase leading-tight"
                >
                  {banner.header}
                </h3>

                {/* Media Preview Box */}
                <div className="relative w-full aspect-[16/10] bg-[#0a0a0a] border border-[#262626] overflow-hidden mb-3">
                  <Image
                    src={banner.image}
                    alt={banner.header}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover contrast-105"
                    unoptimized={banner.image.startsWith('http')}
                  />
                  <div
                    style={{
                      fontFamily: 'var(--font-swiss), sans-serif',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}
                    className="absolute bottom-2 left-2 border border-[#262626] bg-[#0a0a0a] px-2 py-0.5 text-zinc-300 font-swiss"
                  >
                    {banner.spec}
                  </div>
                </div>
              </div>

              {/* Action Trigger */}
              <button
                type="button"
                onClick={() => handleBannerClick(banner)}
                style={{
                  fontFamily: 'var(--font-swiss), sans-serif',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
                className="w-full mt-2 py-2 border border-[#262626] bg-[#0a0a0a] hover:bg-white hover:text-black hover:border-white text-zinc-300 transition-none cursor-pointer rounded-none text-center font-swiss uppercase"
              >
                [ VIEW LOT INDEX ]
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ArchivalMerchandisingBanners;
