'use client';

/**
 * @file src/presentation/components/market/OrderBook.tsx
 *
 * Feature 1: The Two-Sided Order Book (Bids vs. Asks).
 * Feature 5: Automated Liquidity Guarantees (Instant Liquidation action cell).
 *
 * Architectural Specifications:
 * - Two distinct vertical lists: "BIDS" (highest to lowest buyers) and "ASKS" (lowest to highest sellers).
 * - Strict 1px solid dark gray border (#27272a).
 * - Text aligned sharply with no internal padding on grid lines.
 * - Instant brutalist state inversions (0ms) when a user clicks a price level to place a limit order.
 * - Automated Liquidity Guarantee: "INSTANT LIQUIDATION" action cell for S-Rank vaulted items with 1px border,
 *   flat 0px border-radius, zero drop shadows or glassmorphism.
 */

import React, { useState } from 'react';
import Link from 'next/link';

export interface OrderLevel {
  price: number;
  size: number;
  total: number;
  traderRef: string;
}

interface OrderBookProps {
  basePrice?: number;
  lotId?: string;
  isSRank?: boolean;
}

export function OrderBook({
  basePrice = 89000,
  lotId = 'LOT-0482',
  isSRank = true,
}: OrderBookProps): React.JSX.Element {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'BOOK' | 'LIMIT_ENTRY'>('BOOK');
  const [limitBidInput, setLimitBidInput] = useState<string>(String(Math.round(basePrice * 0.98)));
  const [orderPlacedNotice, setOrderPlacedNotice] = useState<string | null>(null);

  // Instant Liquidation floor (guaranteed market maker pool at 92% valuation)
  const instantLiquidationPrice = Math.round(basePrice * 0.92);

  // Generate realistic Bids (Highest to lowest)
  const bids: OrderLevel[] = [
    { price: Math.round(basePrice * 0.98), size: 1, total: 1, traderRef: 'OKB-VAULT-MM' },
    { price: Math.round(basePrice * 0.96), size: 2, total: 3, traderRef: 'COLLECTOR-77' },
    { price: Math.round(basePrice * 0.94), size: 1, total: 4, traderRef: 'TOKYO-DESK-01' },
    { price: Math.round(basePrice * 0.92), size: 3, total: 7, traderRef: 'RESERVE-POOL' },
    { price: Math.round(basePrice * 0.90), size: 2, total: 9, traderRef: 'HEDGE-ARCHIVE' },
  ];

  // Generate realistic Asks (Lowest to highest)
  const asks: OrderLevel[] = [
    { price: basePrice, size: 1, total: 1, traderRef: 'CURRENT-ASK' },
    { price: Math.round(basePrice * 1.03), size: 1, total: 2, traderRef: 'PRIVATE-094' },
    { price: Math.round(basePrice * 1.07), size: 2, total: 4, traderRef: 'SINGAPORE-VLT' },
    { price: Math.round(basePrice * 1.12), size: 1, total: 5, traderRef: 'MUSEUM-HOLD' },
    { price: Math.round(basePrice * 1.18), size: 3, total: 8, traderRef: 'KYOTO-LOTS' },
  ];

  const handleSelectPrice = (price: number) => {
    setSelectedLevel(price);
    setLimitBidInput(String(price));
    setOrderPlacedNotice(`SELECTED LIMIT AT ₹${price.toLocaleString('en-IN')}`);
    setTimeout(() => setOrderPlacedNotice(null), 2500);
  };

  const handlePlaceLimit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderPlacedNotice(`LIMIT ORDER SUBMITTED: ₹${Number(limitBidInput).toLocaleString('en-IN')} TO LEDGER`);
    setTimeout(() => setOrderPlacedNotice(null), 3000);
  };

  return (
    <div
      className="w-full border-b border-[#27272a] bg-[#0c0c0e] select-none text-xs uppercase"
      style={{ fontFamily: "'Satoshi', 'Cabinet Grotesk', sans-serif" }}
    >
      {/* Order Book Header Cell */}
      <div className="p-4 sm:p-5 border-b border-[#27272a] bg-[#0a0a0c] flex items-center justify-between">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-1 font-sans">
            MARKET MECHANICS // TWO-SIDED ORDER BOOK
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold uppercase tracking-wider text-zinc-100 font-sans">
              SPREAD: ₹{(asks[0]!.price - bids[0]!.price).toLocaleString('en-IN')} (2.0%)
            </span>
            <span className="text-[9px] text-zinc-400 border border-zinc-800 bg-zinc-900 px-2 py-0.5">
              DEPTH: 17 LOTS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('BOOK')}
            className={`px-2.5 py-1 text-[9px] uppercase tracking-wider border rounded-none brutalist-btn cursor-pointer ${
              activeTab === 'BOOK'
                ? 'bg-[#f4f4f4] text-black border-[#f4f4f4] font-bold'
                : 'bg-transparent text-zinc-400 border-zinc-800 font-medium'
            }`}
          >
            [ ORDER BOOK ]
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LIMIT_ENTRY')}
            className={`px-2.5 py-1 text-[9px] uppercase tracking-wider border rounded-none brutalist-btn cursor-pointer ${
              activeTab === 'LIMIT_ENTRY'
                ? 'bg-[#f4f4f4] text-black border-[#f4f4f4] font-bold'
                : 'bg-transparent text-zinc-400 border-zinc-800 font-medium'
            }`}
          >
            [ LIMIT ENTRY ]
          </button>
        </div>
      </div>

      {orderPlacedNotice && (
        <div className="p-2.5 bg-zinc-900 border-b border-zinc-700 text-center text-[10px] tracking-widest text-[#f4f4f4] font-bold">
          {orderPlacedNotice}
        </div>
      )}

      {activeTab === 'BOOK' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#27272a]">
          {/* BIDS COLUMN (Highest to Lowest) */}
          <div className="flex flex-col">
            <div className="px-3 py-2 bg-[#09090b] border-b border-[#27272a] flex justify-between text-[9px] tracking-wider text-zinc-500 font-bold">
              <span>BIDS // BUY ORDERS</span>
              <span>SIZE • TOTAL</span>
            </div>
            <div className="divide-y divide-zinc-900">
              {bids.map((b) => {
                const isSelected = selectedLevel === b.price;
                return (
                  <button
                    key={`bid-${b.price}`}
                    type="button"
                    onClick={() => handleSelectPrice(b.price)}
                    className={`w-full px-3 py-2 flex items-center justify-between text-left text-[11px] rounded-none brutalist-btn cursor-pointer transition-none ${
                      isSelected
                        ? 'bg-[#f4f4f4] text-black font-bold'
                        : 'bg-transparent text-zinc-300 hover:text-white'
                    }`}
                  >
                    <span className="font-bold">₹{b.price.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-zinc-500">
                      {b.size} LOT ({b.total})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ASKS COLUMN (Lowest to Highest) */}
          <div className="flex flex-col">
            <div className="px-3 py-2 bg-[#09090b] border-b border-[#27272a] flex justify-between text-[9px] tracking-wider text-zinc-500 font-bold">
              <span>ASKS // SELL OFFERS</span>
              <span>SIZE • TOTAL</span>
            </div>
            <div className="divide-y divide-zinc-900">
              {asks.map((a) => {
                const isSelected = selectedLevel === a.price;
                return (
                  <button
                    key={`ask-${a.price}`}
                    type="button"
                    onClick={() => handleSelectPrice(a.price)}
                    className={`w-full px-3 py-2 flex items-center justify-between text-left text-[11px] rounded-none brutalist-btn cursor-pointer transition-none ${
                      isSelected
                        ? 'bg-[#f4f4f4] text-black font-bold'
                        : 'bg-transparent text-zinc-300 hover:text-white'
                    }`}
                  >
                    <span className="font-bold">₹{a.price.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-zinc-500">
                      {a.size} LOT ({a.total})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Limit Entry Input Stage */
        <form onSubmit={handlePlaceLimit} className="p-4 sm:p-5 space-y-4 bg-[#09090b]">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-zinc-500 block font-sans">
              ENTER LIMIT BID VALUATION (INR ₹)
            </label>
            <input
              type="number"
              value={limitBidInput}
              onChange={(e) => setLimitBidInput(e.target.value)}
              className="w-full bg-[#0c0c0e] border border-zinc-800 p-2.5 text-xs text-white uppercase rounded-none outline-none focus:border-zinc-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[#f4f4f4] text-black text-xs font-bold uppercase tracking-[0.2em] border border-[#f4f4f4] rounded-none brutalist-btn cursor-pointer"
          >
            COMMIT LIMIT ORDER TO ESCROW LEDGER →
          </button>
        </form>
      )}

      {/* Feature 5: Automated Liquidity Guarantees (Instant Liquidation Cell) */}
      {isSRank && (
        <div className="p-4 sm:p-5 border-t border-[#27272a] bg-[#09090b] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-zinc-300 inline-block" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-300 font-bold font-sans">
                AUTOMATED LIQUIDITY GUARANTEE // S-RANK
              </span>
            </div>
            <span className="text-[9px] text-zinc-500">
              ESCROW POOL: ₹14.8M ACTIVE
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 normal-case font-sans leading-relaxed">
            As an authenticated S-Rank archival specimen, this lot carries an automated institutional market-maker backstop. Vault holders may liquidate physical custody instantaneously into Indian Rupee settlement at 92% of canonical mark.
          </p>

          <Link
            href={`/checkout?productId=${lotId}&amount=${instantLiquidationPrice}&liquidation=instant`}
            className="block no-underline"
          >
            <button
              type="button"
              className="w-full py-3.5 px-4 bg-zinc-900 hover:bg-[#f4f4f4] text-zinc-200 hover:text-black border border-zinc-700 hover:border-[#f4f4f4] text-xs font-bold uppercase tracking-[0.22em] transition-none rounded-none brutalist-btn cursor-pointer flex items-center justify-between"
            >
              <span>INSTANT LIQUIDATION (T+0 SETTLEMENT)</span>
              <span>₹{instantLiquidationPrice.toLocaleString('en-IN')} →</span>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default OrderBook;
