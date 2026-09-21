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
        <div className="bento-big-box p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Thumbnail / Image Section */}
          <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-black/40 border border-stone-800 flex items-center justify-center">
            <Image
              src="/Firefly_clean.png"
              alt="Authentic Anime Grail"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4 product-thumbnail"
              data-testid="product-details-image"
              priority
            />
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-[#E8C36A] border border-amber-500/40">
              [S-RANK] FACTORY SEALED
            </span>
          </div>

          {/* Details & Actions Section */}
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Authentic Japanese Import
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 uppercase tracking-wider">
                Kyojuro Rengoku Flame Breathing 1/8 Scale Figure
              </h1>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Factory sealed Kadokawa licensed masterwork. Includes tamper-evident holographic authentication seal and 48-hour unboxing escrow guarantee.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-stone-800/80 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                  Authentic Collector Price
                </span>
                <span className="text-2xl font-black text-[#E8C36A]">₹999.00</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">
                🛡️ 100% Escrow Protected
              </span>
            </div>

            {/* Actions: Add to Cart */}
            <div className="space-y-3 pt-2">
              <Link href="/checkout" className="block w-full no-underline">
                <button
                  type="button"
                  id="add-to-cart-btn"
                  data-testid="add-to-cart"
                  className="w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-white bg-[#F85B1A] hover:brightness-110 active:scale-[0.98] shadow-lg shadow-[#F85B1A]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🛒</span>
                  <span>Add to Cart</span>
                </button>
              </Link>

              <Link
                href="/checkout"
                id="go-to-checkout"
                data-testid="checkout-button"
                className="w-full py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-stone-400 hover:text-stone-200 text-center transition-all block no-underline"
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
