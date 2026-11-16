'use client';

/**
 * @file src/presentation/components/home/HowItWorksAndFaq.tsx
 *
 * Plain-language 3-Step "How It Works" (for Buyers & Sellers) and Homepage FAQ.
 * Strictly adheres to the dark brutalist collector aesthetic:
 * - Canvas: #080808, Surfaces: #0C0C0C, Borders: #1F1F1F / #161616.
 * - Typography: Playfair Display serif headers, Plus Jakarta Sans body copy.
 * - 0px border-radius containers, zero emojis, zero soft gradients.
 */

import React, { useState } from 'react';
import Link from 'next/link';

interface FaqItem {
  question: string;
  answer: string;
}

const BUYER_STEPS = [
  {
    step: '01',
    label: 'FIND & RESERVE',
    title: 'Discover & Secure in Escrow',
    description:
      'Browse authentic Japanese scale figures, statues, and collectibles listed by verified Indian collectors. When you buy, your payment is held securely in escrow—never paid to the seller upfront.',
    detail: '15-min reservation lock • 0% buyer platform fee',
  },
  {
    step: '02',
    label: 'TRACKED COURIER',
    title: 'Seller Ships with Tracking',
    description:
      'The seller securely packages your collectible with bubble wrap and sturdy outer cartons, then ships via tracked express courier (BlueDart, Delhivery, etc.) with live AWB tracking provided in your dashboard.',
    detail: 'Live tracking code • Direct dispatch across India',
  },
  {
    step: '03',
    label: '48H UNBOXING',
    title: 'Inspect & Approve or Refund',
    description:
      'Record an uncut unboxing video when your parcel arrives. You have 48 hours to examine the figure and box condition. If authentic, release payout to the seller. If counterfeit or broken, submit a dispute for a 100% refund.',
    detail: '100% money-back guarantee with unboxing video',
  },
];

const SELLER_STEPS = [
  {
    step: '01',
    label: 'FREE LISTING',
    title: 'List Your Collection in Minutes',
    description:
      'Upload high-resolution photos of your figure, outer box, and authenticity hologram. Set your asking price and auto-reject floor. Listing is 100% free with no upfront fees.',
    detail: 'Zero listing charges • Custom bargain floor price',
  },
  {
    step: '02',
    label: 'ESCROW LOCK',
    title: 'Ship Once Payment Is Locked',
    description:
      'You are notified instantly when a buyer reserves or purchases your figure. The buyer’s payment is confirmed in escrow before you ship, so you never risk shipping without payment.',
    detail: 'Guaranteed buyer funds • 48-hour dispatch SLA',
  },
  {
    step: '03',
    label: 'FAST PAYOUT',
    title: 'Receive Direct Bank Transfer',
    description:
      'Once the buyer confirms the item or the 48-hour inspection period closes without dispute, funds are released directly to your verified bank account or UPI VPA (minus a fair 5% platform fee).',
    detail: 'Flat 5% seller fee • Direct UPI / NEFT payout',
  },
];

const HOMEPAGE_FAQS: FaqItem[] = [
  {
    question: 'How does escrow protect me as a buyer?',
    answer:
      'Your payment is never sent directly to the seller when you purchase. Instead, OtakuBazaar locks the funds in escrow. The seller only receives payout after you receive the package, inspect your figure, and the 48-hour unboxing inspection window clears without a dispute.',
  },
  {
    question: 'Why is an uncut unboxing video required for refunds?',
    answer:
      'To ensure fair dispute resolution for both buyers and sellers, buyers must record a single, continuous, uncut video starting from the sealed courier box (with shipping label barcode visible) through unboxing and inspecting the figure. This proves the item’s condition upon arrival and protects against transit damage, bootlegs, and swap fraud.',
  },
  {
    question: 'What are the platform fees on OtakuBazaar?',
    answer:
      'Buyers pay 0% platform fee. What you see is what you pay. Sellers pay a flat 5% platform commission deducted only upon a successfully settled order. Listing items is completely free.',
  },
  {
    question: 'How is shipping handled across India?',
    answer:
      'Sellers ship directly to buyers using reliable tracked express couriers (such as BlueDart, Delhivery, or Shiprocket). The seller inputs a valid tracking AWB number in their dashboard, allowing both parties to follow the package in real time.',
  },
  {
    question: 'What happens if a received item is a bootleg or damaged?',
    answer:
      'OtakuBazaar enforces a strict zero-tolerance counterfeit policy. If you receive a bootleg or damaged item, submit your dispute via your dashboard within 48 hours accompanied by your uncut unboxing video. Once verified, you receive a 100% refund and the offending seller is banned.',
  },
];

