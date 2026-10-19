'use client';

/**
 * @file src/presentation/components/navigation/MarketplaceFilterNav.tsx
 *
 * Sticky Criteria & Category Bar for Stage 2.
 * Pins immediately below the fixed 56px navbar (top-14) once scrolled past the 100vh hero.
 *
 * Strict Brutalist Architecture:
 * - 0px border-radius, hairline #262626 borders, matte black #0a0a0a canvas.
 * - 0ms instant border/background swaps.
 * - Bracketed uppercase labels: [ ALL ARCHIVAL LOTS ], [ S-RANK ONLY ], etc.
 * - Emerald #10b981 status indicator for INDEX ACTIVE: 9 VERIFIED LOTS.
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const FILTER_TABS = [
  { id: 'ALL', label: '[ ALL ARCHIVAL LOTS ]' },
  { id: 'S_RANK', label: '[ S-RANK ONLY ]' },
  { id: 'FACTORY_SEALED', label: '[ FACTORY SEALED ]' },
  { id: 'ESCROW_VERIFIED', label: '[ VERIFIED ESCROW ]' },
  { id: 'UNDER_30K', label: '[ UNDER ₹30,000 ]' },
  { id: 'PRIME_1', label: '[ PRIME 1 RESIN ]' },
];

const CATEGORY_TABS = [
  {
    id: 'ALL',
    label: 'ALL ARCHIVAL LOTS',
    count: '[9 LOTS]',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'Scale Figure',
    label: 'SCALE FIGURES',
    count: '[6 LOTS]',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'Manga Sets',
    label: 'MANGA SETS',
    count: '[1 LOTS]',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'Nendoroid',
    label: 'NENDOROIDS',
    count: '[1 LOTS]',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'Statues & Resin',
    label: 'STATUES & RESIN',
    count: '[2 LOTS]',
    image: '/showcase/guts_berserker_statue.jpg',
  },
  {
    id: 'Mecha & Gunpla',
    label: 'MECHA & GUNPLA',
    count: '[1 LOTS]',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'Cosplay & Props',
    label: 'COSPLAY & PROPS',
    count: '[1 LOTS]',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=240&q=80',
  },
];

export function MarketplaceFilterNav(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFilterExternal = (e: Event) => {
      const customEvent = e as CustomEvent<{ filter?: string }>;
      if (customEvent.detail?.filter) {
        setActiveFilter(customEvent.detail.filter);
      }
    };

    const handleCategoryExternal = (e: Event) => {
      const customEvent = e as CustomEvent<{ category?: string }>;
      if (customEvent.detail?.category) {
        setActiveCategory(customEvent.detail.category);
      }
    };

    window.addEventListener('otaku_filter_select', handleFilterExternal);
    window.addEventListener('otaku_category_select', handleCategoryExternal);

    return () => {
      window.removeEventListener('otaku_filter_select', handleFilterExternal);
      window.removeEventListener('otaku_category_select', handleCategoryExternal);
    };
  }, []);

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('otaku_filter_select', {
          detail: { filter: filterId },
        })
      );
    }
  };

  const handleCategoryClick = (catId: string) => {
    setActiveCategory(catId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('otaku_category_select', {
          detail: { category: catId },
        })
      );
    }
  };

  return (
    <div className="sticky top-14 z-40 w-full border-b border-[#262626] bg-[#0a0a0a] select-none">
      {/* Tier 1: CRITERIA Pills Bar */}
      <div className="border-b border-[#262626] bg-[#0a0a0a] px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            <span
              style={{
                fontFamily: 'var(--font-swiss), sans-serif',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#8a8a8a',
              }}
              className="shrink-0 mr-1 font-swiss uppercase"
            >
              CRITERIA:
            </span>

            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleFilterClick(tab.id)}
                  style={{
                    fontFamily: 'var(--font-swiss), sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                  className={`px-3 py-1 uppercase border transition-none shrink-0 cursor-pointer rounded-none font-swiss ${
                    isActive
                      ? 'border-white bg-white text-black'
                      : 'border-[#262626] bg-[#141414] text-zinc-300 hover:border-zinc-500 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Status Badge */}
          <div className="hidden md:flex items-center gap-2 shrink-0 border border-[#262626] bg-[#141414] px-3 py-1">
            <span className="w-2 h-2 rounded-none bg-[#10b981] inline-block" />
            <span
              style={{
                fontFamily: 'var(--font-swiss), sans-serif',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#8a8a8a',
              }}
              className="font-swiss uppercase"
            >
              INDEX ACTIVE: 9 VERIFIED LOTS
            </span>
          </div>
        </div>
      </div>

      {/* Tier 2: Horizontal Category Thumbnail Strip */}
      <div className="bg-[#0a0a0a] px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          {CATEGORY_TABS.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center gap-2.5 px-3 py-1.5 border transition-none shrink-0 cursor-pointer rounded-none ${
                  isActive
                    ? 'border-white bg-[#141414] text-white'
                    : 'border-[#262626] bg-[#0a0a0a] text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-[#141414]'
                }`}
              >
                <div className="relative w-6 h-6 shrink-0 bg-[#141414] border border-[#262626] overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    sizes="24px"
                    className="object-cover"
                    unoptimized={cat.image.startsWith('http')}
                  />
                </div>
                <div className="flex items-center gap-1.5 text-left">
                  <span
                    style={{
                      fontFamily: 'var(--font-swiss), sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                    className="whitespace-nowrap font-swiss"
                  >
                    {cat.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-swiss), sans-serif',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#8a8a8a',
                    }}
                    className="whitespace-nowrap font-swiss"
                  >
                    {cat.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MarketplaceFilterNav;
