'use client';

/**
 * @file src/presentation/components/listings/LiveCardPreview.tsx
 *
 * Live Card Preview component for the Seller Consignment Studio.
 * Mirrors the updated ProductCard.tsx monochrome gallery catalog styling:
 * - Container: bg-[#121214] border border-zinc-800/80 rounded-xl p-5 shadow-2xl
 * - Badges: text-[9px] font-mono tracking-wider text-zinc-300 border border-zinc-700 bg-zinc-800/60 px-2 py-0.5 rounded uppercase
 * - Image Stage: relative h-56 w-full flex items-center justify-center p-4 my-3 rounded-lg bg-[#0a0a0c] overflow-hidden
 * - Price/Offer Pill (Bottom): Universal Button Token (disabled for preview)
 */

import React from 'react';

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
  series = 'Anime Collectible',
  category = 'Scale Figure',
  manufacturer,
  conditionGrade = '[S-RANK]',
  askingPriceINR = 0,
  imageUrl,
}: LiveCardPreviewProps): React.JSX.Element {
  const displayTitle = title.trim() || 'Untitled Collectible';
  const displayImage = imageUrl && imageUrl.trim() ? imageUrl : '/Firefly_clean.png';

  return (
    <div className="bg-[#121214] border border-zinc-800/80 rounded-xl p-5 shadow-2xl relative flex flex-col justify-between select-none">
      {/* 1. Archival Header / Badges */}
      <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-zinc-500 mb-2">
        <span>LOT #0482 // VAULT ID: JP-TYO</span>
        <span className="text-[9px] font-mono tracking-wider text-zinc-300 border border-zinc-700 bg-zinc-800/60 px-2 py-0.5 rounded uppercase">
          {conditionGrade || 'AUTHENTIC'}
        </span>
      </div>

      {/* 2. Figure Exhibition Stage with Monochrome Glare */}
      <div className="relative h-56 w-full flex items-center justify-center p-4 my-3 rounded-lg bg-[#0a0a0c] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.04)_0%,_transparent_70%)] pointer-events-none" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt={displayTitle}
          className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/Firefly_clean.png';
          }}
        />
      </div>

      {/* 3. Title & Series Attribution */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          {series && (
            <span className="text-[9px] font-mono tracking-wider text-zinc-400 uppercase">
              {series}
            </span>
          )}
          {category && (
            <>
              <span className="text-zinc-600 text-[9px]">•</span>
              <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase">
                {category}
              </span>
            </>
          )}
        </div>

        <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-100 uppercase truncate">
          {displayTitle}
        </h3>

        {manufacturer && (
          <p className="text-[10px] font-mono text-zinc-500 truncate mt-1">
            Studio: {manufacturer}
          </p>
        )}

        {/* Valuation & Bid Signal */}
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-2.5">
          <span className="text-emerald-400/90 font-medium">ESCROW VERIFIED</span>
          <span>LIVE CONSIGNMENT</span>
        </div>

        {/* 4. Price / Offer Pill (Universal Button Token, Non-clickable for preview) */}
        <div className="w-full mt-3 flex items-center justify-between px-3.5 py-2.5 bg-zinc-900 text-zinc-300 border border-zinc-700 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] rounded-lg select-none cursor-default">
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
            Asking / Offer
          </span>
          <span className="text-sm font-bold font-mono text-zinc-100">
            ₹{(askingPriceINR || 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default LiveCardPreview;
