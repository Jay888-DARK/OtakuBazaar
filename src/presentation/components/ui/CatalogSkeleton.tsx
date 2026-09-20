'use client';

/**
 * @file src/presentation/components/ui/CatalogSkeleton.tsx
 *
 * Cinematic Loading States: "Obsidian Skeletons" for OtakuBazaar.
 * Dark shimmering gradients mirroring the physical weight and aspect ratio
 * of the monochrome product cards.
 */

import React from 'react';

export const SkeletonCard = (): React.JSX.Element => (
  <div className="flex flex-col w-full bg-[#121214] border border-zinc-800/50 rounded-xl overflow-hidden shadow-lg animate-pulse">
    <div className="w-full aspect-[4/5] bg-gradient-to-br from-[#18181b] to-[#0a0a0c]" />
    <div className="p-4 space-y-4">
      <div className="h-3 w-1/3 bg-zinc-800/80 rounded" />
      <div className="h-4 w-3/4 bg-zinc-800 rounded" />
      <div className="pt-4 mt-2 border-t border-zinc-800/50 flex justify-between items-center">
        <div className="h-8 w-1/2 bg-zinc-800/60 rounded" />
        <div className="h-8 w-1/3 bg-zinc-800/60 rounded" />
      </div>
    </div>
  </div>
);

export function CatalogSkeleton({ count = 9 }: { count?: number }): React.JSX.Element {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={`skeleton-card-${index}`} />
        ))}
      </div>
    </div>
  );
}

export default CatalogSkeleton;
