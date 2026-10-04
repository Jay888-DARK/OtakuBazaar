'use client';

/**
 * @file src/app/verify/page.tsx
 *
 * Feature 3: Hardware-Anchored Provenance (NFC Verification Flow).
 * Stark, full-screen verification route triggered by tapping an NFC seal on a physical item.
 *
 * Requirements:
 * - Stark dark background (#09090b).
 * - Displays item's cryptographic hash, tamper seal serial, and full physical custody chain.
 * - Flashes a sharp, monochromatic text indicator on scan.
 * - STRICT CONSTRAINT: No radar blips, green checkmarks, neon colors, or hover animations.
 */

import React, { useState } from 'react';
import Link from 'next/link';

interface CustodyEvent {
  step: string;
  stage: string;
  location: string;
  timestamp: string;
  verifier: string;
  telemetry: string;
}

const CUSTODY_CHAIN: CustodyEvent[] = [
  {
    step: 'STAGE 01',
    stage: 'FACTORY SEALING & HOLOGRAPHIC ENCODING',
    location: 'TOKYO CENTRAL CUSTODY TERMINAL',
    timestamp: '2026-08-14 09:12:44 UTC',
    verifier: 'KADOKAWA / PRIME 1 VAULT SPECIALIST',
    telemetry: 'TAMPER TAPE APPLIED // SEAL #OKB-2026-9941-X',
  },
  {
    step: 'STAGE 02',
    stage: 'AIRBORNE COLD-CHAIN SECURE TRANSIT',
    location: 'HND-BOM DIPLOMATIC CARGO FLIGHT 884',
    timestamp: '2026-08-18 16:40:11 UTC',
    verifier: 'LOGISTICS ESCROW AGENT #44',
    telemetry: 'ACCELEROMETER LOG: ZERO IMPACT SHOCK DETECTED',
  },
  {
    step: 'STAGE 03',
    stage: 'OPTICAL RE-CALIBRATION & RESIN INTEGRITY SCAN',
    location: 'MUMBAI STAGING TERMINAL BAY 04',
    timestamp: '2026-09-28 14:22:08 UTC',
    verifier: 'T. YAGI (SENIOR AUTHENTICATOR #TY-001)',
    telemetry: 'JOINT TORQUE: 0.02MM // NITROGEN FLUSH PASSED',
  },
  {
    step: 'STAGE 04',
    stage: 'NFC HARDWARE CHIP ANCHOR CONFIRMATION',
    location: 'PHYSICAL SPECIMEN BASE EMBEDMENT',
    timestamp: '2026-10-01 00:54:15 UTC',
    verifier: 'OTAKUBAZAAR HARDWARE LEDGER NODE #1',
    telemetry: 'CHIP UID: 04:A2:88:91:FF:4C:80 (NTAG 424 DNA)',
  },
];

