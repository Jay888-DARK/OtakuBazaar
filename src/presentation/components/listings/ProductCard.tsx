'use client';

/**
 * @file src/presentation/components/listings/ProductCard.tsx
 *
 * Strict Brutalist Archival Product Card for OtakuBazaar Main Catalog Grid.
 *
 * Requirements:
 * 1. Card Visuals & Telemetry: Primary image, edition badge, category subtitle, product title, condition tag, price in INR.
 * 2. Exclusive Home Page Action: ONLY [ ADD TO CART ] button on the action bar.
 *    Clicking increments the navbar CART counter, stores item in cart state, and shows inline confirmation state [ ADDED TO VAULT CART ] (0ms instant state change) WITHOUT opening any popup.
 * 3. Card Navigation: Clicking anywhere on the product card image, title, or [ INSPECT LOT DETAILS ] link navigates to /lot/[id].
 * 4. 0px border-radius, hairline #262626 borders, elevated #141414 background.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addToCart } from '@/app/actions/dealActions';

export interface ProductCardProps {
  product: {
    id: string;
    lotNumber?: string;
    title: string;
    price?: number;
    askingPriceAmount?: number;
    category?: string | null;
    categorySubtitle?: string;
    edition?: string;
    condition?: string | null;
    gradeCondition?: string;
    origin?: string;
    imageUrl?: string;
    imageUrls?: string | null;
  };
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps): React.JSX.Element {
  const [addedToCart, setAddedToCart] = useState(false);

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

  const lotNumber = product.lotNumber || String(product.id).replace(/[^0-9]/g, '').padStart(4, '0').slice(-4) || '0482';
  const lotRoute = `/lot/${product.id}`;
  const editionBadge = product.edition || `EDITION: 042 / 350`;
  const categorySubtitle = product.categorySubtitle || (product.category === 'Statues & Resin' ? 'PRE-PAINTED POLYSTONE STATUE' : 'PRE-PAINTED SCALE FIGURE');
  const gradeTag = product.gradeCondition || (product.condition === 'NEW' ? 'GRADE S (MINT)' : 'GRADE A');

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await addToCart(product.id);
    } catch (err) {
      console.warn('[ProductCard] Add to cart note:', err);
    }

    // Trigger instant navbar update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('otaku_cart_updated'));
    }

    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false), 2000;
    });
  };

  return (
    <div
      className={`relative flex flex-col justify-between bg-[#141414] border border-[#262626] hover:border-zinc-500 p-4 transition-none group select-none rounded-none ${className}`.trim()}
    >
      <div>
        {/* 1. Header Telemetry Row */}
        <div className="flex items-center justify-between mb-2 uppercase">
          <span
            style={{
              fontFamily: 'var(--font-swiss), sans-serif',
              fontVariantNumeric: 'tabular-nums',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: '#8a8a8a',
              textTransform: 'uppercase',
            }}
            className="font-swiss"
          >
            LOT #{lotNumber} • {product.origin || 'TOKYO, JAPAN'}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-swiss), sans-serif',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
            className={`border px-1.5 py-0.5 font-swiss ${
              gradeTag.includes('GRADE S') || gradeTag.includes('SEALED')
                ? 'border-emerald-600/40 bg-emerald-950/30 text-[#10b981]'
                : 'border-[#262626] bg-[#0a0a0a] text-zinc-300'
            }`}
          >
            {gradeTag}
          </span>
        </div>

        {/* 2. Primary Media Stage (Navigates to /lot/[id]) */}
        <Link
          href={lotRoute}
          aria-label={`Inspect lot details for ${product.title}`}
          className="block no-underline"
        >
          <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#0a0a0a] border border-[#262626] flex items-center justify-center p-3 mb-3 group-hover:border-zinc-500 transition-none">
            {/* Edition Badge Overlay */}
            <div
              style={{
                fontFamily: 'var(--font-swiss), sans-serif',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
              className="absolute top-2 left-2 z-20 border border-[#262626] bg-[#0a0a0a] px-2 py-0.5 text-zinc-300 font-swiss"
            >
              {editionBadge}
            </div>

            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-2 contrast-105"
              loading="lazy"
              unoptimized={imageUrl.startsWith('http')}
            />
          </div>
        </Link>

        {/* 3. Category Subtitle & Product Title */}
        <div className="space-y-1">
          <span
            style={{
              fontFamily: 'var(--font-swiss), sans-serif',
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: '#8a8a8a',
              textTransform: 'uppercase',
            }}
            className="block font-swiss"
          >
            {categorySubtitle}
          </span>

          <Link href={lotRoute} className="block no-underline">
            <h3
              style={{
                fontFamily: 'var(--font-headline), sans-serif',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.01em',
                lineHeight: 1.25,
                textTransform: 'uppercase',
                color: '#ffffff',
              }}
              className="hover:text-zinc-200 line-clamp-2 font-headline uppercase"
            >
              {product.title}
            </h3>
          </Link>
        </div>

        {/* 4. Price & Escrow Guarantee */}
        <div className="mt-3 pt-3 border-t border-[#262626] flex items-baseline justify-between">
          <div>
            <span
              style={{
                fontFamily: 'var(--font-swiss), sans-serif',
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: '#8a8a8a',
                textTransform: 'uppercase',
              }}
              className="block font-swiss"
            >
              ARCHIVAL VALUATION
            </span>
            <span
              style={{
                fontFamily: 'var(--font-swiss), sans-serif',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '1.15rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: '#ffffff',
              }}
              className="font-swiss"
            >
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-swiss), sans-serif',
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#10b981',
            }}
            className="font-swiss"
          >
            48H ESCROW
          </span>
        </div>

        {/* 5. Direct Link to Lot Inspection */}
        <div className="mt-2 text-right">
          <Link
            href={lotRoute}
            style={{
              fontFamily: 'var(--font-swiss), sans-serif',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
            className="text-zinc-400 hover:text-white transition-none no-underline font-swiss uppercase"
          >
            [ INSPECT LOT DETAILS ] →
          </Link>
        </div>
      </div>

      {/* 6. Exclusive Home Page Action Bar (ONLY ADD TO CART) */}
      <div className="mt-4 pt-3 border-t border-[#262626]">
        <button
          type="button"
          onClick={handleAddToCart}
          style={{
            fontFamily: 'var(--font-swiss), sans-serif',
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
          className={`w-full py-2.5 px-3 border transition-none cursor-pointer flex items-center justify-center gap-2 rounded-none font-swiss uppercase ${
            addedToCart
              ? 'border-[#10b981] bg-[#10b981] text-black font-extrabold'
              : 'border-[#262626] bg-[#0a0a0a] hover:bg-white hover:text-black hover:border-white text-zinc-200'
          }`}
        >
          {addedToCart ? '[ ADDED TO VAULT CART ]' : '[ ADD TO CART ]'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
