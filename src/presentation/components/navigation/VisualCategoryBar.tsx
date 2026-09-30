'use client';

/**
 * @file src/presentation/components/navigation/VisualCategoryBar.tsx
 *
 * Horizontally scrollable Visual Category Navigation Bar for OtakuBazaar.
 * Stark, high-contrast photography cropped into perfect squares with 0px border radius
 * and 1px solid dark gray borders. Zero emojis, zero Lucide icons.
 */

import React, { useState } from 'react';
import Image from 'next/image';

export interface VisualCategory {
  id: string;
  name: string;
  lotCount: number;
  imageUrl: string;
  altText: string;
}

export const VISUAL_CATEGORIES: VisualCategory[] = [
  {
    id: 'ALL',
    name: 'All Archival Lots',
    lotCount: 9,
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&h=300&q=85',
    altText: 'Full Archival Vault Collection',
  },
  {
    id: 'Scale Figure',
    name: 'Scale Figures',
    lotCount: 6,
    imageUrl: '/showcase/guts_berserker_statue.jpg',
    altText: 'Japanese Scale Figures Exhibition',
  },
  {
    id: 'Manga Sets',
    name: 'Manga Sets',
    lotCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=300&h=300&q=85',
    altText: 'Archival Hardcover Manga Collections',
  },
  {
    id: 'Nendoroid',
    name: 'Nendoroids',
    lotCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&h=300&q=85',
    altText: 'Good Smile Chibi Figures',
  },
  {
    id: 'Statues & Resin',
    name: 'Statues & Resin',
    lotCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=300&h=300&q=85',
    altText: 'Prime 1 Studio Limited Polystone',
  },
  {
    id: 'Mecha & Gunpla',
    name: 'Mecha & Gunpla',
    lotCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&h=300&q=85',
    altText: 'Bandai Metal Build & Diecast',
  },
  {
    id: 'Cosplay & Props',
    name: 'Cosplay & Props',
    lotCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=300&h=300&q=85',
    altText: 'Masterwork Nichirin Blade Replicas',
  },
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
      aria-label="Visual Category Navigation"
      className="w-full border-b border-[#27272a] bg-[#09090b] py-3.5 px-4 sm:px-6 lg:px-8 select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-start gap-4 sm:gap-6 overflow-x-auto scrollbar-none">
        {VISUAL_CATEGORIES.map((cat) => {
          const isActive = (onSelectCategory ? activeCategory : selectedId) === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.id)}
              className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer text-left focus:outline-none"
            >
              {/* Stark Square Photographic Frame */}
              <div
                className={`relative w-16 h-16 sm:w-18 sm:h-18 aspect-square bg-[#0c0c0e] border transition-colors overflow-hidden ${
                  isActive
                    ? 'border-zinc-100 ring-1 ring-zinc-100 ring-offset-1 ring-offset-[#09090b]'
                    : 'border-[#27272a] group-hover:border-zinc-500'
                }`}
              >
                <Image
                  src={cat.imageUrl}
                  alt={cat.altText}
                  fill
                  sizes="72px"
                  className="object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-300"
                  unoptimized={true}
                />
                {/* Active Monochromatic Overlay Line */}
                {isActive && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-zinc-100 z-10" />
                )}
              </div>

              {/* Text Label & Telemetry Count */}
              <div className="flex flex-col items-center text-center">
                <span
                  className={`text-[10px] uppercase tracking-[0.16em] transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-zinc-100 font-bold'
                      : 'text-zinc-400 group-hover:text-zinc-200 font-medium'
                  }`}
                >
                  {cat.name}
                </span>
                <span className="text-[8px] text-zinc-600 tracking-widest uppercase mt-0.5">
                  [{cat.lotCount} LOTS]
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default VisualCategoryBar;
