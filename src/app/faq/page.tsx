'use client';

/**
 * @file src/app/faq/page.tsx
 *
 * Comprehensive Knowledge Base & FAQ for OtakuBazaar.
 * High-contrast editorial dark aesthetic with interactive topic accordions.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';

interface FAQGroup {
  category: string;
  items: { q: string; a: string }[];
}

const FAQ_DATA: FAQGroup[] = [
  {
    category: 'BUYING & ESCROW PROTECTION',
    items: [
      {
        q: 'How does the escrow payment system protect me as a buyer?',
        a: 'When you place an order on OtakuBazaar, your payment is held securely in escrow by our payment gateway partner. The seller is never paid upfront. The seller only receives payout after the courier registers delivery, you complete your unboxing inspection, and the 48-hour inspection period concludes without a dispute.',
      },
      {
        q: 'Are there any hidden fees or extra charges for buyers?',
        a: 'No. Buyers pay 0% platform fee. The price shown on the listing (plus any agreed shipping cost indicated at checkout) is the exact total amount you pay.',
      },
      {
        q: 'What is the 15-Minute Reservation Lock during checkout?',
        a: 'To prevent concurrency issues and double-purchases of rare single-edition collectibles, clicking checkout locks the item exclusively for you for 15 minutes. If checkout is completed, the listing is marked SOLD. If payment is abandoned, the lock expires after 15 minutes and the item returns to public catalog view.',
      },
      {
        q: 'Can I make an offer below the seller’s asking price?',
        a: 'Yes. Most listings allow buyers to submit a 24-hour binding offer via the Bargain modal. If the seller accepts your offer, the item is reserved at your offered price and you have 15 minutes to complete the escrow payment.',
      },
    ],
  },
  {
    category: 'SHIPPING, UNBOXING & 48-HOUR INSPECTION',
    items: [
      {
        q: 'Why is an uncut unboxing video strictly mandatory for refunds?',
        a: 'Because OtakuBazaar facilitates peer-to-peer sales of high-value collectibles, the unbroken unboxing video is the objective single source of truth. It proves the condition of the box, seals, and figure immediately upon arrival, ruling out post-delivery accidents or swap fraud. Without an uncut unboxing video, damage and authenticity claims cannot be arbitrated.',
      },
      {
        q: 'What are the exact video recording rules for unboxing?',
        a: '1. Begin recording before cutting any courier tape. 2. Show the courier shipping label with the tracking AWB barcode clearly in focus. 3. Rotate the sealed outer box 360° to demonstrate that external seals are untouched. 4. Open the parcel and inspect the figure, manufacturer packaging, and hologram sticker without pausing or editing the video.',
      },
      {
        q: 'When does the 48-hour inspection countdown start?',
        a: 'The 48-hour window begins at the exact moment the courier (e.g. BlueDart or Delhivery) transmits the delivery confirmation timestamp via API. You have 48 full hours to inspect the collectible in natural light.',
      },
      {
        q: 'How are figures packed and shipped?',
        a: 'Sellers are required to double-box figures with ample bubble wrap and sturdy corrugated outer cartons. Dispatch is conducted through reliable tracked domestic courier services across India.',
      },
    ],
  },
  {
    category: 'SELLING & PAYOUTS',
    items: [
      {
        q: 'What fees do sellers pay on OtakuBazaar?',
        a: 'Listing figures is 100% free. Sellers pay a flat 5% platform commission deducted automatically from the final settled sale amount upon successful escrow release. Applicable GST on platform services is included in the fee accounting.',
      },
      {
        q: 'When and how do I receive my seller payout?',
        a: 'Once the buyer inspects and approves the item or the 48-hour window expires without a dispute, funds are released immediately to your verified Indian bank account via NEFT/IMPS or UPI VPA.',
      },
      {
        q: 'What if a buyer files a false claim or damages the figure after opening?',
        a: 'Our dispute team requires the buyer to supply their uninterrupted unboxing video. If the video shows the parcel was opened before filming started, or if the damage occurred after unboxing, the claim is rejected and funds are released to the seller.',
      },
      {
        q: 'What items am I prohibited from listing?',
        a: 'We strictly ban all counterfeit figures, bootlegs, unlicensed garage recasts, and adult goods without proper age verification. Please see our Prohibited Items policy for full details.',
      },
    ],
  },
];

export default function FaqPage(): React.JSX.Element {
  const [activeCategory, setActiveCategory] = useState<string>(FAQ_DATA[0]!.category);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (q: string) => {
    setOpenItems((prev) => ({ ...prev, [q]: !prev[q] }));
  };

  const currentGroup = FAQ_DATA.find((g) => g.category === activeCategory) || FAQ_DATA[0]!;

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
            <span className="text-[#F2EFE9]">Knowledge Base &amp; FAQ</span>
          </div>

          <div className="flex items-center gap-2 border border-[#193829] bg-[#091812] px-3 py-1">
            <span className="w-1.5 h-1.5 bg-[#10B981] inline-block" />
            <span className="text-[#10B981]">HELP CENTER</span>
          </div>
        </div>

        {/* Header */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 sm:p-8">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold border border-[#1F1F1F] bg-[#080808] px-2.5 py-1 inline-block mb-3">
            CLEAR ANSWERS &amp; PROTOCOLS
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-[0.06em] text-[#F2EFE9]">
            Frequently Asked Questions
          </h1>
          <p className="text-[13px] text-[#8E8E8E] leading-relaxed max-w-2xl mt-2">
            Everything you need to know about buying, selling, escrow security, unboxing video requirements, and courier logistics across India.
          </p>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex border-b border-[#1F1F1F] gap-2 overflow-x-auto scrollbar-none pb-px">
          {FAQ_DATA.map((group) => (
            <button
              key={group.category}
              type="button"
              onClick={() => setActiveCategory(group.category)}
              className={`px-4 py-3 text-[10px] uppercase tracking-[0.16em] font-semibold border cursor-pointer rounded-none whitespace-nowrap transition-none ${
                activeCategory === group.category
                  ? 'bg-[#F2EFE9] text-[#080808] border-[#F2EFE9]'
                  : 'bg-[#0C0C0C] text-[#888888] border-[#1F1F1F]'
              }`}
            >
              [ {group.category} ]
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] divide-y divide-[#161616]">
          {currentGroup.items.map((item) => {
            const isOpen = Boolean(openItems[item.q]);
            return (
              <div key={item.q} className="p-6">
                <button
                  type="button"
                  onClick={() => toggleItem(item.q)}
                  className="w-full text-left flex items-start justify-between gap-4 text-[13px] font-semibold text-[#F2EFE9] hover:text-white cursor-pointer"
                >
                  <span className="uppercase tracking-[0.04em]">{item.q}</span>
                  <span className="text-[#777777] font-mono text-sm shrink-0">
                    {isOpen ? '[-]' : '[+]'}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-3 text-[12px] text-[#8E8E8E] leading-relaxed font-normal pr-6">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-[#777777] uppercase tracking-wider block">STILL HAVE QUESTIONS?</span>
            <span className="font-serif text-base text-[#F2EFE9] font-bold">Reach out directly to our support desk.</span>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-xs font-semibold uppercase tracking-wider no-underline"
          >
            [ CONTACT DESK ]
          </Link>
        </div>
      </div>

      <div className="mt-20">
        <ArchivalFooter />
      </div>
    </div>
  );
}
