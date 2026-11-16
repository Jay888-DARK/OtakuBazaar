import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import VaultHero from '@/presentation/components/home/VaultHero';
import { MarketplaceFilterNav } from '@/presentation/components/navigation/MarketplaceFilterNav';
import { ArchivalMerchandisingBanners } from '@/presentation/components/home/ArchivalMerchandisingBanners';
import { CatalogView } from '@/presentation/components/home/CatalogView';
import { HowItWorksAndFaq } from '@/presentation/components/home/HowItWorksAndFaq';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';

export const metadata: Metadata = {
  title: 'OtakuBazaar — India’s C2C Marketplace for Authentic Anime Figures & Collectibles',
  description:
    'India’s dedicated C2C marketplace for verified anime scale figures and collectibles, backed by 48-hour unboxing inspection and secure escrow payments.',
};

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

  return (
    <div className="min-h-screen bg-[#080808] text-[#F2EFE9]">
      {/* STAGE 1: Full-Viewport Hero Presentation */}
      <VaultHero />

      {/* STAGE 2: Scroll-Revealed Criteria, Curated Collections & Catalog */}
      <div id="stage-2" className="relative w-full bg-[#080808]">
        {/* 1. Sticky Criteria & Category Bar (pins below 80px navbar at top-20) */}
        <MarketplaceFilterNav />

        {/* 2. 4-Column Curated Archival Merchandising Banners */}
        <ArchivalMerchandisingBanners />

        {/* 3. Main Catalog Layout (Left 260px Facet Sidebar + Right 4-Column Product Grid) */}
        <CatalogView />

        {/* 4. Plain-Language 3-Step How It Works (Buyers & Sellers) & Homepage FAQ */}
        <HowItWorksAndFaq />

        {/* 5. Archival Footer with Verifiable Legal & Compliance Links */}
        <ArchivalFooter />
      </div>
    </div>
  );
}
