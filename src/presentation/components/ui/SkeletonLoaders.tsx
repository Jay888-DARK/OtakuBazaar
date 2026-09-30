'use client';

/**
 * @file src/presentation/components/ui/SkeletonLoaders.tsx
 *
 * Performance UX Skeleton Loaders for OtakuBazaar.
 * Stark, dark-gray geometric blocks with sharp 90-degree corners.
 * Enforces zero corner radius, no grid grain, no radar blips.
 */

import React from 'react';

/** Single Product Card Skeleton */
export function ProductCardSkeleton(): React.JSX.Element {
  return (
    <div className="relative flex flex-col justify-between bg-[#0e0e11] border border-[#27272a] p-4 select-none animate-pulse">
      {/* 1. Header Bar Placeholder */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-2.5 w-28 bg-[#18181c]" />
        <div className="h-4 w-16 bg-[#18181c] border border-[#27272a]" />
      </div>

      {/* 2. Image Stage Placeholder */}
      <div className="relative w-full aspect-[4/5] bg-[#121215] border border-[#27272a] my-2 flex items-center justify-center">
        <div className="w-12 h-12 border border-[#27272a] bg-[#18181c]" />
      </div>

      {/* 3. Title & Specs Placeholder */}
      <div className="mt-2 space-y-2">
        <div className="h-3.5 w-5/6 bg-[#1c1c20]" />
        <div className="h-2.5 w-1/2 bg-[#161619]" />

        {/* Valuation & Bid Ticker Placeholder */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-2.5 w-20 bg-[#161619]" />
          <div className="h-2.5 w-16 bg-[#161619]" />
        </div>

        {/* Price & Action Button Placeholder */}
        <div className="flex items-center gap-2 pt-2">
          <div className="flex-1 h-9 bg-[#16161a] border border-[#27272a]" />
          <div className="w-9 h-9 bg-[#16161a] border border-[#27272a] shrink-0" />
        </div>
      </div>
    </div>
  );
}

/** Product Feed Grid Skeleton */
export function ProductFeedSkeleton({ count = 6 }: { count?: number }): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={`skeleton-card-${idx}`} />
      ))}
    </div>
  );
}

/** Visual Category Bar Skeleton */
export function CategoryBarSkeleton(): React.JSX.Element {
  return (
    <div className="w-full border-b border-[#27272a] bg-[#09090b] py-3 px-4 sm:px-8 overflow-x-auto scrollbar-none animate-pulse">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={`skeleton-cat-${idx}`} className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 bg-[#121215] border border-[#27272a]" />
            <div className="h-2 w-12 bg-[#18181c]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Detailed Product View Skeleton */
export function ProductDetailSkeleton(): React.JSX.Element {
  return (
    <div className="border border-[#27272a] bg-[#0e0e11] p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-pulse">
      {/* Left Column: Media Stage Placeholder */}
      <div className="space-y-3">
        <div className="relative h-80 sm:h-96 w-full bg-[#121215] border border-[#27272a] flex items-center justify-center">
          <div className="w-16 h-16 border border-[#27272a] bg-[#18181c]" />
        </div>
        {/* Media Thumbnails Row Placeholder */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`skeleton-thumb-${idx}`} className="w-14 h-14 bg-[#141418] border border-[#27272a]" />
          ))}
        </div>
      </div>

      {/* Right Column: Provenance & Purchase Box Placeholder */}
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="h-2.5 w-32 bg-[#18181c]" />
          <div className="h-6 w-5/6 bg-[#1c1c20]" />
          <div className="h-3 w-full bg-[#141418]" />
          <div className="h-3 w-4/5 bg-[#141418]" />
        </div>

        {/* Valuation Plaque Placeholder */}
        <div className="p-4 bg-[#09090b] border border-[#27272a] flex justify-between items-baseline">
          <div className="h-6 w-24 bg-[#18181c]" />
          <div className="h-3 w-28 bg-[#18181c]" />
        </div>

        {/* Specifications Matrix Placeholder */}
        <div className="border-t border-[#27272a] pt-4 space-y-2.5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`skeleton-spec-${idx}`} className="flex justify-between">
              <div className="h-2.5 w-20 bg-[#161619]" />
              <div className="h-2.5 w-32 bg-[#1c1c20]" />
            </div>
          ))}
        </div>

        {/* Buttons Placeholder */}
        <div className="pt-2 space-y-2">
          <div className="h-12 w-full bg-[#18181c] border border-[#27272a]" />
          <div className="h-10 w-full bg-[#121215] border border-[#27272a]" />
        </div>
      </div>
    </div>
  );
}
