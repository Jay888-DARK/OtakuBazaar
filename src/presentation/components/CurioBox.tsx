'use client';

/**
 * @file src/presentation/components/CurioBox.tsx
 *
 * Universal Curio Showcase Window Box with Shared 3D Physics.
 * Provides identical mouse-tracking 3D tilt, dynamic specular glare,
 * katana audio feedback, and lacquer showcase aesthetics across both
 * the Marketplace feed and Seller Studio live preview.
 */

import React, { useRef, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BargainModal } from '@/presentation/components/BargainModal';
import { addToCart } from '@/app/actions/dealActions';
import { openCartDrawer } from '@/presentation/components/cart/CartDrawer';

export interface CurioBoxProps {
  /** Unique listing or preview ID */
  readonly id?: string;
  /** Product details navigation URL */
  readonly detailsUrl?: string;
  /** Figure or collectible title */
  readonly title: string;
  /** Anime franchise / series (e.g., Jujutsu Kaisen) */
  readonly series?: string;
  /** Collectible category (e.g., Scale Figure) */
  readonly category?: string;
  /** Manufacturer or Studio (e.g., eStream / Shibuya Scramble) */
  readonly manufacturer?: string;
  /** Seller display name */
  readonly sellerName?: string;
  /** Condition rating badge (e.g., [S-RANK], [A-RANK]) */
  readonly conditionGrade?: string;
  /** Current asking price in INR */
  readonly askingPriceINR: number;
  /** Estimated original or reference price in INR */
  readonly originalPriceINR?: number;
  /** Primary figure image URL */
  readonly imageUrl?: string;
  /** Whether the collectible is currently locked in escrow reservation */
  readonly isLocked?: boolean;
  /** Remaining countdown seconds for escrow lock */
  readonly lockRemainingSeconds?: number;
  /** Maximum tilt angle in degrees (default: 12) */
  readonly maxTilt?: number;
  /** Extra CSS classes */
  readonly className?: string;
  /** Custom inline styles */
  readonly style?: React.CSSProperties;
  /** Whether this box is rendered as a live preview */
  readonly isPreview?: boolean;
  /** Click handler for opening bargain / card details */
  readonly onClick?: () => void;
  /** Dedicated handler for the Price / Bargain button */
  readonly onBargainClick?: () => void;
  /** Dedicated handler to open the Media Inspection Lightbox */
  readonly onInspectClick?: () => void;
}

interface TiltTransform {
  readonly rotateX: number;
  readonly rotateY: number;
  readonly glareX: number;
  readonly glareY: number;
  readonly isHovered: boolean;
}

