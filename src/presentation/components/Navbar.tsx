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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('otaku_search', { detail: e.target.value }));
                }
              }}
              placeholder="SEARCH ARCHIVAL LOTS, SERIES, OR SPEC..."
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
            Drop a Grail
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

      {/* Streamlined Sleek Two-Tier Sub-Navigation Bar */}
      <StreamlinedSubNav />
    </header>
  );
}

// Tier 1: Filter Tabs (Simple text filters with clean 1px solid borders and sharp 0px corners)
const FILTER_TABS = [
  { id: 'ALL', label: 'All Lots' },
  { id: 'S_RANK', label: 'S-Rank Only' },
  { id: 'FACTORY_SEALED', label: 'Factory Sealed' },
  { id: 'ESCROW_VERIFIED', label: 'Escrow Verified' },
];

// Tier 2: Categories (Text-driven category list with clean letter spacing and subtle active borders)
const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'Scale Figure', label: 'Scale Figures' },
  { id: 'Statues & Resin', label: 'Statues & Resin' },
  { id: 'Manga Sets', label: 'Manga Editions' },
  { id: 'Nendoroid', label: 'Nendoroids' },
  { id: 'Cosplay & Props', label: 'Cosplay & Props' },
];

function StreamlinedSubNav() {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('otaku_filter_select', {
          detail: { filter: filterId },
        })
      );
    }
  };

  const handleCategoryClick = (catId: string) => {
    setActiveCategory(catId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('otaku_category_select', {
          detail: { category: catId },
        })
      );
    }
  };

  return (
    <div className="w-full border-t border-zinc-800 bg-[#0b0b0e]">
      {/* Tier 1: Simple Text Filters */}
      <div className="border-b border-zinc-900 px-4 sm:px-6 lg:px-8 py-2">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold select-none pr-1">
              Criteria:
            </span>
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleFilterClick(tab.id)}
                  className={`px-3 py-1 text-[11px] tracking-[0.14em] uppercase transition-none cursor-pointer whitespace-nowrap rounded-none border ${
                    isActive
                      ? 'bg-[#f4f4f4] text-black border-[#f4f4f4] font-bold'
                      : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 font-medium'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium shrink-0">
            <span className="inline-block w-1.5 h-1.5 bg-zinc-400 rounded-none" />
            <span>Index Active: 9 Verified Lots</span>
          </div>
        </div>
      </div>

      {/* Tier 2: Text-Driven Categories */}
      <div className="px-4 sm:px-6 lg:px-8 py-2 bg-[#09090b]">
        <div className="mx-auto max-w-7xl flex items-center gap-6 overflow-x-auto scrollbar-none">
          {CATEGORY_TABS.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`text-[11px] tracking-[0.18em] uppercase transition-none cursor-pointer whitespace-nowrap pb-1 border-b-2 ${
                  isActive
                    ? 'border-zinc-100 text-zinc-100 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300 font-medium'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Navbar;