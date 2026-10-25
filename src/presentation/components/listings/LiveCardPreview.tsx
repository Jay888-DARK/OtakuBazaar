'use client';

/**
 * @file src/presentation/components/listings/LiveCardPreview.tsx
 *
 * Live Card Preview component for the Seller Consignment Studio.
 * Strictly adheres to the monochrome archival vault design tokens:
 * - Surface: #0C0C0C elevated card surface with 1px solid #1F1F1F outer border.
 * - Image Stage: aspect-[4/5] studio portrait well (p-3 bg-[#0A0A0A] border border-[#1A1A1A] my-4).
 * - Typography: Playfair editorial serif for titles & valuations, Plus Jakarta Sans for metadata.
 * - Price Box: border border-[#1F1F1F] bg-[#0C0C0C] with ASKING / OFFER and ₹ INR valuation.
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
  title = 'Untitled Collectible',
  series = 'Anime Series',
  category = 'Scale Figure',
  manufacturer,
  conditionGrade = '[S-RANK]',
  askingPriceINR = 0,
  imageUrl,
}: LiveCardPreviewProps): React.JSX.Element {
  const displayTitle = title.trim() || 'Untitled Collectible';
  const displayImage = imageUrl && imageUrl.trim() ? imageUrl : '/Firefly_clean.png';
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-5 relative flex flex-col justify-between select-none rounded-none">
      <div>
        {/* 1. Header Row */}
        <div className="flex items-center justify-between text-[10px] tracking-[0.15em] text-[#777777] mb-2 font-sans uppercase">
          <span>LOT #0482 • VAULT ID: JP-TYO</span>
          <span className="border border-[#2A2A2A] px-2 py-0.5 text-[10px] tracking-[0.12em] text-[#E5E5E5] bg-[#080808] uppercase">
            {conditionGrade || '[S-RANK]'}
          </span>
        </div>

        {/* 2. Strict 4:5 Studio Portrait Well */}
        <div className="relative w-full aspect-[4/5] p-3 bg-[#0A0A0A] border border-[#1A1A1A] my-4 overflow-hidden flex items-center justify-center">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[#141414] animate-pulse pointer-events-none" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage}
            alt={displayTitle}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/Firefly_clean.png';
              setImageLoaded(true);
            }}
            className={`w-full h-full object-cover object-center transition-opacity duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {/* 3. Editorial Metadata Block */}
        <div className="space-y-1.5">
          {/* Row 1: Franchise & Category */}
          <div className="text-[10px] tracking-[0.14em] text-[#888888] uppercase truncate font-sans">
            {(series || 'ANIME SERIES').toUpperCase()} • {(category || 'SCALE FIGURE').toUpperCase()}
          </div>

          {/* Row 2: Collectible Title */}
          <h3 className="font-serif text-[16px] text-[#F2EFE9] uppercase tracking-[0.04em] line-clamp-2 min-h-[44px] leading-tight">
            {displayTitle}
          </h3>

          {/* Row 3: Studio & Edition */}
          <div className="text-[10px] tracking-[0.12em] text-[#666666] uppercase truncate font-sans">
            STUDIO: {(manufacturer || 'IMPORT STUDIO').toUpperCase()} • ED. 042/350
          </div>
        </div>

        {/* 4. Escrow & Valuation Footer */}
        <div className="mt-4 pt-3 border-t border-[#161616]">
          {/* Status Line */}
          <div className="flex items-center justify-between text-[10px] tracking-[0.14em] font-sans uppercase">
            <span className="text-[#10B981] font-semibold">ESCROW VERIFIED</span>
            <span className="text-[#777777]">48H INSPECTION</span>
          </div>

          {/* Price Box */}
          <div className="border border-[#1F1F1F] bg-[#0C0C0C] px-3.5 py-2.5 mt-3 flex justify-between items-center">
            <span className="text-[10px] tracking-[0.15em] text-[#888888] font-sans uppercase">
              ASKING / OFFER
            </span>
            <span className="font-serif text-[18px] text-[#F2EFE9] tracking-wider">
              ₹{(askingPriceINR || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Non-clickable preview action */}
      <div className="mt-3">
        <div className="w-full py-2.5 text-center border border-[#1F1F1F] bg-[#080808] text-[#888888] text-[11px] tracking-[0.14em] uppercase font-sans select-none cursor-default">
          [ LIVE CARD PREVIEW ]
        </div>
      </div>
    </div>
  );
}

export default LiveCardPreview;
