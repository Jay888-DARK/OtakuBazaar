import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MOCK_PRODUCTS } from '@/infrastructure/data/mockProducts';
import ProductCard from '@/presentation/components/listings/ProductCard';

export const metadata: Metadata = {
  title: 'Search Results — OtakuBazaar',
  description: 'Search results for authentic Japanese anime collectibles and figures on OtakuBazaar.',
};

interface SearchPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps): Promise<React.JSX.Element> {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = (resolvedParams.q || '').trim();
  const lowerQuery = query.toLowerCase();

  const matchingProducts = MOCK_PRODUCTS.filter((product) => {
    if (!lowerQuery) return true;
    const titleMatch = product.title.toLowerCase().includes(lowerQuery);
    const categoryMatch = product.category.toLowerCase().includes(lowerQuery);
    const lotMatch = product.lotNumber.toLowerCase().includes(lowerQuery);
    return titleMatch || categoryMatch || lotMatch;
  });

  return (
    <main className="min-h-screen bg-[#09090b] text-white py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500 border-b border-[#27272a] pb-3">
          <Link href="/" className="hover:text-zinc-300 transition-none text-zinc-500 no-underline">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-200">Search</span>
        </div>

        {/* Search Header Banner */}
        <div className="p-6 sm:p-8 bg-[#0c0c0e] border border-[#27272a] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span
              style={{ fontFamily: "'Satoshi', sans-serif" }}
              className="text-[11px] sm:text-xs uppercase tracking-[0.15em] text-[#A3A3A3] font-medium block mb-1"
            >
              SEARCH INVENTORY
            </span>
            <h1
              style={{ fontFamily: "'Clash Display', 'Cabinet Grotesk', sans-serif", letterSpacing: '-0.02em' }}
              className="text-xl sm:text-2xl font-semibold uppercase tracking-tight text-white"
            >
              {query ? `Search Results for: "${query}"` : 'All Products'}
            </h1>
            <p
              style={{ fontFamily: "'Satoshi', sans-serif" }}
              className="text-xs text-zinc-400 mt-1 font-normal"
            >
              Showing {matchingProducts.length} verified {matchingProducts.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {query && (
            <Link
              href="/search"
              className="px-4 py-2 border border-[#27272a] bg-[#111114] hover:bg-[#18181b] text-zinc-400 hover:text-zinc-200 text-[10px] uppercase tracking-[0.18em] font-semibold transition-none no-underline self-start sm:self-auto rounded-none"
            >
              Clear Search
            </Link>
          )}
        </div>

        {/* Dedicated Product Grid or Empty State */}
        {matchingProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {matchingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-12 sm:p-16 border border-[#27272a] bg-[#0c0c0e] text-center space-y-4">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-zinc-300">
              No products found for this search.
            </h2>
            <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
              We could not find any collectibles matching &quot;{query}&quot;. Try searching for characters, series names, or product types.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-[#f4f4f4] hover:bg-white text-black font-extrabold text-xs uppercase tracking-[0.2em] border border-[#f4f4f4] transition-none no-underline rounded-none"
              >
                [ BROWSE ALL PRODUCTS ]
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
