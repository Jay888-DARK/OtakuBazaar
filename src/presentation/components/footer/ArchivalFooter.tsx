'use client';

/**
 * @file src/presentation/components/footer/ArchivalFooter.tsx
 *
 * Swiss Horological Architectural Index Footer inspired by Richard Mille (richardmille.com).
 * Features a 3-column architectural index layout:
 * - Top breadcrumb divider: OTAKUBAZAAR · INDEX
 * - Column 1 (Left): Brand Wordmark (Michroma)
 * - Column 2 (Center): Primary Vault Index (Chakra Petch, uppercase)
 * - Column 3 (Right): Secondary Service & Legal Links (Titillium Web, sentence-case)
 * - Bottom Bar: Copyright on left and currency/language codes on right
 */

import React from 'react';
import Link from 'next/link';

export function ArchivalFooter(): React.JSX.Element {
  const primaryVaultLinks = [
    { label: 'THE VAULT', href: '/vault' },
    { label: 'ESCROW PROTOCOL', href: '#escrow-vault' },
    { label: 'ARCHIVAL LOTS', href: '#catalog' },
    { label: 'AUTHENTICATION STANDARDS', href: '/terms-of-service' },
    { label: 'CONSIGNMENT DISPATCH', href: '/sell' },
    { label: 'PRIVATE ACQUISITIONS', href: '/vault-ops' },
  ];

  const secondaryCol1 = [
    { label: 'Historical Grail Index', href: '#catalog' },
    { label: 'Pre-Owned Custody', href: '/vault' },
    { label: 'Grading Verification', href: '/verify' },
    { label: 'Book Vault Inspection', href: '/terms-of-service' },
  ];

  const secondaryCol2 = [
    { label: 'Contact', href: '/terms-of-service' },
    { label: 'Terms of Service', href: '/terms-of-service' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Escrow Legals', href: '/legal/refunds' },
  ];

  return (
    <footer className="w-full border-t border-[#262626] bg-[#0a0a0a] text-zinc-400 select-none">
      {/* Top Breadcrumb Divider Line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <span
          style={{
            fontFamily: 'var(--font-swiss), sans-serif',
            fontSize: '0.72rem',
            letterSpacing: '0.16em',
            color: '#737373',
            textTransform: 'uppercase',
          }}
          className="font-swiss block mb-4"
        >
          OTAKUBAZAAR · INDEX
        </span>
        <div className="w-full h-px bg-[#262626]" />
      </div>

      {/* 3-Column Luxury Architectural Index Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Column 1 (Left): Brand Wordmark */}
          <div className="lg:col-span-4 flex flex-col justify-start">
            <Link href="/" className="inline-block no-underline">
              <span
                style={{
                  fontFamily: 'var(--font-brand), sans-serif',
                  fontSize: '1.1rem',
                  letterSpacing: '0.16em',
                  color: '#ffffff',
                  textTransform: 'uppercase',
                }}
                className="font-brand block leading-none hover:text-zinc-300 transition-none"
              >
                OTAKUBAZAAR
              </span>
            </Link>
          </div>

          {/* Column 2 (Center): Primary Vault Index */}
          <div className="lg:col-span-4 flex flex-col">
            <nav className="flex flex-col space-y-1" aria-label="Primary Vault Index">
              {primaryVaultLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    fontFamily: 'var(--font-mechanical), sans-serif',
                    fontWeight: 700,
                    fontSize: '1.15rem',
                    letterSpacing: '0.06em',
                    lineHeight: '2.1',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                  }}
                  className="font-mechanical block hover:text-zinc-400 transition-none no-underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3 (Right): Secondary Service & Legal Links */}
          <div className="lg:col-span-4 flex flex-col divide-y divide-[#262626]">
            {/* Sub-columns container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
              <div className="flex flex-col space-y-3">
                {secondaryCol1.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      fontFamily: 'var(--font-swiss), sans-serif',
                      fontSize: '0.9rem',
                      fontWeight: 400,
                      color: '#e5e5e5',
                    }}
                    className="font-swiss hover:text-white transition-none no-underline"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col space-y-3">
                {secondaryCol2.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      fontFamily: 'var(--font-swiss), sans-serif',
                      fontSize: '0.9rem',
                      fontWeight: 400,
                      color: '#e5e5e5',
                    }}
                    className="font-swiss hover:text-white transition-none no-underline"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sub-column lower service micro-notes */}
            <div className="pt-6">
              <p
                style={{
                  fontFamily: 'var(--font-swiss), sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  letterSpacing: '0.04em',
                  color: '#8a8a8a',
                  lineHeight: 1.6,
                }}
                className="font-swiss"
              >
                Curated Japanese scale figures and authenticated manga archives. Climate-controlled Tokyo vault custody backed by 48-hour escrow protection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: © OtakuBazaar 2026 on the left and currency/language codes on the right */}
      <div className="border-t border-[#262626] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            style={{
              fontFamily: 'var(--font-swiss), sans-serif',
              fontSize: '0.75rem',
              fontWeight: 400,
              letterSpacing: '0.08em',
              color: '#8a8a8a',
            }}
            className="font-swiss"
          >
            © OtakuBazaar 2026
          </span>

          <div
            style={{
              fontFamily: 'var(--font-swiss), sans-serif',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: '#8a8a8a',
            }}
            className="flex items-center space-x-4 font-swiss uppercase"
          >
            <span>INR</span>
            <span>JPY</span>
            <span>USD</span>
            <span className="text-[#262626]">|</span>
            <span>EN</span>
            <span>JA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default ArchivalFooter;
