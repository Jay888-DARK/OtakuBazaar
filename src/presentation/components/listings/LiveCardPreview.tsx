'use client';

/**
 * @file src/presentation/components/listings/LiveCardPreview.tsx
 *
 * Live Card Preview component for the Seller Studio.
 * - Displays single-item card preview in plain English.
 * - Suppresses verified badges and default condition grades until real user data exists.
 * - Explains escrow simply without decorative brackets or slashes.
 */

import React, { useState } from 'react';

export interface LiveCardPreviewProps {
  readonly title?: string;
  readonly series?: string;
  readonly category?: string;
  readonly manufacturer?: string;
  readonly conditionGrade?: string;
  readonly askingPriceINR?: number;
  readonly imageUrl?: string;
}

export function LiveCardPreview({
  title = '',
  series = '',
  category = '',
  manufacturer,
  conditionGrade,
  askingPriceINR = 0,
  imageUrl,
}: LiveCardPreviewProps): React.JSX.Element {
  const displayTitle = title.trim() || 'Untitled Collectible';
  const [imageLoaded, setImageLoaded] = useState(false);

  // Only show condition badge when real user-selected grade is present and not a dummy fallback
  const hasRealCondition = Boolean(
    conditionGrade &&
    conditionGrade.trim() &&
    conditionGrade !== '[S-RANK]' &&
    conditionGrade !== 'S-RANK'
  );
  const cleanCondition = conditionGrade?.replace(/^\[|\]$/g, '') || '';

  return (
    <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-5 relative flex flex-col justify-between select-none rounded-none">
      <div>
        {/* 1. Header Row */}
        <div className="flex items-center justify-between text-[11px] tracking-wider text-[#9CA3AF] mb-2 font-sans uppercase">
          <span>Card Preview</span>
          {hasRealCondition && (
            <span className="border border-[#2A2A2A] px-2 py-0.5 text-[10px] tracking-wider text-[#E5E5E5] bg-[#080808] uppercase">
              {cleanCondition}
            </span>
          )}
        </div>

        {/* 2. Strict 4:5 Studio Portrait Well */}
        <div className="relative w-full aspect-[4/5] p-3 bg-[#0A0A0A] border border-[#1A1A1A] my-4 overflow-hidden flex items-center justify-center">
          {imageUrl && imageUrl.trim() ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-[#141414] animate-pulse pointer-events-none" />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl.trim()}
                alt={displayTitle}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/otakubazaar-logo.png';
                  setImageLoaded(true);
                }}
                className={`w-full h-full object-cover object-center transition-opacity duration-200 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <span className="text-[11px] text-[#9CA3AF] uppercase tracking-wider font-mono">
                Add photo to preview
              </span>
              <span className="text-[10px] text-[#71717A] mt-1.5 font-sans">
                Upload or link a collectible photo
              </span>
            </div>
          )}
        </div>

        {/* 3. Metadata Block */}
        <div className="space-y-1.5">
          {/* Row 1: Franchise & Category */}
          <div className="text-[10px] tracking-wider text-[#9CA3AF] uppercase truncate font-sans">
            {(series || 'Anime Series').toUpperCase()} • {(category || 'Scale Figure').toUpperCase()}
          </div>

          {/* Row 2: Collectible Title */}
          <h3 className="font-serif text-[16px] text-[#F2EFE9] uppercase tracking-[0.04em] line-clamp-2 min-h-[44px] leading-tight">
            {displayTitle}
          </h3>

          {/* Row 3: Studio (only if provided) */}
          {manufacturer && (
            <div className="text-[10px] tracking-wider text-[#9CA3AF] uppercase truncate font-sans">
              Manufacturer: {manufacturer.toUpperCase()}
            </div>
          )}
        </div>

        {/* 4. Escrow & Price Footer */}
        <div className="mt-4 pt-3 border-t border-[#161616]">
          {/* Status Line: Plain English Escrow Explanation */}
          <div className="text-[10px] tracking-wide font-sans text-[#10B981] mb-2 leading-relaxed">
            Safe Escrow: We hold your payment until you check your order
          </div>

          {/* Price Box */}
          <div className="border border-[#1F1F1F] bg-[#0C0C0C] px-3.5 py-2.5 flex justify-between items-center">
            <span className="text-[10px] tracking-wider text-[#9CA3AF] font-sans uppercase">
              Asking Price
            </span>
            <span className="font-serif text-[18px] text-[#F2EFE9] tracking-wider">
              ₹{(askingPriceINR || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Non-clickable preview action */}
      <div className="mt-3">
        <div className="w-full py-2.5 text-center border border-[#1F1F1F] bg-[#080808] text-[#9CA3AF] text-[11px] tracking-wider uppercase font-sans select-none cursor-default">
          Preview Only
        </div>
      </div>
    </div>
  );
}

export default LiveCardPreview;
