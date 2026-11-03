'use client';

/**
 * @file src/app/vault/page.tsx
 *
 * Collector Vault Portfolio, Offer Management & Escrow Invoice Hub for OtakuBazaar.
 * Strictly adheres to the dark archival vault visual language:
 * - High-contrast editorial typography (Playfair Display, Archivo, Titillium Web).
 * - 0px border-radius containers with hairline charcoal borders (#1F1F1F).
 * - Brutalist state transitions with 0ms transition duration.
 * - Zero pure white backgrounds, zero 3-feature cards in a row, zero drop shadows.
 * - Live Invoice Generation & IDOR-Secured PDF Downloads.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';

interface ShelfItem {
  id: string;
  lotRef: string;
  title: string;
  series: string;
  condition: string;
  boxGrade: string;
  valuation: number;
  custodyBay: string;
  status: 'ACTIVE_CONSIGNMENT' | 'PERSONAL_CUSTODY' | 'OFFER_PENDING';
  imageUrl: string;
}

interface BargainOffer {
  id: string;
  lotRef: string;
  itemTitle: string;
  buyerHandle: string;
  askingPrice: number;
  offeredPrice: number;
  expiresInHours: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
}

interface DispatchTracker {
  id: string;
  lotRef: string;
  itemTitle: string;
  carrier: 'BLUEDART AIR' | 'DELHIVERY SURFACE' | 'PENDING';
  awbNumber: string;
  status: 'AWAITING_AWB' | 'IN_TRANSIT' | 'INSPECTION_WINDOW_ACTIVE' | 'SETTLED';
  inspectionHoursLeft: number;
  destinationCity: string;
  orderId: string;
}

interface VaultInvoice {
  id: string;
  orderId: string;
  lotRef: string;
  itemTitle: string;
  amountINR: number;
  status: string;
  createdAt: string;
  checksum: string;
  downloadUrl: string;
}

const INITIAL_SHELF: ShelfItem[] = [
  {
    id: 'shelf-01',
    lotRef: 'LOT-0482',
    title: 'Guts Berserker Armor Unleashed 1/4 Scale',
    series: 'Berserk • Kentaro Miura Memorial',
    condition: 'S-RANK // MISB (FACTORY SEALED)',
    boxGrade: 'FACTORY CARTON SEALED',
    valuation: 124000,
    custodyBay: 'MUMBAI TERMINAL BAY 04',
    status: 'ACTIVE_CONSIGNMENT',
    imageUrl: '/showcase/guts_berserker_statue.jpg',
  },
  {
    id: 'shelf-02',
    lotRef: 'LOT-0481',
    title: 'Kyojuro Rengoku 1/8 Flame Breathing',
    series: 'Demon Slayer • Aniplex+ Exclusive',
    condition: 'S-RANK // MISB (FACTORY SEALED)',
    boxGrade: 'MINT BOX (BLISTER INTACT)',
    valuation: 28500,
    custodyBay: 'BENGALURU VAULT 02',
    status: 'OFFER_PENDING',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'shelf-03',
    lotRef: 'LOT-0484',
    title: 'Saber Altria Pendragon 1/7 Deluxe',
    series: 'Fate/Stay Night • Type-Moon Alter',
    condition: 'S-RANK // MISB (FACTORY SEALED)',
    boxGrade: 'MINT BOX (BLISTER INTACT)',
    valuation: 24500,
    custodyBay: 'AHMEDABAD PRIVATE STORAGE',
    status: 'PERSONAL_CUSTODY',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'shelf-04',
    lotRef: 'LOT-0486',
    title: 'Evangelion Unit-01 Metal Build 2026',
    series: 'Neon Genesis Evangelion • Bandai Tamashii',
    condition: 'S-RANK // MISB (FACTORY SEALED)',
    boxGrade: 'ORIGINAL OUTER BROWN BOX',
    valuation: 42000,
    custodyBay: 'TOKYO CENTRAL ARCHIVE',
    status: 'ACTIVE_CONSIGNMENT',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=85',
  },
];

const INITIAL_OFFERS: BargainOffer[] = [
  {
    id: 'offer-101',
    lotRef: 'LOT-0481',
    itemTitle: 'Kyojuro Rengoku 1/8 Flame Breathing Scale',
    buyerHandle: '@tanjiro_collector_in',
    askingPrice: 28500,
    offeredPrice: 24500,
    expiresInHours: 18,
    status: 'PENDING',
  },
  {
    id: 'offer-102',
    lotRef: 'LOT-0484',
    itemTitle: 'Saber Altria Pendragon 1/7 Deluxe',
    buyerHandle: '@shirou_grails_mumbai',
    askingPrice: 24500,
    offeredPrice: 22000,
    expiresInHours: 6,
    status: 'PENDING',
  },
];

const INITIAL_DISPATCHES: DispatchTracker[] = [
  {
    id: 'disp-01',
    lotRef: 'LOT-0482',
    itemTitle: 'Guts Berserker Armor Unleashed 1/4 Scale',
    carrier: 'BLUEDART AIR',
    awbNumber: 'BD-884920192',
    status: 'INSPECTION_WINDOW_ACTIVE',
    inspectionHoursLeft: 31,
    destinationCity: 'MUMBAI, MH',
    orderId: 'lot-0482',
  },
  {
    id: 'disp-02',
    lotRef: 'LOT-0481',
    itemTitle: 'Kyojuro Rengoku 1/8 Flame Breathing Scale',
    carrier: 'DELHIVERY SURFACE',
    awbNumber: 'DEL-991204122',
    status: 'IN_TRANSIT',
    inspectionHoursLeft: 48,
    destinationCity: 'BENGALURU, KA',
    orderId: 'lot-0481',
  },
];

export default function VaultPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'SHELF' | 'LEDGER' | 'DISPATCH' | 'INVOICES'>('SHELF');
  const [shelf] = useState<ShelfItem[]>(INITIAL_SHELF);
  const [offers, setOffers] = useState<BargainOffer[]>(INITIAL_OFFERS);
  const [dispatches, setDispatches] = useState<DispatchTracker[]>(INITIAL_DISPATCHES);
  const [invoices, setInvoices] = useState<VaultInvoice[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<'BLUEDART AIR' | 'DELHIVERY SURFACE'>('BLUEDART AIR');
  const [newAwbInput, setNewAwbInput] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState<string | null>(null);

  const totalVaultValue = shelf.reduce((acc, curr) => acc + curr.valuation, 0);

  const handleOfferAction = (offerId: string, action: 'ACCEPT' | 'REJECT') => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED' } : o))
    );
    setActionFeedback(`OFFER #${offerId} ${action === 'ACCEPT' ? 'ACCEPTED // FUNDS LOCKED IN ESCROW' : 'DECLINED'}`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleAddAwb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAwbInput.trim()) return;

    const newDisp: DispatchTracker = {
      id: `disp_${Date.now()}`,
      lotRef: 'LOT-0481',
      itemTitle: 'Kyojuro Rengoku 1/8 Flame Breathing Scale',
      carrier: selectedCarrier,
      awbNumber: newAwbInput.trim().toUpperCase(),
      status: 'IN_TRANSIT',
      inspectionHoursLeft: 48,
      destinationCity: 'BENGALURU, KA',
      orderId: 'lot-0481',
    };

    setDispatches([newDisp, ...dispatches]);
    setNewAwbInput('');
    setActionFeedback(`INSURED SHIPMENT RECORDED // AWB ${newDisp.awbNumber}`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleGenerateInvoice = async (orderId: string, lotRef: string, itemTitle: string) => {
    setIsGeneratingInvoice(orderId);
    setActionFeedback(`GENERATING AUTHORITATIVE TAX INVOICE FOR ${lotRef}...`);

    try {
      const res = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Invoice generation error');
      }

      const inv: VaultInvoice = {
        id: data.invoice.id,
        orderId: data.invoice.orderId,
        lotRef,
        itemTitle,
        amountINR: data.invoice.amountINR,
        status: 'AUTHENTICATED // ESCROW VERIFIED',
        createdAt: data.invoice.createdAt,
        checksum: data.invoice.checksum,
        downloadUrl: data.invoice.downloadUrl,
      };

      setInvoices((prev) => [inv, ...prev.filter((i) => i.id !== inv.id)]);
      setActionFeedback(`INVOICE ${inv.id} GENERATED & ANCHORED.`);
      setActiveTab('INVOICES');
    } catch (err: any) {
      setActionFeedback(`ERROR: ${err.message}`);
    } finally {
      setIsGeneratingInvoice(null);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F2EFE9] select-none py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1F1F1F] pb-4 gap-2 text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-none no-underline text-[#777777]">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-[#F2EFE9]">Collector Vault Portfolio</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#10B981]" />
            <span className="text-[#10B981]">ACCOUNT: @rengoku_vault • PAN-INDIA CUSTODY</span>
          </div>
        </div>

        {/* Masthead: 4-Column Balanced Grid (Strictly avoids 3-in-a-row) */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold border border-[#1F1F1F] bg-[#080808] px-2.5 py-1">
              INSTITUTIONAL VAULT LEDGER
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-[0.06em] text-[#F2EFE9]">
              Collector Vault
            </h1>
            <p className="text-[13px] text-[#8E8E8E] leading-relaxed max-w-xl">
              Real-time portfolio management of authenticated Japanese collectibles, pending buyer offers, and 48-hour escrow tracking.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t lg:border-t-0 border-[#161616] pt-4 lg:pt-0">
            <div className="p-3.5 border border-[#1F1F1F] bg-[#080808]">
              <span className="block text-[9px] uppercase tracking-[0.16em] text-[#777777]">
                TOTAL VAULT VALUE
              </span>
              <span className="font-serif text-lg sm:text-xl text-[#F2EFE9] font-bold block mt-1">
                ₹{totalVaultValue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3.5 border border-[#1F1F1F] bg-[#080808]">
              <span className="block text-[9px] uppercase tracking-[0.16em] text-[#777777]">
                VAULTED LOTS
              </span>
              <span className="font-serif text-lg sm:text-xl text-[#F2EFE9] font-bold block mt-1">
                {shelf.length} GRAILS
              </span>
            </div>
            <div className="p-3.5 border border-[#1F1F1F] bg-[#080808]">
              <span className="block text-[9px] uppercase tracking-[0.16em] text-[#777777]">
                DISPATCH CUSTODY
              </span>
              <span className="font-serif text-lg sm:text-xl text-[#F2EFE9] font-bold block mt-1">
                {dispatches.length} ACTIVE
              </span>
            </div>
            <div className="p-3.5 border border-[#193829] bg-[#091812]">
              <span className="block text-[9px] uppercase tracking-[0.16em] text-[#10B981] font-semibold">
                ACTIVE OFFERS
              </span>
              <span className="font-serif text-lg sm:text-xl text-[#10B981] font-bold block mt-1">
                {offers.filter((o) => o.status === 'PENDING').length} PENDING
              </span>
            </div>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="p-3 bg-[#091812] border border-[#193829] text-[11px] text-[#10B981] uppercase tracking-[0.14em] font-semibold text-center">
            [ {actionFeedback} ]
          </div>
        )}

        {/* Clean 4-Tab Navigation */}
        <div className="flex border-b border-[#1F1F1F] gap-2 overflow-x-auto scrollbar-none pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('SHELF')}
            className={`px-5 py-3 text-[11px] uppercase tracking-[0.16em] font-semibold border cursor-pointer rounded-none whitespace-nowrap transition-none ${
              activeTab === 'SHELF'
                ? 'bg-[#F2EFE9] text-[#080808] border-[#F2EFE9]'
                : 'bg-[#0C0C0C] text-[#888888] border-[#1F1F1F]'
            }`}
          >
            [ 01 // MY DIGITAL SHELF ({shelf.length}) ]
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LEDGER')}
            className={`px-5 py-3 text-[11px] uppercase tracking-[0.16em] font-semibold border cursor-pointer rounded-none whitespace-nowrap transition-none ${
              activeTab === 'LEDGER'
                ? 'bg-[#F2EFE9] text-[#080808] border-[#F2EFE9]'
                : 'bg-[#0C0C0C] text-[#888888] border-[#1F1F1F]'
            }`}
          >
            [ 02 // BARGAINING LEDGER ({offers.filter((o) => o.status === 'PENDING').length}) ]
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DISPATCH')}
            className={`px-5 py-3 text-[11px] uppercase tracking-[0.16em] font-semibold border cursor-pointer rounded-none whitespace-nowrap transition-none ${
              activeTab === 'DISPATCH'
                ? 'bg-[#F2EFE9] text-[#080808] border-[#F2EFE9]'
                : 'bg-[#0C0C0C] text-[#888888] border-[#1F1F1F]'
            }`}
          >
            [ 03 // ESCROW DISPATCH ({dispatches.length}) ]
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('INVOICES')}
            className={`px-5 py-3 text-[11px] uppercase tracking-[0.16em] font-semibold border cursor-pointer rounded-none whitespace-nowrap transition-none ${
              activeTab === 'INVOICES'
                ? 'bg-[#F2EFE9] text-[#080808] border-[#F2EFE9]'
                : 'bg-[#0C0C0C] text-[#888888] border-[#1F1F1F]'
            }`}
          >
            [ 04 // TAX INVOICES &amp; RECEIPTS ({invoices.length}) ]
          </button>
        </div>

        {/* TAB 01: MY DIGITAL SHELF & CONSIGNMENTS (2-Column Grid) */}
        {activeTab === 'SHELF' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold">
                ACTIVE COLLECTOR CONSIGNMENTS &amp; IN-HAND SHELF
              </span>
              <Link
                href="/sell"
                className="px-4 py-2 border border-[#1F1F1F] bg-[#0C0C0C] hover:bg-[#F2EFE9] hover:text-[#080808] hover:border-[#F2EFE9] text-[#CCCCCC] text-[11px] uppercase tracking-[0.14em] font-semibold transition-none no-underline"
              >
                [ + CONSIGN NEW GRAIL ]
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shelf.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0C0C0C] border border-[#1F1F1F] p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center text-[10px] tracking-[0.15em] text-[#777777] mb-2 uppercase">
                      <span>{item.lotRef}</span>
                      <span className="text-[#10B981] font-semibold">{item.status.replace(/_/g, ' ')}</span>
                    </div>

                    <div className="relative aspect-[16/9] w-full bg-[#080808] border border-[#1A1A1A] mb-4 overflow-hidden">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>

                    <span className="text-[10px] tracking-[0.16em] uppercase text-[#888888] block">
                      {item.series}
                    </span>
                    <h3 className="font-serif text-[17px] text-[#F2EFE9] uppercase tracking-[0.04em] mt-1 leading-snug">
                      {item.title}
                    </h3>

                    <div className="mt-3 pt-3 border-t border-[#161616] space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-[#8E8E8E]">
                        <span>Condition Grade</span>
                        <span className="text-[#E5E5E5] font-semibold">{item.condition}</span>
                      </div>
                      <div className="flex justify-between text-[#8E8E8E]">
                        <span>Box Status</span>
                        <span className="text-[#E5E5E5]">{item.boxGrade}</span>
                      </div>
                      <div className="flex justify-between text-[#8E8E8E]">
                        <span>Physical Custody Bay</span>
                        <span className="text-[#E5E5E5]">{item.custodyBay}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#1F1F1F] flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.15em] text-[#777777] block">
                        ESTIMATED LIQUIDITY
                      </span>
                      <span className="font-serif text-[18px] text-[#F2EFE9] font-bold">
                        ₹{item.valuation.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerateInvoice(item.lotRef.toLowerCase(), item.lotRef, item.title)}
                        className="px-3 py-1.5 bg-[#080808] border border-[#1F1F1F] hover:border-[#3A3A3A] text-[10px] uppercase tracking-[0.14em] text-[#CCCCCC] transition-none cursor-pointer"
                      >
                        [ GET INVOICE ]
                      </button>
                      <Link
                        href={`/lot/${item.lotRef.toLowerCase()}`}
                        className="px-3 py-1.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[10px] uppercase tracking-[0.14em] font-semibold transition-none no-underline"
                      >
                        [ INSPECT ]
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 02: LIVE BARGAINING LEDGER */}
        {activeTab === 'LEDGER' && (
          <div className="space-y-6">
            <div className="border border-[#1F1F1F] bg-[#0C0C0C] divide-y divide-[#161616]">
              {offers.map((offer) => (
                <div key={offer.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] tracking-[0.15em] text-[#777777] uppercase font-semibold">
                        {offer.lotRef}
                      </span>
                      <span className="text-[10px] tracking-[0.14em] text-[#CCCCCC]">
                        BIDDER: {offer.buyerHandle}
                      </span>
                      <span className="border border-[#193829] bg-[#091812] px-2 py-0.5 text-[9px] text-[#10B981] font-bold uppercase">
                        {offer.expiresInHours}H EXPIRES
                      </span>
                    </div>

                    <h3 className="font-serif text-[16px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                      {offer.itemTitle}
                    </h3>

                    <div className="flex items-center gap-4 text-[12px] pt-1">
                      <span className="text-[#777777]">
                        Asking: <strong className="text-[#CCCCCC]">₹{offer.askingPrice.toLocaleString('en-IN')}</strong>
                      </span>
                      <span className="text-[#10B981] font-bold">
                        Offer: ₹{offer.offeredPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {offer.status === 'PENDING' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOfferAction(offer.id, 'ACCEPT')}
                          className="px-4 py-2 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.14em] transition-none cursor-pointer rounded-none"
                        >
                          [ ACCEPT &amp; LOCK ]
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOfferAction(offer.id, 'REJECT')}
                          className="px-4 py-2 bg-[#080808] text-[#888888] hover:text-[#CCCCCC] border border-[#1F1F1F] text-[11px] font-semibold uppercase tracking-[0.14em] transition-none cursor-pointer rounded-none"
                        >
                          [ DECLINE ]
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1.5 border border-[#1F1F1F] bg-[#080808] text-[10px] tracking-[0.15em] uppercase text-[#10B981]">
                        {offer.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 03: ESCROW DISPATCH & AWB TRACKER */}
        {activeTab === 'DISPATCH' && (
          <div className="space-y-6">
            <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-6 space-y-4">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold block">
                CARRIER DISPATCH &amp; AWB INPUT
              </span>
              <form onSubmit={handleAddAwb} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-[10px] uppercase tracking-[0.14em] text-[#777777] mb-1.5 font-medium">
                    Carrier Partner *
                  </label>
                  <select
                    value={selectedCarrier}
                    onChange={(e) => setSelectedCarrier(e.target.value as any)}
                    className="w-full bg-[#080808] border border-[#1F1F1F] px-3 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none"
                  >
                    <option value="BLUEDART AIR">BlueDart Air (Insured Flight)</option>
                    <option value="DELHIVERY SURFACE">Delhivery Surface (Foam Crate)</option>
                  </select>
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-[10px] uppercase tracking-[0.14em] text-[#777777] mb-1.5 font-medium">
                    AWB Tracking Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., BD-924184910-IN"
                    value={newAwbInput}
                    onChange={(e) => setNewAwbInput(e.target.value)}
                    className="w-full bg-[#080808] border border-[#1F1F1F] px-3 py-2.5 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none uppercase"
                  />
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.14em] transition-none cursor-pointer rounded-none"
                  >
                    [ RECORD DISPATCH ]
                  </button>
                </div>
              </form>
            </div>

            <div className="border border-[#1F1F1F] bg-[#0C0C0C] divide-y divide-[#161616]">
              {dispatches.map((disp) => (
                <div key={disp.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] tracking-[0.15em] text-[#777777] uppercase font-semibold">
                        {disp.lotRef}
                      </span>
                      <span className="text-[10px] tracking-[0.14em] text-[#CCCCCC]">
                        {disp.carrier} • {disp.awbNumber}
                      </span>
                      <span className="border border-[#193829] bg-[#091812] px-2 py-0.5 text-[9px] text-[#10B981] font-bold uppercase">
                        DESTINATION: {disp.destinationCity}
                      </span>
                    </div>

                    <h3 className="font-serif text-[16px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                      {disp.itemTitle}
                    </h3>

                    <div className="text-[11px] text-[#8E8E8E] pt-1">
                      {disp.status === 'INSPECTION_WINDOW_ACTIVE'
                        ? `Buyer received specimen. 48-Hour Inspection window active (${disp.inspectionHoursLeft}h left until escrow release).`
                        : 'Specimen in transit under carrier custody. Anti-bootleg unboxing video required upon delivery.'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleGenerateInvoice(disp.orderId, disp.lotRef, disp.itemTitle)}
                      className="px-3.5 py-2 bg-[#080808] border border-[#1F1F1F] hover:border-[#3A3A3A] text-[11px] uppercase tracking-[0.14em] text-[#CCCCCC] cursor-pointer transition-none rounded-none"
                    >
                      [ TAX INVOICE ]
                    </button>
                    <div className="border border-[#1F1F1F] bg-[#080808] px-3.5 py-2 text-center">
                      <span className="block text-[9px] tracking-[0.14em] text-[#777777] uppercase">
                        ESCROW STATUS
                      </span>
                      <span className="font-sans text-[11px] text-[#10B981] font-semibold uppercase tracking-wider block mt-0.5">
                        {disp.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 04: TAX INVOICES & RECEIPTS */}
        {activeTab === 'INVOICES' && (
          <div className="space-y-6">
            <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold border border-[#1F1F1F] bg-[#080808] px-2.5 py-1 inline-block mb-2">
                  SECURITY &amp; COMPLIANCE DIRECTIVE
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-[#F2EFE9] uppercase tracking-[0.04em]">
                  Authoritative Tax Invoices &amp; Escrow Receipts
                </h2>
                <p className="text-[12px] text-[#8E8E8E] mt-1 max-w-2xl">
                  Generated invoices include Indian GST 18% tax breakdowns, double-entry escrow verification, and SHA-256 cryptographic digests. Downloads are protected by strict Object-Level Access Control (IDOR prevention).
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerateInvoice('lot-0482', 'LOT-0482', 'Guts Berserker Armor Unleashed 1/4 Scale')}
                  disabled={isGeneratingInvoice === 'lot-0482'}
                  className="px-4 py-2.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.14em] cursor-pointer rounded-none transition-none disabled:opacity-50"
                >
                  {isGeneratingInvoice === 'lot-0482' ? '[ GENERATING... ]' : '[ + GENERATE LOT-0482 INVOICE ]'}
                </button>
              </div>
            </div>

            {/* Skeleton Loading State */}
            {isGeneratingInvoice && (
              <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-5 space-y-3 animate-pulse">
                <div className="h-3 w-48 bg-[#161616]" />
                <div className="h-5 w-80 bg-[#1A1A1A]" />
                <div className="h-3 w-64 bg-[#141414]" />
              </div>
            )}

            {/* Invoices List */}
            {invoices.length === 0 && !isGeneratingInvoice ? (
              <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-12 text-center space-y-3">
                <span className="text-[10px] tracking-[0.2em] text-[#777777] uppercase block">
                  NO INVOICES GENERATED YET
                </span>
                <p className="text-xs text-[#8E8E8E] max-w-md mx-auto">
                  Click below to generate an authoritative tax receipt with cryptographic SHA-256 integrity checks.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateInvoice('lot-0482', 'LOT-0482', 'Guts Berserker Armor Unleashed 1/4 Scale')}
                    className="px-5 py-2.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.14em] cursor-pointer rounded-none transition-none"
                  >
                    [ GENERATE SAMPLE ESCROW INVOICE ]
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-[#1F1F1F] bg-[#0C0C0C] divide-y divide-[#161616]">
                {invoices.map((inv) => (
                  <div key={inv.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono tracking-[0.15em] text-[#F2EFE9] font-bold">
                          {inv.id}
                        </span>
                        <span className="text-[10px] tracking-[0.14em] text-[#777777] uppercase">
                          LOT: {inv.lotRef} • ORDER: {inv.orderId}
                        </span>
                        <span className="border border-[#193829] bg-[#091812] px-2 py-0.5 text-[9px] text-[#10B981] font-bold uppercase">
                          {inv.status}
                        </span>
                      </div>

                      <h3 className="font-serif text-[16px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                        {inv.itemTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#8E8E8E] pt-1">
                        <span>Total Settled: <strong className="text-[#F2EFE9]">₹{inv.amountINR.toLocaleString('en-IN')}</strong></span>
                        <span>Date: {new Date(inv.createdAt).toLocaleDateString('en-IN')}</span>
                        <span className="font-mono text-[10px] text-[#777777]">
                          SHA-256: {inv.checksum.substring(0, 16)}...
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={inv.downloadUrl}
                        download
                        className="px-4 py-2.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.14em] transition-none rounded-none no-underline block text-center"
                      >
                        [ DOWNLOAD INVOICE (PDF) ]
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-20">
        <ArchivalFooter />
      </div>
    </div>
  );
}
