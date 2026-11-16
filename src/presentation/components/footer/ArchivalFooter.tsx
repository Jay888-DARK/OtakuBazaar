'use client';

/**
 * @file src/presentation/components/footer/ArchivalFooter.tsx
 *
 * Luxury Archival Editorial Footer for OtakuBazaar.
 * Strictly adheres to the dark vault design tokens:
 * - Surface: #080808 canvas with 1px solid #1F1F1F border and #161616 inner dividers.
 * - Typography: High-contrast Playfair editorial serif for titles, Plus Jakarta Sans for body copy.
 * - Platform Custody Specs: 0% BOOTLEG TOLERANCE • 48H ESCROW PROTECTED • PAN-INDIA INSURED TRANSIT.
 * - Explicit direct links to /, /sell, /vault, /login, /terms-of-service, /privacy-policy, /escrow-policy.
 * - Zero emoji, zero icons, zero animated arrows.
 */

import React from 'react';
import Link from 'next/link';

export function ArchivalFooter(): React.JSX.Element {
  const primaryVaultLinks = [
    { label: 'CATALOG & FIGURES', href: '/#stage-2' },
    { label: 'SELL YOUR COLLECTION', href: '/sell' },
    { label: 'COLLECTOR VAULT', href: '/vault' },
    { label: 'ABOUT OTAKUBAZAAR', href: '/about' },
    { label: 'FREQUENTLY ASKED QUESTIONS', href: '/faq' },
    { label: 'HOW ESCROW WORKS', href: '/#escrow-vault' },
  ];

  const complianceLinks = [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: '48-Hour Escrow & Returns', href: '/shipping-returns' },
    { label: 'Prohibited Items Policy', href: '/prohibited-items' },
    { label: 'Contact & Grievance Desk', href: '/contact' },
  ];

  return (
    <footer className="w-full border-t border-[#1F1F1F] bg-[#080808] text-[#8E8E8E] select-none font-sans">
      {/* Top Protocol Spec Strip */}
      <div className="border-b border-[#1F1F1F] bg-[#0A0A0A] px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] tracking-[0.18em] uppercase font-semibold">
          <span className="text-[#CCCCCC]">
            ZERO BOOTLEG TOLERANCE • 48H UNBOXING ESCROW • PAN-INDIA TRACKED SHIPPING
          </span>
          <span className="text-[#10B981] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#10B981] inline-block" />
            <span>SECURE ESCROW PAYMENTS</span>
          </span>
        </div>
      </div>

      {/* Main Structural Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Column 1: Brand Wordmark & Indian Escrow Custody Specs */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <Link href="/" className="inline-block no-underline">
              <span
                style={{
                  fontFamily: 'var(--font-brand), sans-serif',
                  fontSize: '1.25rem',
                  letterSpacing: '0.16em',
                  color: '#F2EFE9',
                  textTransform: 'uppercase',
                }}
                className="font-brand block leading-none hover:text-white transition-colors"
              >
                OTAKUBAZAAR
              </span>
            </Link>

            <p className="text-[12px] text-[#8E8E8E] leading-relaxed max-w-md">
              India&apos;s dedicated C2C marketplace for authentic anime figures, statues, and collectibles. Buyer payments remain locked in escrow until the 48-hour unboxing inspection window clears.
            </p>

            {/* Indian Escrow Protection Badge */}
            <div className="p-3.5 bg-[#0C0C0C] border border-[#1F1F1F] space-y-1.5 max-w-md">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#10B981]" />
                <span className="text-[10px] tracking-[0.14em] text-[#10B981] uppercase font-semibold">
                  48-HOUR ESCROW BUYER PROTECTION
                </span>
              </div>
              <p className="text-[11px] text-[#777777] leading-relaxed">
                Payments are held securely in escrow during transit. The seller receives payout only after your 48-hour unboxing inspection period completes without a dispute.
              </p>
            </div>
          </div>

          {/* Column 2: Primary Navigation Index */}
          <div className="lg:col-span-3 flex flex-col">
            <span className="text-[10px] tracking-[0.2em] text-[#777777] uppercase font-semibold mb-3">
              EXPLORE MARKETPLACE
            </span>
            <nav className="flex flex-col space-y-2.5" aria-label="Primary Vault Index">
              {primaryVaultLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-serif text-[14px] tracking-[0.06em] text-[#F2EFE9] hover:text-white transition-colors uppercase no-underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Authenticity Guarantee & Mandatory Legal Routes */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <span className="text-[10px] tracking-[0.2em] text-[#777777] uppercase font-semibold">
              TRUST, SAFETY &amp; LEGAL
            </span>

            {/* Direct Links to Legal Pages */}
            <div className="flex flex-col space-y-2 border-b border-[#161616] pb-4">
              {complianceLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[12px] text-[#F2EFE9] hover:text-white transition-colors no-underline"
                >
                  [ {item.label.toUpperCase()} ]
                </Link>
              ))}
            </div>

            {/* Authenticity Guarantee Protocol Box */}
            <div className="space-y-1">
              <span className="text-[10px] tracking-[0.14em] text-[#777777] uppercase font-medium block">
                AUTHENTICITY GUARANTEE &amp; REFUND
              </span>
              <p className="text-[11px] text-[#8E8E8E] leading-relaxed">
                Record an uncut unboxing video from package seal to figure inspection. If an item is counterfeit, broken, or non-conforming, dispute within 48 hours for a 100% refund.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Telemetry */}
      <div className="border-t border-[#1F1F1F] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[11px] text-[#777777] tracking-[0.04em]">
            © OtakuBazaar 2026. All rights reserved. India’s C2C Anime Collectibles Marketplace.
          </span>

          <div className="flex items-center space-x-4 text-[10px] tracking-[0.15em] text-[#777777] uppercase">
            <span>INR (₹)</span>
            <span>·</span>
            <span>DIRECT C2C SHIPPING</span>
            <span className="text-[#1F1F1F]">|</span>
            <span>PAN-INDIA DISPATCH</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default ArchivalFooter;
