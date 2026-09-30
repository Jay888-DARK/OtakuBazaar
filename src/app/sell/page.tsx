'use client';

/**
 * @file src/app/sell/page.tsx
 *
 * Vault Consignment Studio — OtakuBazaar.
 *
 * Fully integrated with Next.js Server Actions (createListingAction),
 * Clean Architecture repository persistence, and multi-window BroadcastChannel sync.
 * Adheres strictly to high-end monochrome vault aesthetic with Universal Button Tokens.
 */

import React, { useState, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { LiveCardPreview } from '@/presentation/components/listings/LiveCardPreview';
import { createListingAction } from '@/app/actions';

// ---------------------------------------------------------------------------
// Constants & Options (Strictly English Only)
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
  'Other / Retro',
] as const;

const CATEGORIES = [
  'Scale Figure',
  'Nendoroid',
  'Manga Volume / Set',
  'Cosplay & Props',
  'Trading Card (TCG)',
] as const;

const MANUFACTURERS = [
  'Good Smile Company',
  'MegaHouse Japan',
  'Aniplex+ Exclusive',
  'Kotobukiya',
  'Alter',
  'eStream / Shibuya Scramble',
  'Bandai Spirits / Tamashii Nations',
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
    rank: '[S-RANK]',
    englishLabel: 'Brand New / Factory Sealed',
    description: 'Never opened. Original packaging with intact manufacturer security hologram.',
    internalValue: 'NEW',
  },
  {
    rank: '[A-RANK]',
    englishLabel: 'Like New / Flawless',
    description: 'Opened for authenticity inspection only. Figure never displayed; all blister pieces complete.',
    internalValue: 'LIKE_NEW',
  },
  {
    rank: '[B-RANK]',
    englishLabel: 'Displayed / Pristine Figure',
    description: 'Displayed in smoke-free glass cabinet. Figure in prime condition with minor outer carton wear.',
    internalValue: 'GOOD',
  },
  {
    rank: '[C-RANK]',
    englishLabel: 'Visible Wear / Loose Figure',
    description: 'Noticeable scuffs, paint transfer, or missing original packaging. Ideal for customizers.',
    internalValue: 'FAIR',
  },
];

const SAMPLE_IMAGE_PRESETS = [
  {
    label: 'Gojo Satoru 1/7 Scale',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop',
  },
  {
    label: 'Rengoku Flame Hashira',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop',
  },
  {
    label: 'Luffy Gear 5 Sun God',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop',
  },
  {
    label: 'Power Blood Fiend Pop Up',
    url: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&auto=format&fit=crop',
  },
];

