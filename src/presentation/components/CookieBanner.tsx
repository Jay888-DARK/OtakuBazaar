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
      className="z-[999] fixed bottom-4 left-4 right-4 max-w-xl mx-auto p-4 sm:p-5 rounded-2xl bg-[#140F0B]/95 backdrop-blur-md border border-[#C9943E]/40 shadow-2xl transition-all duration-300"
      style={{
        boxShadow:
          '0 20px 40px -10px rgba(0, 0, 0, 0.85), 0 0 25px rgba(201, 148, 62, 0.2)',
      }}
    >
      <div className="flex flex-col gap-3">
        {/* Top Bar: Icon + Badge + Close 'X' */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">⛩️</span>
            <span className="text-xs font-mono font-bold tracking-wider text-amber-300 uppercase">
              Collector Escrow Privacy
            </span>
          </div>

          <button
            type="button"
            onClick={handleDecline}
            aria-label="Close banner without tracking"
            className="text-[#A89880] hover:text-[#F0E8DA] text-sm p-1 rounded transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Message & Links */}
        <p className="text-xs text-[#C4B7A3] leading-relaxed">
          OtakuBazaar uses essential cryptographic session cookies to power our 15-minute checkout locks and 48-hour inspection escrow vault. Learn more in our{' '}
          <Link
            href="/privacy"
            className="text-amber-300 hover:text-[#F85B1A] underline font-semibold transition-colors"
          >
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link
            href="/terms"
            className="text-amber-300 hover:text-[#F85B1A] underline font-semibold transition-colors"
          >
            Terms of Service
          </Link>
          .
        </p>

        {/* Action Buttons: Sleek Dark Wood Decline & Vermilion (#F85B1A) Accept */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleDecline}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#A89880] hover:text-white bg-[#1A1410] hover:bg-[#2A2118] border border-amber-900/40 rounded-xl transition-all cursor-pointer"
          >
            Essential Only
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="px-5 py-1.5 text-xs font-bold text-white rounded-xl transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer flex items-center gap-1.5"
            style={{ backgroundColor: '#F85B1A' }}
          >
            <span>Accept All</span>
            <span className="text-[10px]">⚔️</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default CookieBanner;
