'use client';

/**
 * @file src/presentation/components/navigation/MarketplaceFilterNav.tsx
 *
 * Dedicated Filter and Category Bar isolated strictly to Marketplace Feed & Catalog pages.
 * Displays:
 * 1. Criteria Filter Bar (All Items, S-Rank Only, Factory Sealed, Escrow Verified)
 * 2. Categories Row (Scale Figures, Statues & Resin, Manga Editions, Nendoroids, Cosplay & Props)
 *
 * Styling Constraints:
 * - 'Satoshi' / 'Cabinet Grotesk' font with regular weight and clean letter spacing.
 * - 1px solid dark borders (#27272a / #1f1f23) and sharp 0px border-radius.
 * - Flat obsidian surfaces, zero drop shadows, zero hover scaling.
 */

import React, { useState, useEffect } from 'react';

// Tier 1: Filter Tabs (Criteria filter pills with clean 1px solid borders and sharp 0px corners)
const FILTER_TABS = [
  { id: 'ALL', label: 'All Items' },
  { id: 'S_RANK', label: 'S-Rank Only' },
  { id: 'FACTORY_SEALED', label: 'Factory Sealed' },
  { id: 'ESCROW_VERIFIED', label: 'Escrow Verified' },
];

// Tier 2: Categories (Text-driven category list with clean letter spacing and subtle active borders)
const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'Scale Figure', label: 'Scale Figures' },
  { id: 'Statues & Resin', label: 'Statues & Resin' },
  { id: 'Manga Sets', label: 'Manga Editions' },
  { id: 'Nendoroid', label: 'Nendoroids' },
  { id: 'Cosplay & Props', label: 'Cosplay & Props' },
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
      className="w-full border-b border-[#27272a] bg-[#0b0b0e] select-none"
      style={{ fontFamily: "'Satoshi', 'Cabinet Grotesk', sans-serif" }}
    >
      {/* Tier 1: Criteria Filter Bar */}
      <div className="border-b border-[#1f1f23] px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-normal pr-1">
              Criteria:
            </span>
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleFilterClick(tab.id)}
                  className={`px-3 py-1 text-xs tracking-wide uppercase transition-none cursor-pointer whitespace-nowrap rounded-none border ${
                    isActive
                      ? 'bg-[#f4f4f4] text-black border-[#f4f4f4] font-semibold'
                      : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 font-normal'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-normal shrink-0">
            <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-none" />
            <span>9 Verified Items Available</span>
          </div>
        </div>
      </div>

      {/* Tier 2: Categories Row */}
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 bg-[#09090b]">
        <div className="mx-auto max-w-7xl flex items-center gap-6 overflow-x-auto scrollbar-none">
          {CATEGORY_TABS.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`text-xs tracking-wider uppercase transition-none cursor-pointer whitespace-nowrap pb-1 border-b-2 ${
                  isActive
                    ? 'border-zinc-100 text-zinc-100 font-semibold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300 font-normal'
                }`}
                style={{ borderRadius: '0px' }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default MarketplaceFilterNav;
