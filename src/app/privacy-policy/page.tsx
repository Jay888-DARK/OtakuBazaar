import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';

export const metadata: Metadata = {
  title: 'Privacy Policy — OtakuBazaar Escrow Marketplace',
  description:
    'Digital Personal Data Protection (DPDP) Act compliance, custody address encryption, and payment security for OtakuBazaar India.',
};

export default function PrivacyPolicyPage(): React.JSX.Element {
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
            <span className="text-[#F2EFE9]">Data Protection</span>
          </div>

          <div className="flex items-center gap-2 border border-[#193829] bg-[#091812] px-3 py-1">
            <span className="w-1.5 h-1.5 bg-[#10B981] inline-block" />
            <span className="text-[#10B981]">DPDP ACT (INDIA) COMPLIANT</span>
          </div>
        </div>

        {/* Header */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 sm:p-8">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold border border-[#1F1F1F] bg-[#080808] px-2.5 py-1 inline-block mb-3">
            COLLECTOR DATA PRIVACY CHARTER
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-[0.06em] text-[#F2EFE9]">
            Privacy Policy &amp; Data Security
          </h1>
          <p className="text-[13px] text-[#8E8E8E] leading-relaxed max-w-2xl mt-2">
            How OtakuBazaar safeguards collector shipping coordinates, encrypted phone numbers, and payment tokens under the Digital Personal Data Protection Act of India.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-[13px] leading-relaxed text-[#CCCCCC]">
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em]">
              01. Scope &amp; Compliance Framework
            </h2>
            <p>
              OtakuBazaar is operated strictly in compliance with the Digital Personal Data Protection Act (DPDP Act, India) and Reserve Bank of India (RBI) payment security directives. We collect only the minimum telemetry required to authenticate, insure, and deliver rare collectible lots.
            </p>
          </section>

          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em]">
              02. Collector Shipping Coordinates &amp; Logistics Disclosure
            </h2>
            <p>
              Your physical address and contact phone number are transmitted exclusively to our vetted insured courier partners (BlueDart Express and Delhivery Surface) via encrypted tokenized APIs for the sole purpose of parcel generation and delivery authentication. Sellers never receive raw payment credentials.
            </p>
          </section>

          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em]">
              03. Payment Tokenization &amp; Bank Intermediaries
            </h2>
            <p>
              Credit card, debit card, UPI handles, and net-banking credentials are processed directly by our PCI-DSS Level 1 certified payment partners (Razorpay). OtakuBazaar never stores or logs raw credit card numbers or banking passwords on internal servers.
            </p>
          </section>

          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em]">
              04. Collector Rights &amp; Data Eradication
            </h2>
            <p>
              Under Indian DPDP regulations, any collector may request the complete deletion of their account history, address ledger, and uploaded verification media once all active escrow custody windows have finalized and settled.
            </p>
          </section>
        </div>
      </div>

      <div className="mt-20">
        <ArchivalFooter />
      </div>
    </div>
  );
}
