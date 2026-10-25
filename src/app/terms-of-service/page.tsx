import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';

export const metadata: Metadata = {
  title: 'Terms of Service — OtakuBazaar Escrow Marketplace',
  description:
    'C2C marketplace charter, zero-bootleg penalties, seller KYC, and escrow financial governance for OtakuBazaar India.',
};

export default function TermsOfServicePage(): React.JSX.Element {
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
            <span className="text-[#F2EFE9]">Legal Governance</span>
          </div>

          <div className="flex items-center gap-2 border border-[#193829] bg-[#091812] px-3 py-1">
            <span className="w-1.5 h-1.5 bg-[#10B981] inline-block" />
            <span className="text-[#10B981]">LEGAL CHARTER EFFECTIVE 2026</span>
          </div>
        </div>

        {/* Header */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 sm:p-8">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold border border-[#1F1F1F] bg-[#080808] px-2.5 py-1 inline-block mb-3">
            MARKETPLACE GOVERNANCE CHARTER
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-[0.06em] text-[#F2EFE9]">
            Terms of Service &amp; Escrow Charter
          </h1>
          <p className="text-[13px] text-[#8E8E8E] leading-relaxed max-w-2xl mt-2">
            Rules and obligations governing buyers, verified consigning collectors, and custodial escrow settlements across India.
          </p>
        </div>

        {/* Legal Sections */}
        <div className="space-y-6 text-[13px] leading-relaxed text-[#CCCCCC]">
          {/* Section 01 */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#161616] pb-2">
              <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                01. C2C Marketplace Governance &amp; Escrow Custody
              </h2>
              <span className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold">
                SEC. 01
              </span>
            </div>
            <p>
              OtakuBazaar acts as a premier custodial technology platform and escrow settlement intermediary connecting collectors of authentic anime figures and statues across India. All transactions are settled in Indian Rupees (₹ INR) via designated Reserve Bank of India (RBI) compliant nodal bank escrow accounts.
            </p>
            <p className="text-[#8E8E8E]">
              Funds deposited by a buyer remain sequestered in nodal custody and are strictly released to the seller only upon completion of the mandatory 48-Hour Unboxing Inspection Window without dispute.
            </p>
          </section>

          {/* Section 02 */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#161616] pb-2">
              <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                02. Zero-Tolerance Anti-Bootleg &amp; Counterfeit Penalties
              </h2>
              <span className="text-[10px] text-[#F87171] uppercase tracking-wider font-semibold">
                STRICT ENFORCEMENT
              </span>
            </div>
            <p>
              OtakuBazaar enforces a zero-tolerance policy against unlicensed bootlegs, unauthorized recasts, counterfeit PVC figures, and unauthorized reproductions.
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[#8E8E8E] pl-1">
              <li>
                <strong className="text-[#F2EFE9]">Immediate Buyer Refund:</strong> In the event a delivered specimen fails holographic or mold authentication, 100% of escrow funds are refunded to the buyer immediately.
              </li>
              <li>
                <strong className="text-[#F2EFE9]">Consignor Banishment &amp; Forfeiture:</strong> Any seller verified to have shipped a counterfeit item faces immediate permanent platform blacklisting, account forfeiture, and liability for all return freight charges.
              </li>
            </ul>
          </section>

          {/* Section 03 */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#161616] pb-2">
              <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                03. Seller KYC &amp; Verification Protocol
              </h2>
              <span className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold">
                SEC. 03
              </span>
            </div>
            <p>
              To consign items valued above ₹10,000 INR, sellers must complete identity verification, provide a verified Indian bank account (PAN/Aadhaar/UPI VPA), and submit in-hand handwritten timestamp proof cards alongside high-resolution macro photography of the item&apos;s authentication seals.
            </p>
          </section>

          {/* Section 04 */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#161616] pb-2">
              <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                04. Transparent Marketplace Fee Schedule
              </h2>
              <span className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold">
                SEC. 04
              </span>
            </div>
            <div className="space-y-2 text-[#8E8E8E]">
              <div className="flex justify-between p-2.5 bg-[#080808] border border-[#1F1F1F]">
                <span className="text-[#F2EFE9] uppercase tracking-wider">Buyer Escrow Protection:</span>
                <span className="text-[#10B981] font-semibold">₹0 (100% FREE FOR BUYERS)</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#080808] border border-[#1F1F1F]">
                <span className="text-[#F2EFE9] uppercase tracking-wider">Consignment Authentication Fee:</span>
                <span className="text-[#F2EFE9] font-medium">5% deducted from seller upon release</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#080808] border border-[#1F1F1F]">
                <span className="text-[#F2EFE9] uppercase tracking-wider">Insured Foam Crate Courier:</span>
                <span className="text-[#10B981] font-semibold">Included in agreed lot price</span>
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
