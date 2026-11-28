import React from 'react';
import type { Metadata } from 'next';
import { MarketplaceFilterNav } from '@/presentation/components/navigation/MarketplaceFilterNav';
import { CatalogView } from '@/presentation/components/home/CatalogView';

export const metadata: Metadata = {
  title: 'Catalog — Anime Figures, Nendoroids & Collectibles | OtakuBazaar',
  description:
    'Browse collector-listed anime scale figures, Nendoroids, statues, and manga editions across India with a 48-hour unboxing inspection window.',
  alternates: {
    canonical: '/catalog',
  },
};

export default function CatalogPage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* Route-Level Isolated Marketplace Criteria & Category Filters */}
      <MarketplaceFilterNav />

      {/* Primary Catalog View with Search and Filter Synchronization */}
      <div className="py-6">
        <CatalogView />
      </div>

      {/* Inspection Window Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 select-none">
        <div className="border border-[#27272a] bg-[#0c0c0e] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-normal block mb-1">
                48-Hour Unboxing Inspection Window
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
                Collector-to-Collector Listings Across India
              </h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                Review seller photos, condition grades, and MFC references before ordering. Report mismatches within 48 hours of delivery.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="px-3 py-1.5 border border-zinc-700 bg-zinc-900 text-xs text-zinc-300 font-normal uppercase tracking-wider">
                48h Inspection
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
