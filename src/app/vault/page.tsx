'use client';

/**
 * @file src/app/vault/page.tsx
 *
 * Collector Vault Portfolio, Offer Management & Escrow Invoice Hub for OtakuBazaar.
 * Strictly adheres to the dark archival vault visual language:
 * - High-contrast editorial typography (Playfair Display, Archivo, Titillium Web).
 * - 0px border-radius containers with hairline charcoal borders (#1F1F1F).
 * - Brutalist state transitions with 0ms transition duration.
 * - Zero pure white backgrounds, zero drop shadows.
 * - Live "MY LISTED ITEMS" management with instant Edit & Delete capabilities.
 * - Live Invoice Generation & IDOR-Secured PDF Downloads.
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';
import type { PublicLotDTO } from '@/app/api/listings/route';
import { optimizeImageUrl } from '@/infrastructure/utils/imageOptimizer';

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

const INITIAL_SHELF: ShelfItem[] = [];
const INITIAL_OFFERS: BargainOffer[] = [];
const INITIAL_DISPATCHES: DispatchTracker[] = [];

export default function VaultPage(): React.JSX.Element {
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<'MY_LISTINGS' | 'SHELF' | 'LEDGER' | 'DISPATCH' | 'INVOICES'>('MY_LISTINGS');
  const [shelf] = useState<ShelfItem[]>(INITIAL_SHELF);
  const [offers, setOffers] = useState<BargainOffer[]>(INITIAL_OFFERS);
  const [dispatches, setDispatches] = useState<DispatchTracker[]>(INITIAL_DISPATCHES);
  const [invoices, setInvoices] = useState<VaultInvoice[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<'BLUEDART AIR' | 'DELHIVERY SURFACE'>('BLUEDART AIR');
  const [newAwbInput, setNewAwbInput] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState<string | null>(null);

  // My Listings State
  const [myListings, setMyListings] = useState<PublicLotDTO[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState<boolean>(true);

  // Edit Modal State
  const [editingLot, setEditingLot] = useState<PublicLotDTO | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    askingPriceINR: 0,
    condition: 'NEW' as 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR',
    category: 'Scale Figure',
    description: '',
    imageUrl: '',
  });
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingLot, setDeletingLot] = useState<PublicLotDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch Seller's active listings from API
  const fetchMyListings = useCallback(async () => {
    setIsLoadingListings(true);
    try {
      const res = await fetch('/api/listings?my=true');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setMyListings(data.items);
        }
      }
    } catch (err) {
      console.error('Failed to retrieve seller listings:', err);
    } finally {
      setIsLoadingListings(false);
    }
  }, []);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const totalVaultValue =
    shelf.reduce((acc, curr) => acc + curr.valuation, 0) +
    myListings.reduce((acc, curr) => acc + (curr.asking_price || 0), 0);

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
      lotRef: 'LOT-DISPATCH',
      itemTitle: 'Insured Collectible Consignment',
      carrier: selectedCarrier,
      awbNumber: newAwbInput.trim().toUpperCase(),
      status: 'IN_TRANSIT',
      inspectionHoursLeft: 48,
      destinationCity: 'BENGALURU, KA',
      orderId: `ord_${Date.now().toString().slice(-4)}`,
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

  // Open Edit Modal with pre-filled lot values
  const handleOpenEdit = (lot: PublicLotDTO) => {
    setEditingLot(lot);
    setEditError(null);
    setEditForm({
      title: lot.title,
      askingPriceINR: lot.asking_price || Math.round(lot.askingPriceAmount / 100),
      condition: (lot.condition as any) || 'NEW',
      category: lot.category || 'Scale Figure',
      description: 'Verified archival anime collectible consigned to OtakuBazaar vault custody.',
      imageUrl: lot.images[0] || lot.imageUrls[0] || '',
    });
  };

  // Submit Edit form via PATCH /api/listings/[id]
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLot) return;

    setIsSavingEdit(true);
    setEditError(null);

    try {
      const payload: Record<string, unknown> = {
        title: editForm.title.trim(),
        askingPriceINR: Number(editForm.askingPriceINR),
        condition: editForm.condition,
        category: editForm.category.trim(),
      };

      if (editForm.description.trim()) {
        payload['description'] = editForm.description.trim();
      }

      if (editForm.imageUrl.trim()) {
        payload['imageUrls'] = [editForm.imageUrl.trim()];
      }

      const res = await fetch(`/api/listings/${editingLot.lot_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update consignment details');
      }

      // Update state locally with 0ms delay
      setMyListings((prev) =>
        prev.map((item) =>
          item.lot_id === editingLot.lot_id
            ? {
                ...item,
                title: editForm.title.trim(),
                asking_price: Number(editForm.askingPriceINR),
                askingPriceAmount: Number(editForm.askingPriceINR) * 100,
                condition: editForm.condition,
                category: editForm.category.trim(),
                images: editForm.imageUrl ? [editForm.imageUrl] : item.images,
                imageUrls: editForm.imageUrl ? [editForm.imageUrl] : item.imageUrls,
              }
            : item
        )
      );

      setEditingLot(null);
      setActionFeedback(`LOT #${editingLot.vault_id} REVISED & ANCHORED`);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err: any) {
      setEditError(err.message || 'Failed to commit revisions.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Submit Delete via DELETE /api/listings/[id]
  const handleConfirmDelete = async () => {
    if (!deletingLot) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/listings/${deletingLot.lot_id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete listing');
      }

      // Immediately purge from local state
      setMyListings((prev) => prev.filter((item) => item.lot_id !== deletingLot.lot_id));
      setActionFeedback(`LOT #${deletingLot.vault_id} DECONSIGNED & REMOVED FROM VAULT`);
      setDeletingLot(null);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err: any) {
      setActionFeedback(`DELETE ERROR: ${err.message}`);
      setTimeout(() => setActionFeedback(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  const getTabButtonClass = (tab: 'MY_LISTINGS' | 'SHELF' | 'LEDGER' | 'DISPATCH' | 'INVOICES'): string => {
    const isSelected = activeTab === tab;
    return [
      'px-5 py-3 text-[11px] uppercase tracking-[0.16em] font-semibold border cursor-pointer rounded-none whitespace-nowrap transition-none font-sans',
      isSelected
        ? 'bg-[#F2EFE9] text-[#080808] border-[#F2EFE9]'
        : 'bg-[#0C0C0C] text-[#888888] border-[#1F1F1F] hover:border-[#3A3A3A] hover:text-[#CCCCCC]',
    ].join(' ');
  };

  const collectorHandle =
    session?.user?.name ||
    session?.user?.email?.split('@')[0] ||
    'VERIFIED COLLECTOR';

  return (
    <div className="min-h-screen bg-[#080808] text-[#F2EFE9] select-none py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1F1F1F] pb-4 gap-2 text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold font-sans">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-none no-underline text-[#777777]">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-[#F2EFE9]">Collector Vault Portfolio</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#10B981]" />
            <span className="text-[#10B981]">ACCOUNT: @{collectorHandle} • PAN-INDIA CUSTODY</span>
          </div>
        </div>

        {/* Masthead: 4-Column Balanced Grid */}
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
                MY LISTED LOTS
              </span>
              <span className="font-serif text-lg sm:text-xl text-[#F2EFE9] font-bold block mt-1">
                {myListings.length} ACTIVE
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

        {/* Action Feedback Toast */}
        {actionFeedback && (
          <div className="p-3 bg-[#091812] border border-[#193829] text-[11px] text-[#10B981] uppercase tracking-[0.14em] font-semibold text-center font-sans">
            [ {actionFeedback} ]
          </div>
        )}

        {/* Clean 5-Tab Navigation Bar */}
        <div className="flex border-b border-[#1F1F1F] gap-2 overflow-x-auto scrollbar-none pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('MY_LISTINGS')}
            className={getTabButtonClass('MY_LISTINGS')}
          >
            {`[ 01 // MY LISTED ITEMS (${myListings.length}) ]`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SHELF')}
            className={getTabButtonClass('SHELF')}
          >
            {`[ 02 // MY DIGITAL SHELF (${shelf.length}) ]`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LEDGER')}
            className={getTabButtonClass('LEDGER')}
          >
            {`[ 03 // BARGAINING LEDGER (${offers.filter((o) => o.status === 'PENDING').length}) ]`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DISPATCH')}
            className={getTabButtonClass('DISPATCH')}
          >
            {`[ 04 // ESCROW DISPATCH (${dispatches.length}) ]`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('INVOICES')}
            className={getTabButtonClass('INVOICES')}
          >
            {`[ 05 // TAX INVOICES & RECEIPTS (${invoices.length}) ]`}
          </button>
        </div>

        {/* TAB 01: MY LISTED ITEMS (Direct Edit & Delete) */}
        {activeTab === 'MY_LISTINGS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold block mb-1">
                  SELLER CONSIGNMENT REPOSITORY
                </span>
                <p className="text-xs text-[#8E8E8E]">
                  All active lots consigned to OtakuBazaar under your collector identity.
                </p>
              </div>
              <Link
                href="/sell"
                className="px-4 py-2 border border-[#F2EFE9] bg-[#F2EFE9] text-[#080808] hover:bg-[#EAE6DF] text-[11px] uppercase tracking-[0.14em] font-semibold transition-none no-underline self-start sm:self-auto rounded-none text-center"
              >
                [ + CONSIGN A LOT ]
              </Link>
            </div>

            {isLoadingListings ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="border border-[#1F1F1F] bg-[#0C0C0C] p-5 space-y-4 animate-pulse">
                    <div className="w-full h-48 bg-[#141414]" />
                    <div className="h-4 bg-[#1F1F1F] w-3/4" />
                    <div className="h-3 bg-[#181818] w-1/2" />
                    <div className="h-8 bg-[#141414] w-full" />
                  </div>
                ))}
              </div>
            ) : myListings.length === 0 ? (
              <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-12 sm:p-16 text-center space-y-4 rounded-none">
                <div className="font-mono text-[10px] text-[#777777] tracking-[0.2em] uppercase">
                  VAULT INDEX: 0 ACTIVE LOTS — NO LOTS LISTED BY YOUR ACCOUNT
                </div>
                <h3 className="font-serif text-lg sm:text-xl uppercase tracking-wider text-[#F2EFE9]">
                  NO ACTIVE CONSIGNMENTS IN CUSTODY
                </h3>
                <p className="text-xs text-[#8E8E8E] max-w-md mx-auto leading-relaxed">
                  You have not published any verified collector lots to the live vault yet. Consign your first authentic anime figure or manga grail to begin receiving escrow-backed offers.
                </p>
                <div className="pt-2">
                  <Link
                    href="/sell"
                    className="inline-block px-5 py-2.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.14em] transition-none rounded-none no-underline"
                  >
                    [ CONSIGN A LOT ]
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myListings.map((lot) => {
                  const thumb = optimizeImageUrl(lot.images[0] || lot.imageUrls[0], 600);
                  const askingPaise = lot.asking_price || Math.round((lot.askingPriceAmount || 0) / 100);

                  return (
                    <div
                      key={lot.lot_id}
                      className="border border-[#1F1F1F] bg-[#0C0C0C] p-4 flex flex-col justify-between space-y-4 rounded-none"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-full h-56 bg-[#080808] border border-[#161616] overflow-hidden">
                        <img
                          src={thumb}
                          alt={lot.title}
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute top-2 left-2 bg-[#080808]/90 border border-[#1F1F1F] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#CCCCCC] font-mono">
                          {lot.vault_id || lot.lot_id.slice(-8).toUpperCase()}
                        </div>
                        <div className="absolute top-2 right-2 bg-[#091812]/95 border border-[#193829] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#10B981] font-semibold">
                          {lot.escrow_status || lot.status || 'ACTIVE'}
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-[#777777] uppercase tracking-wider">
                          <span>{lot.series || lot.category || 'Anime Collectible'}</span>
                          <span>{lot.scale || '1/7 SCALE'}</span>
                        </div>

                        <h3 className="font-serif text-[15px] font-bold text-[#F2EFE9] uppercase tracking-[0.03em] line-clamp-2">
                          {lot.title}
                        </h3>

                        <div className="text-[10px] text-[#888888] uppercase tracking-wide">
                          {lot.grade || (lot.condition === 'NEW' ? 'GRADE S // MISB' : 'GRADE A // BIB')}
                        </div>

                        <div className="pt-2 border-t border-[#161616] flex items-baseline justify-between">
                          <span className="text-[10px] uppercase tracking-[0.14em] text-[#777777]">
                            ASKING PRICE
                          </span>
                          <span className="font-serif text-lg font-bold text-[#F2EFE9]">
                            ₹{askingPaise.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons: Edit & Delete */}
                      <div className="pt-3 border-t border-[#1F1F1F] grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(lot)}
                          className="w-full py-2 bg-[#080808] hover:bg-[#161616] text-[#CCCCCC] hover:text-[#F2EFE9] border border-[#1F1F1F] hover:border-[#F2EFE9] text-[10px] font-semibold uppercase tracking-[0.16em] transition-none cursor-pointer rounded-none text-center"
                        >
                          [ EDIT ]
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingLot(lot)}
                          className="w-full py-2 bg-[#140A0A] hover:bg-[#200E0E] text-[#EF4444] border border-[#451A1A] hover:border-[#EF4444] text-[10px] font-semibold uppercase tracking-[0.16em] transition-none cursor-pointer rounded-none text-center"
                        >
                          [ DELETE ]
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 02: MY DIGITAL SHELF & CONSIGNMENTS */}
        {activeTab === 'SHELF' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold">
                ACTIVE COLLECTOR CONSIGNMENTS & IN-HAND SHELF
              </span>
              <Link
                href="/sell"
                className="px-4 py-2 border border-[#1F1F1F] bg-[#0C0C0C] hover:bg-[#F2EFE9] hover:text-[#080808] hover:border-[#F2EFE9] text-[#CCCCCC] text-[11px] uppercase tracking-[0.14em] font-semibold transition-none no-underline rounded-none"
              >
                [ + CONSIGN NEW GRAIL ]
              </Link>
            </div>

            {shelf.length === 0 ? (
              <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-12 sm:p-16 text-center space-y-4 rounded-none">
                <div className="font-mono text-[10px] text-[#777777] tracking-[0.2em] uppercase">
                  VAULT PORTFOLIO // 0 ACTIVE CONSIGNMENTS
                </div>
                <h3 className="font-serif text-lg sm:text-xl uppercase tracking-wider text-[#F2EFE9]">
                  NO ACTIVE CONSIGNMENTS IN CUSTODY
                </h3>
                <p className="text-xs text-[#8E8E8E] max-w-md mx-auto leading-relaxed">
                  Authenticate your high-end anime scale figures, resin monuments, or complete manga sets. Every consigned lot enters escrow inspection protection.
                </p>
                <div className="pt-2">
                  <Link
                    href="/sell"
                    className="inline-block px-5 py-2.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.14em] transition-none rounded-none no-underline"
                  >
                    [ CONSIGN A LOT ]
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shelf.map((item) => (
                  <div key={item.id} className="border border-[#1F1F1F] bg-[#0C0C0C] p-5 flex flex-col sm:flex-row gap-5">
                    <div className="w-full sm:w-36 h-48 bg-[#080808] border border-[#161616] relative shrink-0">
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-[#777777] tracking-[0.15em] uppercase">
                          <span>LOT: {item.lotRef}</span>
                          <span className="text-[#10B981]">{item.custodyBay}</span>
                        </div>
                        <h3 className="font-serif text-[16px] text-[#F2EFE9] uppercase tracking-[0.04em] mt-1 font-bold">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-[#8E8E8E]">{item.series}</p>
                      </div>
                      <div className="border-t border-[#161616] pt-3 flex justify-between items-center text-xs">
                        <span className="text-[#777777] uppercase text-[10px]">VALUATION</span>
                        <span className="font-serif text-lg text-[#F2EFE9] font-bold">
                          ₹{item.valuation.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 03: BARGAINING LEDGER */}
        {activeTab === 'LEDGER' && (
          <div className="space-y-6">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#777777] font-semibold block">
              REAL-TIME BUYER ESCROW OFFERS (15-MIN LOCK PROTOCOL)
            </span>

            {offers.length === 0 ? (
              <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-12 text-center space-y-3 rounded-none">
                <span className="text-[10px] tracking-[0.2em] text-[#777777] uppercase block">
                  NO PENDING BUYER OFFERS
                </span>
                <p className="text-xs text-[#8E8E8E] max-w-md mx-auto">
                  When a verified buyer tenders a serious escrow-backed offer on one of your consigned lots, it appears here for instant acceptance.
                </p>
              </div>
            ) : (
              <div className="border border-[#1F1F1F] bg-[#0C0C0C] divide-y divide-[#161616]">
                {offers.map((offer) => (
                  <div key={offer.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] tracking-[0.15em] text-[#777777] uppercase">
                          LOT: {offer.lotRef}
                        </span>
                        <span className="text-[10px] tracking-[0.12em] text-[#10B981] font-semibold uppercase">
                          BUYER: {offer.buyerHandle}
                        </span>
                      </div>
                      <h3 className="font-serif text-[16px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                        {offer.itemTitle}
                      </h3>
                      <div className="flex items-center gap-4 text-xs pt-1">
                        <span className="text-[#777777]">Asking: ₹{offer.askingPrice.toLocaleString('en-IN')}</span>
                        <span className="text-[#F2EFE9] font-bold">Tendered: ₹{offer.offeredPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {offer.status === 'PENDING' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOfferAction(offer.id, 'ACCEPT')}
                            className="px-4 py-2 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.14em] transition-none rounded-none cursor-pointer"
                          >
                            [ ACCEPT OFFER ]
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOfferAction(offer.id, 'REJECT')}
                            className="px-4 py-2 bg-[#080808] text-[#888888] hover:text-[#F2EFE9] border border-[#1F1F1F] hover:border-[#3A3A3A] text-[11px] font-semibold uppercase tracking-[0.14em] transition-none rounded-none cursor-pointer"
                          >
                            [ DECLINE ]
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] uppercase tracking-wider text-[#777777] border border-[#1F1F1F] px-3 py-1">
                          STATUS: {offer.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 04: ESCROW DISPATCH */}
        {activeTab === 'DISPATCH' && (
          <div className="space-y-6">
            <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-6 space-y-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold border border-[#1F1F1F] bg-[#080808] px-2.5 py-1 inline-block">
                LOGISTICS PROTOCOL
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-[#F2EFE9] uppercase tracking-[0.04em]">
                Active Air Freight Dispatch & 48-Hour Inspection Escrow
              </h2>
              <form onSubmit={handleAddAwb} className="flex flex-col sm:flex-row gap-3 pt-2">
                <select
                  value={selectedCarrier}
                  onChange={(e) => setSelectedCarrier(e.target.value as any)}
                  className="bg-[#080808] border border-[#1F1F1F] text-[#CCCCCC] text-xs px-3 py-2 outline-none rounded-none uppercase font-sans"
                >
                  <option value="BLUEDART AIR">BLUEDART AIR (INSURED CRATED)</option>
                  <option value="DELHIVERY SURFACE">DELHIVERY SURFACE EXPRESS</option>
                </select>
                <input
                  type="text"
                  placeholder="ENTER DISPATCH AWB NUMBER..."
                  value={newAwbInput}
                  onChange={(e) => setNewAwbInput(e.target.value)}
                  className="flex-1 bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] text-[#F2EFE9] text-xs px-3.5 py-2 outline-none rounded-none uppercase font-sans placeholder-[#555555]"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.14em] cursor-pointer rounded-none font-sans"
                >
                  [ RECORD AWB ]
                </button>
              </form>
            </div>

            {dispatches.length === 0 ? (
              <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-12 text-center space-y-3 rounded-none">
                <span className="text-[10px] tracking-[0.2em] text-[#777777] uppercase block">
                  NO CONSIGNMENTS CURRENTLY IN TRANSIT
                </span>
                <p className="text-xs text-[#8E8E8E] max-w-md mx-auto">
                  Orders requiring shipment tracking or pending unboxing verification will appear here.
                </p>
              </div>
            ) : (
              <div className="border border-[#1F1F1F] bg-[#0C0C0C] divide-y divide-[#161616]">
                {dispatches.map((disp) => (
                  <div key={disp.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono tracking-[0.15em] text-[#10B981] font-bold">
                          AWB: {disp.awbNumber}
                        </span>
                        <span className="text-[10px] tracking-[0.14em] text-[#777777] uppercase">
                          CARRIER: {disp.carrier}
                        </span>
                      </div>
                      <h3 className="font-serif text-[16px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                        {disp.itemTitle}
                      </h3>
                      <p className="text-[11px] text-[#8E8E8E]">
                        Destination: {disp.destinationCity} • Inspection Window: {disp.inspectionHoursLeft}h Remaining
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerateInvoice(disp.orderId, disp.lotRef, disp.itemTitle)}
                        className="px-3.5 py-2 bg-[#080808] border border-[#1F1F1F] hover:border-[#3A3A3A] text-[11px] uppercase tracking-[0.14em] text-[#CCCCCC] cursor-pointer rounded-none font-sans"
                      >
                        [ TAX INVOICE ]
                      </button>
                      <div className="border border-[#1F1F1F] bg-[#080808] px-3.5 py-2 text-center">
                        <span className="font-sans text-[11px] text-[#10B981] font-semibold uppercase tracking-wider block">
                          {disp.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 05: TAX INVOICES & RECEIPTS */}
        {activeTab === 'INVOICES' && (
          <div className="space-y-6">
            <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold border border-[#1F1F1F] bg-[#080808] px-2.5 py-1 inline-block mb-2">
                  SECURITY & COMPLIANCE DIRECTIVE
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-[#F2EFE9] uppercase tracking-[0.04em]">
                  Authoritative Tax Invoices & Escrow Receipts
                </h2>
                <p className="text-[12px] text-[#8E8E8E] mt-1 max-w-2xl">
                  Generated invoices include Indian GST 18% tax breakdowns, double-entry escrow verification, and SHA-256 cryptographic digests. Downloads are protected by strict Object-Level Access Control (IDOR prevention).
                </p>
              </div>
            </div>

            {/* Invoices List */}
            {invoices.length === 0 && !isGeneratingInvoice ? (
              <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-12 text-center space-y-3 rounded-none">
                <span className="text-[10px] tracking-[0.2em] text-[#777777] uppercase block">
                  NO INVOICES GENERATED YET
                </span>
                <p className="text-xs text-[#8E8E8E] max-w-md mx-auto">
                  Authoritative tax receipts with cryptographic SHA-256 integrity checks are generated upon order completion or settlement.
                </p>
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
                        className="px-4 py-2.5 bg-[#F2EFE9] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.14em] rounded-none no-underline block text-center"
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

      {/* EDIT MODAL */}
      {editingLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 select-none">
          <div className="w-full max-w-xl bg-[#0C0C0C] border border-[#1F1F1F] p-6 sm:p-8 space-y-5 rounded-none max-h-[90vh] overflow-y-auto">
            <div className="border-b border-[#161616] pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold block">
                  VAULT REVISION PROTOCOL
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-[#F2EFE9] uppercase tracking-[0.04em] mt-1">
                  Edit Consigned Lot
                </h2>
              </div>
              <span className="font-mono text-[10px] text-[#777777] uppercase border border-[#1F1F1F] px-2 py-1">
                {editingLot.vault_id || editingLot.lot_id.slice(-8).toUpperCase()}
              </span>
            </div>

            {editError && (
              <div className="p-3 bg-[#180A0A] border border-[#7F1D1D] text-[#F87171] text-xs font-semibold uppercase tracking-wider text-center">
                [ ERROR: {editError} ]
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.16em] text-[#888888] font-semibold block mb-1.5">
                  Lot Title *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.16em] text-[#888888] font-semibold block mb-1.5">
                    Asking Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editForm.askingPriceINR || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, askingPriceINR: Number(e.target.value) }))}
                    className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none font-sans"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.16em] text-[#888888] font-semibold block mb-1.5">
                    Category *
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none font-sans uppercase"
                  >
                    <option value="Scale Figure">Scale Figure</option>
                    <option value="Nendoroid">Nendoroid</option>
                    <option value="Statues & Resin">Statues & Resin</option>
                    <option value="Manga Sets">Manga Sets</option>
                    <option value="Mecha & Gunpla">Mecha & Gunpla</option>
                    <option value="Cosplay & Props">Cosplay & Props</option>
                    <option value="Other">Other / Retro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.16em] text-[#888888] font-semibold block mb-1.5">
                  Condition Grade *
                </label>
                <select
                  value={editForm.condition}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, condition: e.target.value as any }))}
                  className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none font-sans uppercase"
                >
                  <option value="NEW">GRADE S // MISB (FACTORY SEALED)</option>
                  <option value="LIKE_NEW">GRADE A // BIB (CABINET DISPLAYED)</option>
                  <option value="GOOD">GRADE B // OPEN SHELF (DISPLAYED)</option>
                  <option value="FAIR">GRADE C // MINOR WEAR</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.16em] text-[#888888] font-semibold block mb-1.5">
                  Archival Provenance & Custody Notes
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none font-sans resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.16em] text-[#888888] font-semibold block mb-1.5">
                  Primary Photograph URL (Optional)
                </label>
                <input
                  type="text"
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://... or data:image/..."
                  className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3.5 py-2.5 text-xs text-[#F2EFE9] outline-none rounded-none font-sans placeholder-[#555555]"
                />
              </div>

              <div className="pt-4 border-t border-[#161616] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingLot(null)}
                  disabled={isSavingEdit}
                  className="px-4 py-2.5 bg-[#080808] hover:bg-[#161616] text-[#888888] hover:text-[#CCCCCC] border border-[#1F1F1F] text-[11px] font-semibold uppercase tracking-[0.16em] cursor-pointer rounded-none"
                >
                  [ CANCEL ]
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2.5 bg-[#F2EFE9] hover:bg-[#EAE6DF] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.16em] cursor-pointer rounded-none disabled:opacity-50"
                >
                  {isSavingEdit ? '[ COMMITTING... ]' : '[ SAVE REVISIONS ]'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 select-none">
          <div className="w-full max-w-md bg-[#0C0C0C] border border-[#7F1D1D] p-6 sm:p-8 space-y-4 rounded-none">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#EF4444] font-semibold block">
              WARNING // PERMANENT DECONSIGNMENT
            </span>

            <h2 className="font-serif text-xl text-[#F2EFE9] uppercase tracking-[0.04em]">
              Confirm Lot Deletion
            </h2>

            <p className="text-xs text-[#8E8E8E] leading-relaxed">
              Are you certain you wish to purge lot <strong className="text-[#F2EFE9]">{deletingLot.title}</strong> ({deletingLot.vault_id || deletingLot.lot_id.slice(-8)}) from the live vault? This will remove the listing and invalidate all open bargaining offers permanently.
            </p>

            <div className="pt-4 border-t border-[#161616] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingLot(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-[#080808] hover:bg-[#161616] text-[#888888] hover:text-[#CCCCCC] border border-[#1F1F1F] text-[11px] font-semibold uppercase tracking-[0.16em] cursor-pointer rounded-none"
              >
                [ ABORT ]
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white border border-[#EF4444] text-[11px] font-semibold uppercase tracking-[0.16em] cursor-pointer rounded-none disabled:opacity-50"
              >
                {isDeleting ? '[ PURGING... ]' : '[ CONFIRM DELETION ]'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-20">
        <ArchivalFooter />
      </div>
    </div>
  );
}
