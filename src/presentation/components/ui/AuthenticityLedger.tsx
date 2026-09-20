'use client';

/**
 * @file src/presentation/components/ui/AuthenticityLedger.tsx
 *
 * Digital Certificate of Authenticity (COA) Component.
 * Displays cryptographic escrow trust and immutable inspection provenance
 * in the Classic Black & Grey monochrome palette.
 */

import React from 'react';

export interface AuthenticityLedgerProps {
  lotId?: string;
  grader?: string;
  hash?: string;
  className?: string;
}

export function AuthenticityLedger({
  lotId = 'LOT-0482',
  grader = 'Prime Inspection Escrow',
  hash = '0x8F4A...B99C',
  className = '',
}: AuthenticityLedgerProps): React.JSX.Element {
  return (
    <div
      className={`w-full bg-[#09090b] border border-zinc-800 rounded-lg p-4 font-mono text-zinc-400 text-[10px] uppercase tracking-widest relative overflow-hidden ${className}`.trim()}
    >
      <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      <div className="flex justify-between items-end border-b border-zinc-800/60 pb-2 mb-2">
        <span className="text-zinc-100 font-bold">Immutable COA Record</span>
        <span className="text-emerald-400/90 font-semibold">Valid</span>
      </div>
      <div className="grid grid-cols-2 gap-y-2 mt-3">
        <div className="flex flex-col">
          <span className="text-zinc-600">Lot Ref</span>
          <span className="text-zinc-300 font-semibold">{lotId}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-zinc-600">Verification</span>
          <span className="text-zinc-300">{grader}</span>
        </div>
        <div className="flex flex-col col-span-2 mt-1">
          <span className="text-zinc-600">Ledger Hash</span>
          <span className="text-zinc-500 truncate">{hash}</span>
        </div>
      </div>
    </div>
  );
}

export default AuthenticityLedger;
