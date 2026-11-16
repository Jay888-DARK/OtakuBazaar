import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';

export const metadata: Metadata = {
  title: 'Prohibited Items Policy — OtakuBazaar Escrow Marketplace',
  description:
    'OtakuBazaar strict zero-tolerance policy against bootlegs, unauthorized resin recasts, counterfeit anime figures, and prohibited goods.',
};

export default function ProhibitedItemsPage(): React.JSX.Element {
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
            <span className="text-[#F2EFE9]">Prohibited Items Policy</span>
          </div>

          <div className="flex items-center gap-2 border border-[#7F1D1D] bg-[#180A0A] px-3 py-1">
            <span className="w-1.5 h-1.5 bg-[#EF4444] inline-block" />
            <span className="text-[#EF4444]">ZERO TOLERANCE POLICY</span>
          </div>
        </div>

        {/* Header */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 sm:p-8">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold border border-[#1F1F1F] bg-[#080808] px-2.5 py-1 inline-block mb-3">
            MARKETPLACE INTEGRITY &amp; AUTHENTICITY
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-[0.06em] text-[#F2EFE9]">
            Prohibited Items Policy
          </h1>
          <p className="text-[13px] text-[#8E8E8E] leading-relaxed max-w-2xl mt-2">
            OtakuBazaar was founded to eradicate bootlegs and counterfeit anime merchandise in India. The following items are strictly prohibited from listing, sale, or distribution.
          </p>
        </div>

        {/* Prohibited Categories */}
        <div className="space-y-6 text-[13px] leading-relaxed text-[#CCCCCC]">
          {/* Section 01: Counterfeit Figures */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#161616] pb-2">
              <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em] font-bold">
                01. Counterfeit Figures &amp; Bootlegs
              </h2>
              <span className="text-[10px] text-[#EF4444] uppercase font-bold tracking-wider">
                PERMANENT BAN
              </span>
            </div>
            <p>
              Listing any unlicensed reproduction, bootleg PVC figure, fake Nendoroid, or copy of official manufacturer merchandise is strictly forbidden. This includes:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[#8E8E8E] pl-1">
              <li>Unlicensed Chinese copies (often marketed as &ldquo;China Version&rdquo;, &ldquo;OEM&rdquo;, or &ldquo;Replica&rdquo;).</li>
              <li>Figures lacking official distributor authenticity hologram stickers (e.g. Kadokawa, Toei, Shueisha, Bandai Namco).</li>
              <li>Fake Good Smile Company, Alter, Kotobukiya, MegaHouse, Aniplex, or Max Factory products.</li>
            </ul>
          </section>

          {/* Section 02: Resin Recasts */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em] border-b border-[#161616] pb-2 font-bold">
              02. Unauthorized Resin Recasts
            </h2>
            <p>
              All resin statues and garage kits must be officially licensed or authentic original runs by recognized studios. Unlicensed recasts from Thai, Chinese, or domestic recast molders are strictly banned. Statues valued over ₹10,000 must include proof of purchase or authenticity certificates upon request.
            </p>
          </section>

          {/* Section 03: Non-Anime & General Prohibitions */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em] border-b border-[#161616] pb-2 font-bold">
              03. Other Prohibited Items
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-[#8E8E8E] pl-1">
              <li><strong className="text-[#F2EFE9]">Non-Collectible Merchandise:</strong> Everyday apparel, generic electronics, or goods unrelated to anime, manga, gaming, and Japanese pop culture.</li>
              <li><strong className="text-[#F2EFE9]">Unlicensed Adult (18+) Goods:</strong> Unrated or unlicensed adult merchandise lacking age-verification and Indian legal compliance.</li>
              <li><strong className="text-[#F2EFE9]">Hazardous Materials:</strong> Flammable paints, solvents, adhesives, or loose batteries not enclosed in manufacturer products.</li>
              <li><strong className="text-[#F2EFE9]">Digital or Virtual Goods:</strong> Game accounts, digital game codes, or non-physical items.</li>
            </ul>
          </section>

          {/* Section 04: Enforcement & Penalties */}
          <section className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-3">
            <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em] border-b border-[#161616] pb-2 font-bold">
              04. Seller Penalties for Violations
            </h2>
            <p>
              OtakuBazaar takes counterfeit protection seriously. Any seller caught attempting to pass off a bootleg as authentic faces immediate enforcement:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-[#080808] border border-[#1F1F1F] space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#EF4444] font-bold block">100% REFUND</span>
                <p className="text-[11px] text-[#777777]">Buyer is immediately refunded 100% of escrow funds.</p>
              </div>
              <div className="p-3 bg-[#080808] border border-[#1F1F1F] space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#EF4444] font-bold block">PERMANENT BAN</span>
                <p className="text-[11px] text-[#777777]">Immediate account blacklisting and ban across all connected VPAs/phone numbers.</p>
              </div>
              <div className="p-3 bg-[#080808] border border-[#1F1F1F] space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#EF4444] font-bold block">LEGAL REPORTING</span>
                <p className="text-[11px] text-[#777777]">Sellers of counterfeit goods may be reported under Indian Trademark &amp; Copyright laws.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Report Callout */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-[#777777] uppercase tracking-wider block">SPOTTED A SUSPICIOUS LISTING?</span>
            <span className="font-serif text-base text-[#F2EFE9] font-bold">Report bootlegs directly to our moderation desk.</span>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-xs font-semibold uppercase tracking-wider no-underline"
          >
            [ REPORT SUSPICIOUS LISTING ]
          </Link>
        </div>
      </div>

      <div className="mt-20">
        <ArchivalFooter />
      </div>
    </div>
  );
}
