import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';

export const metadata: Metadata = {
  title: 'Shipping & Returns Policy — OtakuBazaar Escrow Marketplace',
  description:
    'Pan-India courier shipping rules, mandatory uncut unboxing video standards, 48-hour inspection window, and 100% counterfeit/damage refund policy for anime collectibles.',
};

export default function ShippingAndReturnsPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F2EFE9] select-none py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-4 text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-none no-underline text-[#777777]">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-[#F2EFE9]">Shipping &amp; Returns</span>
          </div>

          <div className="flex items-center gap-2 border border-[#193829] bg-[#091812] px-3 py-1">
            <span className="w-1.5 h-1.5 bg-[#10B981] inline-block" />
            <span className="text-[#10B981]">100% REFUND GUARANTEE</span>
          </div>
        </div>

        {/* Header */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 sm:p-8">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold border border-[#1F1F1F] bg-[#080808] px-2.5 py-1 inline-block mb-3">
            LOGISTICS &amp; REFUND CHARTER
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-[0.06em] text-[#F2EFE9]">
            Shipping &amp; Returns Policy
          </h1>
          <p className="text-[13px] text-[#8E8E8E] leading-relaxed max-w-2xl mt-2">
            Clear standards governing seller packaging, courier tracking across India, mandatory unboxing video protocols, and guaranteed escrow refunds.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6 text-[13px] leading-relaxed text-[#CCCCCC]">
          {/* Section 01: Shipping Framework */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em] border-b border-[#161616] pb-2 font-bold">
              01. Pan-India Courier Logistics
            </h2>
            <p>
              OtakuBazaar operates on a direct seller-to-buyer fulfillment model. When a buyer completes escrow payment, the seller is notified to package and dispatch the figure within 48 business hours.
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[#8E8E8E] pl-1">
              <li>
                <strong className="text-[#F2EFE9]">Tracked Couriers Only:</strong> Sellers must ship via reputable national courier networks (BlueDart, Delhivery, DTDC, Xpressbees, or India Post Speed Post).
              </li>
              <li>
                <strong className="text-[#F2EFE9]">Mandatory AWB Entry:</strong> The seller must record the valid AWB tracking number on their dashboard within 48 hours of escrow confirmation.
              </li>
              <li>
                <strong className="text-[#F2EFE9]">Estimated Delivery:</strong> Typically 3–6 business days depending on origin and destination pincodes.
              </li>
            </ul>
          </section>

          {/* Section 02: Packaging Standards */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em] border-b border-[#161616] pb-2 font-bold">
              02. Packaging Requirements for Sellers
            </h2>
            <p>
              Anime figures are fragile and packaging condition directly impacts collectible valuation. Sellers must adhere to the following packing rules:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-[#080808] border border-[#1F1F1F] space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#F2EFE9] font-bold block">
                  DOUBLE BOXING
                </span>
                <p className="text-[11px] text-[#777777]">
                  The original manufacturer art box must be placed inside a sturdy 3-ply or 5-ply outer corrugated shipping carton.
                </p>
              </div>
              <div className="p-3.5 bg-[#080808] border border-[#1F1F1F] space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#F2EFE9] font-bold block">
                  360° BUBBLE WRAP
                </span>
                <p className="text-[11px] text-[#777777]">
                  Wrap the figure box with at least 2 layers of bubble wrap with corner protectors to prevent edge crushing.
                </p>
              </div>
            </div>
          </section>

          {/* Section 03: 48-Hour Unboxing Inspection */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#161616] pb-2">
              <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em] font-bold">
                03. The 48-Hour Unboxing Inspection Window
              </h2>
              <span className="text-[10px] text-[#10B981] font-bold uppercase tracking-wider">
                MANDATORY FOR CLAIMS
              </span>
            </div>
            <p>
              The 48-hour inspection clock starts the exact second the courier records the parcel as delivered. During this period:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-[#8E8E8E] pl-1">
              <li>Record a single, continuous, uncut unboxing video starting before opening any courier packaging.</li>
              <li>Show the courier label and tracking AWB barcode clearly in frame.</li>
              <li>Rotate the sealed box 360° to prove all tape and seals are original and untouched.</li>
              <li>Inspect the manufacturer seals, hologram sticker, blister tray, paintwork, and joints.</li>
            </ol>
            <p className="text-[11px] text-[#8E8E8E] bg-[#080808] border border-[#1F1F1F] p-3">
              <strong className="text-[#F2EFE9] uppercase">Important Note:</strong> Videos with cuts, pauses, off-camera unboxing, or started after the parcel has already been opened cannot be accepted as evidence in dispute arbitration.
            </p>
          </section>

          {/* Section 04: Refund Conditions */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em] border-b border-[#161616] pb-2 font-bold">
              04. 100% Refund Conditions
            </h2>
            <p>
              Buyers are guaranteed a 100% refund of escrow funds under the following conditions when verified with an uncut unboxing video:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[#8E8E8E] pl-1">
              <li><strong className="text-[#F2EFE9]">Counterfeit / Bootleg:</strong> The figure is an unauthorized Chinese recast, bootleg, or reproduction.</li>
              <li><strong className="text-[#F2EFE9]">Transit Damage:</strong> The figure arrived broken, fractured, or with broken joints during shipping.</li>
              <li><strong className="text-[#F2EFE9]">Non-Conforming Condition:</strong> The item was listed as MISB / Factory Sealed but arrived opened or missing parts.</li>
            </ul>
            <p className="text-[#8E8E8E]">
              Refunds are issued directly to the original payment method via Razorpay within 2–4 business days. The seller is responsible for reverse shipping costs for counterfeit or misdescribed items.
            </p>
          </section>
        </div>

        {/* Action Link Banner */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-[#777777] uppercase tracking-wider block">NEED TO FILE A DISPUTE?</span>
            <span className="font-serif text-base text-[#F2EFE9] font-bold">Submit your unboxing video via the dispute desk.</span>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-xs font-semibold uppercase tracking-wider no-underline"
          >
            [ OPEN DISPUTE TICKET ]
          </Link>
        </div>
      </div>

      <div className="mt-20">
        <ArchivalFooter />
      </div>
    </div>
  );
}
