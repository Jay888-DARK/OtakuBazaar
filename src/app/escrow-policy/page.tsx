import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';

export const metadata: Metadata = {
  title: '48-Hour Escrow & Unboxing Policy — OtakuBazaar',
  description:
    'Mandatory uncut 360° unboxing video protocols, anti-bootleg claims, and Razorpay escrow refund settlement rules for Indian anime collectors.',
};

export default function EscrowPolicyPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F2EFE9] select-none py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-4 text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors no-underline text-[#777777]">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-[#F2EFE9]">Escrow Protocol</span>
          </div>

          <div className="flex items-center gap-2 border border-[#193829] bg-[#091812] px-3 py-1">
            <span className="w-1.5 h-1.5 bg-[#10B981] inline-block" />
            <span className="text-[#10B981]">48-HOUR CUSTODY STANDARD</span>
          </div>
        </div>

        {/* Header */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 sm:p-8">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold border border-[#1F1F1F] bg-[#080808] px-2.5 py-1 inline-block mb-3">
            ANTI-BOOTLEG ESCROW SAFEGUARD
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-[0.06em] text-[#F2EFE9]">
            48-Hour Escrow &amp; Unboxing Policy
          </h1>
          <p className="text-[13px] text-[#8E8E8E] leading-relaxed max-w-2xl mt-2">
            Comprehensive guidelines governing parcel inspection, mandatory unboxing video protocols, counterfeit identification, and instant Razorpay refund timelines.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6 text-[13px] leading-relaxed text-[#CCCCCC]">
          {/* Section 01: Mandatory Uncut Video */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#161616] pb-2">
              <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                01. Mandatory Uncut 360° Unboxing Video Protocol
              </h2>
              <span className="text-[10px] text-[#10B981] uppercase tracking-wider font-semibold">
                REQUIRED FOR REFUNDS
              </span>
            </div>
            <p>
              To protect both buyers and consigning collectors against transit swap fraud or courier tampering, every buyer MUST record a single continuous, uncut unboxing video starting before the courier flyer or foam crate is opened.
            </p>
            <div className="p-3.5 bg-[#080808] border border-[#1F1F1F] space-y-2 text-[#8E8E8E]">
              <div className="text-[#F2EFE9] font-medium uppercase text-[11px] tracking-wider">
                Video Checklist (Non-Negotiable):
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Show the BlueDart / Delhivery shipping label clearly with the tracking AWB barcode legible.</li>
                <li>Rotate the sealed box 360° to prove all exterior tape and security seals are intact.</li>
                <li>Cut open the parcel and inspect the manufacturer art box, hologram sticker, and figure blister without pausing the camera.</li>
              </ul>
            </div>
          </section>

          {/* Section 02: 48-Hour Clock */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#161616] pb-2">
              <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                02. The 48-Hour Physical Inspection Clock
              </h2>
              <span className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold">
                SEC. 02
              </span>
            </div>
            <p>
              The 48-hour inspection period begins precisely when the courier partner registers the delivery timestamp via API. During this 48-hour window, you may test joints, examine paint gradients under natural light, and check manufacturer copyright stamps.
            </p>
            <p className="text-[#8E8E8E]">
              If no dispute is lodged within 48 hours, escrow funds are automatically authorized for payout release to the consigning seller.
            </p>
          </section>

          {/* Section 03: Discrepancy & Claims */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#161616] pb-2">
              <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                03. Counterfeit Claims &amp; Condition Discrepancies
              </h2>
              <span className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold">
                SEC. 03
              </span>
            </div>
            <p>
              If a collectible is suspected of being an unauthorized recast or bootleg:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-[#8E8E8E] pl-1">
              <li>Submit your dispute directly via your Collector Vault dashboard within 48 hours with your uncut unboxing video.</li>
              <li>Our Tokyo &amp; Mumbai authentication specialists review the seam lines, paint finishes, and hologram serials within 24 hours.</li>
              <li>Once verified as non-conforming or bootleg, 100% of your escrow payment is refunded immediately to your original payment method via Razorpay.</li>
            </ol>
          </section>

          {/* Section 04: Refund Timelines */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#161616] pb-2">
              <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                04. Razorpay Escrow Refund Timelines
              </h2>
              <span className="text-[10px] text-[#10B981] uppercase tracking-wider font-semibold">
                INSTANT REVERSAL
              </span>
            </div>
            <p>
              Approved refunds are triggered directly from the nodal escrow liability account:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#080808] border border-[#1F1F1F]">
                <span className="text-[9px] uppercase tracking-wider text-[#777777] block">UPI PAYMENTS</span>
                <span className="font-serif text-[14px] text-[#10B981] font-bold block mt-1">Instant / 2-4 Hours</span>
              </div>
              <div className="p-3 bg-[#080808] border border-[#1F1F1F]">
                <span className="text-[9px] uppercase tracking-wider text-[#777777] block">NET BANKING</span>
                <span className="font-serif text-[14px] text-[#F2EFE9] font-bold block mt-1">1 Business Day</span>
              </div>
              <div className="p-3 bg-[#080808] border border-[#1F1F1F]">
                <span className="text-[9px] uppercase tracking-wider text-[#777777] block">CREDIT / DEBIT CARDS</span>
                <span className="font-serif text-[14px] text-[#F2EFE9] font-bold block mt-1">2-3 Business Days</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-20">
        <ArchivalFooter />
      </div>
    </div>
  );
}
