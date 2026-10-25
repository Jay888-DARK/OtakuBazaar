'use client';

/**
 * @file src/app/vault/page.tsx
 *
 * Collector Vault Portfolio & Offer Management Dashboard for OtakuBazaar.
 * Strictly adheres to the dark archival vault visual language:
 *
 * 3 Clean Architectural Tabs:
 * - [ 01 // MY DIGITAL SHELF & CONSIGNMENTS ]: Active listings & personal custody lots.
 * - [ 02 // LIVE BARGAINING LEDGER ]: Incoming & outgoing buyer offers with 24H countdowns & [ ACCEPT ] / [ COUNTER ] / [ REJECT ].
 * - [ 03 // ESCROW DISPATCH & AWB TRACKER ]: BlueDart/Delhivery AWB input, pre-dispatch photo verification, 48H inspection countdown.
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
];

const INITIAL_OFFERS: BargainOffer[] = [
  {
    id: 'offer-101',
    lotRef: 'LOT-0481',
    itemTitle: 'Kyojuro Rengoku 1/8 Flame Breathing Scale',
    buyerHandle: '@tanjiro_collector_in',
    askingPrice: 28500,
    offeredPrice: 24225,
    expiresInHours: 23,
    status: 'PENDING',
  },
  {
    id: 'offer-102',
    lotRef: 'LOT-0485',
    itemTitle: 'Satoru Gojo Hollow Purple 1/7 Scramble',
    buyerHandle: '@delhi_grails_99',
    askingPrice: 36000,
    offeredPrice: 31500,
    expiresInHours: 18,
    status: 'PENDING',
  },
];

const INITIAL_DISPATCHES: DispatchTracker[] = [
  {
    id: 'disp-01',
    lotRef: 'LOT-0483',
    itemTitle: 'Edward Elric Fullmetal Alchemist GEM',
    carrier: 'BLUEDART AIR',
    awbNumber: 'BD-789421094-IN',
    status: 'INSPECTION_WINDOW_ACTIVE',
    inspectionHoursLeft: 36,
    destinationCity: 'NEW DELHI, DL',
  },
  {
    id: 'disp-02',
    lotRef: 'LOT-0487',
    itemTitle: 'Nendoroid Denji Chainsaw Man Edition',
    carrier: 'DELHIVERY SURFACE',
    awbNumber: 'DEL-992384110',
    status: 'IN_TRANSIT',
    inspectionHoursLeft: 48,
    destinationCity: 'CHENNAI, TN',
  },
];

export default function CollectorVaultDashboardPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'SHELF' | 'LEDGER' | 'DISPATCH'>('SHELF');
  const [shelf] = useState<ShelfItem[]>(INITIAL_SHELF);
  const [offers, setOffers] = useState<BargainOffer[]>(INITIAL_OFFERS);
  const [dispatches, setDispatches] = useState<DispatchTracker[]>(INITIAL_DISPATCHES);
  const [newAwbInput, setNewAwbInput] = useState<string>('');
  const [selectedCarrier, setSelectedCarrier] = useState<'BLUEDART AIR' | 'DELHIVERY SURFACE'>('BLUEDART AIR');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

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
    };

    setDispatches([newDisp, ...dispatches]);
    setNewAwbInput('');
    setActionFeedback(`INSURED SHIPMENT RECORDED // AWB ${newDisp.awbNumber}`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F2EFE9] select-none py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1F1F1F] pb-4 gap-2 text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors no-underline text-[#777777]">
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

        {/* Masthead: Portfolio Valuation Overview */}
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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t lg:border-t-0 border-[#161616] pt-4 lg:pt-0">
            <div className="p-3.5 border border-[#1F1F1F] bg-[#080808]">
              <span className="block text-[9px] uppercase tracking-[0.16em] text-[#777777]">
                TOTAL VAULT VALUE
              </span>
              <span className="font-serif text-xl sm:text-2xl text-[#F2EFE9] font-bold block mt-1">
                ₹{totalVaultValue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3.5 border border-[#1F1F1F] bg-[#080808]">
              <span className="block text-[9px] uppercase tracking-[0.16em] text-[#777777]">
                VAULTED LOTS
              </span>
              <span className="font-serif text-xl sm:text-2xl text-[#F2EFE9] font-bold block mt-1">
                {shelf.length} GRAILS
              </span>
            </div>
            <div className="p-3.5 border border-[#193829] bg-[#091812] col-span-2 sm:col-span-1">
              <span className="block text-[9px] uppercase tracking-[0.16em] text-[#10B981] font-semibold">
                ACTIVE OFFERS
              </span>
              <span className="font-serif text-xl sm:text-2xl text-[#10B981] font-bold block mt-1">
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

        {/* 3 Clean Architectural Tabs */}
        <div className="flex border-b border-[#1F1F1F] gap-2 overflow-x-auto scrollbar-none pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('SHELF')}
            className={`px-5 py-3 text-[11px] uppercase tracking-[0.16em] font-semibold border transition-colors cursor-pointer rounded-none whitespace-nowrap ${
              activeTab === 'SHELF'
                ? 'bg-[#F2EFE9] text-[#080808] border-[#F2EFE9]'
                : 'bg-[#0C0C0C] text-[#888888] border-[#1F1F1F] hover:border-[#3A3A3A]'
            }`}
          >
            [ 01 // MY DIGITAL SHELF &amp; CONSIGNMENTS ]
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LEDGER')}
            className={`px-5 py-3 text-[11px] uppercase tracking-[0.16em] font-semibold border transition-colors cursor-pointer rounded-none whitespace-nowrap ${
              activeTab === 'LEDGER'
                ? 'bg-[#F2EFE9] text-[#080808] border-[#F2EFE9]'
                : 'bg-[#0C0C0C] text-[#888888] border-[#1F1F1F] hover:border-[#3A3A3A]'
            }`}
          >
            [ 02 // LIVE BARGAINING LEDGER ({offers.filter((o) => o.status === 'PENDING').length}) ]
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DISPATCH')}
            className={`px-5 py-3 text-[11px] uppercase tracking-[0.16em] font-semibold border transition-colors cursor-pointer rounded-none whitespace-nowrap ${
              activeTab === 'DISPATCH'
                ? 'bg-[#F2EFE9] text-[#080808] border-[#F2EFE9]'
                : 'bg-[#0C0C0C] text-[#888888] border-[#1F1F1F] hover:border-[#3A3A3A]'
            }`}
          >
            [ 03 // ESCROW DISPATCH &amp; AWB TRACKER ]
          </button>
        </div>

        {/* TAB 01: MY DIGITAL SHELF & CONSIGNMENTS */}
        {activeTab === 'SHELF' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold">
                ACTIVE COLLECTOR CONSIGNMENTS &amp; IN-HAND SHELF
              </span>
              <Link
                href="/sell"
                className="px-4 py-2 border border-[#1F1F1F] bg-[#0C0C0C] hover:bg-[#F2EFE9] hover:text-[#080808] hover:border-[#F2EFE9] text-[#CCCCCC] text-[11px] uppercase tracking-[0.14em] font-semibold transition-colors no-underline"
              >
                [ + CONSIGN NEW GRAIL ]
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shelf.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0C0C0C] border border-[#1F1F1F] p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center text-[10px] tracking-[0.15em] text-[#777777] mb-2 uppercase">
                      <span>{item.lotRef}</span>
                      <span className="border border-[#2A2A2A] bg-[#080808] px-2 py-0.5 text-[#E5E5E5]">
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="relative aspect-[4/5] w-full p-2 bg-[#0A0A0A] border border-[#1A1A1A] my-3 overflow-hidden flex items-center justify-center">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-center"
                        unoptimized={item.imageUrl.startsWith('http')}
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] tracking-[0.14em] text-[#888888] uppercase block">
                        {item.series}
                      </span>
                      <h3 className="font-serif text-[16px] text-[#F2EFE9] uppercase tracking-[0.04em] line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="text-[10px] text-[#777777] uppercase tracking-[0.12em] pt-1">
                        {item.condition} • {item.boxGrade}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#161616]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] tracking-[0.14em] text-[#777777] uppercase">
                        EST. VALUATION
                      </span>
                      <span className="font-serif text-[18px] text-[#F2EFE9]">
                        ₹{item.valuation.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-[10px] tracking-[0.12em] uppercase font-semibold">
                      <Link
                        href={`/lot/${item.lotRef.toLowerCase()}`}
                        className="py-2 border border-[#1F1F1F] bg-[#080808] hover:border-[#F2EFE9] text-[#CCCCCC] hover:text-white transition-colors no-underline"
                      >
                        [ INSPECT LOT ]
                      </Link>
                      <button
                        type="button"
                        onClick={() => setActiveTab('LEDGER')}
                        className="py-2 border border-[#1F1F1F] bg-[#080808] hover:border-[#F2EFE9] text-[#CCCCCC] hover:text-white transition-colors cursor-pointer"
                      >
                        [ VIEW OFFERS ]
                      </button>
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
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold">
                INCOMING &amp; OUTGOING BUYER OFFERS • 24H BINDING WINDOW
              </span>
              <span className="text-[10px] text-[#10B981] font-semibold uppercase tracking-wider">
                INSTANT SETTLEMENT READY
              </span>
            </div>

            <div className="border border-[#1F1F1F] bg-[#0C0C0C] divide-y divide-[#161616]">
              {offers.map((offer) => (
                <div key={offer.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] tracking-[0.15em] text-[#777777] uppercase font-semibold">
                        {offer.lotRef}
                      </span>
                      <span className="text-[10px] tracking-[0.14em] text-[#10B981] font-semibold">
                        BUYER: {offer.buyerHandle}
                      </span>
                      <span className="border border-[#193829] bg-[#091812] px-2 py-0.5 text-[9px] text-[#10B981] font-bold uppercase">
                        {offer.expiresInHours}H REMAINING
                      </span>
                    </div>

                    <h3 className="font-serif text-[16px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                      {offer.itemTitle}
                    </h3>

                    <div className="flex items-center gap-4 text-[11px] text-[#888888] pt-1">
                      <span>ASKING: ₹{offer.askingPrice.toLocaleString('en-IN')}</span>
                      <span>·</span>
                      <span className="text-[#F2EFE9] font-semibold">
                        BUYER OFFER: ₹{offer.offeredPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[#10B981]">
                        ({Math.round(((offer.askingPrice - offer.offeredPrice) / offer.askingPrice) * 100)}% DISCOUNT)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {offer.status === 'PENDING' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOfferAction(offer.id, 'ACCEPT')}
                          className="px-4 py-2 bg-[#F2EFE9] hover:bg-white text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer rounded-none"
                        >
                          [ ACCEPT ]
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOfferAction(offer.id, 'REJECT')}
                          className="px-4 py-2 bg-[#080808] hover:bg-[#1F1F1F] text-[#CCCCCC] border border-[#1F1F1F] text-[11px] uppercase tracking-[0.14em] transition-colors cursor-pointer rounded-none"
                        >
                          [ REJECT ]
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider ${
                          offer.status === 'ACCEPTED'
                            ? 'bg-[#091812] border border-[#193829] text-[#10B981]'
                            : 'bg-[#180A0A] border border-[#7F1D1D] text-[#F87171]'
                        }`}
                      >
                        [ {offer.status} ]
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
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold">
                INSURED DISPATCH PROTOCOL &amp; 48H BUYER VERIFICATION STATUS
              </span>
              <span className="text-[10px] text-[#10B981] font-semibold uppercase tracking-wider">
                CARRIER INTEGRATION ACTIVE
              </span>
            </div>

            {/* Input Form for New AWB */}
            <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-4">
              <span className="text-[11px] uppercase tracking-[0.16em] text-[#F2EFE9] font-semibold block">
                ENTER DISPATCH AWB NUMBER FOR ACCEPTED LOT
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
                    className="w-full py-2.5 bg-[#F2EFE9] hover:bg-white text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer rounded-none"
                  >
                    [ RECORD DISPATCH ]
                  </button>
                </div>
              </form>
            </div>

            {/* Active Dispatch List */}
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

                  <div className="border border-[#1F1F1F] bg-[#080808] px-3.5 py-2 text-center">
                    <span className="block text-[9px] tracking-[0.14em] text-[#777777] uppercase">
                      ESCROW STATUS
                    </span>
                    <span className="font-sans text-[11px] text-[#10B981] font-semibold uppercase tracking-wider block mt-0.5">
                      {disp.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-20">
        <ArchivalFooter />
      </div>
    </div>
  );
}
