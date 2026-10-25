'use client';

/**
 * @file src/presentation/components/listings/ProductCard.tsx
 *
 * Strict Brutalist Archival Product Card for OtakuBazaar.
 * Faithfully inherits the visual language of the /sell VAULT CONSIGNMENT "LIVE CARD PREVIEW":
 *
 * 1. Header Row: LOT #0482 • VAULT ID: JP-TYO (left) + boxed grade badge [S-RANK] (right).
 * 2. Strict 4:5 Studio Image Frame: aspect-[4/5] portrait mat (p-3 bg-[#0A0A0A] border border-[#1A1A1A] my-4)
 *    with object-cover object-center (zero floating edition pills, flat dark pulsing placeholder).
 * 3. Editorial Metadata: Franchise & Category, font-serif collectible title, Studio & Custody Spec.
 * 4. Escrow & Valuation: ESCROW VERIFIED / 48H INSPECTION, Price box with ASKING / OFFER and ₹ INR valuation.
 * 5. Consistent Action: [ INSPECT LOT DETAILS ] across every card (zero hover scale transforms).
 */

import React, { useState } from 'react';
import Link from 'next/link';

export interface ProductCardProps {
  product: {
    id: string;
    lotNumber?: string;
    title: string;
    price?: number;
    askingPriceAmount?: number;
    category?: string | null;
    categorySubtitle?: string;
    edition?: string;
    condition?: string | null;
    gradeCondition?: string;
    figureGrade?: string;
    boxCondition?: string;
    origin?: string;
    indianLocation?: string;
    ownerCount?: string;
    franchise?: string;
    series?: string;
    manufacturer?: string;
    imageUrl?: string;
    imageUrls?: string | null;
  };
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps): React.JSX.Element {
  const [imageLoaded, setImageLoaded] = useState(false);

  const displayPrice =
    typeof product.price === 'number' && product.price > 0
      ? product.price
      : Math.round((product.askingPriceAmount || 0) / 100);

  let rawImageUrl = product.imageUrl || '/Firefly_clean.png';
  try {
    if (product.imageUrls) {
      const parsed = JSON.parse(product.imageUrls);
      if (Array.isArray(parsed) && parsed[0]) {
        rawImageUrl = parsed[0];
      } else if (typeof parsed === 'string') {
        rawImageUrl = parsed;
      }
    }
  } catch {
    if (product.imageUrls) rawImageUrl = product.imageUrls;
  }

  const [currentImage, setCurrentImage] = useState<string>(rawImageUrl);

  // Derived lot telemetry
  const lotNumber =
    product.lotNumber ||
    String(product.id).replace(/[^0-9]/g, '').padStart(4, '0').slice(-4) ||
    '0482';

  const vaultId = product.origin?.toUpperCase().includes('MUMBAI')
    ? 'IN-BOM'
    : product.origin?.toUpperCase().includes('BENGALURU')
    ? 'IN-BLR'
    : product.origin?.toUpperCase().includes('AHMEDABAD')
    ? 'IN-AMD'
    : product.origin?.toUpperCase().includes('DELHI')
    ? 'IN-DEL'
    : 'JP-TYO';

  // Format Condition Grade
  const rawGrade = product.gradeCondition || (product.condition === 'NEW' ? 'GRADE S (MINT)' : 'GRADE A');
  let gradeBadge = '[S-RANK]';
  if (rawGrade.toUpperCase().includes('SEALED') || rawGrade.toUpperCase().includes('MISB')) {
    gradeBadge = '[FACTORY SEALED]';
  } else if (rawGrade.toUpperCase().includes('GRADE S') || rawGrade.toUpperCase().includes('MINT')) {
    gradeBadge = '[S-RANK]';
  } else if (rawGrade.toUpperCase().includes('GRADE A') || rawGrade.toUpperCase().includes('BIB')) {
    gradeBadge = '[A-RANK]';
  } else if (rawGrade.toUpperCase().includes('GRADE B')) {
    gradeBadge = '[B-RANK]';
  }

  // Derive Franchise & Category
  const franchise =
    product.franchise ||
    product.series ||
    (product.title.toUpperCase().includes('BERSERK')
      ? 'BERSERK'
      : product.title.toUpperCase().includes('RENGOKU') || product.title.toUpperCase().includes('DEMON SLAYER')
      ? 'DEMON SLAYER'
      : product.title.toUpperCase().includes('GOJO') || product.title.toUpperCase().includes('JUJUTSU')
      ? 'JUJUTSU KAISEN'
      : product.title.toUpperCase().includes('SABER') || product.title.toUpperCase().includes('FATE')
      ? 'FATE / STAY NIGHT'
      : product.title.toUpperCase().includes('EDWARD') || product.title.toUpperCase().includes('ALCHEMIST')
      ? 'FULLMETAL ALCHEMIST'
      : product.title.toUpperCase().includes('EVA') || product.title.toUpperCase().includes('EVANGELION')
      ? 'EVANGELION'
      : product.title.toUpperCase().includes('LUFFY') || product.title.toUpperCase().includes('ONE PIECE')
      ? 'ONE PIECE'
      : 'ARCHIVAL JAPAN');

  const category = (product.category || 'SCALE FIGURE').toUpperCase();

  // Derive Studio and Custody Spec
  const studio = (product.manufacturer || 'GOOD SMILE COMPANY').toUpperCase();
  const custodyOrigin = product.origin || (product.indianLocation ? `${product.indianLocation} • IN-HAND` : 'MUMBAI, MH • IN-HAND');
  const boxGrade = product.boxCondition || 'BOX: A-GRADE';

  const lotRoute = `/lot/${product.id}`;

  return (
    <div
      className={`bg-[#0C0C0C] border border-[#1F1F1F] hover:border-[#3A3A3A] p-5 relative flex flex-col justify-between select-none transition-colors group rounded-none ${className}`.trim()}
    >
      <div>
        {/* 1. Header Row */}
        <div className="flex items-center justify-between text-[10px] tracking-[0.15em] text-[#777777] mb-2 font-sans uppercase">
          <span>
            LOT #{lotNumber} • VAULT ID: {vaultId}
          </span>
          <span className="border border-[#2A2A2A] px-2 py-0.5 text-[10px] tracking-[0.12em] text-[#E5E5E5] bg-[#080808] uppercase">
            {gradeBadge}
          </span>
        </div>

        {/* 2. Strict 4:5 Studio Image Frame (No Floating Text Badges) */}
        <Link href={lotRoute} className="block no-underline">
          <div className="relative w-full aspect-[4/5] p-3 bg-[#0A0A0A] border border-[#1A1A1A] my-4 overflow-hidden flex items-center justify-center group-hover:border-[#2A2A2A] transition-colors">
            {/* Flat dark pulsing placeholder while image loads */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-[#141414] animate-pulse pointer-events-none" />
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt={product.title}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                setCurrentImage('/Firefly_clean.png');
                setImageLoaded(true);
              }}
              className={`w-full h-full object-cover object-center transition-opacity duration-150 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        </Link>

        {/* 3. Editorial Metadata Block */}
        <div className="space-y-1.5">
          {/* Row 1: Franchise & Category */}
          <div className="text-[10px] tracking-[0.14em] text-[#888888] uppercase truncate font-sans">
            {franchise} • {category}
          </div>

          {/* Row 2: Collectible Title */}
          <Link href={lotRoute} className="block no-underline">
            <h3 className="font-serif text-[16px] text-[#F2EFE9] uppercase tracking-[0.04em] line-clamp-2 min-h-[44px] group-hover:text-white transition-colors leading-tight">
              {product.title}
            </h3>
          </Link>

          {/* Row 3: Studio & Collector Custody Specs */}
          <div className="text-[10px] tracking-[0.12em] text-[#666666] uppercase truncate font-sans">
            STUDIO: {studio} • {custodyOrigin} • {boxGrade}
          </div>
        </div>

        {/* 4. Escrow & Valuation Footer */}
        <div className="mt-4 pt-3 border-t border-[#161616]">
          {/* Status Line */}
          <div className="flex items-center justify-between text-[10px] tracking-[0.14em] font-sans uppercase">
            <span className="text-[#10B981] font-semibold">ESCROW VERIFIED</span>
            <span className="text-[#777777]">48H INSPECTION</span>
          </div>

          {/* Price Box */}
          <div className="border border-[#1F1F1F] bg-[#0C0C0C] px-3.5 py-2.5 mt-3 flex justify-between items-center">
            <span className="text-[10px] tracking-[0.15em] text-[#888888] font-sans uppercase">
              ASKING / OFFER
            </span>
            <span className="font-serif text-[18px] text-[#F2EFE9] tracking-wider">
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Consistent Inspect Lot Action Across Every Card */}
      <div className="mt-3">
        <Link
          href={lotRoute}
          className="w-full py-2.5 text-center border border-[#1F1F1F] bg-[#080808] hover:bg-[#F2EFE9] hover:text-[#080808] hover:border-[#F2EFE9] text-[#888888] text-[11px] tracking-[0.14em] uppercase transition-colors block no-underline font-sans cursor-pointer"
        >
          [ INSPECT LOT DETAILS ]
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;
