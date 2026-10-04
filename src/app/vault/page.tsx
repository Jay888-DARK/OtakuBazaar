'use client';

/**
 * @file src/app/vault/page.tsx
 *
 * Feature 2: Vault Custody & Frictionless Trading UI.
 * User portfolio dashboard titled "VAULT CUSTODY".
 *
 * Requirements:
 * - Displays owned digital ledger assets using stark, squared thumbnail images.
 * - Includes a brutalist action button labeled "REDEEM PHYSICAL CUSTODY" for each asset.
 * - STRICT CONSTRAINT: Zero Emojis, zero checkmarks, zero animated arrows, zero sparkle icons.
 *   Rely entirely on typography (e.g., "[ ASSET SECURED ]").
 */

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface VaultAsset {
  id: string;
  lotRef: string;
  title: string;
  series: string;
  condition: string;
  currentValuation: number;
  acquiredDate: string;
  custodyBay: string;
  tamperSeal: string;
  imageUrl: string;
  isRedeemed?: boolean;
}

const INITIAL_VAULT_ASSETS: VaultAsset[] = [
  {
    id: 'vault-asset-01',
    lotRef: 'LOT-0482',
    title: 'Guts Berserker Armor Unleashed 1/4 Scale',
    series: 'Berserk • Kentaro Miura Memorial Edition',
    condition: 'S-RANK FACTORY SEALED',
    currentValuation: 89000,
    acquiredDate: '2026-09-12',
    custodyBay: 'MUMBAI STAGING TERMINAL BAY 04',
    tamperSeal: 'OKB-2026-9941-X',
    imageUrl: '/showcase/guts_berserker_statue.jpg',
    isRedeemed: false,
  },
  {
    id: 'vault-asset-02',
    lotRef: 'LOT-0484',
    title: 'Saber Altria Pendragon 1/7 Deluxe',
    series: 'Fate/Stay Night • Type-Moon Archival',
    condition: 'S-RANK FACTORY SEALED',
    currentValuation: 24500,
    acquiredDate: '2026-08-29',
    custodyBay: 'TOKYO CENTRAL CUSTODY VAULT 02',
    tamperSeal: 'OKB-2026-1184-B',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=85',
    isRedeemed: false,
  },
  {
    id: 'vault-asset-03',
    lotRef: 'LOT-0488',
    title: 'Berserk Deluxe Edition Vol 1-14 Complete Hardcover Set',
    series: 'Dark Horse Archival Hardcover Pressing',
    condition: 'S-RANK MINT IN BOX',
    currentValuation: 42000,
    acquiredDate: '2026-07-15',
    custodyBay: 'MUMBAI DEEP ARCHIVE STORAGE B-12',
    tamperSeal: 'OKB-2026-0889-M',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=85',
    isRedeemed: false,
  },
];

