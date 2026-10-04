'use client';

/**
 * @file src/presentation/components/market/HistoricalDataTerminal.tsx
 *
 * Feature 4: The Data Terminal (Historical Valuation Index).
 * Real-time market data terminal directly integrated into the PDP context column.
 *
 * Requirements:
 * - Display 52-week highs/lows, average appreciation rates, and daily market volume using raw data tables.
 * - Format data like a high-end financial terminal using editorial sans-serif font.
 * - STRICT CONSTRAINT: Do not organize data into Bento Grids. Keep structurally stacked with 1px borders.
 */

import React from 'react';

interface HistoricalDataTerminalProps {
  basePrice?: number;
  lotRef?: string;
  category?: string;
}

export function HistoricalDataTerminal({
  basePrice = 89000,
  lotRef = 'LOT-0482',
  category = 'Scale Figure',
}: HistoricalDataTerminalProps): React.JSX.Element {
  const high52 = Math.round(basePrice * 1.18);
  const low52 = Math.round(basePrice * 0.84);
  const appreciation30d = '+4.8%';
  const appreciation1y = '+22.4%';
  const dailyVolume = Math.round(basePrice * 3.4);

  return (
    <div className="w-full border-b border-[#27272a] bg-[#0c0c0e] select-none text-xs">
      {/* Terminal Masthead */}
      <div className="p-4 sm:p-5 border-b border-[#27272a] bg-[#0a0a0c] flex items-center justify-between">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-1">
            ANALYTICS ENGINE // TERMINAL FEED
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">
            Historical Valuation &amp; Liquidity Index
          </h3>
        </div>

        <div className="flex items-center gap-2 text-[9px] uppercase tracking-wider text-emerald-400">
          <span className="w-1.5 h-1.5 bg-emerald-400 inline-block" />
          <span>INDEX ACTIVE (MUMBAI/TYO)</span>
        </div>
      </div>

      {/* Raw Stacked Data Tables (Strict 1px Borders, NO Bento Grids) */}
      <div className="divide-y divide-[#27272a] bg-[#09090b]">
        {/* Metric Row 1: 52-Week Range */}
        <div className="p-4 flex items-center justify-between text-[11px]">
          <span className="text-zinc-500 uppercase tracking-wider">52-WEEK HIGH / LOW</span>
          <div className="text-right font-bold text-zinc-200">
            <span>₹{high52.toLocaleString('en-IN')}</span>
            <span className="text-zinc-600 mx-2">/</span>
            <span className="text-zinc-400">₹{low52.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Metric Row 2: Appreciation Curves */}
        <div className="p-4 flex items-center justify-between text-[11px]">
          <span className="text-zinc-500 uppercase tracking-wider">ANNUALIZED APPRECIATION</span>
          <div className="flex items-center gap-3 font-bold">
            <span className="text-emerald-400">{appreciation1y} (1Y)</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400">{appreciation30d} (30D)</span>
          </div>
        </div>

        {/* Metric Row 3: Daily Trading Volume */}
        <div className="p-4 flex items-center justify-between text-[11px]">
          <span className="text-zinc-500 uppercase tracking-wider">24H SECONDARY LIQUIDITY</span>
          <span className="font-bold text-zinc-200">
            ₹{dailyVolume.toLocaleString('en-IN')} (3 TRANSACTIONS)
          </span>
        </div>

        {/* Metric Row 4: Volatility & Sharpe Index */}
        <div className="p-4 flex items-center justify-between text-[11px]">
          <span className="text-zinc-500 uppercase tracking-wider">BETA / VOLATILITY COEFFICIENT</span>
          <span className="font-bold text-zinc-300">
            0.42 (LOW CORRELATION ASSET)
          </span>
        </div>

        {/* Metric Row 5: Archival Vault Index Comparison */}
        <div className="p-4 flex items-center justify-between text-[11px]">
          <span className="text-zinc-500 uppercase tracking-wider">OTAKU-100 BENCHMARK</span>
          <span className="font-bold text-zinc-300">
            OUTPERFORMING BY +8.6%
          </span>
        </div>
      </div>
    </div>
  );
}

export default HistoricalDataTerminal;
