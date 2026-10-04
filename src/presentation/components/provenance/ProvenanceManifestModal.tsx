'use client';

/**
 * @file src/presentation/components/provenance/ProvenanceManifestModal.tsx
 *
 * Feature 3: Expanded Provenance Manifests.
 * Full-screen, text-heavy data manifest overlay formatted like a raw data table
 * or printed archival custody receipt.
 *
 * Capabilities:
 * - Triggered by clicking "Ledger Hash" or "Immutable COA Record".
 * - Displays complete optical inspection log, verification timestamps, and custody chain.
 * - Rely on structural indentation, column alignment, and uppercase labels (no boxes/lines).
 * - Instant 0ms open/close transitions.
 * - Enforces #f4f4f4 stark off-white brutalist invert on buttons and triggers.
 */

import React, { useEffect, useState } from 'react';

export interface ProvenanceManifestData {
  lotRef: string;
  itemTitle: string;
  series: string;
  fabricator: string;
  scaleAndMass: string;
  editionToken: string;
  tamperSealSerial: string;
  cryptographicHash: string;
  vaultTemperature: string;
  humidityLevel: string;
  leadVerifier: string;
  inspectionDate: string;
  escrowProtocol: string;
}

const DEFAULT_MANIFEST: ProvenanceManifestData = {
  lotRef: 'LOT-0482',
  itemTitle: 'GUTS BERSERKER ARMOR UNLEASHED 1/4 SCALE',
  series: 'BERSERK • KENTARO MIURA MEMORIAL ARCHIVE',
  fabricator: 'PRIME 1 STUDIO ULTIMATE PREMIUM MASTERLINE',
  scaleAndMass: '1/4 SCALE (H: 95CM, W: 57CM, D: 52CM) • 18.40 KG NET',
  editionToken: '042 / 350 WORLDWIDE PRODUCTION RUN',
  tamperSealSerial: 'OKB-2026-9941-X (HOLOGRAPHIC SECURITY TAMPER TAPE)',
  cryptographicHash: '0x8F4A9B23C7E10842B99C741029FA31D6',
  vaultTemperature: '18.2°C (STABILIZED CLIMATE VAULT)',
  humidityLevel: '42% RH (ARCHIVAL RESIN STANDARD)',
  leadVerifier: 'TOSHINORI YAGI (SENIOR AUTHENTICATOR #TY-001)',
  inspectionDate: '2026-09-28 14:22:08 UTC',
  escrowProtocol: 'DOUBLE-ENTRY ESCROW • 48-HOUR INSPECTION RELEASE',
};

export function openProvenanceManifest(data?: Partial<ProvenanceManifestData>) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('otaku_open_provenance_manifest', { detail: data })
    );
  }
}

