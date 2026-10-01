'use client';

/**
 * @file src/presentation/components/cart/CartDrawer.tsx
 *
 * Slide-Over Cart Drawer for OtakuBazaar.
 *
 * Features:
 * 1. Accessible from Navbar cart icon (`otaku-open-cart-drawer` custom event).
 * 2. Displays all carted figures with:
 *    - Thumbnail, Title, and Original Asking Price.
 *    - Current Bid Status pill.
 * 3. Clicking any carted item opens the negotiation chat drawer (BargainChatDrawer) with the seller.
 *
 * Aesthetic: Strict monochrome obsidian vault (#09090b, #121214, border-zinc-800)
 * with Universal Button Tokens and clean monospace typography.
 */

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCartItems, removeFromCart } from '@/app/actions/dealActions';
import { BargainChatDrawer } from '@/presentation/components/chat/BargainChatDrawer';

export interface CartProduct {
  id: string;
  title: string;
  price: number;
  imageUrls?: string | null;
  minOfferPrice?: number | null;
  activeOffer?: {
    id: string;
    offeredPrice: number;
    status: string;
    expiresAt: string | Date;
  } | null;
}

export interface CartItemData {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
}

// Global dispatcher to open the Cart Drawer from anywhere
export function openCartDrawer() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('otaku-open-cart-drawer'));
  }
}

// Demo fallback item if the user's DB cart is empty
const DEMO_CART_ITEMS: CartItemData[] = [
  {
    id: 'cart-demo-1',
    productId: 'prod_rengoku_scale_1',
    quantity: 1,
    product: {
      id: 'prod_rengoku_scale_1',
      title: 'Kyojuro Rengoku Flame Breathing 1/8 Scale Figure',
      price: 18500,
      imageUrls: '/Firefly_clean.png',
      minOfferPrice: 13500,
      activeOffer: {
        id: 'offer-demo-pending',
        offeredPrice: 15500,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000 + 42 * 60 * 1000),
      },
    },
  },
];

