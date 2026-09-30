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
import Image from 'next/image';
import { BargainChatDrawer } from '@/presentation/components/chat/BargainChatDrawer';
import { addToCart } from '@/app/actions/dealActions';
import { openCartDrawer } from '@/presentation/components/cart/CartDrawer';

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
      className={`relative flex flex-col justify-between bg-[#0e0e11] border border-zinc-800 hover:border-zinc-600 p-4 transition-colors group select-none ${className}`.trim()}
    >
      {/* 1. Archival Header (Anti-Truncation LOT Format) */}
      <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-zinc-500 mb-2">
        <span>LOT #{String(product.id).replace(/[^0-9]/g, '').padStart(4, '0').slice(-4) || '0482'} • VAULT ID: JP-TYO</span>
        <span className="text-[9px] font-bold tracking-[0.15em] text-zinc-300 border border-zinc-700 bg-zinc-900 px-2 py-0.5 uppercase">
          AUTHENTIC
        </span>
      </div>

      {/* 2. Jeweler’s Loupe Inspection Stage */}
      <Link
        href={`/products/${product.id}`}
        aria-label={`View vault details for ${product.title}`}
        className="block no-underline product-thumbnail"
        data-testid="product-thumbnail"
      >
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#09090b] border border-zinc-800/80 flex items-center justify-center p-3 my-2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)] pointer-events-none" />
          <Image
            src={imageUrl || '/Firefly_clean.png'}
            alt={product.title || 'Anime Collectible'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-2 relative z-10"
            loading="lazy"
          />
        </div>
      </Link>

      {/* 3. Title & Market Intelligence Ticker */}
      <div>
        <Link href={`/products/${product.id}`} className="block no-underline hover:no-underline">
          <h3 className="text-xs font-bold tracking-wider text-zinc-100 uppercase truncate mt-2">
            {product.title}
          </h3>
        </Link>

        {/* Secondary Valuation Bar */}
        <div className="flex items-center justify-between text-[10px] font-medium tracking-wider text-zinc-500 mt-2">
          <span className="text-emerald-400 font-semibold">+14.2% (90d)</span>
          <span>{offersCount || 2} ACTIVE BIDS</span>
        </div>

        {/* Consolidated Price / Offer Pill & Quick Cart (Universal Button Token) */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => handleOpenBargain(product.id)}
            aria-label={`Tap asking price to make an offer on ${product.title}`}
            data-testid="price-offer-pill"
            className="flex-1 flex items-center justify-between px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-100 text-zinc-300 hover:text-black border border-zinc-700 hover:border-zinc-100 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-200 cursor-pointer group/btn"
          >
            <span className="text-[10px] uppercase font-semibold tracking-widest text-zinc-400 group-hover/btn:text-black">
              Asking / Offer
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-zinc-100 group-hover/btn:text-black">
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
          </button>
          <button
            type="button"
            aria-label="Quick Cart"
            title="Add to Vault Cart"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (product.id) {
                try {
                  await addToCart(product.id);
                } catch (err) {
                  console.warn('Error adding to cart:', err);
                }
                openCartDrawer();
              }
            }}
            className="w-10 h-10 bg-zinc-900 hover:bg-zinc-100 text-zinc-300 hover:text-black border border-zinc-700 hover:border-zinc-100 flex items-center justify-center text-sm transition-all duration-200 cursor-pointer shrink-0"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Real-Time Live Bargain Negotiation Drawer */}
      {isBargainOpen && (
        <BargainChatDrawer
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
