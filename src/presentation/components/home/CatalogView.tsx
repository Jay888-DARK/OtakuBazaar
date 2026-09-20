'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/presentation/components/listings/ProductCard';
import { MOCK_PRODUCTS } from '@/infrastructure/data/mockProducts';

const CATEGORIES = [
  { id: 'ALL', label: 'All Grails' },
  { id: 'Scale Figure', label: 'Scale Figures' },
  { id: 'Manga Sets', label: 'Manga Sets' },
  { id: 'Cosplay & Props', label: 'Cosplay & Props' },
] as const;

export const CatalogView: React.FC = () => {
  const [highlightedLotId, setHighlightedLotId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

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

    window.addEventListener('otaku_highlight_lot', handleHighlightEvent);
    return () => {
      window.removeEventListener('otaku_highlight_lot', handleHighlightEvent);
    };
  }, []);

  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    if (selectedCategory === 'ALL') return true;
    return product.category === selectedCategory;
  });

  return (
    <div id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Minimalist Monochrome Category Tabs */}
      <div className="flex items-center space-x-8 border-b border-zinc-800/80 mb-8 pb-3 overflow-x-auto scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer ${
                isActive
                  ? 'text-zinc-100 border-b-2 border-zinc-100 pb-3 -mb-[13px] font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300 pb-3 -mb-[13px]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Strict 3x9 Symmetrical Exhibition Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const isHighlighted = highlightedLotId === product.id;
          return (
            <div
              key={product.id}
              id={product.id}
              className={`transition-all duration-500 rounded-xl ${
                isHighlighted
                  ? 'ring-2 ring-zinc-300 ring-offset-4 ring-offset-[#09090b] shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-[1.02]'
                  : ''
              }`}
            >
              <ProductCard product={product} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CatalogView;
