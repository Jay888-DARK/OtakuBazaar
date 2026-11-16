import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';

export const metadata: Metadata = {
  title: 'About OtakuBazaar — India’s Authentic Anime Collectibles Marketplace',
  description:
    'Learn about OtakuBazaar: India’s dedicated peer-to-peer marketplace for authentic anime figures, statues, and collectibles protected by escrow payments.',
};

export default function AboutPage(): React.JSX.Element {
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
            <span className="text-[#F2EFE9]">About Us</span>
          </div>

          <div className="flex items-center gap-2 border border-[#193829] bg-[#091812] px-3 py-1">
            <span className="w-1.5 h-1.5 bg-[#10B981] inline-block" />
            <span className="text-[#10B981]">BUILT FOR INDIAN COLLECTORS</span>
          </div>
        </div>

        {/* Header */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 sm:p-8">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold border border-[#1F1F1F] bg-[#080808] px-2.5 py-1 inline-block mb-3">
            OUR MISSION &amp; ORIGIN
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-[0.06em] text-[#F2EFE9]">
            About OtakuBazaar
          </h1>
          <p className="text-[13px] text-[#8E8E8E] leading-relaxed max-w-2xl mt-2">
            Eliminating counterfeits and payment risk from India&apos;s anime collectibles market through escrow payments and mandatory unboxing verification.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-[13px] leading-relaxed text-[#CCCCCC]">
          {/* Section 01: The Problem */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em] border-b border-[#161616] pb-2 font-bold">
              01. The Problem in India&apos;s Anime Figure Community
            </h2>
            <p>
              For years, Indian anime enthusiasts and scale figure collectors have been forced to navigate unvetted Instagram pages, Telegram groups, and classified sites with zero buyer protection. Collectors routinely pay upfront via UPI, only to receive cheap unlicensed Chinese bootlegs, damaged boxes, or nothing at all.
            </p>
            <p className="text-[#8E8E8E]">
              At the same time, legitimate collectors trying to downsize or sell grails face payment fraud, tire-kickers, and baseless return claims.
            </p>
          </section>

          {/* Section 02: Our Solution */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em] border-b border-[#161616] pb-2 font-bold">
              02. Escrow Protection Built from the Ground Up
            </h2>
            <p>
              OtakuBazaar was created to solve trust in C2C collectible sales. We act as an impartial intermediary:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#8E8E8E] pl-1">
              <li>
                <strong className="text-[#F2EFE9]">Funds Protected in Escrow:</strong> When a buyer pays, the money is locked securely. The seller cannot withdraw until the buyer receives and verifies the parcel.
              </li>
              <li>
                <strong className="text-[#F2EFE9]">48-Hour Unboxing Window:</strong> Buyers record an unbroken unboxing video upon delivery to inspect paint quality, joints, and authenticity stickers.
              </li>
              <li>
                <strong className="text-[#F2EFE9]">Fair Dispute Settlement:</strong> Verified counterfeit or transit-damaged items receive a 100% refund. Once verified authentic, sellers receive their payout immediately.
              </li>
            </ul>
          </section>

          {/* Section 03: Values */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em] border-b border-[#161616] pb-2 font-bold">
              03. Transparent Marketplace Economics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#080808] border border-[#1F1F1F] space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#10B981] font-semibold block">
                  FOR BUYERS
                </span>
                <span className="font-serif text-[16px] text-[#F2EFE9] font-bold block">0% Platform Fee</span>
                <p className="text-[11px] text-[#777777] leading-relaxed">
                  Browse, bargain, and checkout without surprise platform markups. What you agree upon is what you pay.
                </p>
              </div>

              <div className="p-4 bg-[#080808] border border-[#1F1F1F] space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#777777] font-semibold block">
                  FOR SELLERS
                </span>
                <span className="font-serif text-[16px] text-[#F2EFE9] font-bold block">Flat 5% Commission</span>
                <p className="text-[11px] text-[#777777] leading-relaxed">
                  List for free. A transparent 5% fee is deducted only when your order settles safely without dispute.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* CTA Footer */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-[#777777] uppercase tracking-wider block">READY TO EXPLORE?</span>
            <span className="font-serif text-base text-[#F2EFE9] font-bold">Discover authenticated grails or list your figures today.</span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/#stage-2"
              className="px-4 py-2 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-xs font-semibold uppercase tracking-wider no-underline"
            >
              [ BROWSE FIGURES ]
            </Link>
            <Link
              href="/sell"
              className="px-4 py-2 bg-[#080808] text-[#CCCCCC] border border-[#1F1F1F] text-xs font-semibold uppercase tracking-wider no-underline"
            >
              [ SELL YOUR GRAILS ]
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <ArchivalFooter />
      </div>
    </div>
  );
}
