'use client';

/**
 * @file src/presentation/components/home/CatalogView.tsx
 *
 * Main Catalog Layout for Stage 2:
 * - Left Facet Sidebar (260px wide on desktop): Price Bracket, Grade Condition, Origin Vault, Scale, Escrow Inspection Window.
 * - Right Product Grid (4 columns on desktop, 2 on tablet, 1 on mobile): 1px solid hairline borders, dark-grey tabular skeleton loaders.
 * - Strict Brutalist aesthetic: 0px border-radius, #0a0a0a canvas, #141414 elevated surface, #262626 hairline borders.
 */

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import ProductCard from '@/presentation/components/listings/ProductCard';
import { MOCK_PRODUCTS, MockProduct } from '@/infrastructure/data/mockProducts';
import { ProductFeedSkeleton } from '@/presentation/components/ui/SkeletonLoaders';

export const CatalogView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Sidebar Facet States
  const [selectedPriceBracket, setSelectedPriceBracket] = useState<string>('ALL');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [selectedScales, setSelectedScales] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

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
        }, 120);
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
        }, 120);
      }
    };

    const handleSearchEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const query = customEvent.detail || '';
      startTransition(() => {
        setSearchQuery(query.toLowerCase().trim());
      });
    };

    window.addEventListener('otaku_category_select', handleCategoryEvent);
    window.addEventListener('otaku_filter_select', handleFilterEvent);
    window.addEventListener('otaku_search', handleSearchEvent as EventListener);

    return () => {
      window.removeEventListener('otaku_category_select', handleCategoryEvent);
      window.removeEventListener('otaku_filter_select', handleFilterEvent);
      window.removeEventListener('otaku_search', handleSearchEvent as EventListener);
    };
  }, []);

  const toggleGrade = (grade: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedGrades((prev) =>
        prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
      );
      setIsLoading(false);
    }, 100);
  };

  const toggleOrigin = (origin: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedOrigins((prev) =>
        prev.includes(origin) ? prev.filter((o) => o !== origin) : [...prev, origin]
      );
      setIsLoading(false);
    }, 100);
  };

  const toggleScale = (scale: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedScales((prev) =>
        prev.includes(scale) ? prev.filter((s) => s !== scale) : [...prev, scale]
      );
      setIsLoading(false);
    }, 100);
  };

  const handlePriceBracketChange = (bracket: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedPriceBracket(bracket);
      setIsLoading(false);
    }, 100);
  };

  const handleResetFilters = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedCategory('ALL');
      setActiveFilter('ALL');
      setSelectedPriceBracket('ALL');
      setSelectedGrades([]);
      setSelectedOrigins([]);
      setSelectedScales([]);
      setSearchQuery('');
      setIsLoading(false);
    }, 120);
  };

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product: MockProduct) => {
      // 1. Search Query
      if (searchQuery) {
        const titleMatch = product.title.toLowerCase().includes(searchQuery);
        const catMatch = product.category.toLowerCase().includes(searchQuery);
        const lotMatch = product.lotNumber.toLowerCase().includes(searchQuery);
        if (!titleMatch && !catMatch && !lotMatch) return false;
      }

      // 2. Category Filter from Navbar Strip
      if (selectedCategory !== 'ALL') {
        if (product.category !== selectedCategory) {
          return false;
        }
      }

      // 3. Criteria Filter Pills from Bar
      if (activeFilter === 'S_RANK') {
        if (product.gradeCondition !== 'GRADE S (MINT)') return false;
      }
      if (activeFilter === 'FACTORY_SEALED') {
        if (product.gradeCondition !== 'FACTORY SEALED') return false;
      }
      if (activeFilter === 'ESCROW_VERIFIED') {
        // All items in Tokyo Archival Vault are escrow verified
      }
      if (activeFilter === 'UNDER_30K') {
        if (product.price >= 30000) return false;
      }
      if (activeFilter === 'PRIME_1') {
        const isPrime =
          product.category === 'Statues & Resin' ||
          product.title.toLowerCase().includes('berserk') ||
          product.manufacturer.toLowerCase().includes('prime 1') ||
          product.price >= 50000;
        if (!isPrime) return false;
      }

      // 4. Sidebar Price Bracket
      if (selectedPriceBracket === 'UNDER_15K' && product.price >= 15000) return false;
      if (selectedPriceBracket === '15K_35K' && (product.price < 15000 || product.price > 35000)) return false;
      if (selectedPriceBracket === '35K_75K' && (product.price < 35000 || product.price > 75000)) return false;
      if (selectedPriceBracket === 'ABOVE_75K' && product.price <= 75000) return false;

      // 5. Sidebar Grade Condition
      if (selectedGrades.length > 0) {
        if (!selectedGrades.includes(product.gradeCondition)) return false;
      }

      // 6. Sidebar Origin Vault
      if (selectedOrigins.length > 0) {
        const match = selectedOrigins.some((orig) => product.origin.includes(orig));
        if (!match) return false;
      }

      // 7. Sidebar Scale
      if (selectedScales.length > 0) {
        if (!selectedScales.includes(product.scale)) return false;
      }

      return true;
    });
  }, [
    searchQuery,
    selectedCategory,
    activeFilter,
    selectedPriceBracket,
    selectedGrades,
    selectedOrigins,
    selectedScales,
  ]);

  return (
    <div id="catalog" className="w-full bg-[#0a0a0a] py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#262626] pb-4 mb-6 gap-4">
          <div>
            <span
              style={{
                fontFamily: 'var(--font-swiss), sans-serif',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#8a8a8a',
              }}
              className="block mb-1 font-swiss uppercase"
            >
              ARCHIVAL CUSTODY • MAIN CATALOG
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-headline), sans-serif',
                fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: '#ffffff',
              }}
              className="leading-tight font-headline uppercase"
            >
              ACTIVE VAULT LOTS
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span
              style={{
                fontFamily: 'var(--font-swiss), sans-serif',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: '#8a8a8a',
                textTransform: 'uppercase',
              }}
              className="font-swiss"
            >
              SHOWING {filteredProducts.length} OF {MOCK_PRODUCTS.length} LOTS
            </span>
            {(activeFilter !== 'ALL' ||
              selectedCategory !== 'ALL' ||
              selectedPriceBracket !== 'ALL' ||
              selectedGrades.length > 0 ||
              selectedOrigins.length > 0 ||
              selectedScales.length > 0) && (
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  fontFamily: 'var(--font-swiss), sans-serif',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
                className="px-2.5 py-1 border border-[#262626] bg-[#141414] hover:bg-white hover:text-black hover:border-white text-zinc-300 transition-none cursor-pointer rounded-none font-swiss uppercase"
              >
                [ RESET ALL ]
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Desktop Architecture: Left 260px Facet Sidebar + Right 4-Column Grid */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Filter Sidebar (260px wide on desktop) */}
          <aside className="w-full lg:w-[260px] shrink-0 bg-[#141414] border border-[#262626] p-4 space-y-6 rounded-none">
            {/* Sidebar Title */}
            <div className="border-b border-[#262626] pb-3 flex items-center justify-between">
              <span
                style={{
                  fontFamily: 'var(--font-swiss), sans-serif',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
                className="text-xs text-white font-swiss"
              >
                FILTER FACETS
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-swiss), sans-serif',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#8a8a8a',
                }}
                className="font-swiss"
              >
                CUSTODY SPEC
              </span>
            </div>

            {/* Facet 1: Price Bracket */}
            <div className="space-y-2">
              <span
                style={{
                  fontFamily: 'var(--font-swiss), sans-serif',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  color: '#8a8a8a',
                  textTransform: 'uppercase',
                }}
                className="block font-swiss"
              >
                PRICE BRACKET (INR)
              </span>
              <div className="space-y-1.5">
                {[
                  { id: 'ALL', label: 'ALL PRICING BRACKETS' },
                  { id: 'UNDER_15K', label: 'UNDER ₹15,000' },
                  { id: '15K_35K', label: '₹15,000 – ₹35,000' },
                  { id: '35K_75K', label: '₹35,000 – ₹75,000' },
                  { id: 'ABOVE_75K', label: '₹75,000+ (GRAIL TIER)' },
                ].map((bracket) => (
                  <label
                    key={bracket.id}
                    className="flex items-center space-x-2.5 cursor-pointer text-zinc-300 hover:text-white"
                  >
                    <input
                      type="radio"
                      name="priceBracket"
                      checked={selectedPriceBracket === bracket.id}
                      onChange={() => handlePriceBracketChange(bracket.id)}
                      className="rounded-none border-[#262626] bg-[#0a0a0a] text-white focus:ring-0 cursor-pointer w-3.5 h-3.5 accent-white"
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-swiss), sans-serif',
                        fontVariantNumeric: 'tabular-nums',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                      className="font-swiss"
                    >
                      {bracket.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Facet 2: Grade Condition */}
            <div className="space-y-2 pt-3 border-t border-[#262626]">
              <span
                style={{
                  fontFamily: 'var(--font-swiss), sans-serif',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  color: '#8a8a8a',
                  textTransform: 'uppercase',
                }}
                className="block font-swiss"
              >
                GRADE CONDITION
              </span>
              <div className="space-y-1.5">
                {['GRADE S (MINT)', 'GRADE A', 'FACTORY SEALED'].map((grade) => (
                  <label
                    key={grade}
                    className="flex items-center space-x-2.5 cursor-pointer text-zinc-300 hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGrades.includes(grade)}
                      onChange={() => toggleGrade(grade)}
                      className="rounded-none border-[#262626] bg-[#0a0a0a] text-white focus:ring-0 cursor-pointer w-3.5 h-3.5 accent-white"
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-swiss), sans-serif',
                        fontVariantNumeric: 'tabular-nums',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                      className="font-swiss"
                    >
                      {grade}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Facet 3: Origin Vault */}
            <div className="space-y-2 pt-3 border-t border-[#262626]">
              <span
                style={{
                  fontFamily: 'var(--font-swiss), sans-serif',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  color: '#8a8a8a',
                  textTransform: 'uppercase',
                }}
                className="block font-swiss"
              >
                ORIGIN VAULT
              </span>
              <div className="space-y-1.5">
                {['TOKYO, JAPAN', 'OSAKA', 'KYOTO'].map((origin) => (
                  <label
                    key={origin}
                    className="flex items-center space-x-2.5 cursor-pointer text-zinc-300 hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOrigins.includes(origin)}
                      onChange={() => toggleOrigin(origin)}
                      className="rounded-none border-[#262626] bg-[#0a0a0a] text-white focus:ring-0 cursor-pointer w-3.5 h-3.5 accent-white"
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-swiss), sans-serif',
                        fontVariantNumeric: 'tabular-nums',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                      className="font-swiss"
                    >
                      {origin}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Facet 4: Scale */}
            <div className="space-y-2 pt-3 border-t border-[#262626]">
              <span
                style={{
                  fontFamily: 'var(--font-swiss), sans-serif',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  color: '#8a8a8a',
                  textTransform: 'uppercase',
                }}
                className="block font-swiss"
              >
                COLLECTIBLE SCALE
              </span>
              <div className="space-y-1.5">
                {['1/4 SCALE', '1/6 SCALE', '1/7 SCALE', '1/8 SCALE', 'NON-SCALE'].map(
                  (scale) => (
                    <label
                      key={scale}
                      className="flex items-center space-x-2.5 cursor-pointer text-zinc-300 hover:text-white"
                    >
                      <input
                        type="checkbox"
                        checked={selectedScales.includes(scale)}
                        onChange={() => toggleScale(scale)}
                        className="rounded-none border-[#262626] bg-[#0a0a0a] text-white focus:ring-0 cursor-pointer w-3.5 h-3.5 accent-white"
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-swiss), sans-serif',
                          fontVariantNumeric: 'tabular-nums',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                        className="font-swiss"
                      >
                        {scale}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Facet 5: Escrow Inspection Window */}
            <div className="pt-3 border-t border-[#262626] space-y-2">
              <span
                style={{
                  fontFamily: 'var(--font-swiss), sans-serif',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  color: '#8a8a8a',
                  textTransform: 'uppercase',
                }}
                className="block font-swiss"
              >
                ESCROW PROTECTION
              </span>
              <div className="p-2.5 bg-[#0a0a0a] border border-[#262626] space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#10b981] inline-block" />
                  <span
                    style={{
                      fontFamily: 'var(--font-swiss), sans-serif',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                    className="text-zinc-200 font-swiss"
                  >
                    48H INSPECTION WINDOW
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-swiss), sans-serif',
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                  className="text-zinc-500 leading-tight font-swiss"
                >
                  100% ESCROW PROTECTED VIA OTAKUBAZAAR CUSTODY PROTOCOL.
                </p>
              </div>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                fontFamily: 'var(--font-swiss), sans-serif',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
              className="w-full py-2 border border-[#262626] bg-[#0a0a0a] hover:bg-white hover:text-black hover:border-white text-zinc-300 transition-none cursor-pointer rounded-none text-center font-swiss uppercase"
            >
              [ RESET FACETS ]
            </button>
          </aside>

          {/* Right Product Grid (4 columns on desktop, 2 on tablet, 1 on mobile) */}
          <main className="flex-1 w-full">
            {isLoading ? (
              <ProductFeedSkeleton count={8} />
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 border border-[#262626] bg-[#141414] text-center">
                <p
                  style={{
                    fontFamily: 'var(--font-headline), sans-serif',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                  className="text-xs text-zinc-300 mb-2 font-headline"
                >
                  No Archival Lots Found
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-swiss), sans-serif',
                    fontSize: '0.75rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                  className="text-zinc-500 max-w-sm mx-auto mb-4 font-swiss"
                >
                  No lots match your active criteria and facet selections.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    fontFamily: 'var(--font-swiss), sans-serif',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                  className="px-4 py-2 border border-[#262626] bg-[#0a0a0a] text-zinc-200 hover:bg-white hover:text-black hover:border-white transition-none cursor-pointer rounded-none font-swiss uppercase"
                >
                  [ RESET ALL FILTERS ]
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} id={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CatalogView;
