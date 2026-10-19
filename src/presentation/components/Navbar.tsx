'use client';

/**
 * @file src/presentation/components/Navbar.tsx
 *
 * Streamlined Minimalist Archival Header Architecture for OtakuBazaar.
 * Locked to dark brutalist vault theme (#0a0a0a, hairline #262626, instant 0ms state changes).
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
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  useEffect(() => {
    // Initial fetch of cart items
    getCartItems()
      .then((items) => {
        if (items && Array.isArray(items)) {
          setCartItemCount(items.length);
        }
      })
      .catch(() => {});

    // Listen for instant cart update events
    const handleCartUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ count?: number }>;
      if (typeof customEvent.detail?.count === 'number') {
        setCartItemCount(customEvent.detail.count);
      } else {
        setCartItemCount((prev) => prev + 1);
      }
    };

    window.addEventListener('otaku_cart_updated', handleCartUpdate);
    return () => window.removeEventListener('otaku_cart_updated', handleCartUpdate);
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
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-14 border-b border-[#262626] bg-[#0a0a0a]">
      {/* Primary Navigation Bar (Height: 56px) */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mascot Brand Logo & Typography */}
        <div className="flex items-center">
          <Link
            href="/"
            aria-label="OtakuBazaar Home — Authentic Anime Collectibles"
            className="flex items-center space-x-3 cursor-pointer group no-underline focus-visible:outline-none p-1"
          >
            {/* Mascot Logo Mark */}
            <div
              className="relative flex items-center justify-center shrink-0 w-8 h-8 sm:w-9 sm:h-9"
              style={{ borderRadius: '0px', boxShadow: 'none', background: 'transparent' }}
            >
              <Image
                src="/Firefly.png"
                alt="OtakuBazaar Mascot"
                width={36}
                height={36}
                priority
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                style={{ borderRadius: '0px', boxShadow: 'none', background: 'transparent' }}
              />
            </div>

            {/* The Logotype */}
            <div className="flex flex-col justify-center">
              <span
                style={{
                  fontFamily: 'var(--font-brand), sans-serif',
                  fontSize: '0.95rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                }}
                className="font-extrabold uppercase leading-tight font-brand"
              >
                OTAKUBAZAAR
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-swiss), sans-serif',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#8a8a8a',
                }}
                className="leading-tight font-swiss"
              >
                ESCROW AUTHENTICATED
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden flex-1 max-w-md mx-6 sm:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH PRODUCTS, SERIES, OR CHARACTERS..."
              style={{
                fontFamily: 'var(--font-swiss), sans-serif',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
              className="w-full border border-[#262626] bg-[#141414] px-3.5 py-1.5 text-zinc-100 placeholder-[#737373] outline-none transition-none focus:border-white focus:bg-[#0a0a0a] uppercase rounded-none font-swiss"
            />
          </form>
        </div>

        {/* Right: Bracketed Action Cluster */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Cart Drawer Trigger */}
          <button
            onClick={openCart}
            type="button"
            aria-label="Open Cart Drawer"
            style={{
              fontFamily: 'var(--font-swiss), sans-serif',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
            className="flex items-center border border-[#262626] bg-[#141414] px-3 py-1.5 uppercase text-zinc-200 hover:border-white hover:bg-white hover:text-black transition-none cursor-pointer rounded-none font-swiss"
          >
            <span>[ CART {cartItemCount} ]</span>
          </button>

          {/* Monochromatic Primary CTA */}
          <button
            onClick={handleOpenSellModal}
            type="button"
            style={{
              fontFamily: 'var(--font-swiss), sans-serif',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
            className="hidden sm:inline-flex border border-[#262626] bg-[#141414] px-3.5 py-1.5 uppercase text-zinc-200 hover:border-white hover:bg-white hover:text-black transition-none cursor-pointer rounded-none font-swiss"
          >
            [ SELL ITEM ]
          </button>

          {/* Sign In / Profile */}
          {!session ? (
            <button
              onClick={handleAuth}
              type="button"
              style={{
                fontFamily: 'var(--font-swiss), sans-serif',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
              className="border border-[#262626] bg-[#141414] px-3 py-1.5 uppercase text-zinc-200 hover:border-white hover:bg-white hover:text-black transition-none cursor-pointer rounded-none font-swiss"
            >
              [ SIGN IN ]
            </button>
          ) : (
            <div className="flex items-center gap-2 pl-2 pr-2 py-1 bg-[#141414] border border-[#262626] shrink-0">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user?.name || 'User profile'}
                  className="w-5 h-5 border border-[#262626] object-cover shrink-0 rounded-none"
                />
              ) : (
                <div
                  style={{ fontFamily: 'var(--font-swiss), sans-serif' }}
                  className="w-5 h-5 border border-[#262626] bg-[#0a0a0a] flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0 font-swiss"
                >
                  {session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span
                style={{
                  fontFamily: 'var(--font-swiss), sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
                className="hidden lg:inline-block max-w-[80px] truncate uppercase text-zinc-300 font-swiss"
              >
                {session.user?.name}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                aria-label="Sign out of OtakuBazaar"
                style={{
                  fontFamily: 'var(--font-swiss), sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
                className="uppercase text-zinc-400 hover:text-white px-2 py-0.5 border border-[#262626] bg-[#0a0a0a] hover:bg-[#262626] transition-none cursor-pointer shrink-0 whitespace-nowrap rounded-none font-swiss"
                title="Sign out of OtakuBazaar"
              >
                [ SIGN OUT ]
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;