export default function SellPage(): React.JSX.Element {
  const [isPending, startTransition] = useTransition();

  // Form Field States
  const [title, setTitle] = useState('');
  const [franchise, setFranchise] = useState<string>(FRANCHISES[0]);
  const [customFranchise, setCustomFranchise] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [manufacturer, setManufacturer] = useState<string>(MANUFACTURERS[0]);
  const [customManufacturer, setCustomManufacturer] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<ConditionOption>(CONDITION_GRADES[0]!);
  const [askingPrice, setAskingPrice] = useState('');
  const [minimumPrice, setMinimumPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string>(SAMPLE_IMAGE_PRESETS[0]?.url || '');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [extraImageUrls, setExtraImageUrls] = useState<string[]>(['']);
  const [videoUrl, setVideoUrl] = useState('');

  // Upload Interaction State
  const [activeUploadTab, setActiveUploadTab] = useState<'UPLOAD' | 'PRESETS' | 'LINK'>('UPLOAD');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // UI Feedback States
  const [isPublished, setIsPublished] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Derived Values
  const activeFranchise = franchise === 'Other / Retro' ? customFranchise || 'Anime Series' : franchise;
  const activeManufacturer = manufacturer === 'Other' ? customManufacturer || 'Import Studio' : manufacturer;
  const activeImageUrl = customImageUrl.trim() || imageUrl;
  const priceNum = parseInt(askingPrice, 10) || 0;
  const originalEst = Math.round(priceNum * 1.25);

  // Handle Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setIsUploading(true);

    setTimeout(() => {
      const localUrl = URL.createObjectURL(file);
      setCustomImageUrl(localUrl);
      setIsUploading(false);
    }, 800);
  };

  // Submission via Server Action
  const handlePublish = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage(null);

      if (!title.trim()) {
        setErrorMessage('Please provide a title for the collectible.');
        return;
      }
      if (priceNum <= 0) {
        setErrorMessage('Please provide a valid asking price.');
        return;
      }

      startTransition(async () => {
        try {
          const result = await createListingAction({
            title: `[${activeFranchise}] ${title}`,
            franchise: activeFranchise,
            category,
            manufacturer: activeManufacturer,
            condition: selectedGrade.internalValue,
            askingPriceAmount: priceNum * 100,
            imageUrl: activeImageUrl,
            description,
            extraImageUrls: extraImageUrls.filter((url) => url.trim().length > 0),
            videoUrl,
          } as any);

          if (!result.success) {
            throw new Error(result.error || 'Failed to create listing');
          }

          const newListingPayload = {
            id: result.data?.id || `listing_${Date.now()}`,
            title: `[${activeFranchise}] ${title}`,
            name: `[${activeFranchise}] ${title}`,
            series: activeFranchise,
            manufacturer: activeManufacturer,
            category,
            type: category,
            condition: selectedGrade.internalValue,
            conditionGrade: `${selectedGrade.rank} ${selectedGrade.englishLabel}`,
            askingPriceINR: priceNum,
            askingPriceAmount: priceNum * 100,
            price: priceNum,
            originalPriceINR: originalEst,
            imageUrl: activeImageUrl,
            image: activeImageUrl,
            imageUrls: [activeImageUrl, ...extraImageUrls.filter((url) => url.trim().length > 0)],
            videoUrl,
            status: 'ACTIVE',
            badge: selectedGrade.rank,
            sellerName: 'Kyojuro Rengoku',
            sellerRating: '5.0 (42 Verified Sales)',
            sellerAvatar: 'KR',
          };

          // Broadcast cross-tab instant state sync
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const channel = new BroadcastChannel('otaku_bargain_sync');
            channel.postMessage({
              type: 'LISTING_CREATED',
              payload: newListingPayload,
            });
            channel.close();
          }

          // Store locally so buyer feed discovers it immediately
          try {
            const stored = JSON.parse(localStorage.getItem('otaku_custom_listings') || '[]');
            localStorage.setItem('otaku_custom_listings', JSON.stringify([newListingPayload, ...stored]));
          } catch {
            // Ignore storage errors
          }

          setIsPublished(true);
        } catch (err: unknown) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to publish listing');
        }
      });
    },
    [
      title,
      priceNum,
      activeFranchise,
      description,
      activeImageUrl,
      category,
      selectedGrade,
      activeManufacturer,
      originalEst,
      extraImageUrls,
      videoUrl,
    ]
  );

  return (
    <div className="min-h-screen bg-[#09090b] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-zinc-100 pb-24">
      {/* Page Header & Typography */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-zinc-800 bg-zinc-900 text-zinc-400 text-[10px] tracking-[0.25em] uppercase mb-3 font-semibold">
          <span>Vault Studio</span>
          <span>•</span>
          <span>Consignment</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 uppercase tracking-[0.15em] mb-2">
          Vault Consignment
        </h1>
        <p className="mt-1 text-xs text-zinc-400 font-normal tracking-wide">
          List your authentic anime collectible with escrow security and real-time buyer bargaining.
        </p>
      </div>

      {/* Success Notification */}
      {isPublished && (
        <div className="bg-[#0e0e11] border border-emerald-500/40 p-8 mb-10 text-center">
          <div className="w-10 h-10 mx-auto mb-3 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-zinc-100 mb-2 uppercase tracking-[0.15em]">
            Grail Consigned Successfully
          </h2>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto mb-6 font-normal tracking-wide">
            Your listing is now live in the global vault catalog and synchronized across all active buyer windows.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-2.5 bg-zinc-100 hover:bg-white text-black text-xs font-bold uppercase tracking-[0.2em] transition-colors"
            >
              View in Buyer Feed →
            </Link>
            <button
              type="button"
              onClick={() => setIsPublished(false)}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer"
            >
              + Consign Another Grail
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Grid: Form Controls on Left, Live Card Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Streamlined Editorial Form Controls */}
        <form onSubmit={handlePublish} className="lg:col-span-7 space-y-12">
          {/* Step 1: Item Identity */}
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-semibold block mb-1">
                SECTION 01
              </span>
              <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-[0.2em]">
                Item Identity &amp; Series
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] font-medium text-zinc-400 mb-2">
                  Figure or Collectible Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g., Satoru Gojo - 1/7 Scale Shibuya Scramble"
                  className="w-full bg-[#0c0c0e] border border-zinc-800 px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-400 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                <div className="flex flex-col">
                  <label className="block text-xs uppercase tracking-[0.2em] font-medium text-zinc-400 mb-2">
                    Anime Franchise *
                  </label>
                  <select
                    value={franchise}
                    onChange={(e) => setFranchise(e.target.value)}
                    className="w-full bg-[#0c0c0e] border border-zinc-800 px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-400 outline-none transition-colors"
                  >
                    {FRANCHISES.map((f) => (
                      <option key={f} value={f} className="bg-[#0c0c0e] text-zinc-100">
                        {f}
                      </option>
                    ))}
                  </select>

                  {franchise === 'Other / Retro' && (
                    <input
                      type="text"
                      placeholder="Type custom anime franchise..."
                      value={customFranchise}
                      onChange={(e) => setCustomFranchise(e.target.value)}
                      className="w-full mt-3 bg-[#0c0c0e] border border-zinc-800 px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-400 outline-none transition-colors"
                    />
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="block text-xs uppercase tracking-[0.2em] font-medium text-zinc-400 mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0c0c0e] border border-zinc-800 px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-400 outline-none transition-colors"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#0c0c0e] text-zinc-100">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] font-medium text-zinc-400 mb-2">
                  Manufacturer or Studio
                </label>
                <select
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full bg-[#0c0c0e] border border-zinc-800 px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-400 outline-none transition-colors"
                >
                  {MANUFACTURERS.map((m) => (
                    <option key={m} value={m} className="bg-[#0c0c0e] text-zinc-100">
                      {m}
                    </option>
                  ))}
                </select>

                {manufacturer === 'Other' && (
                  <input
                    type="text"
                    placeholder="Type custom manufacturer studio..."
                    value={customManufacturer}
                    onChange={(e) => setCustomManufacturer(e.target.value)}
                    className="w-full mt-3 bg-[#0c0c0e] border border-zinc-800 px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-400 outline-none transition-colors"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Collector Condition Grading */}
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-semibold block mb-1">
                SECTION 02
              </span>
              <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-[0.2em]">
                Collector Condition Grading
              </h2>
            </div>
            <p className="text-xs text-zinc-400 -mt-2 font-normal tracking-wide">
              Select the authentic collector grade based on seal and packaging integrity:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONDITION_GRADES.map((grade) => {
                const isSelected = selectedGrade.rank === grade.rank;
                return (
                  <div
                    key={grade.rank}
                    onClick={() => setSelectedGrade(grade)}
                    className={`p-4 border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-zinc-300 bg-zinc-900/90'
                        : 'border-zinc-800 bg-[#0c0c0e] hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                        {grade.rank}
                      </span>
                      {isSelected && (
                        <span className="text-zinc-100 text-[10px] font-bold uppercase tracking-widest border border-zinc-600 px-1.5 py-0.5 bg-zinc-800">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-zinc-200 mb-1 tracking-wide">
                      {grade.englishLabel}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                      {grade.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Photo & Hologram Seal Verification */}
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-semibold block mb-1">
                SECTION 03
              </span>
              <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-[0.2em]">
                Photo &amp; Verification
              </h2>
            </div>

            {/* Standard Upload Modal Tabs */}
            <div className="flex overflow-x-auto border-b border-zinc-800 mb-4 no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveUploadTab('UPLOAD')}
                className={`pb-3 px-4 text-xs uppercase tracking-[0.2em] transition-colors whitespace-nowrap cursor-pointer ${
                  activeUploadTab === 'UPLOAD'
                    ? 'border-b-2 border-zinc-200 text-zinc-100 font-bold'
                    : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-300 font-medium'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveUploadTab('PRESETS')}
                className={`pb-3 px-4 text-xs uppercase tracking-[0.2em] transition-colors whitespace-nowrap cursor-pointer ${
                  activeUploadTab === 'PRESETS'
                    ? 'border-b-2 border-zinc-200 text-zinc-100 font-bold'
                    : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-300 font-medium'
                }`}
              >
                Gallery Presets
              </button>
              <button
                type="button"
                onClick={() => setActiveUploadTab('LINK')}
                className={`pb-3 px-4 text-xs uppercase tracking-[0.2em] transition-colors whitespace-nowrap cursor-pointer ${
                  activeUploadTab === 'LINK'
                    ? 'border-b-2 border-zinc-200 text-zinc-100 font-bold'
                    : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-300 font-medium'
                }`}
              >
                Custom URL
              </button>
            </div>

            {isUploading ? (
              <div className="h-52 w-full flex flex-col items-center justify-center bg-[#0c0c0e] border border-zinc-800 overflow-hidden">
                <div className="relative flex items-center justify-center w-16 h-16">
                  <div className="absolute inset-0 border border-zinc-700 animate-[spin_4s_linear_infinite]" />
                  <div className="absolute inset-2 border border-dashed border-zinc-400 animate-[spin_2s_linear_infinite_reverse]" />
                </div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-[0.25em] font-semibold mt-4">
                  Digitizing Asset...
                </span>
              </div>
            ) : (
              <div>
                {/* TAB 1: DEVICE UPLOAD */}
                {activeUploadTab === 'UPLOAD' && (
                  <div className="relative w-full h-52 border border-dashed border-zinc-800 hover:border-zinc-600 bg-[#0c0c0e] flex flex-col items-center justify-center transition-colors overflow-hidden">
                    {customImageUrl ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center p-3 z-20">
                        <div className="relative w-full h-32 overflow-hidden border border-zinc-800 bg-black flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={customImageUrl}
                            alt="Uploaded collectible"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-200 text-[10px] uppercase tracking-wider font-semibold">
                            Asset Attached
                          </div>
                        </div>

                        <div className="w-full mt-2 flex items-center justify-between px-1">
                          <div className="truncate max-w-[220px]">
                            <span className="text-xs text-zinc-200 block truncate font-medium">
                              {imageFile?.name || 'Custom Uploaded Photo'}
                            </span>
                            {imageFile && (
                              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                {(imageFile.size / 1024 / 1024).toFixed(2)} MB • Ready for Vault
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setImageFile(null);
                              setCustomImageUrl('');
                            }}
                            className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-700 uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Remove / Change
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="text-center pointer-events-none p-4">
                          <svg className="w-6 h-6 mx-auto mb-2 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                          </svg>
                          <span className="text-xs font-bold text-zinc-300 uppercase tracking-[0.2em] block mb-1">
                            Drag &amp; Drop Asset or Click to Browse
                          </span>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                            JPG, PNG, WEBP, MP4 (Max 50MB)
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* TAB 2: GALLERY PRESETS */}
                {activeUploadTab === 'PRESETS' && (
                  <div className="space-y-4">
                    <span className="block text-xs uppercase tracking-[0.2em] font-medium text-zinc-400 mb-2">
                      Select a Verified Showcase Asset:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_IMAGE_PRESETS.map((preset) => (
                        <button
                          type="button"
                          key={preset.label}
                          onClick={() => {
                            setImageUrl(preset.url);
                            setCustomImageUrl('');
                          }}
                          className={`px-3 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                            imageUrl === preset.url && !customImageUrl
                              ? 'bg-zinc-100 text-black border border-zinc-100 font-bold'
                              : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 font-medium'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: CUSTOM URL */}
                {activeUploadTab === 'LINK' && (
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] font-medium text-zinc-400 mb-2">
                      Direct Image / Asset URL
                    </label>
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-[#0c0c0e] border border-zinc-800 px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-400 outline-none transition-colors"
                    />
                    <p className="text-[10px] text-zinc-500 mt-2 font-normal">
                      * Ensure asset link ends in .jpg, .png, or .webp for direct embedding.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Extra Gallery Images & Video Attachment Section */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <label className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400 block">
                Extra Gallery Images (Optional)
              </label>

              {extraImageUrls.map((url, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    id={`extra-file-${idx}`}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const updated = [...extraImageUrls];
                        updated[idx] = URL.createObjectURL(file);
                        setExtraImageUrls(updated);
                      }
                    }}
                  />

                  <input
                    type="url"
                    readOnly
                    placeholder="Click 'Browse' to upload an image..."
                    value={url}
                    className="flex-1 bg-[#0c0c0e] border border-zinc-800 px-4 py-2.5 text-xs text-zinc-400 cursor-not-allowed outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => document.getElementById(`extra-file-${idx}`)?.click()}
                    className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider border border-zinc-700 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    Browse
                  </button>

                  {idx === extraImageUrls.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setExtraImageUrls([...extraImageUrls, ''])}
                      className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider border border-zinc-700 cursor-pointer transition-colors whitespace-nowrap"
                    >
                      + Add
                    </button>
                  )}
                </div>
              ))}

              <label className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400 block mt-4">
                Unboxing / Verification Video URL (YouTube / MP4)
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-[#0c0c0e] border border-zinc-800 px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-400 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Step 4: Pricing & Auto-Bargaining Controls */}
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-semibold block mb-1">
                SECTION 04
              </span>
              <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-[0.2em]">
                Pricing &amp; Bargaining Floor
              </h2>
            </div>
            <p className="text-xs text-zinc-400 -mt-2 font-normal tracking-wide">
              Set your public asking price and an optional floor below which buyer offers are auto-rejected.
            </p>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-medium text-zinc-400 mb-2">
                    Asking Price (INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-xs text-zinc-500 font-bold">₹</span>
                    <input
                      type="number"
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(e.target.value)}
                      required
                      placeholder="7200"
                      className="w-full bg-[#0c0c0e] border border-zinc-800 pl-7 pr-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-400 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-medium text-zinc-400 mb-2">
                    Auto-Reject Floor (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-xs text-zinc-500 font-bold">₹</span>
                    <input
                      type="number"
                      value={minimumPrice}
                      onChange={(e) => setMinimumPrice(e.target.value)}
                      placeholder="6000"
                      className="w-full bg-[#0c0c0e] border border-zinc-800 pl-7 pr-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-400 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] font-medium text-zinc-400 mb-2">
                  Collector Authenticity Notes
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Include details regarding packaging condition, manufacturer authenticity seal, or purchase history..."
                  className="w-full bg-[#0c0c0e] border border-zinc-800 px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-400 outline-none transition-colors resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-950/30 border border-red-500/40 text-red-300 text-xs tracking-wide">
              {errorMessage}
            </div>
          )}

          {/* D. Final Submit Button: Universal Button Token */}
          <button
            type="submit"
            id="submit-sell-btn"
            disabled={isPending}
            className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-100 text-zinc-200 hover:text-black border border-zinc-700 hover:border-zinc-100 text-xs font-bold uppercase tracking-[0.25em] transition-colors cursor-pointer mt-4"
          >
            {isPending ? 'Publishing Grail to Vault...' : 'Drop Grail into Marketplace'}
          </button>
        </form>

        {/* C. Right Column: Live Card Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm sticky top-28">
            <div className="mb-4">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-300 block mb-1">
                Live Card Preview
              </span>
              <p className="text-[11px] text-zinc-500 font-normal">
                Real-time gallery catalog rendering with condition badge
              </p>
            </div>

            <LiveCardPreview
              title={title || 'Untitled Collectible'}
              series={activeFranchise}
              category={category}
              manufacturer={activeManufacturer}
              conditionGrade={selectedGrade.rank}
              askingPriceINR={priceNum}
              imageUrl={activeImageUrl}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar (Hidden on desktop) */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-[#09090b] border-t border-zinc-800 p-4 pb-safe flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Total Valuation</span>
          <span className="text-sm font-extrabold text-zinc-100 tracking-wider">
            ₹{priceNum > 0 ? priceNum.toLocaleString('en-IN') : '0'}
          </span>
        </div>

        {/* Universal Button Token */}
        <button
          type="button"
          onClick={() => {
            const btn = document.getElementById('submit-sell-btn');
            if (btn) btn.click();
          }}
          disabled={isPending}
          className="px-6 py-3 bg-zinc-900 hover:bg-zinc-100 text-zinc-200 hover:text-black border border-zinc-700 hover:border-zinc-100 text-[11px] font-bold uppercase tracking-[0.25em] transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {isPending ? 'Publishing...' : 'Lock Escrow'}
        </button>
      </div>
    </div>
  );
}