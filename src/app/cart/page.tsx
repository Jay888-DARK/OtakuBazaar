'use client';

/**
 * @file src/app/cart/page.tsx
 *
 * Dedicated Cart Page for OtakuBazaar.
 * Follows Route-Level Navigation Isolation:
 * - Only displays top logo, search bar, and user profile links in Header (no Criteria or Categories bar).
 * - Displays active cart items, price breakdown, and direct link to Escrow Checkout.
 * - Strict 1px dark borders, 0px border-radius, luxury Satoshi/Clash typography.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCartItems, removeFromCart } from '@/app/actions/dealActions';

export default function CartPage(): React.JSX.Element {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCartItems()
      .then((items) => {
        if (items && Array.isArray(items)) {
          setCartItems(items);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('[CartPage] Failed to fetch items:', err);
        setLoading(false);
      });
  }, []);

  const handleRemove = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error('[CartPage] Failed to remove item:', err);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const effectivePrice =
      item.product?.activeOffer?.status === 'ACCEPTED'
        ? item.product.activeOffer.offeredPrice
        : item.product?.price || 0;
    return acc + effectivePrice * (item.quantity || 1);
  }, 0);

  return (
    <div
      className="min-h-screen bg-[#09090b] text-zinc-100 py-10 px-4 sm:px-6 lg:px-8 pb-24"
      style={{ fontFamily: "'Satoshi', 'Cabinet Grotesk', sans-serif" }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-normal text-zinc-500">
          <Link href="/" className="hover:text-zinc-200 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-200">Cart</span>
        </div>

        {/* Page Header */}
        <div className="border border-zinc-800 bg-[#111114] p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 bg-zinc-900 text-zinc-400 border border-zinc-700 text-xs uppercase tracking-wider font-normal">
              48-Hour Escrow Protection
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight"
            style={{ fontFamily: "'Clash Display', 'Syne', sans-serif" }}
          >
            Collector Vault Cart
          </h1>
          <p className="text-xs text-zinc-400 mt-2 font-normal">
            Your reserved lots are backed by physical inspection before fund release.
          </p>
        </div>

        {/* Cart Contents */}
        {loading ? (
          <div className="border border-zinc-800 bg-[#111114] p-16 text-center text-zinc-500 text-xs">
            <div className="w-6 h-6 border border-zinc-400 border-t-transparent animate-spin mx-auto mb-3" />
            <span>Loading cart items...</span>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="border border-zinc-800 bg-[#111114] p-16 text-center space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Your Cart is Empty
            </h2>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Explore authenticated scale figures and rare grails in the catalog.
            </p>
            <Link
              href="/catalog"
              className="inline-block px-5 py-2.5 bg-[#f4f4f4] hover:bg-white text-black text-xs font-semibold uppercase tracking-wider border border-[#f4f4f4] transition-none cursor-pointer rounded-none"
            >
              Explore Catalog →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Items Column */}
            <div className="lg:col-span-8 space-y-3">
              {cartItems.map((item) => {
                const product = item.product;
                const effectivePrice =
                  product?.activeOffer?.status === 'ACCEPTED'
                    ? product.activeOffer.offeredPrice
                    : product?.price || 0;

                return (
                  <div
                    key={item.id}
                    className="border border-zinc-800 bg-[#111114] p-4 flex gap-4 items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-[#09090b] border border-zinc-800 shrink-0 flex items-center justify-center p-1">
                        <Image
                          src={product?.imageUrl || product?.images?.[0] || '/Firefly_clean.png'}
                          alt={product?.title || 'Collectible'}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
                          LOT #{product?.lotNumber || '0482'} • {product?.condition || 'MINT'}
                        </span>
                        <h3 className="text-xs font-semibold text-zinc-100 tracking-normal line-clamp-1">
                          {product?.title || 'Authentic Collectible'}
                        </h3>
                        <span className="text-xs font-bold text-zinc-300 mt-1 block">
                          ₹{effectivePrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="text-xs text-zinc-500 hover:text-red-400 border border-zinc-800 bg-zinc-900 px-2.5 py-1 uppercase tracking-wider transition-none cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4">
              <div className="border border-zinc-800 bg-[#111114] p-6 space-y-4">
                <h2
                  className="text-sm font-bold text-zinc-100 uppercase tracking-tight border-b border-zinc-800 pb-3"
                  style={{ fontFamily: "'Clash Display', 'Syne', sans-serif" }}
                >
                  Order Summary
                </h2>

                <div className="space-y-2.5 text-xs text-zinc-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-zinc-200 font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Escrow Liability Trust Fee</span>
                    <span className="text-emerald-400 font-semibold">FREE (₹0)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Express Insured Courier</span>
                    <span className="text-emerald-400 font-semibold">FREE (₹0)</span>
                  </div>
                  <div className="border-t border-zinc-800 pt-3 flex justify-between items-baseline text-zinc-100">
                    <span className="text-xs uppercase tracking-wider font-medium">Total (INR)</span>
                    <span className="text-lg font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => router.push('/checkout')}
                    className="w-full py-3 bg-[#f4f4f4] hover:bg-white text-black text-xs font-bold uppercase tracking-wider border border-[#f4f4f4] transition-none cursor-pointer text-center block rounded-none"
                  >
                    Proceed to Escrow Checkout →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
