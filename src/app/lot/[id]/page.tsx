import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { MockProduct } from '@/lib/mockProducts';
import { ListingRepository } from '@/infrastructure/database/repositories/ListingRepository';
import { LotDetailClientView } from '@/presentation/components/products/LotDetailClientView';
import { optimizeImageUrl } from '@/infrastructure/utils/imageOptimizer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

async function getProductFromDb(id: string): Promise<MockProduct | null> {
  const listing = await ListingRepository.findById(id);
  if (!listing) return null;

  const priceINR = Math.round(listing.askingPriceAmount / 100);
  const rawPrimary = listing.imageUrls[0] || '/otakubazaar-logo.png';
  const primaryImg = optimizeImageUrl(rawPrimary, 1200);
  const optimizedGallery = listing.imageUrls.map((url) => optimizeImageUrl(url, 1200));

  const categorySubtitle =
    listing.category === 'Statues & Resin'
      ? 'PRE-PAINTED POLYSTONE MONUMENT'
      : listing.category === 'Mecha & Gunpla'
        ? 'DIE-CAST & COMPOSITE METAL BUILD'
        : listing.category === 'Manga Sets'
          ? 'COMPLETE ARCHIVAL RUN'
          : 'AUTHENTIC JAPANESE IMPORT';

  const scale =
    listing.title.includes('1/4')
      ? '1/4 SCALE'
      : listing.title.includes('1/6')
        ? '1/6 SCALE'
        : listing.title.includes('1/8')
          ? '1/8 SCALE'
          : listing.title.includes('1/7')
            ? '1/7 SCALE'
            : 'NON-SCALE';

  return {
    id: listing.id,
    lotNumber: String(listing.id).replace(/[^0-9]/g, '').padStart(4, '0').slice(-4) || '0001',
    title: listing.title,
    franchise: listing.category || 'Anime',
    series: listing.title,
    category: (listing.category as any) || 'Scale Figure',
    categorySubtitle,
    edition: 'VERIFIED ARCHIVAL CUSTODY',
    price: priceINR,
    imageUrl: primaryImg,
    condition: (listing.condition as any) || 'NEW',
    gradeCondition: listing.condition === 'NEW' ? 'GRADE S // MISB (FACTORY SEALED)' : 'GRADE A // BIB (DISPLAYED)',
    figureGrade: listing.condition === 'NEW' ? 'MISB (FACTORY SEALED)' : 'BIB (CABINET DISPLAYED)',
    boxCondition: listing.condition === 'NEW' ? 'FACTORY CARTON SEALED' : 'MINT BOX (BLISTER INTACT)',
    origin: 'PAN-INDIA VAULT • IN-HAND',
    indianLocation: 'MUMBAI, MH',
    ownerCount: '1ST OWNER',
    sellerHandle: `@vault_seller_${listing.sellerId.slice(-6)}`,
    dispatchSla: '48H INSURED BLUEDART AIR (CRATED)',
    scale,
    weight: '2.4 KG',
    seal: 'TAMPER-EVIDENT HOLOGRAPHIC SEAL VERIFIED',
    sculptor: 'Authentic Studio Artisans',
    manufacturer: 'Japanese Manufacturer',
    boxDimensions: '340 × 260 × 200 MM',
    provenance: listing.description || 'Verified Japanese imported collectible held in secure custody under 48-hour unboxing inspection escrow.',
    videoUrl: primaryImg,
    gallery: optimizedGallery.length > 0
      ? optimizedGallery.map((url, idx) => ({
          src: url,
          label: idx === 0 ? 'FRONT ELEVATION' : `DETAIL VIEW 0${idx}`,
          caption: `Verified inspection angle ${idx + 1} for ${listing.title}`,
        }))
      : [{ src: primaryImg, label: 'FRONT ELEVATION', caption: 'Primary archival elevation' }],
    macroSlots: [
      {
        slot: '[ 01 // STUDIO SCULPT ]',
        title: 'Studio Sculpt Macro',
        src: listing.imageUrls[0] || primaryImg,
        description: 'Micro-macro of primary sculpt finish, paint separation, and seam inspection.',
      },
      {
        slot: '[ 02 // HOLOGRAPHIC SEAL ]',
        title: 'Authenticity Seal',
        src: listing.imageUrls[1] || primaryImg,
        description: 'Tamper-evident Japanese publisher holographic seal verification.',
      },
      {
        slot: '[ 03 // BASE COPYRIGHT STAMP ]',
        title: 'Base Plaque Stamp',
        src: listing.imageUrls[2] || primaryImg,
        description: 'Debossed studio copyright mark and serial inspection.',
      },
      {
        slot: '[ 04 // PHYSICAL TIMESTAMP ]',
        title: 'Vault Timestamp Ledger',
        src: listing.imageUrls[3] || primaryImg,
        description: 'Physical ledger card verified with authentic live IST date stamp.',
      },
    ],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductFromDb(id);

  if (!product) {
    return {
      title: 'Lot Not Found — OtakuBazaar Escrow Marketplace',
      description: 'The requested collectible lot does not exist or has been settled.',
    };
  }

  const title = `${product.title} — OtakuBazaar Escrow Marketplace`;
  const description = `Buy authentic ${product.title} (${product.category}, ${product.gradeCondition}) for ₹${product.price.toLocaleString('en-IN')}. Protected by 48-hour unboxing inspection escrow.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: product.imageUrl,
          width: 800,
          height: 1000,
          alt: product.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.imageUrl],
    },
  };
}

export default async function LotDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const product = await getProductFromDb(id);

  if (!product) {
    notFound();
  }

  // Schema.org Product JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: [product.imageUrl],
    description: product.provenance || product.categorySubtitle,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: product.manufacturer || 'Japanese Collectibles',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      itemCondition: product.condition === 'NEW' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
      seller: {
        '@type': 'Person',
        name: product.sellerHandle,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <LotDetailClientView product={product} />
    </>
  );
}