export function ProvenanceManifestModal(): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const [manifest, setManifest] = useState<ProvenanceManifestData>(DEFAULT_MANIFEST);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<Partial<ProvenanceManifestData>>;
      if (customEvent.detail) {
        setManifest({ ...DEFAULT_MANIFEST, ...customEvent.detail });
      }
      setIsOpen(true);
    };

    window.addEventListener('otaku_open_provenance_manifest', handleOpen);
    return () => window.removeEventListener('otaku_open_provenance_manifest', handleOpen);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cryptographic Provenance Manifest"
      className="fixed inset-0 z-[99999] bg-[#09090b] text-[#f4f4f5] select-none overflow-y-auto"
      style={{ transition: 'none' }}
    >
      <div className="min-h-screen p-6 sm:p-12 lg:p-16 flex flex-col justify-between max-w-5xl mx-auto">
        {/* Manifest Header Bar */}
        <div className="border-b border-[#27272a] pb-6 mb-8 flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">
              OTAKUBAZAAR ARCHIVAL REPOSITORY • CENTRAL VAULT REGISTRY
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#f4f4f5]">
              Cryptographic Provenance Manifest &amp; Inspection Log
            </h1>
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 mt-1">
              ACCESSION IDENTIFIER: {manifest.lotRef} • SYSTEM LEDGER STATUS: SYNCHRONIZED
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close Manifest"
            className="px-4 py-2 bg-transparent text-[#f4f4f5] border border-zinc-700 text-[10px] uppercase tracking-[0.2em] font-bold brutalist-btn cursor-pointer"
          >
            [ ESC / CLOSE MANIFEST ]
          </button>
        </div>

        {/* Raw Printed Receipt / Structured Data Manifest Format */}
        <div
          className="space-y-8 text-xs uppercase leading-relaxed tracking-wider text-zinc-300"
          style={{ fontFamily: "'Satoshi', 'Cabinet Grotesk', sans-serif" }}
        >
          {/* Section 01: Specimen Identification */}
          <div>
            <div className="text-zinc-500 text-[10px] tracking-[0.25em] mb-3">
              01 // SPECIMEN IDENTIFICATION &amp; PRODUCTION METRICS
            </div>
            <div className="pl-4 space-y-1.5 border-l border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">CANONICAL TITLE:</span>
                <span className="text-[#f4f4f5] font-bold">{manifest.itemTitle}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">SERIES DESIGNATION:</span>
                <span className="text-zinc-300">{manifest.series}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">AUTHORIZED FABRICATOR:</span>
                <span className="text-zinc-300">{manifest.fabricator}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">MASS &amp; VOLUME SPEC:</span>
                <span className="text-zinc-300">{manifest.scaleAndMass}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">EDITION RUN TOKEN:</span>
                <span className="text-zinc-300">{manifest.editionToken}</span>
              </div>
            </div>
          </div>

          {/* Section 02: Physical Custody & Staging Telemetry */}
          <div>
            <div className="text-zinc-500 text-[10px] tracking-[0.25em] mb-3">
              02 // VAULT TELEMETRY &amp; PHYSICAL CUSTODY LOG
            </div>
            <div className="pl-4 space-y-1.5 border-l border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">PHYSICAL LOCATION:</span>
                <span className="text-zinc-300">MUMBAI STAGING TERMINAL • DEEP VAULT BAY 04</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">CLIMATE LOGGING:</span>
                <span className="text-zinc-300">{manifest.vaultTemperature}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">RELATIVE HUMIDITY:</span>
                <span className="text-zinc-300">{manifest.humidityLevel}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">TAMPER TAG SERIAL:</span>
                <span className="text-[#f4f4f5] font-bold">{manifest.tamperSealSerial}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">MICROSCOPIC JOINT TOLERANCE:</span>
                <span className="text-zinc-300">0.02MM (NOMINAL MASTER TOLERANCE PASSED)</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">PAINT LAYER INTEGRITY:</span>
                <span className="text-zinc-300">ZERO UV DEGRADATION • FACTORY SEALED FILM INTACT</span>
              </div>
            </div>
          </div>

          {/* Section 03: Cryptographic Escrow Audit Ledger */}
          <div>
            <div className="text-zinc-500 text-[10px] tracking-[0.25em] mb-3">
              03 // CRYPTOGRAPHIC ESCROW AUDIT CHAIN
            </div>
            <div className="pl-4 space-y-1.5 border-l border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">INSPECTION HASH:</span>
                <span className="text-emerald-400 font-bold break-all">{manifest.cryptographicHash}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">AUTHENTICATING OFFICER:</span>
                <span className="text-zinc-300">{manifest.leadVerifier}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">TIMESTAMP SIGNATURE:</span>
                <span className="text-zinc-300">{manifest.inspectionDate}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">SETTLEMENT PROTOCOL:</span>
                <span className="text-zinc-300">{manifest.escrowProtocol}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-zinc-500">REVERSIBILITY ASSURANCE:</span>
                <span className="text-zinc-300">100% DISPUTE ESCROW ROLLBACK PRE-UNBOXING</span>
              </div>
            </div>
          </div>

          {/* Section 04: Curatorial Legal Certification */}
          <div>
            <div className="text-zinc-500 text-[10px] tracking-[0.25em] mb-3">
              04 // VAULT GUARANTEE SIGN-OFF
            </div>
            <p className="text-zinc-400 text-xs normal-case leading-relaxed font-sans max-w-3xl">
              This manifest certifies that the listed specimen has been inspected by certified OtakuBazaar authentication specialists. Funds remain deposited in a double-entry escrow contract until 48 hours post physical unboxing. In the event of holographic seal compromise or transit damage, 100% of escrow funds revert to the buyer unconditionally.
            </p>
          </div>
        </div>

        {/* Footer Receipt Footprint */}
        <div className="border-t border-[#27272a] pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          <div>
            IMMUTABLE COA ID: {manifest.tamperSealSerial.split(' ')[0]} • RECORD VALIDATED
          </div>
          <div className="mt-2 sm:mt-0">
            PRESS [ESC] OR CLICK CLOSE TO RETURN TO ARCHIVE
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProvenanceManifestModal;
