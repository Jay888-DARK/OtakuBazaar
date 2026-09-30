'use client';

import React, { useState, useEffect, useTransition } from 'react';
import ProductCard from '@/presentation/components/listings/ProductCard';
import { MOCK_PRODUCTS } from '@/infrastructure/data/mockProducts';
import { ProductFeedSkeleton } from '@/presentation/components/ui/SkeletonLoaders';

const CATEGORIES = [
  { id: 'ALL', label: 'All Archival Grails' },
  { id: 'Scale Figure', label: 'Scale Figures' },
  { id: 'Nendoroid', label: 'Nendoroids' },
  { id: 'Manga Sets', label: 'Manga Sets' },
  { id: 'Cosplay & Props', label: 'Cosplay & Props' },
] as const;

export const CatalogView: React.FC = () => {
  const [highlightedLotId, setHighlightedLotId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleHighlightEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ id?: string }>;
      const id = customEvent.detail?.id;
      if (!id) return;

      setHighlightedLotId(id);

      if (typeof document !== 'undefined') {
        const targetElement = document.getElementById(id);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      const timer = setTimeout(() => {
        setHighlightedLotId((curr) => (curr === id ? null : curr));
      }, 2500);

      return () => clearTimeout(timer);
    };

    const handleCategoryEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ category?: string }>;
      const cat = customEvent.detail?.category;
      if (cat) {
        setIsLoading(true);
        setTimeout(() => {
          startTransition(() => {
            setSelectedCategory(cat);
            setIsLoading(false);
          });
        }, 150);
      }
    };

    const handleFilterEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ filter?: string }>;
      const flt = customEvent.detail?.filter;
      if (flt) {
        setIsLoading(true);
        setTimeout(() => {
          startTransition(() => {
            setActiveFilter(flt);
            setIsLoading(false);
          });
        }, 150);
      }
    };

    const handleSearchEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const query = customEvent.detail || '';
      startTransition(() => {
        setSearchQuery(query.toLowerCase().trim());
      });
    };

    window.addEventListener('otaku_highlight_lot', handleHighlightEvent);
    window.addEventListener('otaku_category_select', handleCategoryEvent);
    window.addEventListener('otaku_filter_select', handleFilterEvent);
    window.addEventListener('otaku_search', handleSearchEvent as EventListener);

    return () => {
      window.removeEventListener('otaku_highlight_lot', handleHighlightEvent);
      window.removeEventListener('otaku_category_select', handleCategoryEvent);
      window.removeEventListener('otaku_filter_select', handleFilterEvent);
      window.removeEventListener('otaku_search', handleSearchEvent as EventListener);
    };
  }, []);

  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    // 1. Search Query
    if (searchQuery) {
      const titleMatch = product.title.toLowerCase().includes(searchQuery);
      const catMatch = product.category.toLowerCase().includes(searchQuery);
      const lotMatch = product.lotNumber.toLowerCase().includes(searchQuery);
      if (!titleMatch && !catMatch && !lotMatch) return false;
    }

    // 2. Category Filter
    if (selectedCategory !== 'ALL' && product.category !== selectedCategory) {
      return false;
    }

    // 3. Sticky Filter Pill Criteria
    if (activeFilter === 'S_RANK' && product.condition !== 'NEW') {
      return false;
    }
    if (activeFilter === 'FACTORY_SEALED' && product.condition !== 'NEW') {
      return false;
    }
    if (activeFilter === 'UNDER_30K' && product.price >= 30000) {
      return false;
    }
    if (activeFilter === 'PRIME1') {
      const isPrime = product.title.toLowerCase().includes('berserk') || product.price > 50000;
      if (!isPrime) return false;
    }

    return true;
  });

  return (
    <div id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      {/* Editorial Catalog Header & Active Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-800 pb-4 mb-8 gap-4">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-1">
            ARCHIVAL LOT INVENTORY • CURRENT CATALOGUE
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wider text-zinc-100">
            Available Verified Lots
          </h2>
        </div>

        {/* Minimalist Monochrome Category Tabs */}
        <div className="flex items-center space-x-6 overflow-x-auto scrollbar-none pb-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setSelectedCategory(cat.id);
                    setIsLoading(false);
                  }, 120);
                }}
                className={`text-[11px] uppercase tracking-[0.18em] transition-none cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-zinc-100 border-b border-zinc-100 pb-1 font-bold'
                    : 'text-zinc-500 hover:text-zinc-300 pb-1 font-medium'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature 4: Performance UX Stark Skeleton Loader During Transitions */}
      {isLoading ? (
        <ProductFeedSkeleton count={6} />
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 border border-zinc-800 bg-[#0e0e11] text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-bold mb-2">
            No Archival Lots Found
          </p>
          <p className="text-[11px] text-zinc-500 max-w-sm mx-auto mb-4">
            No verified specimens match the active search criteria or filter pill.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('ALL');
              setActiveFilter('ALL');
              setSearchQuery('');
            }}
            className="px-4 py-2 border border-zinc-700 bg-zinc-900 text-zinc-200 text-[10px] uppercase tracking-widest font-semibold hover:bg-zinc-800"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Strict Symmetrical Exhibition Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isHighlighted = highlightedLotId === product.id;
            return (
              <div
                key={product.id}
                id={product.id}
                className={`transition-all duration-300 ${
                  isHighlighted
                    ? 'ring-1 ring-zinc-300 ring-offset-2 ring-offset-[#09090b]'
                    : ''
                }`}
              >
                <ProductCard product={product} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CatalogView;
