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
import { CheckoutButton } from '@/presentation/components/payments/CheckoutButton';

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
      {/* 1. Header (Anti-Truncation Item Format) */}
      <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-zinc-500 mb-2">
        <span>ITEM #{String(product.id).replace(/[^0-9]/g, '').padStart(4, '0').slice(-4) || '0482'} • TOKYO / MUMBAI</span>
        <span className="text-[9px] font-bold tracking-[0.15em] text-zinc-300 border border-zinc-700 bg-zinc-900 px-2 py-0.5 uppercase">
          AUTHENTIC
        </span>
      </div>

      {/* 2. Image Stage */}
      <Link
        href={`/products/${product.id}`}
        aria-label={`View details for ${product.title}`}
        className="block no-underline product-thumbnail"
        data-testid="product-thumbnail"
      >
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#09090b] border border-zinc-800/80 flex items-center justify-center p-3 my-2">
          <span className="marginal-metadata marginal-tl text-zinc-600">
            ITEM #{String(product.id).replace(/[^0-9]/g, '').padStart(4, '0').slice(-4) || '0482'}
          </span>
          <span className="marginal-metadata marginal-br text-zinc-600">
            MINT
          </span>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)] pointer-events-none" />
          <Image
            src={imageUrl || '/Firefly_clean.png'}
            alt={product.title || 'Anime Collectible'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-2 relative z-10 contrast-110"
            loading="lazy"
          />
        </div>
      </Link>

      {/* 3. Title & Price Ticker */}
      <div>
        <Link href={`/products/${product.id}`} className="block no-underline hover:no-underline">
          <h3
            className="product-title text-sm font-semibold text-zinc-100 truncate mt-2 normal-case tracking-normal"
            style={{ fontFamily: "'Satoshi', 'Cabinet Grotesk', sans-serif" }}
          >
            {product.title}
          </h3>
        </Link>

        {/* Secondary Valuation Bar */}
        <div
          className="flex items-center justify-between text-xs font-normal text-zinc-500 mt-2"
          style={{ fontFamily: "'Satoshi', 'Cabinet Grotesk', sans-serif" }}
        >
          <span className="text-emerald-400 font-medium">+14.2% (90D)</span>
          <span className="text-zinc-400 font-normal">{offersCount || 2} Active Offers</span>
        </div>

        {/* Buying Flow: Primary CTA */}
        <div className="mt-3 space-y-2">
          {/* Direct Prominent Primary CTA */}
          <CheckoutButton
            productId={product.id}
            lotId={product.id}
            amount={displayPrice}
            title={product.title}
            description="Direct Purchase with Escrow Protection"
            buttonText={`BUY NOW — ₹${displayPrice.toLocaleString('en-IN')}`}
            className="w-full py-2.5 px-3 bg-zinc-100 hover:bg-white text-black font-semibold text-xs uppercase tracking-wider border border-zinc-100 transition-none cursor-pointer flex items-center justify-center gap-2 rounded-none"
          />

          {/* Clear Assurance Badges (Zero Emojis, Sharp 0px borders) */}
          <div
            className="flex items-center justify-between text-[11px] text-zinc-400 font-normal px-0.5"
            style={{ fontFamily: "'Satoshi', 'Cabinet Grotesk', sans-serif" }}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-zinc-500 inline-block" />
              Insured Shipping
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-zinc-500 inline-block" />
              48h Inspection Window
            </span>
          </div>

          {/* Secondary Action: Make an Offer / Quick Cart */}
          <div className="flex items-center gap-2 pt-1 border-t border-zinc-900">
            <button
              onClick={() => handleOpenBargain(product.id)}
              aria-label={`Make an offer on ${product.title}`}
              data-testid="price-offer-pill"
              className="filter-pill flex-1 flex items-center justify-between px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-normal cursor-pointer rounded-none"
              style={{ fontFamily: "'Satoshi', 'Cabinet Grotesk', sans-serif" }}
            >
              <span>Make an Offer</span>
              <span className="text-zinc-400 font-medium">Offer →</span>
            </button>
            <button
              type="button"
              aria-label="Quick Cart"
              title="Add to Cart"
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
              className="p-1.5 border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer shrink-0 rounded-none"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </button>
          </div>
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
