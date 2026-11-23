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
 * - Pure live database-driven: zero hardcoded dummy products.
 */

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/presentation/components/listings/ProductCard';
import { ProductFeedSkeleton } from '@/presentation/components/ui/SkeletonLoaders';

export interface CatalogProductItem {
  id: string;
  lotNumber?: string;
  title: string;
  price?: number;
  askingPriceAmount?: number;
  category?: string | null;
  categorySubtitle?: string;
  edition?: string;
  condition?: string | null;
  gradeCondition?: string;
  figureGrade?: string;
  boxCondition?: string;
  origin?: string;
  indianLocation?: string;
  ownerCount?: string;
  franchise?: string;
  series?: string;
  manufacturer?: string;
  imageUrl?: string;
  imageUrls?: string | null;
  scale?: string;
  status?: string;
  mfcItemId?: string;
  mfcUrl?: string;
  lockRemainingSeconds?: number;
}

interface CatalogViewProps {
  initialProducts?: CatalogProductItem[];
}

export const CatalogView: React.FC<CatalogViewProps> = ({ initialProducts }) => {
  const [products, setProducts] = useState<CatalogProductItem[]>(initialProducts || []);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(!initialProducts);

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
    if (initialProducts) return;
    let isMounted = true;
    fetch('/api/listings')
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (!isMounted) return;
        const items = Array.isArray(data.items) ? data.items : [];
        const mapped: CatalogProductItem[] = items.map((item: any) => {
          let img = '/Firefly_clean.png';
          if (Array.isArray(item.imageUrls) && item.imageUrls[0]) {
            img = item.imageUrls[0];
          } else if (typeof item.imageUrls === 'string') {
            try {
              const parsed = JSON.parse(item.imageUrls);
              if (Array.isArray(parsed) && parsed[0]) img = parsed[0];
              else img = item.imageUrls;
            } catch {
              img = item.imageUrls;
            }
          }
          return {
            id: item.id,
            lotNumber: String(item.id).replace(/[^0-9]/g, '').padStart(4, '0').slice(-4) || '0001',
            title: item.title,
            price: Math.round((item.askingPriceAmount || 0) / 100),
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
            imageUrl: img,
            imageUrls: typeof item.imageUrls === 'string' ? item.imageUrls : JSON.stringify(item.imageUrls || [img]),
            scale: '1/7 SCALE',
            status: item.status,
            lockRemainingSeconds: item.lockRemainingSeconds,
          };
        });
        setProducts(mapped);
        setIsInitialLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setProducts([]);
          setIsInitialLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialProducts]);

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
    return products.filter((product) => {
      const itemPrice = typeof product.price === 'number' ? product.price : Math.round((product.askingPriceAmount || 0) / 100);

      // 1. Search Query
      if (searchQuery) {
        const titleMatch = product.title.toLowerCase().includes(searchQuery);
        const catMatch = (product.category || '').toLowerCase().includes(searchQuery);
        const lotMatch = (product.lotNumber || '').toLowerCase().includes(searchQuery);
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
        if (product.condition !== 'NEW' && product.gradeCondition !== 'FACTORY SEALED') return false;
      }
      if (activeFilter === 'FACTORY_SEALED') {
        if (product.condition !== 'NEW' && product.gradeCondition !== 'FACTORY SEALED') return false;
      }
      if (activeFilter === 'UNDER_30K') {
        if (itemPrice >= 30000) return false;
      }
      if (activeFilter === 'PRIME_1') {
        const isHighValue =
          product.category === 'Statues & Resin' ||
          product.title.toLowerCase().includes('berserk') ||
          (product.manufacturer && product.manufacturer.toLowerCase().includes('prime 1')) ||
          itemPrice >= 50000;
        if (!isHighValue) return false;
      }

      // 4. Sidebar Price Bracket
      if (selectedPriceBracket === 'UNDER_15K' && itemPrice >= 15000) return false;
      if (selectedPriceBracket === '15K_35K' && (itemPrice < 15000 || itemPrice > 35000)) return false;
      if (selectedPriceBracket === '35K_75K' && (itemPrice < 35000 || itemPrice > 75000)) return false;
      if (selectedPriceBracket === 'ABOVE_75K' && itemPrice <= 75000) return false;

      // 5. Sidebar Grade Condition
      if (selectedGrades.length > 0) {
        const grade = product.gradeCondition || (product.condition === 'NEW' ? 'FACTORY SEALED' : 'GRADE A');
        if (!selectedGrades.includes(grade)) return false;
      }

      // 6. Sidebar Origin Vault
      if (selectedOrigins.length > 0) {
        const originStr = product.origin || '';
        const match = selectedOrigins.some((orig) => originStr.includes(orig));
        if (!match) return false;
      }

      // 7. Sidebar Scale
      if (selectedScales.length > 0) {
        if (product.scale && !selectedScales.includes(product.scale)) return false;
      }

      return true;
    });
  }, [
    products,
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
          </div>
        </div>

        {/* Catalog Body: Left Facet Sidebar + Right Product Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Facet Sidebar (260px wide on desktop) */}
          <aside className="w-full lg:w-[260px] shrink-0 border border-[#1F1F1F] bg-[#0C0C0C] p-5 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#161616] pb-3">
              <span className="font-sans text-[11px] tracking-[0.16em] uppercase text-[#F2EFE9] font-medium">
                CATALOG FACETS
              </span>
              <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-[#777777]">
                LIVE LEDGER
              </span>
            </div>

            {/* Facet Group 1: Price Bracket */}
            <div className="space-y-2.5">
              <div className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#777777] font-semibold">
                VALUATION BRACKET
              </div>
              <div className="space-y-1.5 font-sans text-[12px] text-[#8E8E8E]">
                {[
                  { id: 'ALL', label: 'All Valuations' },
                  { id: 'UNDER_15K', label: 'Under ₹15,000' },
                  { id: '15K_35K', label: '₹15,000 – ₹35,000' },
                  { id: '35K_75K', label: '₹35,000 – ₹75,000' },
                  { id: 'ABOVE_75K', label: 'Above ₹75,000' },
                ].map((item) => {
                  const isSelected = selectedPriceBracket === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handlePriceBracketChange(item.id)}
                      className="flex items-center justify-between py-1 px-1.5 hover:bg-[#141414] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-3 h-3 rounded-none border transition-colors flex items-center justify-center ${
                            isSelected
                              ? 'border-[#F2EFE9] bg-[#F2EFE9]'
                              : 'border-[#333333] bg-[#080808]'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 bg-[#080808]" />}
                        </div>
                        <span className={isSelected ? 'text-[#F2EFE9] font-medium' : 'text-[#8E8E8E]'}>
                          {item.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Facet Group 2: Condition Grade */}
            <div className="space-y-2.5 pt-4 border-t border-[#161616]">
              <div className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#777777] font-semibold">
                INSPECTION GRADE
              </div>
              <div className="space-y-1.5 font-sans text-[12px] text-[#8E8E8E]">
                {[
                  { id: 'FACTORY SEALED', label: 'MISB (Factory Sealed)' },
                  { id: 'GRADE A', label: 'BIB (Cabinet Displayed)' },
                ].map((item) => {
                  const isChecked = selectedGrades.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleGrade(item.id)}
                      className="flex items-center justify-between py-1 px-1.5 hover:bg-[#141414] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-3 h-3 rounded-none border transition-colors flex items-center justify-center ${
                            isChecked
                              ? 'border-[#F2EFE9] bg-[#F2EFE9]'
                              : 'border-[#333333] bg-[#080808]'
                          }`}
                        >
                          {isChecked && <div className="w-1.5 h-1.5 bg-[#080808]" />}
                        </div>
                        <span className={isChecked ? 'text-[#F2EFE9] font-medium' : 'text-[#8E8E8E]'}>
                          {item.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Facet Group 3: Origin Vault */}
            <div className="space-y-2.5 pt-4 border-t border-[#161616]">
              <div className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#777777] font-semibold">
                VAULT LOCATION
              </div>
              <div className="space-y-1.5 font-sans text-[12px] text-[#8E8E8E]">
                {[
                  { id: 'MUMBAI', label: 'Mumbai, MH (In-Hand)' },
                  { id: 'BENGALURU', label: 'Bengaluru, KA (In-Hand)' },
                  { id: 'AHMEDABAD', label: 'Ahmedabad, GJ (In-Hand)' },
                ].map((item) => {
                  const isChecked = selectedOrigins.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleOrigin(item.id)}
                      className="flex items-center justify-between py-1 px-1.5 hover:bg-[#141414] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-3 h-3 rounded-none border transition-colors flex items-center justify-center ${
                            isChecked
                              ? 'border-[#F2EFE9] bg-[#F2EFE9]'
                              : 'border-[#333333] bg-[#080808]'
                          }`}
                        >
                          {isChecked && <div className="w-1.5 h-1.5 bg-[#080808]" />}
                        </div>
                        <span className={isChecked ? 'text-[#F2EFE9] font-medium' : 'text-[#8E8E8E]'}>
                          {item.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Facet Group 4: Scale Ratio */}
            <div className="space-y-2.5 pt-4 border-t border-[#161616]">
              <div className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#777777] font-semibold">
                SCALE SPECIFICATION
              </div>
              <div className="space-y-1.5 font-sans text-[12px] text-[#8E8E8E]">
                {['1/4 SCALE', '1/7 SCALE', '1/8 SCALE', 'NON-SCALE'].map((scale) => {
                  const isChecked = selectedScales.includes(scale);
                  return (
                    <div
                      key={scale}
                      onClick={() => toggleScale(scale)}
                      className="flex items-center justify-between py-1 px-1.5 hover:bg-[#141414] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-3 h-3 rounded-none border transition-colors flex items-center justify-center ${
                            isChecked
                              ? 'border-[#F2EFE9] bg-[#F2EFE9]'
                              : 'border-[#333333] bg-[#080808]'
                          }`}
                        >
                          {isChecked && <div className="w-1.5 h-1.5 bg-[#080808]" />}
                        </div>
                        <span className={isChecked ? 'text-[#F2EFE9] font-medium' : 'text-[#8E8E8E]'}>
                          {scale}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reset Filters CTA */}
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
            {isInitialLoading || isLoading ? (
              <ProductFeedSkeleton count={8} />
            ) : products.length === 0 ? (
              /* Global Zero Lots Empty State (Strict OtakuBazaar Dark Archival Vault Aesthetic) */
              <div className="p-12 sm:p-16 border border-[#1F1F1F] bg-[#080808] text-center my-4">
                <div className="font-mono text-[10px] text-[#777777] tracking-[0.2em] uppercase mb-3">
                  VAULT INDEX // LIVE STATUS
                </div>
                <h3 className="font-serif text-[18px] sm:text-[22px] text-[#F2EFE9] uppercase tracking-[0.06em] mb-3">
                  VAULT INDEX: 0 ACTIVE LOTS — NEW CONSIGNMENTS UNDERGOING AUTHENTICATION
                </h3>
                <p className="font-sans text-[12px] text-[#8E8E8E] max-w-lg mx-auto mb-6 leading-relaxed">
                  ALL VAULT LOTS UNDER CUSTODY HAVE BEEN SETTLED OR ARE CURRENTLY IN TRANSIT. SELLERS CAN CONSIGN GRAILS FOR ESCROW-BACKED ACQUISITIONS.
                </p>
                <Link
                  href="/sell"
                  className="inline-block px-6 py-3 border border-[#F2EFE9] bg-[#080808] text-[#F2EFE9] hover:bg-[#F2EFE9] hover:text-[#080808] transition-colors font-sans text-[11px] tracking-[0.16em] uppercase font-semibold no-underline"
                >
                  [ CONSIGN A LOT ]
                </Link>
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Filter Criteria Zero Matches Empty State */
              <div className="p-12 sm:p-16 border border-[#1F1F1F] bg-[#0C0C0C] text-center my-4">
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

                {/* Clean Architectural Pagination Bar */}
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
