'use client';

/**
 * @file src/presentation/components/navigation/MarketplaceFilterNav.tsx
 *
 * Architectural Criteria & Category Bar for OtakuBazaar.
 * Pins immediately below the sticky 80px navbar (top-20).
 *
 * Strict Architectural Visual Rules:
 * - 0px border-radius, hairline #1F1F1F borders, #080808 canvas.
 * - Pure typographic category tabs (zero micro-thumbnails, zero right-edge clipping).
 * - Active: bg-[#F2EFE9] text-[#080808] font-semibold.
 * - Inactive: bg-[#0C0C0C] text-[#888888] border-[#1F1F1F].
 * - Right Status: #10B981 text on #091812 surface with #193829 border.
 */

import React, { useState, useEffect } from 'react';

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
  },
  {
    id: 'Scale Figure',
    label: 'SCALE FIGURES',
    count: '[6 LOTS]',
  },
  {
    id: 'Manga Sets',
    label: 'MANGA SETS',
    count: '[1 LOTS]',
  },
  {
    id: 'Nendoroid',
    label: 'NENDOROIDS',
    count: '[1 LOTS]',
  },
  {
    id: 'Statues & Resin',
    label: 'STATUES & RESIN',
    count: '[2 LOTS]',
  },
  {
    id: 'Mecha & Gunpla',
    label: 'MECHA & GUNPLA',
    count: '[1 LOTS]',
  },
  {
    id: 'Cosplay & Props',
    label: 'COSPLAY & PROPS',
    count: '[1 LOTS]',
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
    <div className="sticky top-20 z-40 w-full border-b border-[#1F1F1F] bg-[#080808] select-none">
      {/* Tier 1: CRITERIA Pills Bar */}
      <div className="border-b border-[#1F1F1F] bg-[#080808] px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            <span className="shrink-0 mr-1 font-sans uppercase text-[10px] tracking-[0.15em] text-[#777777] font-semibold">
              CRITERIA:
            </span>

            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleFilterClick(tab.id)}
                  className={`px-3 py-1.5 uppercase border transition-colors shrink-0 cursor-pointer rounded-none font-sans text-[10px] tracking-[0.14em] ${
                    isActive
                      ? 'border-[#F2EFE9] bg-[#F2EFE9] text-[#080808] font-semibold'
                      : 'border-[#1F1F1F] bg-[#0C0C0C] text-[#888888] hover:border-[#333333] hover:text-[#F2EFE9]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Status Badge */}
          <div className="hidden md:flex items-center gap-2 shrink-0 border border-[#193829] bg-[#091812] px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-none bg-[#10B981] inline-block" />
            <span className="font-sans uppercase text-[10px] tracking-[0.15em] text-[#10B981] font-semibold">
              INDEX ACTIVE: 9 VERIFIED LOTS
            </span>
          </div>
        </div>
      </div>

      {/* Tier 2: Pure Typographic Category Bar (No Muddy Micro-Thumbnails, Complete Width Clearance) */}
      <div className="bg-[#080808] px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto scrollbar-none">
        <div className="mx-auto flex max-w-7xl items-center gap-2.5 flex-nowrap pb-1">
          {CATEGORY_TABS.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 border transition-colors shrink-0 cursor-pointer rounded-none uppercase font-sans text-[11px] tracking-[0.14em] ${
                  isActive
                    ? 'border-[#F2EFE9] bg-[#F2EFE9] text-[#080808] font-semibold'
                    : 'border-[#1F1F1F] bg-[#0C0C0C] text-[#888888] hover:border-[#333333] hover:text-[#F2EFE9]'
                }`}
              >
                <span>{cat.label}</span>
                <span className={isActive ? 'text-[#080808]/75 text-[10px] font-medium' : 'text-[#555555] text-[10px]'}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MarketplaceFilterNav;
