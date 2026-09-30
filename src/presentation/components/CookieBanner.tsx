'use client';

/**
 * @file src/presentation/components/CookieBanner.tsx
 *
 * Japanese Dark-Wood & Vermilion Cookie Consent Banner for OtakuBazaar.
 * Complies with escrow marketplace identity, DPDP, and transparency requirements.
 *
 * Positioning: z-[999] fixed bottom-4 left-4 right-4 max-w-xl mx-auto
 * Direct navigation links to `/privacy` and `/terms`.
 * Persists consent preference in localStorage under 'otaku_cookie_consent'.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieBanner(): React.JSX.Element | null {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Only check in browser client environment
    if (typeof window === 'undefined') return;

    try {
      const consent = localStorage.getItem('otaku_cookie_consent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      // Fallback if localStorage is inaccessible
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('otaku_cookie_consent', 'accepted');
      }
    } catch {
      // In case localStorage is blocked
    }
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('otaku_cookie_consent', 'declined');
      }
    } catch {
      // In case localStorage is blocked
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie Consent & Escrow Privacy Notice"
      className="z-[999] fixed bottom-4 left-4 right-4 max-w-xl mx-auto p-4 sm:p-5 bg-[#111114] border border-zinc-800 transition-all duration-300"
    >
      <div className="flex flex-col gap-3">
        {/* Top Bar: Icon + Badge + Close 'X' */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <span className="text-xs font-bold tracking-[0.2em] text-zinc-200 uppercase">
              Collector Escrow Privacy
            </span>
          </div>

          <button
            type="button"
            onClick={handleDecline}
            aria-label="Close banner without tracking"
            className="text-zinc-400 hover:text-zinc-100 text-sm p-1 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Message & Links */}
        <p className="text-xs text-zinc-400 leading-relaxed font-normal tracking-wide">
          OtakuBazaar uses essential cryptographic session cookies to power our 15-minute checkout locks and 48-hour inspection escrow vault. Learn more in our{' '}
          <Link
            href="/privacy"
            className="text-zinc-200 hover:text-white underline font-semibold transition-colors"
          >
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link
            href="/terms"
            className="text-zinc-200 hover:text-white underline font-semibold transition-colors"
          >
            Terms of Service
          </Link>
          .
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleDecline}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 uppercase tracking-widest transition-colors cursor-pointer"
          >
            Essential Only
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="px-5 py-1.5 text-xs font-bold text-black bg-zinc-100 hover:bg-white uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Accept All</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default CookieBanner;
