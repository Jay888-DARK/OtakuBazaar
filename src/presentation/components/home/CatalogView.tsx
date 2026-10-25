'use client';

/**
 * @file src/presentation/components/home/CatalogView.tsx
 *
 * Main Catalog Layout for OtakuBazaar:
 * - Left Facet Sidebar (260px wide on desktop): Custom sharp architectural square selectors
 *   (12px x 12px, zero native radio/checkbox styling), #0C0C0C surface, #1F1F1F borders.
 * - Right Product Grid (4 columns on desktop): Strict 4-multiple pagination (8 lots per view)
 *   eliminating the 9th orphaned card, complete with architectural pagination bar.
 * - Strict Aesthetic: #080808 canvas, #0C0C0C elevated surface, #1F1F1F outer hairlines,
 *   #161616 inner dividers, editorial serif titles (#F2EFE9), clean Plus Jakarta Sans body copy.
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

  // Pagination State (Strict multiples of 4: 8 lots per view)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const LOTS_PER_PAGE = 8;

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
            setCurrentPage(1);
            setIsLoading(false);
          });
        }, 100);
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
            setCurrentPage(1);
            setIsLoading(false);
          });
        }, 100);
      }
    };

    const handleSearchEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const query = customEvent.detail || '';
      startTransition(() => {
        setSearchQuery(query.toLowerCase().trim());
        setCurrentPage(1);
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
      setCurrentPage(1);
      setIsLoading(false);
    }, 80);
  };

  const toggleOrigin = (origin: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedOrigins((prev) =>
        prev.includes(origin) ? prev.filter((o) => o !== origin) : [...prev, origin]
      );
      setCurrentPage(1);
      setIsLoading(false);
    }, 80);
  };

  const toggleScale = (scale: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedScales((prev) =>
        prev.includes(scale) ? prev.filter((s) => s !== scale) : [...prev, scale]
      );
      setCurrentPage(1);
      setIsLoading(false);
    }, 80);
  };

  const handlePriceBracketChange = (bracket: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedPriceBracket(bracket);
      setCurrentPage(1);
      setIsLoading(false);
    }, 80);
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
      setCurrentPage(1);
      setIsLoading(false);
    }, 100);
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

  // Paginated Product Slice (8 items per view to avoid orphaned 9th card)
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / LOTS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * LOTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + LOTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const startLot = filteredProducts.length > 0 ? (currentPage - 1) * LOTS_PER_PAGE + 1 : 0;
  const endLot = Math.min(currentPage * LOTS_PER_PAGE, filteredProducts.length);
  const startStr = String(startLot).padStart(2, '0');
  const endStr = String(endLot).padStart(2, '0');
  const totalStr = String(filteredProducts.length).padStart(2, '0');

  return (
    <div id="catalog" className="w-full bg-[#080808] py-10 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#1F1F1F] pb-4 mb-8 gap-4">
          <div>
            <span className="block mb-1 font-sans text-[10px] tracking-[0.15em] text-[#777777] uppercase font-semibold">
              ARCHIVAL CUSTODY • MAIN CATALOG
            </span>
            <h2 className="leading-tight font-serif text-[26px] sm:text-[32px] text-[#F2EFE9] uppercase tracking-[0.06em]">
              ACTIVE VAULT LOTS
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-sans text-[11px] tracking-[0.14em] text-[#777777] uppercase">
              SHOWING LOTS {startStr}–{endStr} OF {totalStr}
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
                className="px-3 py-1.5 border border-[#1F1F1F] bg-[#0C0C0C] hover:bg-[#F2EFE9] hover:text-[#080808] hover:border-[#F2EFE9] text-[#888888] font-sans text-[10px] tracking-[0.12em] uppercase transition-colors cursor-pointer rounded-none"
              >
                [ RESET ALL ]
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Desktop Architecture: Left 260px Facet Sidebar + Right 4-Column Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Filter Sidebar (260px wide on desktop) */}
          <aside className="w-full lg:w-[260px] shrink-0 bg-[#0C0C0C] border border-[#1F1F1F] p-5 space-y-6 rounded-none">
            {/* Sidebar Title */}
            <div className="border-b border-[#1F1F1F] pb-3 flex items-center justify-between">
              <span className="text-[11px] font-sans text-[#F2EFE9] uppercase tracking-[0.15em] font-semibold">
                FILTER FACETS
              </span>
              <span className="text-[10px] font-sans text-[#777777] uppercase tracking-[0.15em]">
                CUSTODY SPEC
              </span>
            </div>

            {/* Facet 1: Price Bracket */}
            <div className="space-y-2.5">
              <span className="block font-sans text-[10px] tracking-[0.15em] text-[#777777] uppercase font-semibold">
                PRICE BRACKET (INR)
              </span>
              <div className="space-y-2">
                {[
                  { id: 'ALL', label: 'ALL PRICING BRACKETS' },
                  { id: 'UNDER_15K', label: 'UNDER ₹15,000' },
                  { id: '15K_35K', label: '₹15,000 – ₹35,000' },
                  { id: '35K_75K', label: '₹35,000 – ₹75,000' },
                  { id: 'ABOVE_75K', label: '₹75,000+ (GRAIL TIER)' },
                ].map((bracket) => {
                  const isActive = selectedPriceBracket === bracket.id;
                  return (
                    <label
                      key={bracket.id}
                      className="flex items-center space-x-2.5 cursor-pointer group select-none"
                    >
                      <input
                        type="radio"
                        name="priceBracket"
                        checked={isActive}
                        onChange={() => handlePriceBracketChange(bracket.id)}
                        className="sr-only"
                      />
                      {/* Custom Architectural Selector: Sharp 12px x 12px square */}
                      <span
                        className={`w-3 h-3 shrink-0 border transition-colors flex items-center justify-center ${
                          isActive
                            ? 'border-[#F2EFE9] bg-[#F2EFE9]'
                            : 'border-[#3A3A3A] bg-transparent group-hover:border-[#666666]'
                        }`}
                      />
                      <span
                        className={`font-sans text-[11px] tracking-[0.08em] uppercase transition-colors ${
                          isActive
                            ? 'text-[#F2EFE9] font-medium'
                            : 'text-[#888888] group-hover:text-[#CCCCCC]'
                        }`}
                      >
                        {bracket.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Facet 2: Grade Condition */}
            <div className="space-y-2.5 pt-4 border-t border-[#161616]">
              <span className="block font-sans text-[10px] tracking-[0.15em] text-[#777777] uppercase font-semibold">
                GRADE CONDITION
              </span>
              <div className="space-y-2">
                {['GRADE S (MINT)', 'GRADE A', 'FACTORY SEALED'].map((grade) => {
                  const isActive = selectedGrades.includes(grade);
                  return (
                    <label
                      key={grade}
                      className="flex items-center space-x-2.5 cursor-pointer group select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => toggleGrade(grade)}
                        className="sr-only"
                      />
                      {/* Custom Architectural Selector: Sharp 12px x 12px square */}
                      <span
                        className={`w-3 h-3 shrink-0 border transition-colors flex items-center justify-center ${
                          isActive
                            ? 'border-[#F2EFE9] bg-[#F2EFE9]'
                            : 'border-[#3A3A3A] bg-transparent group-hover:border-[#666666]'
                        }`}
                      />
                      <span
                        className={`font-sans text-[11px] tracking-[0.08em] uppercase transition-colors ${
                          isActive
                            ? 'text-[#F2EFE9] font-medium'
                            : 'text-[#888888] group-hover:text-[#CCCCCC]'
                        }`}
                      >
                        {grade}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Facet 3: Origin Vault */}
            <div className="space-y-2.5 pt-4 border-t border-[#161616]">
              <span className="block font-sans text-[10px] tracking-[0.15em] text-[#777777] uppercase font-semibold">
                ORIGIN VAULT
              </span>
              <div className="space-y-2">
                {['TOKYO, JAPAN', 'OSAKA', 'KYOTO'].map((origin) => {
                  const isActive = selectedOrigins.includes(origin);
                  return (
                    <label
                      key={origin}
                      className="flex items-center space-x-2.5 cursor-pointer group select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => toggleOrigin(origin)}
                        className="sr-only"
                      />
                      <span
                        className={`w-3 h-3 shrink-0 border transition-colors flex items-center justify-center ${
                          isActive
                            ? 'border-[#F2EFE9] bg-[#F2EFE9]'
                            : 'border-[#3A3A3A] bg-transparent group-hover:border-[#666666]'
                        }`}
                      />
                      <span
                        className={`font-sans text-[11px] tracking-[0.08em] uppercase transition-colors ${
                          isActive
                            ? 'text-[#F2EFE9] font-medium'
                            : 'text-[#888888] group-hover:text-[#CCCCCC]'
                        }`}
                      >
                        {origin}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Facet 4: Collectible Scale */}
            <div className="space-y-2.5 pt-4 border-t border-[#161616]">
              <span className="block font-sans text-[10px] tracking-[0.15em] text-[#777777] uppercase font-semibold">
                COLLECTIBLE SCALE
              </span>
              <div className="space-y-2">
                {['1/4 SCALE', '1/6 SCALE', '1/7 SCALE', '1/8 SCALE', 'NON-SCALE'].map(
                  (scale) => {
                    const isActive = selectedScales.includes(scale);
                    return (
                      <label
                        key={scale}
                        className="flex items-center space-x-2.5 cursor-pointer group select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => toggleScale(scale)}
                          className="sr-only"
                        />
                        <span
                          className={`w-3 h-3 shrink-0 border transition-colors flex items-center justify-center ${
                            isActive
                              ? 'border-[#F2EFE9] bg-[#F2EFE9]'
                              : 'border-[#3A3A3A] bg-transparent group-hover:border-[#666666]'
                          }`}
                        />
                        <span
                          className={`font-sans text-[11px] tracking-[0.08em] uppercase transition-colors ${
                            isActive
                              ? 'text-[#F2EFE9] font-medium'
                              : 'text-[#888888] group-hover:text-[#CCCCCC]'
                          }`}
                        >
                          {scale}
                        </span>
                      </label>
                    );
                  }
                )}
              </div>
            </div>

            {/* Facet 5: Escrow Inspection Window */}
            <div className="pt-4 border-t border-[#161616] space-y-2.5">
              <span className="block font-sans text-[10px] tracking-[0.15em] text-[#777777] uppercase font-semibold">
                ESCROW PROTECTION
              </span>
              <div className="p-3 bg-[#080808] border border-[#1F1F1F] space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#10B981] inline-block" />
                  <span className="font-sans text-[10px] tracking-[0.14em] text-[#10B981] uppercase font-semibold">
                    48H INSPECTION WINDOW
                  </span>
                </div>
                <p className="font-sans text-[10px] text-[#777777] leading-relaxed">
                  100% escrow protected via OtakuBazaar custody protocol. Funds released only upon buyer verification.
                </p>
              </div>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full py-2.5 border border-[#1F1F1F] bg-[#080808] hover:bg-[#F2EFE9] hover:text-[#080808] hover:border-[#F2EFE9] text-[#888888] text-[11px] tracking-[0.14em] uppercase transition-colors cursor-pointer rounded-none text-center font-sans font-medium"
            >
              [ RESET FACETS ]
            </button>
          </aside>

          {/* Right Product Grid (Strict multiples of 4: 8 lots per view) */}
          <main className="flex-1 w-full">
            {isLoading ? (
              <ProductFeedSkeleton count={8} />
            ) : filteredProducts.length === 0 ? (
              <div className="p-16 border border-[#1F1F1F] bg-[#0C0C0C] text-center">
                <p className="font-serif text-[18px] text-[#F2EFE9] uppercase tracking-[0.06em] mb-2">
                  No Archival Lots Found
                </p>
                <p className="font-sans text-[12px] text-[#8E8E8E] max-w-sm mx-auto mb-6">
                  No collectibles match your active criteria and facet selections.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 border border-[#1F1F1F] bg-[#080808] text-[#F2EFE9] hover:bg-[#F2EFE9] hover:text-[#080808] hover:border-[#F2EFE9] transition-colors cursor-pointer rounded-none font-sans text-[11px] tracking-[0.14em] uppercase"
                >
                  [ RESET ALL FILTERS ]
                </button>
              </div>
            ) : (
              <div>
                {/* Strict 4-Column Grid: Exactly 8 lots per view */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {paginatedProducts.map((product) => (
                    <div key={product.id} id={product.id}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Clean Architectural Pagination Bar (Eliminating the Orphaned 9th Card) */}
                <div className="border border-[#1F1F1F] bg-[#0C0C0C] px-5 py-4 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-[11px] tracking-[0.14em] uppercase text-[#777777]">
                  <div>
                    SHOWING LOTS {startStr}–{endStr} OF {totalStr}
                  </div>
                  <div className="flex items-center gap-4">
                    {currentPage > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[#888888] hover:text-[#F2EFE9] transition-colors cursor-pointer uppercase"
                      >
                        [ PREV PAGE ]
                      </button>
                    )}
                    {currentPage < totalPages && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[#F2EFE9] hover:text-white transition-colors cursor-pointer uppercase font-medium"
                      >
                        [ NEXT PAGE ]
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CatalogView;
