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
  { id: 'ALL', label: 'All Items' },
  { id: 'S_RANK', label: 'Pristine' },
  { id: 'FACTORY_SEALED', label: 'New, Sealed Box' },
  { id: 'ESCROW_VERIFIED', label: 'Safe Escrow' },
  { id: 'UNDER_30K', label: 'Under ₹30,000' },
  { id: 'PRIME_1', label: 'High-Scale Statues' },
];

const BASE_CATEGORIES = [
  { id: 'ALL', label: 'All Collectibles' },
  { id: 'Scale Figure', label: 'Scale Figures' },
  { id: 'Manga Sets', label: 'Manga Editions' },
  { id: 'Nendoroid', label: 'Nendoroids' },
  { id: 'Statues & Resin', label: 'Statues & Resin' },
  { id: 'Mecha & Gunpla', label: 'Mecha & Gunpla' },
  { id: 'Cosplay & Props', label: 'Cosplay & Props' },
];

export function MarketplaceFilterNav(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [totalCount, setTotalCount] = useState<number>(9);
  const [countsMap, setCountsMap] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;
    fetch('/api/listings')
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (!isMounted) return;
        const items = Array.isArray(data.items) ? data.items : [];
        setTotalCount(items.length);
        const map: Record<string, number> = {};
        for (const item of items) {
          const c = item.category || 'Scale Figure';
          map[c] = (map[c] || 0) + 1;
        }
        setCountsMap(map);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

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
      {/* Tier 1: Criteria Bar */}
      <div className="border-b border-[#1F1F1F] bg-[#080808] px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            <span className="shrink-0 mr-1 font-sans uppercase text-[10px] tracking-wider text-[#9CA3AF] font-semibold">
              Filter:
            </span>

            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleFilterClick(tab.id)}
                  className={`px-3 py-1.5 uppercase border transition-colors duration-75 shrink-0 cursor-pointer rounded-none font-sans text-[10px] tracking-wider ${
                    isActive
                      ? 'border-[#F2EFE9] bg-[#F2EFE9] text-[#080808] font-semibold'
                      : 'border-[#1F1F1F] bg-[#0C0C0C] text-[#9CA3AF] hover:border-[#333333] hover:text-[#F2EFE9]'
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
            <span className="font-sans uppercase text-[10px] tracking-wider text-[#10B981] font-semibold">
              {totalCount} Items Live in Catalog
            </span>
          </div>
        </div>
      </div>

      {/* Tier 2: Typographic Category Bar */}
      <div className="bg-[#080808] px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto scrollbar-none">
        <div className="mx-auto flex max-w-7xl items-center gap-2.5 flex-nowrap pb-1">
          {BASE_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = cat.id === 'ALL' ? totalCount : countsMap[cat.id] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 border transition-colors duration-75 shrink-0 cursor-pointer rounded-none uppercase font-sans text-[11px] tracking-wider ${
                  isActive
                    ? 'border-[#F2EFE9] bg-[#F2EFE9] text-[#080808] font-semibold'
                    : 'border-[#1F1F1F] bg-[#0C0C0C] text-[#9CA3AF] hover:border-[#333333] hover:text-[#F2EFE9]'
                }`}
              >
                <span>{cat.label}</span>
                <span className={isActive ? 'text-[#080808]/75 text-[10px] font-medium' : 'text-[#A1A1AA] text-[10px]'}>
                  ({count})
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
