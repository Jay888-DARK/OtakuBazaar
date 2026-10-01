/**
 * @file src/presentation/components/navigation/VisualCategoryBar.tsx
 *
 * Streamlined text-driven category bar for OtakuBazaar.
 * Clean letter spacing, subtle active borders, zero image squares, and zero brackets.
 */

'use client';

import React, { useState, useEffect } from 'react';

export interface CategoryItem {
  id: string;
  name: string;
  count: number;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'ALL', name: 'All Collectibles', count: 9 },
  { id: 'Scale Figure', name: 'Scale Figures', count: 6 },
  { id: 'Statues & Resin', name: 'Statues & Resin', count: 2 },
  { id: 'Manga Sets', name: 'Manga Editions', count: 1 },
  { id: 'Nendoroid', name: 'Nendoroids', count: 1 },
  { id: 'Cosplay & Props', name: 'Cosplay & Props', count: 1 },
];

interface VisualCategoryBarProps {
  activeCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
}

export function VisualCategoryBar({
  activeCategory = 'ALL',
  onSelectCategory,
}: VisualCategoryBarProps): React.JSX.Element {
  const [selectedId, setSelectedId] = useState<string>(activeCategory);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleCategoryEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ category?: string }>;
      if (customEvent.detail?.category) {
        setSelectedId(customEvent.detail.category);
      }
    };

    window.addEventListener('otaku_category_select', handleCategoryEvent);
    return () => {
      window.removeEventListener('otaku_category_select', handleCategoryEvent);
    };
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedId(categoryId);
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('otaku_category_select', {
          detail: { category: categoryId },
        })
      );
    }
  };

  return (
    <nav
      aria-label="Archival Category Navigation"
      className="w-full border-b border-[#27272a] bg-[#0c0c0e] py-2.5 px-4 sm:px-6 lg:px-8 select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-6 shrink-0">
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold pr-2">
            Categories:
          </span>
          {CATEGORIES.map((cat) => {
            const isActive = (onSelectCategory ? activeCategory : selectedId) === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-baseline gap-1.5 text-[11px] uppercase tracking-[0.18em] transition-none cursor-pointer whitespace-nowrap pb-1 border-b-2 ${
                  isActive
                    ? 'border-zinc-100 text-zinc-100 font-bold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 font-medium'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[9px] text-zinc-500 font-normal">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium shrink-0">
          <span className="inline-block w-1.5 h-1.5 bg-emerald-500" />
          <span>Real-time Vault Sync Active</span>
        </div>
      </div>
    </nav>
  );
}

export default VisualCategoryBar;