export function CurioBox({
  id,
  detailsUrl,
  title,
  series,
  category,
  manufacturer,
  sellerName = 'Verified Collector',
  conditionGrade = '[S-RANK]',
  askingPriceINR,
  originalPriceINR,
  imageUrl,
  isLocked = false,
  lockRemainingSeconds,
  className = '',
  style,
  onClick,
  onBargainClick,
  onInspectClick,
}: CurioBoxProps): React.JSX.Element {
  const [isBargainOpen, setIsBargainOpen] = useState<boolean>(false);

  // Format lock countdown timer
  const formatTimer = (secs?: number) => {
    if (secs === undefined || secs === null) return '15:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Rank badge extraction
  const rankBadge = conditionGrade.includes('[')
    ? conditionGrade.split(' ')[0]
    : `[${conditionGrade}]`;

  return (
    <div
      onClick={onClick}
      className={`p-4 flex flex-col justify-between relative bg-[#0c0c0e] border border-[#27272a] ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      } ${className}`.trim()}
      style={{
        borderRadius: '0px',
        boxShadow: 'none',
        ...style,
      }}
    >
      {/* Top Plaque: Condition Rank & Series / Lock Badge */}
      <div className="flex items-center justify-between z-10 mb-3 px-0.5">
        <span className="text-[10px] tracking-[0.16em] uppercase font-bold text-[#E8C36A] px-2 py-0.5 border border-[#3f3f46] bg-[#141416]">
          {rankBadge}
        </span>
        {isLocked ? (
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-amber-400 bg-amber-950/40 border border-amber-600/40 px-2 py-0.5">
            LOCKED [{formatTimer(lockRemainingSeconds)}]
          </span>
        ) : (
          <span className="text-[9px] font-semibold text-[#a1a1aa] uppercase tracking-[0.16em]">
            {series || category || 'COLLECTIBLE'}
          </span>
        )}
      </div>

      {/* Showcase Bay: Image & Title (Navigates to detailsUrl if provided) */}
      {detailsUrl ? (
        <Link
          href={detailsUrl}
          data-testid="product-thumbnail"
          className="block no-underline cursor-pointer group/thumb"
        >
          {/* Collectible Image Display Bay */}
          <div className="relative h-64 sm:h-72 w-full border border-[#27272a] overflow-hidden flex items-end justify-center bg-[#09090b]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title || 'Anime Collectible'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain object-bottom p-2"
                unoptimized={true}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-xs tracking-widest text-zinc-600 uppercase font-mono">
                [ No Image Available ]
              </div>
            )}

            {/* Inspection Lens Trigger Button */}
            {onInspectClick && imageUrl && !isLocked && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onInspectClick();
                }}
                aria-label="Inspect media in lightbox"
                className="absolute top-2 right-2 z-20 px-2.5 py-1 bg-[#141416] border border-[#3f3f46] hover:border-[#C9943E] text-[10px] font-medium tracking-widest uppercase text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="hidden sm:inline">INSPECT</span>
              </button>
            )}

            {/* 15-Minute Checkout Lock Screen */}
            {isLocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/90">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="1.5" className="mb-2">
                  <rect x="3" y="11" width="18" height="11" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                  Checkout Lock Engaged
                </span>
                <span className="text-xs font-bold text-amber-400 mt-1 tracking-wider">
                  {formatTimer(lockRemainingSeconds)}
                </span>
              </div>
            )}
          </div>

          {/* Title and Collector Attribution */}
          <div className="mt-3 mb-1 z-10 px-0.5 text-left">
            <h3 className="text-sm font-semibold text-[#f4f4f5] group-hover/thumb:text-[#C9943E] transition-colors m-0 truncate tracking-wide">
              {title || 'Untitled Collectible'}
            </h3>
            <p className="text-[10px] text-[#71717a] mt-1 m-0 truncate tracking-wide">
              {manufacturer || 'Authentic Import'} • {sellerName}
            </p>
          </div>
        </Link>
      ) : (
        <>
          {/* Collectible Image Display Bay */}
          <div className="relative h-64 sm:h-72 w-full border border-[#27272a] overflow-hidden flex items-end justify-center bg-[#09090b]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title || 'Anime Collectible'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain object-bottom p-2"
                unoptimized={true}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-xs tracking-widest text-zinc-600 uppercase font-mono">
                [ No Image Available ]
              </div>
            )}

            {/* Inspection Lens Trigger Button */}
            {onInspectClick && imageUrl && !isLocked && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInspectClick();
                }}
                aria-label="Inspect media in lightbox"
                className="absolute top-2 right-2 z-20 px-2.5 py-1 bg-[#141416] border border-[#3f3f46] hover:border-[#C9943E] text-[10px] font-medium tracking-widest uppercase text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="hidden sm:inline">INSPECT</span>
              </button>
            )}

            {/* 15-Minute Checkout Lock Screen */}
            {isLocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/90">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="1.5" className="mb-2">
                  <rect x="3" y="11" width="18" height="11" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                  Checkout Lock Engaged
                </span>
                <span className="text-xs font-bold text-amber-400 mt-1 tracking-wider">
                  {formatTimer(lockRemainingSeconds)}
                </span>
              </div>
            )}
          </div>

          {/* Title and Collector Attribution */}
          <div className="mt-3 mb-1 z-10 px-0.5 text-left">
            <h3 className="text-sm font-semibold text-[#f4f4f5] m-0 truncate tracking-wide">
              {title || 'Untitled Collectible'}
            </h3>
            <p className="text-[10px] text-[#71717a] mt-1 m-0 truncate tracking-wide">
              {manufacturer || 'Authentic Import'} • {sellerName}
            </p>
          </div>
        </>
      )}

      {/* Subtle Horizontal Divider */}
      <div className="border-t border-[#27272a] my-3 w-full" />

      {/* Bottom Shelf Rail: Interactive Price Badge & Adjacent Add to Cart Button */}
      <div className="flex items-center gap-2 z-10 select-none">
        <div
          role="button"
          tabIndex={0}
          aria-label="Tap asking price to make an offer or bargain"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsBargainOpen(true);
            if (onBargainClick) onBargainClick();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              setIsBargainOpen(true);
            }
          }}
          className="flex-1 flex items-center justify-between px-3 py-2 bg-[#141416] border border-[#27272a] hover:border-[#3f3f46] transition-colors cursor-pointer group/price"
        >
          <div className="flex flex-col text-left">
            <span className="text-[8px] text-[#71717a] uppercase tracking-[0.16em] font-semibold">
              ASKING PRICE
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xs sm:text-sm font-bold text-[#fafafa]">
                ₹{askingPriceINR ? askingPriceINR.toLocaleString('en-IN') : '0'}
              </span>
              {originalPriceINR && originalPriceINR > askingPriceINR && (
                <span className="text-[10px] text-[#71717a] line-through">
                  ₹{originalPriceINR.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C9943E] hover:text-[#e4a849]">
            OFFER
          </span>
        </div>

        {/* Adjacent Add to Cart Icon Button */}
        <button
          type="button"
          aria-label="Quick Cart"
          title="Add to Vault Cart"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (id) {
              await addToCart(id);
              openCartDrawer();
            }
          }}
          className="w-9 h-9 bg-[#141416] border border-[#27272a] hover:border-[#3f3f46] text-zinc-300 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </button>
      </div>

      {isBargainOpen && (
        <BargainModal
          productId={id || 'default-product'}
          isOpen={isBargainOpen}
          onClose={() => setIsBargainOpen(false)}
          askingPriceINR={askingPriceINR}
          productTitle={title}
        />
      )}
    </div>
  );
}