export default function HardwareVerificationPage(): React.JSX.Element {
  const [isScanning, setIsScanning] = useState(false);
  const [isVerified, setIsVerified] = useState(true); // Default verified for demonstration
  const [activeChipUID, setActiveChipUID] = useState('04:A2:88:91:FF:4C:80');

  const handleSimulateScan = () => {
    setIsScanning(true);
    setIsVerified(false);
    setTimeout(() => {
      setIsScanning(false);
      setIsVerified(true);
      setActiveChipUID('04:A2:88:91:FF:4C:80');
    }, 400); // 400ms simulate tap
  };

  return (
    <div
      className="min-h-screen bg-[#09090b] text-[#f4f4f5] py-12 px-4 sm:px-6 lg:px-8 select-none"
      style={{ fontFamily: "'Satoshi', 'Cabinet Grotesk', sans-serif" }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-zinc-300 transition-none no-underline text-zinc-500">
              Vault Home
            </Link>
            <span>/</span>
            <span className="text-zinc-300 font-bold">Hardware NFC Verification</span>
          </div>
          <div>TERMINAL PROTOCOL // RFC-8439</div>
        </div>

        {/* Top Header Card */}
        <div className="border border-[#27272a] bg-[#0c0c0e] p-6 sm:p-10 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-bold border border-zinc-700 bg-zinc-900 px-2.5 py-1">
              PHYSICAL HARDWARE ANCHOR
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-medium font-sans">
              NFC ENCRYPTED TAMPER-PROOF AUTHENTICATION
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#f4f4f5] font-sans">
            Hardware NFC Verification Terminal
          </h1>

          <p className="text-xs text-zinc-400 normal-case leading-relaxed font-sans max-w-2xl">
            Tap your mobile device or optical scanner against the tamper-evident holographic tag embedded into the specimen’s plinth. The cryptographic authentication token is checked against the OtakuBazaar decentralized double-entry vault ledger.
          </p>

          {/* Monochromatic Hardware Status Indicator */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              type="button"
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="px-6 py-3 bg-[#f4f4f4] text-black text-xs font-bold uppercase tracking-[0.2em] border border-[#f4f4f4] brutalist-btn cursor-pointer"
            >
              {isScanning ? '[ SCANNING HARDWARE CHIP... ]' : '[ SIMULATE PHYSICAL NFC TAP ]'}
            </button>

            {isVerified && !isScanning && (
              <div className="px-4 py-2.5 border border-zinc-700 bg-zinc-900 text-xs font-bold uppercase tracking-[0.2em] text-[#f4f4f4]">
                [ HARDWARE AUTHENTICATED: OKB-2026-9941-X ]
              </div>
            )}
          </div>
        </div>

        {/* Cryptographic Telemetry Grid */}
        <div className="border border-[#27272a] bg-[#0c0c0e]">
          <div className="p-4 sm:p-6 border-b border-[#27272a] bg-[#0a0a0c] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-bold">
              CRYPTOGRAPHIC HARDWARE CREDENTIALS
            </span>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500">
              HASH ALGORITHM: SHA-256 / ED25519
            </span>
          </div>

          <div className="divide-y divide-[#27272a] bg-[#09090b] text-xs">
            <div className="p-4 flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-zinc-500">HARDWARE CHIP IDENTIFIER (UID):</span>
              <span className="text-zinc-200 font-bold">{activeChipUID}</span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-zinc-500">IMMUTABLE VAULT HASH:</span>
              <span className="text-zinc-200 font-bold break-all">
                0x8F4A9B23C7E10842B99C741029FA31D6489A11CE88
              </span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-zinc-500">PHYSICAL TAMPER SEAL:</span>
              <span className="text-zinc-200 font-bold">OKB-2026-9941-X (GRADE S MINT)</span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-zinc-500">ESCROW UNBOXING STATUS:</span>
              <span className="text-zinc-200 font-bold">LOCKED IN DOUBLE-ENTRY VAULT (48H WINDOW ACTIVE)</span>
            </div>
          </div>
        </div>

        {/* Custody Chain Event Table */}
        <div className="border border-[#27272a] bg-[#0c0c0e]">
          <div className="p-4 sm:p-6 border-b border-[#27272a] bg-[#0a0a0c]">
            <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-bold block mb-1">
              END-TO-END PHYSICAL CUSTODY CHAIN
            </span>
            <span className="text-[11px] text-zinc-500 block normal-case font-sans">
              Cryptographically timestamped chronological transfer of physical custody.
            </span>
          </div>

          <div className="divide-y divide-[#27272a] bg-[#09090b]">
            {CUSTODY_CHAIN.map((evt) => (
              <div key={evt.step} className="p-4 sm:p-6 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-zinc-500 gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 border border-zinc-800 bg-zinc-900 text-zinc-300 font-bold">
                      {evt.step}
                    </span>
                    <span className="text-zinc-300 font-bold uppercase">{evt.stage}</span>
                  </div>
                  <span>{evt.timestamp}</span>
                </div>

                <div className="pl-4 border-l border-zinc-800 space-y-1 text-xs">
                  <div className="text-zinc-400">
                    <span className="text-zinc-600 mr-2">LOCATION:</span>
                    {evt.location}
                  </div>
                  <div className="text-zinc-400">
                    <span className="text-zinc-600 mr-2">VERIFIER:</span>
                    {evt.verifier}
                  </div>
                  <div className="text-zinc-400">
                    <span className="text-zinc-600 mr-2">LOG:</span>
                    {evt.telemetry}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Link Back */}
        <div className="pt-4 flex justify-between items-center text-xs">
          <Link
            href="/products/lot-0482"
            className="px-4 py-2 border border-zinc-700 bg-zinc-900 text-zinc-300 brutalist-btn no-underline uppercase tracking-wider"
          >
            ← Return to Specimen Dossier
          </Link>
          <span className="text-[10px] uppercase tracking-widest text-zinc-600">
            SECURE VERIFICATION TERMINAL // OKB
          </span>
        </div>
      </div>
    </div>
  );
}
