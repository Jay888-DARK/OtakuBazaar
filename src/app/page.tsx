import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import VaultHero from '@/presentation/components/home/VaultHero';
import { MarketplaceFilterNav } from '@/presentation/components/navigation/MarketplaceFilterNav';
import { ArchivalMerchandisingBanners } from '@/presentation/components/home/ArchivalMerchandisingBanners';
import { CatalogView, type CatalogProductItem } from '@/presentation/components/home/CatalogView';
import { HowItWorksAndFaq } from '@/presentation/components/home/HowItWorksAndFaq';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';
import { ListingRepository } from '@/infrastructure/database/repositories/ListingRepository';
import { optimizeImageUrl } from '@/infrastructure/utils/imageOptimizer';
import type { DriftWallItem } from '@/presentation/components/ui/DriftWall';

export const metadata: Metadata = {
  title: 'OtakuBazaar — India’s C2C Marketplace for Authentic Anime Figures & Collectibles',
  description:
    'India’s dedicated C2C marketplace for verified anime scale figures and collectibles, backed by 48-hour unboxing inspection and secure escrow payments.',
};

export const dynamic = 'force-dynamic';

export default async function HomePage(props?: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = props?.searchParams ? await props.searchParams : {};
  const query =
    typeof resolvedParams.q === 'string'
      ? resolvedParams.q
      : typeof resolvedParams.search === 'string'
        ? resolvedParams.search
        : '';

  if (query.trim()) {
    redirect(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  let catalogItems: CatalogProductItem[] = [];
  let driftItems: DriftWallItem[] = [];

  try {
    const rawListings = await ListingRepository.findAllActive();
    catalogItems = rawListings.map((item) => {
      const rawPrimary = item.imageUrls[0] || '/Firefly_clean.png';
      const primaryImg = optimizeImageUrl(rawPrimary, 800);
      const optimizedImages = item.imageUrls.map((u) => optimizeImageUrl(u, 800));
      return {
        id: item.id,
        lotNumber: String(item.id).replace(/[^0-9]/g, '').padStart(4, '0').slice(-4) || '0001',
        title: item.title,
        price: Math.round(item.askingPriceAmount / 100),
        askingPriceAmount: item.askingPriceAmount,
        category: item.category || 'Scale Figure',
        categorySubtitle: 'AUTHENTIC JAPANESE IMPORT',
        edition: 'VERIFIED CUSTODY',
        condition: item.condition || 'NEW',
        gradeCondition: item.condition === 'NEW' ? 'FACTORY SEALED' : 'GRADE A',
        figureGrade: item.condition === 'NEW' ? 'MISB (FACTORY SEALED)' : 'BIB (CABINET DISPLAYED)',
        boxCondition: item.condition === 'NEW' ? 'FACTORY CARTON SEALED' : 'MINT BOX (BLISTER INTACT)',
        origin: 'PAN-INDIA VAULT • IN-HAND',
        indianLocation: 'MUMBAI, MH',
        ownerCount: '1ST OWNER',
        franchise: item.category || 'Anime',
        series: item.title,
        manufacturer: 'Japanese Studio',
        imageUrl: primaryImg,
        imageUrls: JSON.stringify(optimizedImages.length > 0 ? optimizedImages : [primaryImg]),
        scale: '1/7 SCALE',
        status: item.status,
        lockRemainingSeconds: item.lockRemainingSeconds,
      };
    });

    driftItems = rawListings.map((l) => ({
      id: l.id,
      image: optimizeImageUrl(l.imageUrls[0] || '/Firefly_clean.png', 600),
      title: l.title,
      href: `/lot/${l.id}`,
    }));
  } catch (error) {
    console.warn('[HomePage] Live listings lookup fallback notice:', error);
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#F2EFE9]">
      {/* STAGE 1: Full-Viewport Hero Presentation */}
      <VaultHero initialItems={driftItems} />

      {/* STAGE 2: Scroll-Revealed Criteria, Curated Collections & Catalog */}
      <div id="stage-2" className="relative w-full bg-[#080808]">
        {/* 1. Sticky Criteria & Category Bar (pins below 80px navbar at top-20) */}
        <MarketplaceFilterNav />

        {/* 2. 4-Column Curated Archival Merchandising Banners */}
        <ArchivalMerchandisingBanners initialListingCount={catalogItems.length} />

        {/* 3. Main Catalog Layout (Left 260px Facet Sidebar + Right 4-Column Product Grid) */}
        <CatalogView initialProducts={catalogItems} />

        {/* 4. Plain-Language 3-Step How It Works (Buyers & Sellers) & Homepage FAQ */}
        <HowItWorksAndFaq />

        {/* 5. Archival Footer with Verifiable Legal & Compliance Links */}
        <ArchivalFooter />
      </div>
    </div>
  );
}