export function HowItWorksAndFaq(): React.JSX.Element {
  const [activeWorkflow, setActiveWorkflow] = useState<'BUYERS' | 'SELLERS'>('BUYERS');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const steps = activeWorkflow === 'BUYERS' ? BUYER_STEPS : SELLER_STEPS;

  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-20 select-none font-sans">
      {/* 1. Header & Workflow Toggle */}
      <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1F1F1F] pb-6">
          <div>
            <span className="block mb-1.5 text-[10px] tracking-[0.2em] text-[#777777] uppercase font-semibold">
              TRANSPARENT C2C MARKETPLACE
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#F2EFE9] uppercase tracking-[0.05em] font-bold">
              How OtakuBazaar Works
            </h2>
            <p className="mt-2 text-[13px] text-[#8E8E8E] max-w-xl leading-relaxed">
              Safe, authentic anime figure trading across India with automated escrow protection and verified 48-hour inspection.
            </p>
          </div>

          {/* Workflow Mode Tabs */}
          <div className="flex border border-[#1F1F1F] bg-[#080808]">
            <button
              type="button"
              onClick={() => setActiveWorkflow('BUYERS')}
              className={`px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] font-semibold transition-none cursor-pointer rounded-none ${
                activeWorkflow === 'BUYERS'
                  ? 'bg-[#F2EFE9] text-[#080808]'
                  : 'bg-transparent text-[#888888] hover:text-[#CCCCCC]'
              }`}
            >
              [ FOR BUYERS ]
            </button>
            <button
              type="button"
              onClick={() => setActiveWorkflow('SELLERS')}
              className={`px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] font-semibold transition-none cursor-pointer rounded-none border-l border-[#1F1F1F] ${
                activeWorkflow === 'SELLERS'
                  ? 'bg-[#F2EFE9] text-[#080808]'
                  : 'bg-transparent text-[#888888] hover:text-[#CCCCCC]'
              }`}
            >
              [ FOR SELLERS ]
            </button>
          </div>
        </div>

        {/* 2. 3-Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {steps.map((item) => (
            <div
              key={item.step}
              className="bg-[#080808] border border-[#1F1F1F] p-6 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif text-2xl font-bold text-[#F2EFE9] tracking-wider">
                    {item.step}
                  </span>
                  <span className="text-[10px] tracking-[0.16em] uppercase font-semibold text-[#10B981] border border-[#193829] bg-[#091812] px-2 py-0.5">
                    {item.label}
                  </span>
                </div>
                <h3 className="font-serif text-[17px] text-[#F2EFE9] uppercase tracking-[0.04em] mb-2 font-bold">
                  {item.title}
                </h3>
                <p className="text-[12px] text-[#8E8E8E] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#161616] text-[10px] tracking-[0.14em] uppercase text-[#777777] font-medium">
                {item.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Action Link Banner */}
        <div className="mt-8 pt-6 border-t border-[#1F1F1F] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span className="text-[#888888] tracking-wide">
            {activeWorkflow === 'BUYERS'
              ? 'Ready to collect authentic figures with zero risk?'
              : 'Have grail figures you want to sell to serious collectors?'}
          </span>
          <Link
            href={activeWorkflow === 'BUYERS' ? '/#stage-2' : '/sell'}
            className="px-5 py-2.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] font-semibold uppercase tracking-[0.14em] transition-none text-[11px] no-underline rounded-none"
          >
            {activeWorkflow === 'BUYERS' ? '[ BROWSE ALL FIGURES ]' : '[ LIST YOUR GRAIL NOW ]'}
          </Link>
        </div>
      </div>

      {/* 3. Homepage FAQ Section */}
      <div className="mt-12 bg-[#0C0C0C] border border-[#1F1F1F] p-6 sm:p-8">
        <div className="border-b border-[#1F1F1F] pb-4 mb-6">
          <span className="block mb-1 text-[10px] tracking-[0.2em] text-[#777777] uppercase font-semibold">
            CLEAR ANSWERS • ZERO JARGON
          </span>
          <h2 className="font-serif text-2xl text-[#F2EFE9] uppercase tracking-[0.05em] font-bold">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="divide-y divide-[#161616]">
          {HOMEPAGE_FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={faq.question} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left flex items-center justify-between gap-4 text-[13px] font-semibold text-[#F2EFE9] hover:text-white transition-none cursor-pointer"
                >
                  <span className="uppercase tracking-[0.04em]">{faq.question}</span>
                  <span className="text-[#777777] font-mono text-sm shrink-0">
                    {isOpen ? '[-]' : '[+]'}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-3 text-[12px] text-[#8E8E8E] leading-relaxed max-w-3xl pr-4">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-[#161616] flex justify-between items-center text-[11px] text-[#777777] uppercase tracking-wider">
          <span>HAVE MORE QUESTIONS?</span>
          <Link href="/faq" className="text-[#F2EFE9] hover:underline no-underline">
            [ VIEW FULL FAQ &amp; HELP DESK → ]
          </Link>
        </div>
      </div>
    </section>
  );
}