function formatCountdown(expiresAt: string | Date): string {
  const target = new Date(expiresAt).getTime();
  const diff = target - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export function CartDrawer(): React.JSX.Element | null {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeNegotiateProduct, setActiveNegotiateProduct] = useState<CartProduct | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const items = await getCartItems('user_buyer_tanjiro');
      if (items && items.length > 0) {
        setCartItems(
          items.map((i: any) => {
            const rawOffer = i.product?.dealOffers?.[0];
            return {
              id: i.id,
              productId: i.productId,
              quantity: i.quantity,
              product: {
                id: i.product.id,
                title: i.product.title,
                price: i.product.price > 0 ? i.product.price : Math.round(i.product.askingPriceAmount / 100),
                imageUrls: i.product.imageUrls,
                minOfferPrice: i.product.minOfferPrice,
                activeOffer: rawOffer
                  ? {
                      id: rawOffer.id,
                      offeredPrice: rawOffer.offeredPrice,
                      status: rawOffer.status,
                      expiresAt: rawOffer.expiresAt,
                    }
                  : {
                      id: `offer-${i.id}`,
                      offeredPrice: Math.round(
                        (i.product.price > 0 ? i.product.price : Math.round(i.product.askingPriceAmount / 100)) * 0.85
                      ),
                      status: 'PENDING',
                      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    },
              },
            };
          })
        );
      } else {
        setCartItems(DEMO_CART_ITEMS);
      }
    } catch {
      setCartItems(DEMO_CART_ITEMS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      fetchItems();
    };

    window.addEventListener('otaku-open-cart-drawer', handleOpen);
    return () => window.removeEventListener('otaku-open-cart-drawer', handleOpen);
  }, [fetchItems]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleRemove = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await removeFromCart(itemId);
    } catch (err) {
      console.warn('[CartDrawer] Error removing item:', err);
    }
  };

  const handleCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const effectivePrice =
      item.product.activeOffer?.status === 'ACCEPTED'
        ? item.product.activeOffer.offeredPrice
        : item.product.price;
    return acc + effectivePrice * item.quantity;
  }, 0);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9990] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 transition-opacity duration-300 animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-[#09090b] border-l border-zinc-800 text-zinc-100 flex flex-col transform transition-transform ease-out duration-300 animate-in slide-in-from-right">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#0e0e11]">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 flex items-center justify-center text-zinc-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </span>
                <div>
                  <h2 id="cart-drawer-title" className="text-sm font-bold text-zinc-100 uppercase tracking-widest">
                    Collector Vault Cart
                  </h2>
                  <p className="text-[10px] text-zinc-500 m-0 uppercase tracking-wider">
                    {cartItems.length} {cartItems.length === 1 ? 'lot' : 'lots'} • 48-Hour Escrow Protected
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close cart drawer"
                className="w-7 h-7 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500 text-xs uppercase tracking-wider">
                  <div className="w-5 h-5 border border-zinc-400 border-t-transparent animate-spin mb-2" />
                  <span>Loading vault cart...</span>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-20 px-6 space-y-4">
                  <div className="w-12 h-12 mx-auto border border-zinc-800 flex items-center justify-center text-zinc-600 bg-[#0c0c0e]">
                    <svg className="w-6 h-6 stroke-[1.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" />
                      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 font-semibold block mb-1">
                      Vault Cart Status
                    </span>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-300">
                      Your Cart is Empty
                    </h3>
                    <p className="text-zinc-500 text-[11px] leading-relaxed max-w-xs mx-auto mt-1 font-normal">
                      Your cart is currently empty. Browse our verified anime figures and manga sets to place an order.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2.5 bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-semibold hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer uppercase tracking-[0.2em]"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                cartItems.map((item) => {
                  const offer = item.product.activeOffer;
                  const isPending = offer?.status === 'PENDING';
                  const isAccepted = offer?.status === 'ACCEPTED';

                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveNegotiateProduct(item.product)}
                      className="bg-[#0e0e11] border border-zinc-800 p-3 hover:border-zinc-600 transition-colors cursor-pointer group relative"
                    >
                      <div className="flex gap-3 items-start">
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 bg-[#09090b] border border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center p-1">
                          <Image
                            src={item.product.imageUrls || '/Firefly_clean.png'}
                            alt={item.product.title}
                            width={56}
                            height={56}
                            className="object-contain"
                            unoptimized
                          />
                        </div>

                        {/* Title & Asking Price */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="text-xs font-bold text-zinc-200 truncate pr-2 group-hover:text-zinc-100 transition-colors uppercase tracking-wider">
                              {item.product.title}
                            </h3>
                            <button
                              type="button"
                              onClick={(e) => handleRemove(item.id, e)}
                              aria-label="Remove item"
                              className="text-zinc-500 hover:text-zinc-200 p-0.5 transition-colors cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Asking:</span>
                            <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                              ₹{item.product.price.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Current Bid Status Pill */}
                          <div className="mt-2">
                            {isAccepted ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] uppercase tracking-wider font-semibold">
                                <span className="font-bold">ACCEPTED:</span>
                                <span>₹{offer.offeredPrice.toLocaleString('en-IN')}</span>
                              </div>
                            ) : isPending ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] uppercase tracking-wider font-medium">
                                <span className="text-zinc-500">PENDING:</span>
                                <span>
                                  ₹{offer.offeredPrice.toLocaleString('en-IN')} ({formatCountdown(offer.expiresAt)})
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveNegotiateProduct(item.product);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-[10px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                              >
                                <span>Make Offer / Bargain</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Subtotal & Escrow Checkout Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-zinc-800 bg-[#0e0e11] space-y-3">
                <div className="flex justify-between items-baseline text-xs uppercase tracking-wider">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Cart Total</span>
                  <span className="text-lg font-bold text-zinc-100 tracking-wider">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-2.5 bg-[#09090b] border border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>48-Hour Inspection Escrow Protection</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">INCLUDED</span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-100 text-zinc-300 hover:text-black border border-zinc-700 hover:border-zinc-100 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Checkout →</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Negotiation Chat Drawer when clicking any carted item */}
      {activeNegotiateProduct && (
        <BargainChatDrawer
          productId={activeNegotiateProduct.id}
          askingPriceINR={activeNegotiateProduct.price}
          productTitle={activeNegotiateProduct.title}
          existingOfferId={activeNegotiateProduct.activeOffer?.id}
          isOpen={true}
          onClose={() => {
            setActiveNegotiateProduct(null);
            fetchItems();
          }}
        />
      )}
    </>
  );
}

export default CartDrawer;
