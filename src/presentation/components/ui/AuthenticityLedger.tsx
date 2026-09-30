'use client';

/**
 * @file src/presentation/components/ui/AuthenticityLedger.tsx
 *
 * Digital Certificate of Authenticity (COA) Component.
 * Displays cryptographic escrow trust and immutable inspection provenance
 * in the Classic Black & Grey monochrome palette.
 */

import React from 'react';

import { openProvenanceManifest } from '@/presentation/components/provenance/ProvenanceManifestModal';

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
  const handleOpenManifest = () => {
    openProvenanceManifest({
      lotRef: lotId,
      cryptographicHash: hash.includes('...') ? '0x8F4A9B23C7E10842B99C741029FA31D6' : hash,
      leadVerifier: grader,
    });
  };

  return (
    <div
      className={`w-full bg-[#09090b] border border-zinc-800 p-4 text-zinc-400 text-[10px] uppercase tracking-wider relative overflow-hidden ${className}`.trim()}
    >
      <div className="flex justify-between items-end border-b border-zinc-800/60 pb-2 mb-2">
        <button
          type="button"
          onClick={handleOpenManifest}
          className="text-zinc-100 font-bold hover:text-white underline decoration-zinc-600 underline-offset-4 cursor-pointer brutalist-btn text-left p-0.5"
          title="Click to view full cryptographic provenance manifest"
        >
          [ Immutable COA Record ] ↗
        </button>
        <span className="text-emerald-400/90 font-semibold font-mono">Valid (Grade S)</span>
      </div>

      <div className="grid grid-cols-2 gap-y-2 mt-3">
        <div className="flex flex-col">
          <span className="text-zinc-600 text-[9px]">Lot Ref</span>
          <span className="text-zinc-300 font-semibold">{lotId}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-zinc-600 text-[9px]">Verification</span>
          <span className="text-zinc-300">{grader}</span>
        </div>
        <div className="flex flex-col col-span-2 mt-1">
          <span className="text-zinc-600 text-[9px]">Ledger Hash (Click to Inspect)</span>
          <button
            type="button"
            onClick={handleOpenManifest}
            className="text-zinc-400 hover:text-white truncate font-mono text-left cursor-pointer brutalist-btn p-0.5 mt-0.5"
          >
            {hash} ↗
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthenticityLedger;
