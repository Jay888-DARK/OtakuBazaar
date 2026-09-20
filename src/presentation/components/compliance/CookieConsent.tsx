'use client';

/**
 * @file src/presentation/components/compliance/CookieConsent.tsx
 *
 * Strict Privacy & Tracking Consent Banner for OtakuBazaar.
 *
 * Compliance Architecture:
 * - Positioned at z-[999] fixed bottom banner for prominent visibility.
 * - Requires explicit user action ("Accept All" or "Decline / Essential Only").
 * - Zero pre-checked boxes to satisfy e-Privacy and DPDP requirements.
 * - Persists choice in localStorage under 'otaku_cookie_consent'.
 * - WCAG AAA text contrast, descriptive aria-labels, and visible focus rings.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export const COOKIE_CONSENT_KEY = 'otaku_cookie_consent';

export function CookieConsent(): React.JSX.Element | null {
  const [hasCheckedConsent, setHasCheckedConsent] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedPreference = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!storedPreference) {
        setIsVisible(true);
      }
    } catch {
      // In case localStorage is blocked by user agent
      setIsVisible(true);
    } finally {
      setHasCheckedConsent(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        // Dispatch custom event for analytical listeners if present
        window.dispatchEvent(
          new CustomEvent('otaku_cookie_consent_change', {
            detail: { consent: 'accepted' },
          })
        );
      }
    } catch {
      // Fail safely if storage access is restricted
    }
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
        window.dispatchEvent(
          new CustomEvent('otaku_cookie_consent_change', {
            detail: { consent: 'declined' },
          })
        );
      }
    } catch {
      // Fail safely if storage access is restricted
    }
    setIsVisible(false);
  };

  if (!hasCheckedConsent || !isVisible) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-label="Cookie & Privacy Consent"
      aria-describedby="cookie-consent-desc"
      className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-[999] p-4 sm:p-5 rounded-2xl bg-[#140F0B]/95 backdrop-blur-md border border-[#C9943E]/50 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
      style={{
        boxShadow:
          '0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 25px rgba(201, 148, 62, 0.25)',
      }}
    >
      <div className="flex flex-col gap-3">
        {/* Top Header: Badge, Title & Close Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden="true">⛩️</span>
            <span className="text-xs font-mono font-bold tracking-wider text-amber-300 uppercase">
              Collector Privacy &amp; Escrow Security
            </span>
          </div>

          <button
            type="button"
            onClick={handleDecline}
            aria-label="Close cookie consent banner and decline analytical tracking"
            className="text-stone-300 hover:text-white p-1 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F85B1A] focus-visible:outline-none"
          >
            <span aria-hidden="true" className="text-sm font-bold">✕</span>
          </button>
        </div>

        {/* Descriptive Statement with Links */}
        <p
          id="cookie-consent-desc"
          className="text-xs text-stone-200 leading-relaxed m-0"
        >
          OtakuBazaar uses essential cryptographic session cookies to power our 15-minute checkout locks and 48-hour inspection escrow vaults. We never sell your personal data. You can choose whether to enable non-essential analytical cookies. Review our{' '}
          <Link
            href="/legal/privacy"
            aria-label="Read our full Privacy Policy"
            className="text-amber-300 hover:text-[#F85B1A] underline font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#F85B1A] focus-visible:outline-none rounded px-0.5"
          >
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link
            href="/legal/terms"
            aria-label="Read our Terms of Service"
            className="text-amber-300 hover:text-[#F85B1A] underline font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#F85B1A] focus-visible:outline-none rounded px-0.5"
          >
            Terms of Service
          </Link>
          .
        </p>

        {/* Action Controls: Zero Pre-Checked Boxes, Explicit User Choices */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleDecline}
            aria-label="Decline non-essential tracking cookies and keep essential cookies only"
            className="px-3.5 py-1.5 text-xs font-bold text-stone-200 hover:text-white bg-[#1A1410] hover:bg-[#2A2118] border border-amber-900/60 rounded-xl transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F85B1A] focus-visible:outline-none"
          >
            Decline / Essential Only
          </button>

          <button
            type="button"
            onClick={handleAccept}
            aria-label="Accept all cookies including analytical cookies"
            className="px-4 py-1.5 text-xs font-black text-white rounded-xl transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#F85B1A] focus-visible:outline-none"
            style={{ backgroundColor: '#F85B1A' }}
          >
            <span>Accept All</span>
            <span aria-hidden="true" className="text-[10px]">⚔️</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default CookieConsent;
