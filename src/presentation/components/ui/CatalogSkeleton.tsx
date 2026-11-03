'use client';

/**
 * @file src/presentation/components/ui/CatalogSkeleton.tsx
 *
 * Brutalist Editorial Loading States: "Obsidian Skeletons" for OtakuBazaar.
 * - Flat solid backgrounds (#0C0C0C, #141414).
 * - Strictly 0px border radius (zero rounded corners).
 * - Zero drop shadows, zero gradients.
 * - Symmetrical 4-column grid (avoids 3-in-a-row).
 */

import React from 'react';

export const SkeletonCard = (): React.JSX.Element => (
  <div className="flex flex-col w-full bg-[#0C0C0C] border border-[#1F1F1F] rounded-none overflow-hidden select-none animate-pulse">
    <div className="w-full aspect-[4/5] bg-[#141414] p-3 border-b border-[#1A1A1A]">
      <div className="w-full h-full bg-[#1A1A1A] rounded-none" />
    </div>
    <div className="p-4 space-y-3">
      <div className="h-2.5 w-1/3 bg-[#1A1A1A] rounded-none" />
      <div className="h-4 w-3/4 bg-[#1A1A1A] rounded-none" />
      <div className="pt-3 mt-2 border-t border-[#161616] flex justify-between items-center">
        <div className="h-6 w-1/2 bg-[#141414] rounded-none border border-[#1F1F1F]" />
        <div className="h-6 w-1/3 bg-[#141414] rounded-none border border-[#1F1F1F]" />
      </div>
    </div>
  </div>
);

export function CatalogSkeleton({ count = 8 }: { count?: number }): React.JSX.Element {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={`skeleton-card-${index}`} />
        ))}
      </div>
    </div>
  );
}

export default CatalogSkeleton;
