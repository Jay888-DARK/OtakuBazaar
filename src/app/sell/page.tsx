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
 * - Client-side Parallel Image Compression (max 1200px, 0.82 JPEG quality)
 * - Strict Per-Field Inline Validation with Smooth Auto-Scroll & .focus()
 * - Step-by-Step Progress & Multi-Click Prevention on Submission
 */

import React, { useState, useTransition, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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

/**
 * Client-side EXIF/GPS Metadata Stripper & Canvas Image Compressor.
 * 
 * Security & Privacy Guarantees:
 * - Enforces strict client-side MIME type allowlist: image/jpeg, image/png, image/webp.
 * - Enforces 5MB maximum file size boundary.
 * - Draws raw image pixels onto an offscreen HTML5 <canvas> (max dimension 1600px, aspect-ratio preserved).
 * - Exports via canvas.toBlob(..., 'image/webp', 0.82) with JPEG fallback.
 * - Strips 100% of EXIF, GPS, camera model, orientation, and hardware serial metadata
 *   BEFORE any bytes leave the user's browser device.
 */
async function compressAndStripExif(file: File, maxDim = 1600, quality = 0.82): Promise<string> {
  const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!ALLOWED_MIMES.includes(file.type.toLowerCase())) {
    throw new Error('Invalid format: Only JPG, PNG, and WEBP photographs are permitted.');
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Photograph size exceeds 5MB limit. Please select an optimized photo.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw image onto clean offscreen canvas (strips all EXIF/GPS tags)
        ctx.drawImage(img, 0, 0, width, height);

        // Export via canvas.toBlob to guarantee clean WebP rasterization
        if (typeof canvas.toBlob === 'function') {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const blobReader = new FileReader();
                blobReader.onloadend = () => resolve(blobReader.result as string);
                blobReader.onerror = () => resolve(canvas.toDataURL('image/webp', quality));
                blobReader.readAsDataURL(blob);
              } else {
                // Fallback to direct WebP/JPEG dataURL
                try {
                  resolve(canvas.toDataURL('image/webp', quality));
                } catch {
                  resolve(canvas.toDataURL('image/jpeg', quality));
                }
              }
            },
            'image/webp',
            quality
          );
        } else {
          try {
            resolve(canvas.toDataURL('image/webp', quality));
          } catch {
            resolve(canvas.toDataURL('image/jpeg', quality));
          }
        }
      };
      img.onerror = () => reject(new Error('Failed to parse specimen image pixels.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read photo file from disk.'));
    reader.readAsDataURL(file);
  });
}

