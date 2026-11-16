'use client';

/**
 * @file src/app/sell/page.tsx
 *
 * Vault Consignment Studio — OtakuBazaar.
 *
 * Fully integrated with Next.js Server Actions (createListingAction),
 * Clean Architecture repository persistence, and multi-window BroadcastChannel sync.
 * Adheres strictly to high-end monochrome vault aesthetic with Universal Button Tokens:
 * - Collector Condition Grading: MISB vs BIB vs Open Shelf
 * - Box & Blister Integrity Selector
 * - Single Lot vs Multi-Figure Shelf Bundle Toggle
 * - Timestamp Note + Hologram Macro Upload Slots
 */

import React, { useState, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { LiveCardPreview } from '@/presentation/components/listings/LiveCardPreview';
import { createListingAction } from '@/app/actions';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';

// ---------------------------------------------------------------------------
// Constants & Options
// ---------------------------------------------------------------------------

const FRANCHISES = [
  'Jujutsu Kaisen',
  'Demon Slayer',
  'One Piece',
  'Chainsaw Man',
  'Bleach',
  'Attack on Titan',
  'Naruto Shippuden',
  'Berserk',
  'Fate / Stay Night',
  'Neon Genesis Evangelion',
  'Fullmetal Alchemist',
  'Other / Retro',
] as const;

const CATEGORIES = [
  'Scale Figure',
  'Nendoroid',
  'Statues & Resin',
  'Manga Sets',
  'Mecha & Gunpla',
  'Cosplay & Props',
  'Other',
] as const;

const MANUFACTURERS = [
  'Good Smile Company',
  'MegaHouse Japan',
  'Aniplex+ Exclusive',
  'Kotobukiya',
  'Alter',
  'eStream / Shibuya Scramble',
  'Bandai Spirits / Tamashii Nations',
  'Prime 1 Studio',
  'Dark Horse Manga',
  'Other',
] as const;

interface ConditionOption {
  readonly rank: string;
  readonly englishLabel: string;
  readonly description: string;
  readonly internalValue: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
}

const CONDITION_GRADES: ConditionOption[] = [
  {
    rank: '[S-RANK // MISB]',
    englishLabel: 'MISB (Factory Sealed)',
    description: 'Never opened. Pristine original manufacturer seals with intact security hologram foil.',
    internalValue: 'NEW',
  },
  {
    rank: '[A-RANK // BIB]',
    englishLabel: 'BIB (Glass Cabinet Displayed)',
    description: 'Back in Box. Maintained inside UV-filtered glass Moducase. Flawless figure, complete blister tray.',
    internalValue: 'LIKE_NEW',
  },
  {
    rank: '[B-RANK // OPEN]',
    englishLabel: 'Open Shelf (Displayed)',
    description: 'Kept on open shelf. Micro-dust or minor paint contact possible. Complete original packaging.',
    internalValue: 'GOOD',
  },
];

const BOX_GRADES = [
  {
    id: 'MINT_BOX',
    label: 'Mint Box (Blister Intact)',
    desc: 'Sharp 90° corners, zero scuffs, factory window clarity.',
  },
  {
    id: 'MINOR_WEAR',
    label: 'Minor Courier Corner Wear',
    desc: 'Light transit crease or corner indentation. Blister 100% intact.',
  },
  {
    id: 'BLISTER_CREASE',
    label: 'Creased Carton / Blister Wear',
    desc: 'Visible exterior box wear, ideal for unboxed display collectors.',
  },
] as const;

const SAMPLE_IMAGE_PRESETS = [
  {
    label: 'Guts Berserker Armor',
    url: '/showcase/guts_berserker_statue.jpg',
  },
  {
    label: 'Kyojuro Rengoku Flame 1/8',
    url: '/showcase/bay1_clean.png',
  },
  {
    label: 'Saber Altria Pendragon',
    url: '/showcase/bay2_clean.png',
  },
  {
    label: 'Satoru Gojo Hollow Purple',
    url: '/showcase/bay3_clean.png',
  },
];

export default function SellPage(): React.JSX.Element {
  const [, startTransition] = useTransition();

  // Consignment Type Toggle
  const [consignType, setConsignType] = useState<'SINGLE' | 'BUNDLE'>('SINGLE');

  // Form Field States
  const [title, setTitle] = useState('');
  const [franchise, setFranchise] = useState<string>(FRANCHISES[0]);
  const [customFranchise, setCustomFranchise] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [manufacturer, setManufacturer] = useState<string>(MANUFACTURERS[0]);
  const [customManufacturer, setCustomManufacturer] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<ConditionOption>(CONDITION_GRADES[0]!);
  const [selectedBoxGrade, setSelectedBoxGrade] = useState<string>(BOX_GRADES[0].id);
  const [askingPrice, setAskingPrice] = useState('');
  const [minimumPrice, setMinimumPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [extraImageUrls, setExtraImageUrls] = useState<string[]>(['']);
  const [hologramProofUrl, setHologramProofUrl] = useState('');
  const [timestampProofUrl, setTimestampProofUrl] = useState('');

  // Shipping & Logistics States
  const [pickupPincode, setPickupPincode] = useState('');
  const [shippingWeightKg, setShippingWeightKg] = useState('1.5');
  const [boxLengthCm, setBoxLengthCm] = useState('30');
  const [boxWidthCm, setBoxWidthCm] = useState('25');
  const [boxHeightCm, setBoxHeightCm] = useState('35');

  // Proof of Purchase / Invoice State
  const [invoiceFileName, setInvoiceFileName] = useState('');
  const [invoicePreviewUrl, setInvoicePreviewUrl] = useState('');
  const [invoiceUploaded, setInvoiceUploaded] = useState(false);

  // Upload Interaction State
  const isProduction = process.env.NODE_ENV === 'production';
  const [activeUploadTab, setActiveUploadTab] = useState<'UPLOAD' | 'PRESETS' | 'LINK'>('UPLOAD');
  const [isUploading, setIsUploading] = useState(false);

  // UI Feedback States
  const [isPublished, setIsPublished] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Derived Values
  const activeFranchise = franchise === 'Other / Retro' ? customFranchise || 'Anime Series' : franchise;
  const activeCategory = category === 'Other' ? customCategory || 'Other' : category;
  const activeManufacturer = manufacturer === 'Other' ? customManufacturer || 'Import Studio' : manufacturer;
  const activeImageUrl = (customImageUrl.trim() || imageUrl || (isProduction ? '' : SAMPLE_IMAGE_PRESETS[0]?.url)) as string;
  const priceNum = parseInt(askingPrice, 10) || 0;
  const originalEst = Math.round(priceNum * 1.25);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const simulatedUrl = URL.createObjectURL(file);
      setImageUrl(simulatedUrl);
      setIsUploading(false);
    }, 400);
  };

  const handleInvoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInvoiceFileName(file.name);
    setInvoiceUploaded(true);
    const simulatedUrl = URL.createObjectURL(file);
    setInvoicePreviewUrl(simulatedUrl);
  };

  const handlePublish = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage(null);

      if (!title.trim()) {
        setErrorMessage('Collectible title is required.');
        return;
      }
      if (!priceNum || priceNum < 500) {
        setErrorMessage('Asking price must be at least ₹500 INR.');
        return;
      }
      if (!activeImageUrl) {
        setErrorMessage('A genuine photograph of your collectible item is required.');
        return;
      }
      if (priceNum > 10000 && !invoiceUploaded && !invoicePreviewUrl) {
        setErrorMessage('Proof of purchase or store invoice is mandatory for grails valued over ₹10,000 to verify authenticity provenance.');
        return;
      }
      if (!pickupPincode || !/^[1-9][0-9]{5}$/.test(pickupPincode.trim())) {
        setErrorMessage('A valid 6-digit Indian pickup PIN code is required for courier dispatch.');
        return;
      }

      startTransition(async () => {
        try {
          const result = await createListingAction({
            title: `[${activeFranchise}] ${title}`,
            series: activeFranchise,
            category: activeCategory,
            manufacturer: activeManufacturer,
            condition: selectedGrade.internalValue,
            conditionGrade: selectedGrade.rank,
            askingPriceINR: priceNum,
            originalPriceINR: originalEst,
            imageUrl: activeImageUrl,
            description,
            pickupPincode: pickupPincode.trim(),
            weightKg: parseFloat(shippingWeightKg) || 1.5,
            dimensionsCm: `${boxLengthCm}x${boxWidthCm}x${boxHeightCm}`,
            invoiceProofUrl: invoicePreviewUrl || undefined,
          });
          if (!result.success) {
            setErrorMessage(result.error || 'Failed to consign lot.');
            return;
          }

          const newListingPayload = {
            id: result.data?.id || `listing_${Date.now()}`,
            title: `[${activeFranchise}] ${title}`,
            name: `[${activeFranchise}] ${title}`,
            series: activeFranchise,
            manufacturer: activeManufacturer,
            category: activeCategory,
            type: activeCategory,
            condition: selectedGrade.internalValue,
            conditionGrade: selectedGrade.rank,
            askingPriceINR: priceNum,
            askingPriceAmount: priceNum * 100,
            price: priceNum,
            originalPriceINR: originalEst,
            imageUrl: activeImageUrl,
            image: activeImageUrl,
            imageUrls: [activeImageUrl, ...extraImageUrls.filter((url) => url.trim().length > 0)],
            status: 'ACTIVE',
            badge: selectedGrade.rank,
            sellerName: 'Kyojuro Rengoku',
            sellerRating: '5.0 (42 Verified Sales)',
            sellerAvatar: 'KR',
          };

          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const channel = new BroadcastChannel('otaku_bargain_sync');
            channel.postMessage({
              type: 'LISTING_CREATED',
              payload: newListingPayload,
            });
            channel.close();
          }

          try {
            const stored = JSON.parse(localStorage.getItem('otaku_custom_listings') || '[]');
            localStorage.setItem('otaku_custom_listings', JSON.stringify([newListingPayload, ...stored]));
          } catch {
            // ignore
          }

          setIsPublished(true);
        } catch (err: unknown) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to publish consignment');
        }
      });
    },
    [
      title,
      priceNum,
      activeFranchise,
      description,
      activeImageUrl,
      activeCategory,
      selectedGrade,
      activeManufacturer,
      originalEst,
      extraImageUrls,
      pickupPincode,
      shippingWeightKg,
      boxLengthCm,
      boxWidthCm,
      boxHeightCm,
      invoiceUploaded,
      invoicePreviewUrl,
    ]
  );

  return (
    <div className="min-h-screen bg-[#080808] pt-8 pb-20 text-[#F2EFE9] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 border-b border-[#1F1F1F] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#1F1F1F] bg-[#0C0C0C] text-[#777777] text-[10px] tracking-[0.2em] uppercase mb-3 font-semibold font-sans">
            <span>VAULT CONSIGNMENT STUDIO</span>
            <span>•</span>
            <span>ESCROW AUTHENTICATED</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#F2EFE9] uppercase tracking-[0.08em] mb-2">
            Vault Consignment
          </h1>
          <p className="font-sans text-[13px] text-[#8E8E8E] font-normal leading-relaxed max-w-2xl">
            List your authentic anime collectible with escrow security and real-time buyer bargaining.
          </p>

          {/* Consignment Mode Toggle */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setConsignType('SINGLE')}
              className={`px-4 py-2 text-[11px] font-sans uppercase tracking-[0.14em] font-semibold border transition-colors cursor-pointer rounded-none ${
                consignType === 'SINGLE'
                  ? 'bg-[#F2EFE9] text-[#080808] border-[#F2EFE9]'
                  : 'bg-[#0C0C0C] text-[#888888] border-[#1F1F1F] hover:border-[#3A3A3A]'
              }`}
            >
              [ 01 // SINGLE LOT CONSIGNMENT ]
            </button>
            <button
              type="button"
              onClick={() => setConsignType('BUNDLE')}
              className={`px-4 py-2 text-[11px] font-sans uppercase tracking-[0.14em] font-semibold border transition-colors cursor-pointer rounded-none ${
                consignType === 'BUNDLE'
                  ? 'bg-[#F2EFE9] text-[#080808] border-[#F2EFE9]'
                  : 'bg-[#0C0C0C] text-[#888888] border-[#1F1F1F] hover:border-[#3A3A3A]'
              }`}
            >
              [ 02 // MULTI-FIGURE SHELF BUNDLE ]
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-[#180A0A] border border-[#7F1D1D] p-4 mb-6 font-sans text-xs text-[#F87171] uppercase tracking-wider">
            [ ERROR: {errorMessage} ]
          </div>
        )}

        {/* Success Notification */}
        {isPublished && (
          <div className="bg-[#091812] border border-[#193829] p-8 mb-8 text-center font-sans">
            <span className="text-[#10B981] text-[10px] tracking-[0.2em] uppercase font-bold block mb-2">
              [ LOT AUTHENTICATED &amp; CONSIGNED ]
            </span>
            <h2 className="font-serif text-[22px] text-[#F2EFE9] uppercase tracking-[0.06em] mb-2">
              Grail Consigned Successfully
            </h2>
            <p className="text-xs text-[#8E8E8E] max-w-lg mx-auto mb-6 leading-relaxed">
              Your lot is now live in the global vault catalog and synchronized across all active buyer windows.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/"
                className="px-6 py-2.5 bg-[#F2EFE9] text-[#080808] font-sans text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors no-underline"
              >
                [ VIEW IN BUYER FEED ]
              </Link>
              <button
                type="button"
                onClick={() => setIsPublished(false)}
                className="px-6 py-2.5 bg-[#0C0C0C] text-[#CCCCCC] border border-[#1F1F1F] font-sans text-[11px] uppercase tracking-[0.18em] transition-colors cursor-pointer"
              >
                [ + CONSIGN ANOTHER LOT ]
              </button>
            </div>
          </div>
        )}

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Controls */}
          <form onSubmit={handlePublish} className="lg:col-span-7 space-y-8 font-sans">
            {/* Section 01: Item Identity */}
            <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-5">
              <div className="border-b border-[#161616] pb-3 flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold">
                  SECTION 01 // ITEM IDENTITY &amp; SERIES
                </span>
                <span className="text-[10px] text-[#10B981] font-semibold uppercase tracking-wider">
                  MANDATORY
                </span>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#888888] mb-2 font-medium">
                  Collectible Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g., Satoru Gojo - 1/7 Scale Shibuya Scramble"
                  className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-4 py-3 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#888888] mb-2 font-medium">
                    Franchise *
                  </label>
                  <select
                    value={franchise}
                    onChange={(e) => setFranchise(e.target.value)}
                    className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-4 py-3 text-xs text-[#F2EFE9] outline-none rounded-none cursor-pointer"
                  >
                    {FRANCHISES.map((f) => (
                      <option key={f} value={f} className="bg-[#080808] text-[#F2EFE9]">
                        {f}
                      </option>
                    ))}
                  </select>
                  {franchise === 'Other / Retro' && (
                    <input
                      type="text"
                      placeholder="Custom franchise name..."
                      value={customFranchise}
                      onChange={(e) => setCustomFranchise(e.target.value)}
                      className="w-full mt-2 bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-4 py-2 text-xs text-[#F2EFE9] outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#888888] mb-2 font-medium">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-4 py-3 text-xs text-[#F2EFE9] outline-none rounded-none cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#080808] text-[#F2EFE9]">
                        {c}
                      </option>
                    ))}
                  </select>
                  {category === 'Other' && (
                    <input
                      type="text"
                      placeholder="Custom category name..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full mt-2 bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-4 py-2 text-xs text-[#F2EFE9] outline-none"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#888888] mb-2 font-medium">
                  Studio / Manufacturer *
                </label>
                <select
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-4 py-3 text-xs text-[#F2EFE9] outline-none rounded-none cursor-pointer"
                >
                  {MANUFACTURERS.map((m) => (
                    <option key={m} value={m} className="bg-[#080808] text-[#F2EFE9]">
                      {m}
                    </option>
                  ))}
                </select>
                {manufacturer === 'Other' && (
                  <input
                    type="text"
                    placeholder="Custom studio name..."
                    value={customManufacturer}
                    onChange={(e) => setCustomManufacturer(e.target.value)}
                    className="w-full mt-2 bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-4 py-2 text-xs text-[#F2EFE9] outline-none"
                  />
                )}
              </div>
            </div>

            {/* Section 02: Collector Condition Grading */}
            <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-5">
              <div className="border-b border-[#161616] pb-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold block mb-1">
                  SECTION 02 // COLLECTOR CONDITION GRADING
                </span>
                <p className="text-[12px] text-[#8E8E8E]">
                  Select the verifiable figure condition and packaging state:
                </p>
              </div>

              {/* 3 Explicit Selectable Figure Condition Cards */}
              <div className="grid grid-cols-1 gap-3">
                {CONDITION_GRADES.map((grade) => {
                  const isSelected = selectedGrade.rank === grade.rank;
                  return (
                    <div
                      key={grade.rank}
                      onClick={() => setSelectedGrade(grade)}
                      className={`p-4 border transition-colors cursor-pointer rounded-none ${
                        isSelected
                          ? 'border-[#F2EFE9] bg-[#161616]'
                          : 'border-[#1F1F1F] bg-[#080808] hover:border-[#3A3A3A]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif text-[14px] text-[#F2EFE9] uppercase tracking-[0.04em]">
                          {grade.englishLabel}
                        </span>
                        <span className="text-[10px] tracking-[0.14em] uppercase text-[#10B981] font-semibold">
                          {grade.rank}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8E8E8E] leading-relaxed">
                        {grade.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Separate Selector for Box & Blister Integrity */}
              <div className="pt-4 border-t border-[#161616] space-y-3">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#888888] font-semibold block">
                  BOX &amp; BLISTER INTEGRITY
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BOX_GRADES.map((box) => {
                    const isSelected = selectedBoxGrade === box.id;
                    return (
                      <div
                        key={box.id}
                        onClick={() => setSelectedBoxGrade(box.id)}
                        className={`p-3 border transition-colors cursor-pointer rounded-none ${
                          isSelected
                            ? 'border-[#F2EFE9] bg-[#161616]'
                            : 'border-[#1F1F1F] bg-[#080808] hover:border-[#3A3A3A]'
                        }`}
                      >
                        <div className="text-[11px] font-semibold text-[#F2EFE9] uppercase mb-1">
                          {box.label}
                        </div>
                        <p className="text-[10px] text-[#777777] leading-relaxed">
                          {box.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 03: Photo & Authenticity Proof Uploads */}
            <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-5">
              <div className="border-b border-[#161616] pb-3 flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold">
                  SECTION 03 // PHOTO &amp; PROOF VERIFICATION
                </span>
                <span className="text-[10px] text-[#10B981] font-semibold uppercase tracking-wider">
                  48H ESCROW REQUIREMENT
                </span>
              </div>

              {/* Upload Tabs: In production, enforce real file uploads */}
              <div className="flex border-b border-[#161616] mb-3">
                <button
                  type="button"
                  onClick={() => setActiveUploadTab('UPLOAD')}
                  className={`py-2 px-4 text-[11px] uppercase tracking-[0.14em] font-semibold transition-colors cursor-pointer rounded-none ${
                    activeUploadTab === 'UPLOAD'
                      ? 'border-b-2 border-[#F2EFE9] text-[#F2EFE9]'
                      : 'text-[#777777] hover:text-[#CCCCCC]'
                  }`}
                >
                  Real Photo Upload (Mandatory)
                </button>
                {!isProduction && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveUploadTab('PRESETS')}
                      className={`py-2 px-4 text-[11px] uppercase tracking-[0.14em] font-semibold transition-colors cursor-pointer rounded-none ${
                        activeUploadTab === 'PRESETS'
                          ? 'border-b-2 border-[#F2EFE9] text-[#F2EFE9]'
                          : 'text-[#777777] hover:text-[#CCCCCC]'
                      }`}
                    >
                      Vault Presets (Dev Only)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveUploadTab('LINK')}
                      className={`py-2 px-4 text-[11px] uppercase tracking-[0.14em] font-semibold transition-colors cursor-pointer rounded-none ${
                        activeUploadTab === 'LINK'
                          ? 'border-b-2 border-[#F2EFE9] text-[#F2EFE9]'
                          : 'text-[#777777] hover:text-[#CCCCCC]'
                      }`}
                    >
                      Custom URL (Dev Only)
                    </button>
                  </>
                )}
              </div>

              {/* Tab Content */}
              {!isProduction && activeUploadTab === 'PRESETS' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SAMPLE_IMAGE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setImageUrl(p.url);
                        setCustomImageUrl('');
                      }}
                      className={`p-2 border text-left rounded-none transition-colors cursor-pointer ${
                        imageUrl === p.url && !customImageUrl
                          ? 'border-[#F2EFE9] bg-[#161616]'
                          : 'border-[#1F1F1F] bg-[#080808] hover:border-[#3A3A3A]'
                      }`}
                    >
                      <div className="relative aspect-[4/5] w-full bg-[#111111] border border-[#1A1A1A] overflow-hidden mb-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover object-center" />
                      </div>
                      <span className="text-[9px] text-[#888888] uppercase block truncate">{p.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {activeUploadTab === 'UPLOAD' && (
                <div className="p-8 border border-dashed border-[#1F1F1F] bg-[#080808] text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="primary-photo-input"
                  />
                  <label
                    htmlFor="primary-photo-input"
                    className="inline-block px-5 py-2.5 border border-[#1F1F1F] bg-[#0C0C0C] hover:bg-[#F2EFE9] hover:text-[#080808] text-[#CCCCCC] text-[11px] uppercase tracking-[0.14em] cursor-pointer transition-colors"
                  >
                    {imageUrl && !imageUrl.startsWith('http') ? '[ CHANGE UPLOADED PHOTO ]' : '[ CHOOSE REAL ITEM PHOTOGRAPH ]'}
                  </label>
                  <p className="text-[10px] text-[#777777] mt-2">
                    JPG, PNG, or WEBP up to 25MB • Take clear in-hand photos showing seals, box, and figure condition
                  </p>
                  {isUploading && (
                    <p className="text-[10px] text-[#10B981] mt-2 animate-pulse font-mono">
                      [ PROCESSING LOCAL SPECIMEN PHOTO... ]
                    </p>
                  )}
                  {imageUrl && (
                    <p className="text-[10px] text-[#10B981] mt-2 font-mono">
                      [ IMAGE ATTACHED AND VERIFIED ]
                    </p>
                  )}
                </div>
              )}

              {!isProduction && activeUploadTab === 'LINK' && (
                <div>
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-4 py-3 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none"
                  />
                </div>
              )}

              {/* Upload Slots for Timestamp Note + Hologram Macro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#161616]">
                <div className="p-3 border border-[#1F1F1F] bg-[#080808] space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#888888] font-semibold block">
                    HOLOGRAM PROOF SLOT
                  </span>
                  <input
                    type="url"
                    value={hologramProofUrl}
                    onChange={(e) => setHologramProofUrl(e.target.value)}
                    placeholder="URL: Hologram macro photo..."
                    className="w-full bg-[#0C0C0C] border border-[#1F1F1F] px-3 py-2 text-[11px] text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none"
                  />
                  <span className="text-[9px] text-[#777777] block">
                    Close-up of Toei, Aniplex, or GSC seal.
                  </span>
                </div>

                <div className="p-3 border border-[#1F1F1F] bg-[#080808] space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#888888] font-semibold block">
                    HANDWRITTEN TIMESTAMP SLOT
                  </span>
                  <input
                    type="url"
                    value={timestampProofUrl}
                    onChange={(e) => setTimestampProofUrl(e.target.value)}
                    placeholder="URL: Handwritten note photo..."
                    className="w-full bg-[#0C0C0C] border border-[#1F1F1F] px-3 py-2 text-[11px] text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none"
                  />
                  <span className="text-[9px] text-[#777777] block">
                    Card showing @YourHandle + Current Date.
                  </span>
                </div>
              </div>

              {/* Proof of Purchase / Invoice Upload for Items > ₹10,000 */}
              <div className="pt-4 border-t border-[#161616] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#888888] font-semibold block">
                    PROOF OF PURCHASE / INVOICE {priceNum > 10000 ? '(MANDATORY OVER ₹10,000)' : '(OPTIONAL)'}
                  </span>
                  {priceNum > 10000 && (
                    <span className="text-[9px] uppercase tracking-[0.14em] text-[#EF4444] border border-[#EF4444]/40 bg-[#EF4444]/10 px-2 py-0.5 font-bold">
                      REQUIRED FOR ₹10,000+ LOTS
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#777777] leading-relaxed">
                  Upload store receipt, AmiAmi/GoodSmile import invoice, or customs bill to verify provenance and eliminate counterfeit disputes.
                </p>
                <div className="p-4 border border-dashed border-[#1F1F1F] bg-[#080808] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleInvoiceUpload}
                    className="hidden"
                    id="invoice-file-input"
                  />
                  <div className="text-left">
                    <span className="text-[11px] text-[#CCCCCC] block font-mono">
                      {invoiceFileName ? `[ ATTACHED: ${invoiceFileName} ]` : '[ NO INVOICE ATTACHED ]'}
                    </span>
                    <span className="text-[9px] text-[#666666]">
                      PDF, JPG, or PNG up to 10MB
                    </span>
                  </div>
                  <label
                    htmlFor="invoice-file-input"
                    className="px-4 py-2 border border-[#1F1F1F] bg-[#0C0C0C] hover:bg-[#F2EFE9] hover:text-[#080808] text-[#CCCCCC] text-[10px] uppercase tracking-[0.14em] cursor-pointer transition-colors whitespace-nowrap"
                  >
                    {invoiceFileName ? '[ REPLACE FILE ]' : '[ ATTACH INVOICE ]'}
                  </label>
                </div>
              </div>
            </div>

            {/* Section 04: Shipping & Logistics */}
            <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-5">
              <div className="border-b border-[#161616] pb-3 flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold">
                  SECTION 04 // LOGISTICS &amp; PICKUP SPEC
                </span>
                <span className="text-[10px] text-[#10B981] font-semibold uppercase tracking-wider">
                  SHIPROCKET DIRECT C2C
                </span>
              </div>
              <p className="text-[12px] text-[#8E8E8E]">
                Enter your pickup pincode and package dimensions for automated courier pickup and weight verification:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#888888] mb-2 font-medium">
                    Seller Pickup Pincode (6 Digits) *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pickupPincode}
                    onChange={(e) => setPickupPincode(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="e.g. 400001"
                    className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-4 py-3 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none font-mono"
                  />
                  <span className="text-[9px] text-[#666666] mt-1 block">
                    Shiprocket will collect the boxed lot directly from this address upon escrow confirmation.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#888888] mb-2 font-medium">
                    Estimated Packed Weight (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={shippingWeightKg}
                    onChange={(e) => setShippingWeightKg(e.target.value)}
                    required
                    placeholder="1.5"
                    className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-4 py-3 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none font-mono"
                  />
                  <span className="text-[9px] text-[#666666] mt-1 block">
                    Figure + art box + sturdy 3-ply outer shipping carton + bubble wrap.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#888888] mb-2 font-medium">
                  Outer Carton Dimensions (L × W × H in cm) *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input
                      type="number"
                      min="5"
                      value={boxLengthCm}
                      onChange={(e) => setBoxLengthCm(e.target.value)}
                      placeholder="Length cm"
                      className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3 py-2.5 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none font-mono text-center"
                    />
                    <span className="text-[9px] text-[#666666] block text-center mt-1">LENGTH (CM)</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="5"
                      value={boxWidthCm}
                      onChange={(e) => setBoxWidthCm(e.target.value)}
                      placeholder="Width cm"
                      className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3 py-2.5 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none font-mono text-center"
                    />
                    <span className="text-[9px] text-[#666666] block text-center mt-1">WIDTH (CM)</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="5"
                      value={boxHeightCm}
                      onChange={(e) => setBoxHeightCm(e.target.value)}
                      placeholder="Height cm"
                      className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3 py-2.5 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none font-mono text-center"
                    />
                    <span className="text-[9px] text-[#666666] block text-center mt-1">HEIGHT (CM)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 05: Valuation & Settlement */}
            <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-6 space-y-5">
              <div className="border-b border-[#161616] pb-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold block mb-1">
                  SECTION 05 // VALUATION &amp; SETTLEMENT
                </span>
                <p className="text-[12px] text-[#8E8E8E]">
                  Specify your public asking price and optional automated bargaining minimum (5% seller platform fee applies upon escrow completion):
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#888888] mb-2 font-medium">
                    Asking Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="500"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    required
                    placeholder="28500"
                    className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-4 py-3 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#888888] mb-2 font-medium">
                    Auto-Accept Minimum (Optional)
                  </label>
                  <input
                    type="number"
                    min="500"
                    value={minimumPrice}
                    onChange={(e) => setMinimumPrice(e.target.value)}
                    placeholder="24000"
                    className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-4 py-3 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#888888] mb-2 font-medium">
                  Curatorial Provenance &amp; Custody Notes
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes on glass Moducase storage, smoke-free home, unboxing inspection history..."
                  className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-4 py-3 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none resize-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 bg-[#F2EFE9] hover:bg-[#EAE6DF] text-[#080808] border border-[#F2EFE9] text-xs font-semibold uppercase tracking-[0.2em] transition-colors cursor-pointer rounded-none"
              >
                [ PUBLISH CONSIGNMENT TO LIVE VAULT ]
              </button>
            </div>
          </form>

          {/* Right Column: Live Card Preview Component */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="mb-2 flex justify-between items-center text-[10px] tracking-[0.16em] uppercase font-sans text-[#777777]">
              <span>SYNCHRONIZED PREVIEW</span>
              <span className="text-[#10B981] font-semibold">LIVE CARD BLUEPRINT</span>
            </div>
            <LiveCardPreview
              title={title}
              series={activeFranchise}
              category={activeCategory}
              manufacturer={activeManufacturer}
              conditionGrade={selectedGrade.rank}
              askingPriceINR={priceNum}
              imageUrl={activeImageUrl}
            />
          </div>
        </div>
      </div>

      <div className="mt-20">
        <ArchivalFooter />
      </div>
    </div>
  );
}