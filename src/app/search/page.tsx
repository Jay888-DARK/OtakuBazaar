import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingRepository } from '@/infrastructure/database/repositories/ListingRepository';
import ProductCard from '@/presentation/components/listings/ProductCard';

export const metadata: Metadata = {
  title: 'Search Results — OtakuBazaar',
  description: 'Search results for authentic Japanese anime collectibles and figures on OtakuBazaar.',
};

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps): Promise<React.JSX.Element> {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = (resolvedParams.q || '').trim();
  const lowerQuery = query.toLowerCase();

  let activeListings: any[] = [];
  try {
    activeListings = await ListingRepository.findAllActive();
  } catch (err) {
    console.warn('[SearchPage] DB listings search note:', err);
  }

  const matchingProducts = activeListings
    .filter((listing) => {
      if (!lowerQuery) return true;
      const titleMatch = listing.title.toLowerCase().includes(lowerQuery);
      const categoryMatch = (listing.category || '').toLowerCase().includes(lowerQuery);
      const idMatch = listing.id.toLowerCase().includes(lowerQuery);
      return titleMatch || categoryMatch || idMatch;
    })
    .map((item) => {
      const primaryImg = item.imageUrls[0] || '/otakubazaar-logo.png';
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
        imageUrls: JSON.stringify(item.imageUrls.length > 0 ? item.imageUrls : [primaryImg]),
        scale: '1/7 SCALE',
      };
    });

  return (
    <main className="min-h-screen bg-[#080808] text-white py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500 border-b border-[#1F1F1F] pb-3">
          <Link href="/" className="hover:text-zinc-300 transition-none text-zinc-500 no-underline">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-200">Search</span>
        </div>

        {/* Search Header Banner */}
        <div className="p-6 sm:p-8 bg-[#0C0C0C] border border-[#1F1F1F] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.15em] text-[#777777] font-medium block mb-1">
              SEARCH INVENTORY // LIVE CUSTODY
            </span>
            <h1 className="text-xl sm:text-2xl font-serif uppercase tracking-tight text-[#F2EFE9]">
              {query ? `Search Results for: "${query}"` : 'All Vault Lots'}
            </h1>
            <p className="text-xs text-[#8E8E8E] mt-1 font-normal">
              Showing {matchingProducts.length} verified {matchingProducts.length === 1 ? 'lot' : 'lots'} in active custody
            </p>
          </div>

          {query && (
            <Link
              href="/search"
              className="px-4 py-2 border border-[#1F1F1F] bg-[#080808] hover:bg-[#161616] text-[#CCCCCC] hover:text-[#F2EFE9] text-[10px] uppercase tracking-[0.18em] font-semibold transition-none no-underline self-start sm:self-auto rounded-none"
            >
              Clear Search
            </Link>
          )}
        </div>

        {/* Dedicated Product Grid or Empty State */}
        {matchingProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {matchingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-12 sm:p-16 border border-[#1F1F1F] bg-[#0C0C0C] text-center space-y-4">
            <div className="font-mono text-[10px] text-[#777777] tracking-[0.2em] uppercase mb-1">
              VAULT INDEX // ZERO MATCHES
            </div>
            <h2 className="text-base sm:text-lg font-serif uppercase tracking-wider text-[#F2EFE9]">
              {query ? `No verified lots found matching "${query}"` : 'Vault Index: 0 Active Lots'}
            </h2>
            <p className="text-xs text-[#8E8E8E] max-w-md mx-auto leading-relaxed">
              {query
                ? 'Try searching by character name, studio, series, or scale specification.'
                : 'All vault lots under custody have been settled or are currently in transit. New consignments are undergoing authentication.'}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/"
                className="inline-block px-5 py-2.5 bg-[#080808] hover:bg-[#161616] text-[#F2EFE9] border border-[#1F1F1F] text-[11px] uppercase tracking-[0.16em] transition-none no-underline rounded-none"
              >
                [ BROWSE ALL ]
              </Link>
              <Link
                href="/sell"
                className="inline-block px-5 py-2.5 bg-[#F2EFE9] hover:bg-[#EAE6DF] text-[#080808] border border-[#F2EFE9] text-[11px] font-semibold uppercase tracking-[0.16em] transition-none no-underline rounded-none"
              >
                [ CONSIGN A LOT ]
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