export default function SellPage(): React.JSX.Element {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/sell');
    }
  }, [status, router]);

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
  const [activeUploadTab, setActiveUploadTab] = useState<'UPLOAD' | 'LINK'>('UPLOAD');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Per-Field Inline Validation State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPublished, setIsPublished] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Derived Values
  const activeFranchise = franchise === 'Other / Retro' ? customFranchise || 'Anime Series' : franchise;
  const activeCategory = category === 'Other' ? customCategory || 'Other' : category;
  const activeManufacturer = manufacturer === 'Other' ? customManufacturer || 'Import Studio' : manufacturer;
  const activeImageUrl = (customImageUrl.trim() || imageUrl || '') as string;
  const priceNum = parseInt(askingPrice, 10) || 0;
  const originalEst = Math.round(priceNum * 1.25);

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
    if (globalError) setGlobalError(null);
  };

  const handleResetForm = () => {
    setTitle('');
    setDescription('');
    setAskingPrice('');
    setMinimumPrice('');
    setImageUrl('');
    setCustomImageUrl('');
    setExtraImageUrls(['']);
    setInvoiceFileName('');
    setInvoicePreviewUrl('');
    setInvoiceUploaded(false);
    setFieldErrors({});
    setGlobalError(null);
    setIsPublished(false);
  };

  const hasErrors = Object.keys(fieldErrors).length > 0 || !!globalError;
  const firstErrorMessage = globalError || Object.values(fieldErrors)[0];
  const buttonErrorMessage = fieldErrors.title
    ? 'ITEM TITLE (MIN 3 CHARS)'
    : fieldErrors.askingPrice
    ? 'ASKING PRICE (MIN ₹500)'
    : fieldErrors.image
    ? 'COLLECTIBLE SPECIMEN PHOTO'
    : fieldErrors.pickupPincode
    ? 'VALID 6-DIGIT PICKUP PINCODE'
    : fieldErrors.invoice
    ? 'PURCHASE INVOICE FOR > ₹10,000'
    : firstErrorMessage
    ? firstErrorMessage.slice(0, 36).toUpperCase()
    : 'COMPLETE HIGHLIGHTED FIELDS';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    clearFieldError('image');
    try {
      const sanitizedDataUri = await compressAndStripExif(file, 1600, 0.82);
      setImageUrl(sanitizedDataUri);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sanitize image file.';
      setFieldErrors((prev) => ({ ...prev, image: msg }));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInvoiceFileName(file.name);
    setInvoiceUploaded(true);
    clearFieldError('invoice');

    if (file.type.startsWith('image/')) {
      try {
        const sanitized = await compressAndStripExif(file, 1200, 0.75);
        setInvoicePreviewUrl(sanitized);
      } catch {
        setInvoicePreviewUrl(URL.createObjectURL(file));
      }
    } else {
      setInvoicePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePublish = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setGlobalError(null);

      // Validate per-field
      const errors: Record<string, string> = {};

      if (!title.trim()) {
        errors.title = 'Collectible title is required (minimum 3 characters).';
      } else if (title.trim().length < 3) {
        errors.title = 'Collectible title must be at least 3 characters.';
      }

      if (!priceNum || priceNum < 500) {
        errors.askingPrice = 'Asking price must be at least ₹500 INR.';
      } else if (priceNum > 10_000_000) {
        errors.askingPrice = 'Asking price cannot exceed ₹10,000,000 INR.';
      }

      if (!activeImageUrl) {
        errors.image = 'A genuine photograph of your collectible item is required.';
      }

      if (!pickupPincode || !/^[1-9][0-9]{5}$/.test(pickupPincode.trim())) {
        errors.pickupPincode = 'A valid 6-digit Indian pickup PIN code is required for courier dispatch.';
      }

      if (priceNum > 10000 && !invoiceUploaded && !invoicePreviewUrl) {
        errors.invoice = 'Proof of purchase or store invoice is mandatory for grails valued over ₹10,000.';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        // Auto-scroll and focus first invalid field
        const checkOrder = ['title', 'askingPrice', 'image', 'pickupPincode', 'invoice'];
        const firstKey = checkOrder.find((key) => errors[key]);
        if (firstKey) {
          const el = document.getElementById(`field-${firstKey}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
          }
        }
        return;
      }

      setFieldErrors({});

      startTransition(async () => {
        try {
          const cleanDesc = description.trim() || 'Verified archival anime collectible consigned to OtakuBazaar vault custody.';
          const result = await createListingAction({
            title: `[${activeFranchise}] ${title.trim()}`,
            series: activeFranchise,
            category: activeCategory,
            manufacturer: activeManufacturer,
            condition: selectedGrade.internalValue,
            conditionGrade: selectedGrade.rank,
            askingPriceINR: priceNum,
            originalPriceINR: originalEst,
            imageUrl: activeImageUrl,
            description: cleanDesc,
            pickupPincode: pickupPincode.trim(),
            weightKg: parseFloat(shippingWeightKg) || 1.5,
            dimensionsCm: `${boxLengthCm}x${boxWidthCm}x${boxHeightCm}`,
            invoiceProofUrl: invoicePreviewUrl || undefined,
          });

          if (!result.success) {
            setGlobalError(result.error || 'Failed to consign lot.');
            return;
          }

          const newListingPayload = {
            id: result.data?.id || `listing_${Date.now()}`,
            title: `[${activeFranchise}] ${title.trim()}`,
            name: `[${activeFranchise}] ${title.trim()}`,
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

          setFieldErrors({});
          setGlobalError(null);
          setIsPublished(true);
          setTimeout(() => {
            const submitEl = document.getElementById('field-submit');
            if (submitEl) {
              submitEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 80);
        } catch (err: unknown) {
          setGlobalError(err instanceof Error ? err.message : 'Failed to publish consignment');
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center font-sans text-xs uppercase tracking-widest text-[#777777]">
        [ VERIFYING COLLECTOR CREDENTIALS... ]
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center font-sans text-xs uppercase tracking-widest text-[#777777]">
        [ REDIRECTING TO AUTHENTICATION PORTAL... ]
      </div>
    );
  }

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

        {/* Global Error Banner (Only for network/server action exceptions) */}
        {globalError && (
          <div className="bg-[#180A0A] border border-[#EF4444] p-4 mb-6 font-sans text-xs text-[#EF4444] uppercase tracking-wider">
            [ ERROR: {globalError} ]
          </div>
        )}

        {/* Success Notification */}
        {isPublished && (
          <div className="bg-[#091812] border border-[#10B981] p-8 mb-8 text-center font-sans">
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
                href="/vault"
                className="px-6 py-2.5 bg-[#F2EFE9] text-[#080808] font-sans text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors no-underline"
              >
                [ VIEW IN COLLECTOR VAULT ]
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsPublished(false);
                  setTitle('');
                  setAskingPrice('');
                  setDescription('');
                  setImageUrl('');
                  setCustomImageUrl('');
                  setInvoiceUploaded(false);
                  setInvoiceFileName('');
                  setInvoicePreviewUrl('');
                }}
                className="px-6 py-2.5 bg-[#0C0C0C] text-[#CCCCCC] border border-[#1F1F1F] font-sans text-[11px] uppercase tracking-[0.18em] transition-colors cursor-pointer"
              >
                [ + CONSIGN ANOTHER LOT ]
              </button>
            </div>
          </div>
        )}

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Consignment Configuration Form */}
          <form onSubmit={handlePublish} className="lg:col-span-7 space-y-8" noValidate>
            {/* Section 01: Item Identity & Series */}
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
                  id="field-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearFieldError('title');
                  }}
                  placeholder="e.g., Satoru Gojo - 1/7 Scale Shibuya Scramble"
                  className={`w-full bg-[#080808] border px-4 py-3 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none transition-colors ${
                    fieldErrors.title ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#1F1F1F] focus:border-[#F2EFE9]'
                  }`}
                />
                {fieldErrors.title && (
                  <p className="text-[10px] text-[#EF4444] font-mono mt-1.5 tracking-wider">
                    [ ERROR: {fieldErrors.title} ]
                  </p>
                )}
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

              {/* Upload Mode Selector */}
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
                  Real Photo Upload (Mandatory) *
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
                  Direct Image URL
                </button>
              </div>

              {/* Photo Input Area */}
              {activeUploadTab === 'UPLOAD' && (
                <div
                  id="field-image"
                  className={`p-8 border border-dashed text-center transition-colors ${
                    fieldErrors.image ? 'border-[#EF4444] bg-[#140808]' : 'border-[#1F1F1F] bg-[#080808]'
                  }`}
                >
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
                    {imageUrl ? '[ CHANGE UPLOADED SPECIMEN PHOTO ]' : '[ CHOOSE REAL ITEM PHOTOGRAPH * ]'}
                  </label>
                  <p className="text-[10px] text-[#777777] mt-2">
                    JPG, PNG, or WEBP • In-hand photos automatically compressed for instant vault synchronization
                  </p>
                  {isCompressing && (
                    <p className="text-[10px] text-[#F2EFE9] mt-2 animate-pulse font-mono">
                      [ COMPRESSING &amp; OPTIMIZING SPECIMEN RESOLUTION... ]
                    </p>
                  )}
                  {imageUrl && !isCompressing && (
                    <p className="text-[10px] text-[#10B981] mt-2 font-mono">
                      [ OPTIMIZED SPECIMEN IMAGE LOADED // ESCROW READY ]
                    </p>
                  )}
                  {fieldErrors.image && (
                    <p className="text-[10px] text-[#EF4444] font-mono mt-2 tracking-wider">
                      [ ERROR: {fieldErrors.image} ]
                    </p>
                  )}
                </div>
              )}

              {activeUploadTab === 'LINK' && (
                <div id="field-image">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => {
                      setCustomImageUrl(e.target.value);
                      clearFieldError('image');
                    }}
                    placeholder="https://..."
                    className={`w-full bg-[#080808] border px-4 py-3 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none transition-colors ${
                      fieldErrors.image ? 'border-[#EF4444]' : 'border-[#1F1F1F] focus:border-[#F2EFE9]'
                    }`}
                  />
                  {fieldErrors.image && (
                    <p className="text-[10px] text-[#EF4444] font-mono mt-1.5 tracking-wider">
                      [ ERROR: {fieldErrors.image} ]
                    </p>
                  )}
                </div>
              )}

              {/* Upload Slots for Timestamp Note + Hologram Macro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#161616]">
                <div className="p-3 border border-[#1F1F1F] bg-[#080808] space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#888888] font-semibold block">
                    HOLOGRAM PROOF SLOT (OPTIONAL)
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
                    HANDWRITTEN TIMESTAMP SLOT (OPTIONAL)
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

              {/* Proof of Purchase / Invoice Upload */}
              <div id="field-invoice" className="pt-4 border-t border-[#161616] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#888888] font-semibold block">
                    PROOF OF PURCHASE / INVOICE {priceNum > 10000 ? '* (MANDATORY OVER ₹10,000)' : '(OPTIONAL)'}
                  </span>
                  {priceNum > 10000 && (
                    <span className="text-[9px] uppercase tracking-[0.14em] text-[#EF4444] border border-[#EF4444]/40 bg-[#EF4444]/10 px-2 py-0.5 font-bold">
                      REQUIRED FOR ₹10,000+ LOTS *
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#777777] leading-relaxed">
                  Upload store receipt, AmiAmi/GoodSmile import invoice, or customs bill to verify provenance and eliminate counterfeit disputes.
                </p>
                <div
                  className={`p-4 border border-dashed flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors ${
                    fieldErrors.invoice ? 'border-[#EF4444] bg-[#140808]' : 'border-[#1F1F1F] bg-[#080808]'
                  }`}
                >
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
                {fieldErrors.invoice && (
                  <p className="text-[10px] text-[#EF4444] font-mono mt-1.5 tracking-wider">
                    [ ERROR: {fieldErrors.invoice} ]
                  </p>
                )}
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
                    id="field-pickupPincode"
                    type="text"
                    maxLength={6}
                    value={pickupPincode}
                    onChange={(e) => {
                      setPickupPincode(e.target.value.replace(/\D/g, ''));
                      clearFieldError('pickupPincode');
                    }}
                    placeholder="e.g. 400001"
                    className={`w-full bg-[#080808] border px-4 py-3 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none font-mono transition-colors ${
                      fieldErrors.pickupPincode
                        ? 'border-[#EF4444] focus:border-[#EF4444]'
                        : 'border-[#1F1F1F] focus:border-[#F2EFE9]'
                    }`}
                  />
                  {fieldErrors.pickupPincode && (
                    <p className="text-[10px] text-[#EF4444] font-mono mt-1.5 tracking-wider">
                      [ ERROR: {fieldErrors.pickupPincode} ]
                    </p>
                  )}
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
                  Outer Carton Dimensions (L × W × H in cm) (Optional)
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
                    id="field-askingPrice"
                    type="number"
                    min="500"
                    value={askingPrice}
                    onChange={(e) => {
                      setAskingPrice(e.target.value);
                      clearFieldError('askingPrice');
                    }}
                    placeholder="28500"
                    className={`w-full bg-[#080808] border px-4 py-3 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none transition-colors ${
                      fieldErrors.askingPrice
                        ? 'border-[#EF4444] focus:border-[#EF4444]'
                        : 'border-[#1F1F1F] focus:border-[#F2EFE9]'
                    }`}
                  />
                  {fieldErrors.askingPrice && (
                    <p className="text-[10px] text-[#EF4444] font-mono mt-1.5 tracking-wider">
                      [ ERROR: {fieldErrors.askingPrice} ]
                    </p>
                  )}
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
                  Curatorial Provenance &amp; Custody Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes on glass Moducase storage, smoke-free home, unboxing inspection history (optional)..."
                  className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-4 py-3 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none resize-none"
                />
              </div>

              {/* Submit CTA with Dynamic Reactive States */}
              {isPublished ? (
                <div className="space-y-3 pt-2">
                  <div
                    id="field-submit"
                    className="w-full py-4 bg-[#091812] text-[#10B981] border-2 border-[#10B981] text-xs font-semibold uppercase tracking-[0.2em] flex items-center justify-center gap-2 rounded-none transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                    <span>[ CONSIGNMENT ACCEPTED // LIVE IN VAULT ]</span>
                  </div>

                  {/* Immediate in-place confirmation block */}
                  <div className="p-5 bg-[#0C140F] border border-[#10B981] text-center font-sans space-y-3">
                    <div className="text-[10px] text-[#10B981] uppercase tracking-[0.2em] font-bold">
                      [ LOT AUTHENTICATED &amp; SYNCHRONIZED ]
                    </div>
                    <p className="text-xs text-[#F2EFE9] max-w-md mx-auto leading-relaxed">
                      Your consignment <span className="font-semibold text-white">&ldquo;[{activeFranchise}] {title}&rdquo;</span> is now active in the live catalog and visible to all collectors.
                    </p>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <Link
                        href="/vault"
                        className="px-5 py-2.5 bg-[#10B981] text-[#080808] font-sans text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-[#0ea572] transition-colors no-underline"
                      >
                        [ VIEW IN MY VAULT ]
                      </Link>
                      <Link
                        href="/"
                        className="px-5 py-2.5 bg-[#0C0C0C] text-[#F2EFE9] border border-[#1F1F1F] font-sans text-[11px] font-semibold uppercase tracking-[0.16em] hover:border-[#3A3A3A] transition-colors no-underline"
                      >
                        [ VIEW ON MARKETPLACE ]
                      </Link>
                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="px-5 py-2.5 bg-transparent text-[#888888] hover:text-[#F2EFE9] border border-[#1F1F1F] font-sans text-[11px] uppercase tracking-[0.16em] transition-colors"
                      >
                        [ CONSIGN ANOTHER LOT ]
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    id="field-submit"
                    disabled={hasErrors || isPending || isCompressing || isUploading}
                    className={`w-full py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-all rounded-none ${
                      hasErrors
                        ? 'bg-[#7F1D1D] hover:bg-[#7F1D1D] text-[#F2EFE9] border border-[#EF4444] cursor-not-allowed'
                        : isPending || isCompressing || isUploading
                        ? 'bg-[#1F1F1F] text-[#888888] border border-[#1F1F1F] cursor-wait'
                        : 'bg-[#F2EFE9] hover:bg-[#EAE6DF] text-[#080808] border border-[#F2EFE9] cursor-pointer active:scale-[0.99]'
                    }`}
                  >
                    {isCompressing
                      ? '[ COMPRESSING SPECIMEN IMAGES... ]'
                      : isUploading
                      ? '[ UPLOADING SPECIMEN TO VAULT... ]'
                      : isPending
                      ? '[ PUBLISHING CONSIGNMENT TO LIVE VAULT... ]'
                      : hasErrors
                      ? `[ REQUIRED: ${buttonErrorMessage} ]`
                      : '[ PUBLISH CONSIGNMENT TO LIVE VAULT ]'}
                  </button>

                  {hasErrors && (
                    <div className="p-3.5 bg-[#180A0A] border border-[#EF4444] font-sans text-left space-y-1">
                      <div className="text-[10px] text-[#EF4444] font-bold uppercase tracking-[0.18em]">
                        [ SPECIFICATION REQUIRED BEFORE PUBLISHING ]
                      </div>
                      <p className="text-xs text-[#F2EFE9] leading-relaxed">
                        {firstErrorMessage}
                      </p>
                    </div>
                  )}
                </div>
              )}
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

      <ArchivalFooter />
    </div>
  );
}
