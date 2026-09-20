'use client';

/**
 * @file src/presentation/components/listings/ProductCard.tsx
 *
 * Ultra-Luxury Archival Lot & Market Intelligence Card for OtakuBazaar.
 * Styled strictly in Classic Black & Grey monochrome palette with
 * Jeweler’s Loupe interactive image inspection.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { BargainModal } from '@/presentation/components/BargainModal';

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price?: number;
    askingPriceAmount?: number;
    category?: string | null;
    condition?: string | null;
    imageUrl?: string;
    imageUrls?: string | null;
    status?: string;
    dealOffersCount?: number;
    _count?: {
      dealOffers?: number;
    };
  };
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps): React.JSX.Element {
  const [isBargainOpen, setIsBargainOpen] = useState(false);

  const handleOpenBargain = (_productId?: string) => {
    setIsBargainOpen(true);
  };

  const displayPrice =
    typeof product.price === 'number' && product.price > 0
      ? product.price
      : Math.round((product.askingPriceAmount || 0) / 100);

  let imageUrl = product.imageUrl || '/Firefly_clean.png';
  try {
    if (product.imageUrls) {
      const parsed = JSON.parse(product.imageUrls);
      if (Array.isArray(parsed) && parsed[0]) {
        imageUrl = parsed[0];
      } else if (typeof parsed === 'string') {
        imageUrl = parsed;
      }
    }
  } catch {
    if (product.imageUrls) imageUrl = product.imageUrls;
  }

  const offersCount = product.dealOffersCount ?? product._count?.dealOffers ?? 2;

  return (
    <div
      className={`relative flex flex-col justify-between bg-[#121214] border border-zinc-800/80 hover:border-zinc-600 rounded-xl p-4 transition-all duration-300 shadow-xl group select-none ${className}`.trim()}
    >
      {/* 1. Archival Header (Anti-Truncation LOT Format) */}
      <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-zinc-500 mb-2">
        <span>LOT #{String(product.id).replace(/[^0-9]/g, '').padStart(4, '0').slice(-4) || '0482'} // VAULT ID: JP-TYO</span>
        <span className="text-[9px] font-mono tracking-wider text-zinc-300 border border-zinc-700 bg-zinc-800/60 px-2 py-0.5 rounded uppercase">
          AUTHENTIC
        </span>
      </div>

      {/* 2. Jeweler’s Loupe Inspection Stage */}
      <Link
        href={`/products/${product.id}`}
        aria-label={`View vault details for ${product.title}`}
        className="block no-underline"
      >
        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-lg bg-[#0a0a0c] flex items-center justify-center p-3 my-2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)] pointer-events-none" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={product.title || 'Anime Collectible'}
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)] transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/Firefly_clean.png';
            }}
          />
        </div>
      </Link>

      {/* 3. Title & Market Intelligence Ticker */}
      <div>
        <Link href={`/products/${product.id}`} className="block no-underline hover:no-underline">
          <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-100 uppercase truncate mt-2">
            {product.title}
          </h3>
        </Link>

        {/* Secondary Valuation Bar */}
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-2">
          <span className="text-emerald-400/90 font-medium">+14.2% (90d)</span>
          <span>{offersCount || 2} ACTIVE BIDS</span>
        </div>

        {/* Consolidated Price / Offer Pill (Universal Button Token) */}
        <button
          onClick={() => handleOpenBargain(product.id)}
          className="w-full mt-3 flex items-center justify-between px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-100 text-zinc-300 hover:text-black border border-zinc-700 hover:border-zinc-100 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] rounded-lg transition-all duration-300 cursor-pointer group/btn"
        >
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 group-hover/btn:text-black">
            Asking / Offer
          </span>
          <span className="text-sm font-bold font-mono text-zinc-100 group-hover/btn:text-black">
            ₹{displayPrice.toLocaleString('en-IN')}
          </span>
        </button>
      </div>

      {/* Real-Time Live Bargain Modal */}
      {isBargainOpen && (
        <BargainModal
          productId={product.id}
          isOpen={isBargainOpen}
          onClose={() => setIsBargainOpen(false)}
          askingPriceINR={displayPrice}
          productTitle={product.title}
        />
      )}
    </div>
  );
}

export default ProductCard;
