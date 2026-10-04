'use client';

/**
 * @file src/presentation/components/navigation/MarketplaceFilterNav.tsx
 *
 * Dedicated Filter and Category Bar replicated precisely from Screenshot 822.
 * Displays:
 * 1. Criteria Filter Bar ([ ALL ARCHIVAL LOTS ], [ S-RANK ONLY ], [ FACTORY SEALED ], etc.)
 *    and right-aligned "■ INDEX ACTIVE: 9 VERIFIED LOTS"
 * 2. Visual Categories Row with collectible thumbnail previews and lot counts:
 *    (ALL ARCHIVAL LOTS [9 LOTS], SCALE FIGURES [6 LOTS], MANGA SETS [1 LOTS], etc.)
 *
 * Strict Brutalist Constraints:
 * - 0px border-radius throughout.
 * - 1px solid borders (#262626 / #27272a).
 * - Monochromatic palette, Satoshi font.
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Tier 1: Filter Tabs (Criteria filter pills from Screenshot 822)
const FILTER_TABS = [
  { id: 'ALL', label: '[ ALL ARCHIVAL LOTS ]' },
  { id: 'S_RANK', label: '[ S-RANK ONLY ]' },
  { id: 'FACTORY_SEALED', label: '[ FACTORY SEALED ]' },
  { id: 'ESCROW_VERIFIED', label: '[ VERIFIED ESCROW ]' },
  { id: 'UNDER_30K', label: '[ UNDER ₹30,000 ]' },
  { id: 'PRIME_1', label: '[ PRIME 1 RESIN ]' },
];

// Tier 2: Visual Categories with Thumbnails from Screenshot 822
const CATEGORY_TABS = [
  {
    id: 'ALL',
    label: 'ALL ARCHIVAL LOTS',
    count: '[9 LOTS]',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'Scale Figure',
    label: 'SCALE FIGURES',
    count: '[6 LOTS]',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'Manga Sets',
    label: 'MANGA SETS',
    count: '[1 LOTS]',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'Nendoroid',
    label: 'NENDOROIDS',
    count: '[1 LOTS]',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'Statues & Resin',
    label: 'STATUES & RESIN',
    count: '[2 LOTS]',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'Mecha & Gunpla',
    label: 'MECHA & GUNPLA',
    count: '[1 LOTS]',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'Cosplay & Props',
    label: 'COSPLAY & PROPS',
    count: '[1 LOTS]',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=200&q=80',
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
    <nav
      aria-label="Marketplace Feed Navigation & Filters"
      className="w-full border-b border-[#27272a] bg-[#09090b] select-none"
      style={{ fontFamily: "'Satoshi', sans-serif" }}
    >
      {/* Tier 1: Criteria Filter Bar */}
      <div className="border-b border-[#1f1f23] px-4 sm:px-6 lg:px-8 py-2">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold pr-1">
              CRITERIA:
            </span>
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleFilterClick(tab.id)}
                  className={`px-2.5 py-1 text-[11px] tracking-wider uppercase transition-none cursor-pointer whitespace-nowrap rounded-none border ${
                    isActive
                      ? 'bg-transparent text-white border-white font-bold'
                      : 'bg-transparent text-zinc-400 border-[#27272a] hover:border-zinc-700 hover:text-zinc-200 font-medium'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] uppercase tracking-wider text-zinc-400 font-medium shrink-0">
            <span className="text-zinc-500">■</span>
            <span>INDEX ACTIVE: 9 VERIFIED LOTS</span>
          </div>
        </div>
      </div>

      {/* Tier 2: Visual Categories with Thumbnails */}
      <div className="px-4 sm:px-6 lg:px-8 py-3 bg-[#09090b]">
        <div className="mx-auto max-w-7xl flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
          {CATEGORY_TABS.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className="group flex flex-col items-start gap-1.5 cursor-pointer shrink-0 text-left transition-none outline-none focus-visible:outline-none"
              >
                {/* Thumbnail Image Box */}
                <div
                  className={`relative w-14 h-9 overflow-hidden bg-[#111114] border transition-none ${
                    isActive
                      ? 'border-white'
                      : 'border-[#27272a] group-hover:border-zinc-500'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    sizes="56px"
                    className={`object-cover contrast-110 grayscale transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'
                    }`}
                  />
                </div>

                {/* Category Name & Count */}
                <div className="flex flex-col items-start leading-none">
                  <span
                    className={`text-[10px] tracking-wider uppercase leading-tight font-bold transition-colors ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  >
                    {cat.label}
                  </span>
                  <span className="text-[9px] tracking-wider uppercase text-[#737373] mt-0.5 font-normal">
                    {cat.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default MarketplaceFilterNav;
