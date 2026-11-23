'use client';

/**
 * @file src/app/contact/page.tsx
 *
 * Contact Support & Grievance Desk for OtakuBazaar.
 * Complies with Indian E-Commerce and IT Act requirements:
 * - Direct customer support email
 * - Contact inquiry form
 * - Grievance Officer details
 * - Corporate legal entity reference with TODO for lawyer review
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';

export default function ContactPage(): React.JSX.Element {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [topic, setTopic] = useState('ORDER_SUPPORT');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission to support desk
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

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
            <span className="text-[#F2EFE9]">Contact &amp; Grievance Desk</span>
          </div>

          <div className="flex items-center gap-2 border border-[#193829] bg-[#091812] px-3 py-1">
            <span className="w-1.5 h-1.5 bg-[#10B981] inline-block" />
            <span className="text-[#10B981]">TURNAROUND: 24–48 BUSINESS HOURS</span>
          </div>
        </div>

        {/* Header */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 sm:p-8">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold border border-[#1F1F1F] bg-[#080808] px-2.5 py-1 inline-block mb-3">
            CUSTOMER SUPPORT &amp; ARBITRATION
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-[0.06em] text-[#F2EFE9]">
            Contact Desk
          </h1>
          <p className="text-[13px] text-[#8E8E8E] leading-relaxed max-w-2xl mt-2">
            Have questions about an order, need dispute assistance with an unboxing video, or want to inquire about consignments? We are here to help.
          </p>
        </div>

        {/* 2-Column Layout: Direct Details vs Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Info Column */}
          <div className="md:col-span-5 space-y-6">
            {/* Direct Support Card */}
            <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-5 space-y-3">
              <span className="text-[10px] tracking-[0.18em] text-[#777777] uppercase font-semibold block">
                DIRECT CHANNELS
              </span>
              <div className="space-y-1">
                <span className="text-[11px] text-[#8E8E8E] block">Customer Support Email:</span>
                <a
                  href="mailto:support@otakubazaar.com"
                  className="font-mono text-[13px] text-[#F2EFE9] hover:underline block"
                >
                  support@otakubazaar.com
                </a>
              </div>
              <div className="space-y-1 pt-2 border-t border-[#161616]">
                <span className="text-[11px] text-[#8E8E8E] block">Dispute &amp; Unboxing Escalations:</span>
                <a
                  href="mailto:disputes@otakubazaar.com"
                  className="font-mono text-[13px] text-[#F2EFE9] hover:underline block"
                >
                  disputes@otakubazaar.com
                </a>
              </div>
              <div className="pt-2 text-[10px] text-[#777777] uppercase tracking-wider">
                Support Hours: Monday – Saturday (10:00 AM – 7:00 PM IST)
              </div>
            </div>

            {/* Grievance Redressal Card */}
            <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#161616] pb-2">
                <span className="text-[10px] tracking-[0.18em] text-[#777777] uppercase font-semibold">
                  STATUTORY GRIEVANCE DESK
                </span>
                <span className="text-[9px] text-[#10B981] font-semibold border border-[#193829] bg-[#091812] px-1.5 py-0.5">
                  IT RULES 2021
                </span>
              </div>
              <p className="text-[11px] text-[#8E8E8E] leading-relaxed">
                In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020:
              </p>
              <div className="text-[11px] space-y-1 text-[#CCCCCC]">
                <div><strong className="text-[#F2EFE9]">Grievance Officer:</strong> Grievance Redressal Officer</div>
                <div><strong className="text-[#F2EFE9]">Email:</strong> <a href="mailto:grievance@otakubazaar.com" className="text-[#F2EFE9] underline">grievance@otakubazaar.com</a></div>
                <div><strong className="text-[#F2EFE9]">Response SLA:</strong> Acknowledged within 48 hours; resolved within 30 days.</div>
              </div>
              {/* TODO: Lawyer review - Verify registered entity name and office address upon incorporation */}
              <div className="pt-2 border-t border-[#161616] text-[10px] text-[#666666] leading-tight">
                Corporate Entity: OtakuBazaar Internet Services Private Limited (Proposed) • Mumbai, Maharashtra, India
              </div>
            </div>
          </div>

          {/* Right Inquiry Form */}
          <div className="md:col-span-7 bg-[#0C0C0C] border border-[#1F1F1F] p-6 sm:p-8">
            <h2 className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.04em] font-bold mb-4">
              Send an Inquiry
            </h2>

            {isSuccess ? (
              <div className="p-6 bg-[#091812] border border-[#193829] text-center space-y-3">
                <span className="text-[11px] tracking-[0.16em] uppercase text-[#10B981] font-bold block">
                  [ INQUIRY TRANSMITTED SUCCESSFULLY ]
                </span>
                <p className="text-xs text-[#8E8E8E]">
                  Our support team has logged your ticket and will respond via email to <strong className="text-[#F2EFE9]">{email}</strong> within 24–48 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="mt-3 px-4 py-2 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[10px] uppercase tracking-wider font-semibold"
                >
                  [ SUBMIT ANOTHER INQUIRY ]
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.14em] text-[#888888] font-medium block mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3.5 py-2.5 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.14em] text-[#888888] font-medium block mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="collector@example.com"
                    className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3.5 py-2.5 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.14em] text-[#888888] font-medium block mb-1.5">
                      Inquiry Topic *
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none"
                    >
                      <option value="ORDER_SUPPORT">Order Status &amp; Tracking</option>
                      <option value="DISPUTE_UNBOXING">Dispute &amp; Unboxing Video</option>
                      <option value="SELLER_CONSIGNMENT">Seller Onboarding &amp; Payouts</option>
                      <option value="GENERAL_QUESTION">General Question</option>
                      <option value="GRIEVANCE">Statutory Grievance</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-[0.14em] text-[#888888] font-medium block mb-1.5">
                      Order / Lot Reference (Optional)
                    </label>
                    <input
                      type="text"
                      value={orderRef}
                      onChange={(e) => setOrderRef(e.target.value)}
                      placeholder="e.g. LOT-0001"
                      className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3.5 py-2.5 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.14em] text-[#888888] font-medium block mb-1.5">
                    Your Message / Description *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry or dispute details in detail..."
                    className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] p-3 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#F2EFE9] hover:bg-[#EAE6DF] text-[#080808] border border-[#F2EFE9] font-semibold text-[11px] uppercase tracking-[0.16em] transition-none cursor-pointer rounded-none disabled:opacity-50"
                >
                  {isSubmitting ? '[ TRANSMITTING INQUIRY... ]' : '[ SEND MESSAGE TO SUPPORT ]'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="mt-20">
        <ArchivalFooter />
      </div>
    </div>
  );
}
