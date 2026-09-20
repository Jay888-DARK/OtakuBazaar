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
  maxTilt = 12,
  className = '',
  style,
  isPreview = false,
  onClick,
  onBargainClick,
  onInspectClick,
}: CurioBoxProps): React.JSX.Element {
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Interactive 3D tilt state
  const [tilt, setTilt] = useState<TiltTransform>({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });

  const [isBargainOpen, setIsBargainOpen] = useState<boolean>(false);

  const handleMouseEnter = useCallback(() => {
    // hover sound removed
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!boxRef.current || isLocked) return;

      const rect = boxRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Normalize between -1 and +1
      const normalizedX = (mouseX / rect.width) * 2 - 1;
      const normalizedY = (mouseY / rect.height) * 2 - 1;

      // Snappy, realistic 3D perspective tilt
      const rotateX = -normalizedY * maxTilt;
      const rotateY = normalizedX * maxTilt;

      const glareX = Math.round((mouseX / rect.width) * 100);
      const glareY = Math.round((mouseY / rect.height) * 100);

      setTilt({
        rotateX,
        rotateY,
        glareX,
        glareY,
        isHovered: true,
      });
    },
    [maxTilt, isLocked]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false,
    });
  }, []);

  // Compute transform style for identical 3D movement
  const boxTransform = useMemo(() => {
    if (!tilt.isHovered || isLocked) {
      return 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
    return `perspective(1000px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
  }, [tilt.isHovered, tilt.rotateX, tilt.rotateY, isLocked]);

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
      ref={boxRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`curio-bay rounded-lg p-3 flex flex-col justify-between relative group select-none ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      } ${className}`.trim()}
      style={{
        transform: boxTransform,
        transition: tilt.isHovered
          ? 'transform 0.08s ease-out, box-shadow 0.2s ease, border-color 0.2s ease'
          : 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s ease, border-color 0.3s ease',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        borderColor: tilt.isHovered && !isLocked ? 'rgba(201, 148, 62, 0.8)' : undefined,
        boxShadow:
          tilt.isHovered && !isLocked
            ? '0 -10px 25px -10px rgba(201, 148, 62, 0.25), 0 20px 40px -10px rgba(0, 0, 0, 0.85), 0 0 25px rgba(201, 148, 62, 0.35)'
            : undefined,
        ...style,
      }}
    >
      {/* Specular Light Glare Overlay on Hover */}
      {tilt.isHovered && !isLocked && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 248, 230, 0.22) 0%, rgba(201, 148, 62, 0.08) 35%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 25,
            opacity: 0.9,
            borderRadius: 'inherit',
            transition: 'opacity 0.2s ease',
          }}
        />
      )}

      {/* Recessed Top Ambient Glow */}
      <div className="absolute inset-x-0 top-0 h-20 pointer-events-none opacity-20 bg-gradient-to-b from-amber-200/30 to-transparent blur-sm rounded-t-lg" />

      {/* Top Plaque: Condition Rank & Series / Lock Badge */}
      <div className="flex items-center justify-between z-10 mb-2 px-1">
        <span className="curio-base-plaque">{rankBadge}</span>
        {isLocked ? (
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-600/50 px-2 py-0.5 rounded animate-pulse">
            🔒 LOCKED ({formatTimer(lockRemainingSeconds)})
          </span>
        ) : (
          <span className="text-[9px] font-bold text-[#E8C36A] uppercase tracking-wider">
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
          <div className="relative h-64 sm:h-72 w-full rounded overflow-hidden flex items-end justify-center bg-black/25">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title || 'Anime Collectible'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain object-bottom group-hover/thumb:scale-105 transition-transform duration-500 p-2"
                unoptimized={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-amber-500/50">
                ⛩️
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
                className="absolute top-2 right-2 z-20 px-2 py-1 rounded-md bg-black/75 hover:bg-[#F85B1A] border border-amber-500/40 hover:border-[#F85B1A] text-[10px] font-bold text-amber-200 hover:text-white transition-all shadow-md opacity-0 group-hover/thumb:opacity-100 flex items-center gap-1 cursor-pointer"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">Inspect</span>
              </button>
            )}

            {/* 15-Minute Checkout Lock Screen */}
            {isLocked && (
              <div className="absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center z-30 bg-black/75">
                <span className="text-2xl mb-1">🔒</span>
                <span className="text-[10px] font-black text-white uppercase tracking-wider font-mono">
                  Checkout Lock Engaged
                </span>
                <span className="text-sm font-black text-amber-400 mt-0.5">
                  {formatTimer(lockRemainingSeconds)}
                </span>
              </div>
            )}
          </div>

          {/* Title and Collector Attribution */}
          <div className="mt-2.5 mb-1 z-10 px-1 text-center">
            <h3 className="font-mono text-sm sm:text-base font-bold text-[#F0E8DA] group-hover/thumb:text-[#E8C36A] transition-colors m-0 truncate">
              {title || 'Untitled Collectible'}
            </h3>
            <p className="text-[10px] text-[#A89880] mt-0.5 m-0 truncate">
              {manufacturer || 'Authentic Import'} • {sellerName}
            </p>
          </div>
        </Link>
      ) : (
        <>
          {/* Collectible Image Display Bay */}
          <div className="relative h-64 sm:h-72 w-full rounded overflow-hidden flex items-end justify-center bg-black/25">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title || 'Anime Collectible'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain object-bottom group-hover:scale-105 transition-transform duration-500 p-2"
                unoptimized={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-amber-500/50">
                ⛩️
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
                className="absolute top-2 right-2 z-20 px-2 py-1 rounded-md bg-black/75 hover:bg-[#F85B1A] border border-amber-500/40 hover:border-[#F85B1A] text-[10px] font-bold text-amber-200 hover:text-white transition-all shadow-md opacity-0 group-hover:opacity-100 flex items-center gap-1 cursor-pointer"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">Inspect</span>
              </button>
            )}

            {/* 15-Minute Checkout Lock Screen */}
            {isLocked && (
              <div className="absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center z-30 bg-black/75">
                <span className="text-2xl mb-1">🔒</span>
                <span className="text-[10px] font-black text-white uppercase tracking-wider font-mono">
                  Checkout Lock Engaged
                </span>
                <span className="text-sm font-black text-amber-400 mt-0.5">
                  {formatTimer(lockRemainingSeconds)}
                </span>
              </div>
            )}
          </div>

          {/* Title and Collector Attribution */}
          <div className="mt-2.5 mb-1 z-10 px-1 text-center">
            <h3 className="font-mono text-sm sm:text-base font-bold text-[#F0E8DA] group-hover:text-[#E8C36A] transition-colors m-0 truncate">
              {title || 'Untitled Collectible'}
            </h3>
            <p className="text-[10px] text-[#A89880] mt-0.5 m-0 truncate">
              {manufacturer || 'Authentic Import'} • {sellerName}
            </p>
          </div>
        </>
      )}

      {/* Glass Shelf Divider */}
      <div className="curio-glass-shelf my-2 w-full rounded-full" />

      {/* Bottom Shelf Rail: Interactive Price Badge & Adjacent Add to Cart Button */}
      <div className="flex items-center gap-2 pt-1 z-10 select-none mt-1">
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
          className="flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/40 border border-stone-800/90 hover:border-[#F85B1A] hover:bg-[#F85B1A]/10 transition-all cursor-pointer group/price"
        >
          <div className="flex flex-col text-left">
            <span className="text-[8px] text-[#A89880] uppercase tracking-wider group-hover/price:text-[#F85B1A] transition-colors font-bold">
              ASKING PRICE: ₹{askingPriceINR ? askingPriceINR.toLocaleString('en-IN') : '0'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs sm:text-sm font-black text-[#E8C36A] group-hover/price:text-white transition-colors">
                ₹{askingPriceINR ? askingPriceINR.toLocaleString('en-IN') : '0'}
              </span>
              {originalPriceINR && originalPriceINR > askingPriceINR && (
                <span className="text-[10px] text-[#A89880]/60 line-through">
                  ₹{originalPriceINR.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <span className="curio-price-btn flex items-center gap-1 text-[10px] font-bold text-[#F85B1A] group-hover/price:text-white">
            <span>Offer 🤝</span>
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
          className="w-8 h-8 rounded-lg bg-black/40 border border-stone-800 hover:border-[#C9943E] hover:bg-[#C9943E]/20 text-stone-300 hover:text-[#E8C36A] flex items-center justify-center text-xs transition-colors shrink-0 cursor-pointer"
        >
          🛒
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
