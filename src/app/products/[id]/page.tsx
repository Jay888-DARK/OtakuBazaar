'use client';

/**
 * @file src/app/products/[id]/page.tsx
 *
 * Product Details Page for OtakuBazaar.
 * Displays figure specs, holographic authenticity guarantee, and "Add to Cart" button.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ProductDetailsProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function ProductDetailsPage({ params }: ProductDetailsProps) {
  const router = useRouter();
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    router.push('/checkout');
  };

  const handleBuyNow = () => {
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-stone-400">
          <Link href="/" className="hover:text-amber-300 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-stone-300">Collectibles</span>
          <span>/</span>
          <span className="text-amber-400">Grail Details</span>
        </div>

        {/* Main Product Details Card */}
        <div className="border border-zinc-800 bg-[#0e0e11] p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Thumbnail / Image Section */}
          <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-[#09090b] border border-zinc-800 flex items-center justify-center">
            <Image
              src="/Firefly_clean.png"
              alt="Authentic Anime Grail"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4 product-thumbnail"
              data-testid="product-details-image"
              priority
            />
            <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-semibold tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-700 uppercase">
              [S-RANK] FACTORY SEALED
            </span>
          </div>

          {/* Details & Actions Section */}
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.25em] block mb-1">
                Authentic Japanese Import
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 uppercase tracking-tight">
                Kyojuro Rengoku Flame Breathing 1/8 Scale Figure
              </h1>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Factory sealed Kadokawa licensed masterwork. Includes tamper-evident holographic authentication seal and 48-hour unboxing escrow guarantee.
              </p>
            </div>

            <div className="p-4 bg-[#09090b] border border-zinc-800 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">
                  Authentic Collector Price
                </span>
                <span className="text-2xl font-bold uppercase tracking-wider text-zinc-100">₹999.00</span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                100% Escrow Protected
              </span>
            </div>

            {/* Actions: Add to Cart */}
            <div className="space-y-3 pt-2">
              <Link href="/checkout" className="block w-full no-underline">
                <button
                  type="button"
                  id="add-to-cart-btn"
                  data-testid="add-to-cart"
                  className="w-full py-3.5 px-6 font-bold text-sm uppercase tracking-[0.2em] text-white bg-[#F85B1A] hover:brightness-110 border border-[#F85B1A] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <span>Add to Cart</span>
                </button>
              </Link>

              <Link
                href="/checkout"
                id="go-to-checkout"
                data-testid="checkout-button"
                className="w-full py-2.5 px-6 font-semibold text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 bg-zinc-900/60 text-center transition-all block no-underline"
              >
                Proceed to Checkout →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