export default function VaultCustodyDashboardPage(): React.JSX.Element {
  const [assets, setAssets] = useState<VaultAsset[]>(INITIAL_VAULT_ASSETS);
  const [redemptionNotice, setRedemptionNotice] = useState<string | null>(null);

  const totalVaultValue = assets.reduce((acc, curr) => acc + curr.currentValuation, 0);

  const handleRedeem = (assetId: string, lotRef: string) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, isRedeemed: true } : a))
    );
    setRedemptionNotice(`PHYSICAL DISPATCH INITIATED FOR ${lotRef} // COLD-CHAIN TELEMETRY ENCODED`);
    setTimeout(() => setRedemptionNotice(null), 4000);
  };

  return (
    <div
      className="min-h-screen bg-[#09090b] text-[#f4f4f5] py-10 px-4 sm:px-6 lg:px-8 select-none"
      style={{ fontFamily: "'Satoshi', 'Cabinet Grotesk', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumbs & Portfolio System ID */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#27272a] pb-3 gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-zinc-300 transition-none no-underline text-zinc-500">
              Vault Home
            </Link>
            <span>/</span>
            <span className="text-zinc-300 font-bold">Vault Custody Portfolio</span>
          </div>

          <div>PORTFOLIO CUSTODY LEDGER // ACCOUNT #TY-7819</div>
        </div>

        {/* Masthead: Vault Custody Summary */}
        <div className="border border-[#27272a] bg-[#0c0c0e] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-bold border border-zinc-700 bg-zinc-900 px-2 py-0.5 font-sans">
              INSTITUTIONAL VAULT LEDGER
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#f4f4f5] font-sans">
              VAULT CUSTODY
            </h1>
            <p className="text-xs text-zinc-400 normal-case leading-relaxed font-sans max-w-xl">
              Real-time ledger of authenticated physical collectibles held in double-entry escrow containment across Tokyo and Mumbai vault terminals.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t lg:border-t-0 border-[#27272a] pt-4 lg:pt-0">
            <div className="p-3 border border-zinc-800 bg-[#09090b]">
              <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-sans">
                TOTAL SECURED VALUE
              </span>
              <span className="text-base font-extrabold uppercase text-zinc-100">
                ₹{totalVaultValue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3 border border-zinc-800 bg-[#09090b]">
              <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-sans">
                VAULTED SPECIMENS
              </span>
              <span className="text-base font-extrabold uppercase text-zinc-100">
                {assets.length} LOTS SECURED
              </span>
            </div>
            <div className="p-3 border border-zinc-800 bg-[#09090b] col-span-2 sm:col-span-1">
              <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-sans">
                INSURANCE COVERAGE
              </span>
              <span className="text-base font-extrabold uppercase text-emerald-400">
                100% UNDERWRITTEN
              </span>
            </div>
          </div>
        </div>

        {redemptionNotice && (
          <div className="p-3 bg-zinc-900 border border-zinc-700 text-center text-xs tracking-widest text-[#f4f4f4] font-bold">
            {redemptionNotice}
          </div>
        )}

        {/* Asset Inventory Table: Strict 1px Grid */}
        <div className="border border-[#27272a] bg-[#0c0c0e]">
          <div className="p-4 sm:p-6 border-b border-[#27272a] bg-[#0a0a0c] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-bold font-sans">
              ACTIVE CUSTODIAL POSITIONS
            </span>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500">
              SETTLEMENT: FRICTIONLESS SECONDARY TRADING ENABLED
            </span>
          </div>

          <div className="divide-y divide-[#27272a] bg-[#09090b]">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                {/* 1. Stark Squared Thumbnail */}
                <div className="lg:col-span-2 relative w-24 h-24 sm:w-28 sm:h-28 aspect-square bg-[#0c0c0e] border border-[#27272a] overflow-hidden shrink-0 flex items-center justify-center">
                  <Image
                    src={asset.imageUrl}
                    alt={asset.title}
                    fill
                    sizes="112px"
                    className="object-contain p-2 contrast-115 grayscale hover:grayscale-0 transition-all duration-300"
                    unoptimized={asset.imageUrl.startsWith('http')}
                  />
                </div>

                {/* 2. Asset Identification & Provenance */}
                <div className="lg:col-span-6 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                      {asset.lotRef}
                    </span>
                    {/* Typography-only ownership badge (Strict Constraint: No Emojis, no checkmarks, no sparkles) */}
                    <span className="text-[9px] uppercase tracking-wider font-bold border border-zinc-700 bg-zinc-900 text-zinc-200 px-2 py-0.5">
                      {asset.isRedeemed ? '[ IN TRANSIT // DISPATCHED ]' : '[ ASSET SECURED ]'}
                    </span>
                    <span className="text-[9px] text-zinc-500">[{asset.condition}]</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-100 font-sans">
                    {asset.title}
                  </h3>

                  <div className="text-[10px] text-zinc-500 space-y-0.5">
                    <div>LOCATION: {asset.custodyBay}</div>
                    <div>TAMPER SEAL: {asset.tamperSeal} • ACQUIRED: {asset.acquiredDate}</div>
                  </div>
                </div>

                {/* 3. Valuation & Trading Actions */}
                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col justify-between items-start lg:items-end gap-3 border-t lg:border-t-0 border-[#27272a] pt-4 lg:pt-0">
                  <div className="lg:text-right">
                    <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-sans">
                      MARK-TO-MARKET VALUATION
                    </span>
                    <span className="text-lg font-bold uppercase text-zinc-100">
                      ₹{asset.currentValuation.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Actions: Redeem Physical Custody (Brutalist button) & Instant Trade */}
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => handleRedeem(asset.id, asset.lotRef)}
                      disabled={asset.isRedeemed}
                      className="px-4 py-2.5 bg-[#f4f4f4] text-black text-[10px] font-bold uppercase tracking-[0.2em] border border-[#f4f4f4] rounded-none brutalist-btn cursor-pointer whitespace-nowrap disabled:opacity-40"
                    >
                      {asset.isRedeemed ? 'DISPATCH INITIATED' : 'REDEEM PHYSICAL CUSTODY'}
                    </button>

                    <Link
                      href={`/products/${asset.lotRef.toLowerCase()}`}
                      className="px-3 py-2.5 bg-transparent text-zinc-300 text-[10px] font-semibold uppercase tracking-[0.18em] border border-zinc-800 rounded-none brutalist-btn no-underline text-center whitespace-nowrap"
                    >
                      TRADE ASSET
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Footer Navigation Links */}
        <div className="pt-6 border-t border-[#27272a] flex flex-col sm:flex-row items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 gap-4">
          <div>
            OTAKUBAZAAR CUSTODY PROTOCOL • 100% ESCROW PROTECTED
          </div>
          <div className="flex items-center gap-4">
            <Link href="/verify" className="text-zinc-400 hover:text-white no-underline brutalist-btn p-1">
              [ HARDWARE NFC VERIFY ]
            </Link>
            <Link href="/terms" className="text-zinc-500 hover:text-zinc-300 no-underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-zinc-500 hover:text-zinc-300 no-underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
