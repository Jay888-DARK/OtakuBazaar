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
  BUYER: { id: 'user_buyer_tanjiro', name: 'Tanjiro Kamado', role: 'BUYER', avatar: 'TK', handle: '@tanjiro_slayer' },
  SELLER: { id: 'user_seller_rengoku', name: 'Kyojuro Rengoku', role: 'SELLER', avatar: 'KR', handle: '@flame_hashira' },
  ADMIN: { id: 'user_admin_allmight', name: 'Toshinori Yagi', role: 'ADMIN', avatar: 'TY', handle: '@allmight_auth' },
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
    const query = searchQuery.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/search');
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
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-[#09090b]">
      {/* Primary Navigation Bar (Height: 56px) */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mascot Brand Logo & Typography */}
        <div className="flex items-center">
          <Link
            href="/"
            aria-label="OtakuBazaar Home — Authentic Anime Collectibles"
            className="flex items-center space-x-3 cursor-pointer group no-underline focus-visible:outline-none p-1"
          >
            {/* The Original Mascot Logo Mark */}
            <div
              className="relative flex items-center justify-center shrink-0 w-10 h-10"
              style={{ borderRadius: '0px', boxShadow: 'none', background: 'transparent' }}
            >
              <Image
                src="/Firefly.png"
                alt="OtakuBazaar Mascot"
                width={40}
                height={40}
                priority
                className="w-10 h-10 object-contain"
                style={{ borderRadius: '0px', boxShadow: 'none', background: 'transparent' }}
              />
            </div>

            {/* The Logotype ('Clash Display' / 'Syne') */}
            <div className="flex flex-col">
              <span
                style={{ fontFamily: "'Clash Display', 'Syne', sans-serif" }}
                className="text-sm font-extrabold tracking-[0.25em] uppercase text-zinc-100 group-hover:text-white transition-colors leading-none"
              >
                OtakuBazaar
              </span>
              <span className="text-[8px] font-semibold tracking-[0.25em] text-zinc-500 uppercase mt-0.5 leading-none">
                Secure Marketplace
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
              placeholder="SEARCH PRODUCTS, SERIES, OR CHARACTERS..."
              className="w-full border border-zinc-800 bg-[#0e0e11] px-3.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-zinc-500 uppercase tracking-wider text-[11px] rounded-none"
            />
          </form>
        </div>

        {/* Right: Action Cluster */}
        <div className="flex items-center space-x-3">
          {/* Cart Drawer Trigger */}
          <button
            onClick={openCart}
            type="button"
            aria-label="Open Cart Drawer"
            className="flex items-center space-x-2 border border-zinc-800 bg-[#0e0e11] px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white cursor-pointer rounded-none"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider">Cart</span>
            <span className="border border-zinc-800 bg-zinc-900 px-1.5 py-0.2 text-[10px] font-medium text-zinc-200">
              {cartItemCount || 0}
            </span>
          </button>

          {/* Monochromatic Primary CTA */}
          <button
            onClick={handleOpenSellModal}
            type="button"
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-100 text-zinc-300 hover:text-black border border-zinc-700 hover:border-zinc-100 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-200 cursor-pointer rounded-none"
          >
            Sell Item
          </button>

          {/* Sign In / Profile */}
          {!session ? (
            <button
              onClick={handleAuth}
              type="button"
              className="border border-zinc-800 bg-[#0e0e11] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white cursor-pointer rounded-none"
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-2 pl-2 pr-2 py-1 bg-[#0e0e11] border border-zinc-800 shrink-0">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user?.name || 'User profile'}
                  className="w-5 h-5 border border-zinc-700 object-cover shrink-0 rounded-none"
                />
              ) : (
                <div className="w-5 h-5 border border-zinc-700 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0">
                  {session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="hidden lg:inline-block max-w-[80px] truncate text-xs font-medium uppercase tracking-wider text-zinc-300">
                {session.user?.name}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                aria-label="Sign out of OtakuBazaar"
                className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-white px-2 py-0.5 border border-zinc-700 bg-zinc-800 transition-colors cursor-pointer shrink-0 whitespace-nowrap rounded-none"
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