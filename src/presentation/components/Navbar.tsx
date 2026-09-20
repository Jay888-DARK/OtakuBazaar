'use client';

/**
 * @file src/presentation/components/Navbar.tsx
 *
 * Streamlined Minimalist Header Architecture for OtakuBazaar.
 * Locked to Indian Rupee (INR ₹) with quiet luxury gallery design.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { openCartDrawer } from '@/presentation/components/cart/CartDrawer';
import { getCartItems } from '@/app/actions/dealActions';

export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface UserPersona {
  readonly id: string;
  readonly name: string;
  readonly role: UserRole;
  readonly avatar: string;
  readonly handle: string;
}

export const DEMO_PERSONAS: Record<UserRole, UserPersona> = {
  BUYER: { id: 'user_buyer_tanjiro', name: 'Tanjiro Kamado', role: 'BUYER', avatar: '🗡️', handle: '@tanjiro_slayer' },
  SELLER: { id: 'user_seller_rengoku', name: 'Kyojuro Rengoku', role: 'SELLER', avatar: '🔥', handle: '@flame_hashira' },
  ADMIN: { id: 'user_admin_allmight', name: 'Toshinori Yagi', role: 'ADMIN', avatar: '⚡', handle: '@allmight_auth' },
};

export function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItemCount, setCartItemCount] = useState<number>(1);

  useEffect(() => {
    getCartItems()
      .then((items) => {
        if (items && Array.isArray(items)) {
          setCartItemCount(items.length);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('otaku_search', { detail: searchQuery.trim() }));
    }
  };

  const openCart = () => {
    openCartDrawer();
  };

  const handleOpenSellModal = () => {
    router.push('/sell');
  };

  const handleAuth = () => {
    if (session) {
      signOut();
    } else {
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Split Luxury Brand Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            aria-label="OtakuBazaar Home — Authentic Anime Collectibles"
            className="flex items-center space-x-3 cursor-pointer group no-underline focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:outline-none rounded-xl p-1"
          >
            {/* The Brand Mark (Kitsune Mask) */}
            <div className="h-8 w-8 relative flex items-center justify-center drop-shadow-[0_2px_8px_rgba(255,255,255,0.05)]">
              <img
                src="/Firefly.png"
                alt="OtakuBazaar Icon"
                className="h-full w-auto object-contain object-left group-hover:opacity-90 transition-opacity"
              />
            </div>

            {/* The Logotype (Premium Platinum Gradient) */}
            <div className="flex flex-col">
              <span className="text-[13px] font-sans font-extrabold tracking-[0.25em] uppercase bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent group-hover:from-white group-hover:via-zinc-200 group-hover:to-zinc-400 transition-all duration-300">
                OtakuBazaar
              </span>
              {/* Retain the micro-label underneath */}
              <span className="text-[8px] font-mono tracking-[0.25em] text-zinc-500 uppercase mt-0.5">
                Escrow Authenticated
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Clean Search Bar */}
        <div className="hidden flex-1 max-w-md mx-8 sm:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search verified scale figures..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-zinc-500 font-mono"
            />
          </form>
        </div>

        {/* Right: Simplified Action Cluster */}
        <div className="flex items-center space-x-3">
          {/* Cart Drawer Trigger */}
          <button
            onClick={openCart}
            type="button"
            aria-label="Open Cart Drawer"
            className="flex items-center space-x-2 rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white cursor-pointer"
          >
            <span className="font-mono text-[11px] uppercase tracking-wider">Cart</span>
            <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] font-mono text-zinc-200">
              {cartItemCount || 0}
            </span>
          </button>

          {/* Monochromatic Primary CTA */}
          <button
            onClick={handleOpenSellModal}
            type="button"
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-100 text-zinc-300 hover:text-black border border-zinc-700 hover:border-zinc-100 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] rounded-lg transition-all duration-300 cursor-pointer"
          >
            Drop a Grail
          </button>

          {/* Sign In / Profile */}
          {!session ? (
            <button
              onClick={handleAuth}
              type="button"
              className="rounded-md border border-zinc-800 px-3 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white cursor-pointer"
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 shrink-0">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user?.name || 'User profile'}
                  className="w-5 h-5 rounded-full border border-zinc-700 object-cover shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0">
                  {session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="hidden lg:inline-block max-w-[80px] truncate text-xs font-mono text-zinc-300">
                {session.user?.name}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                aria-label="Sign out of OtakuBazaar"
                className="text-[10px] font-mono text-zinc-400 hover:text-white px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                title="Sign out of OtakuBazaar"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;