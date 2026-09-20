'use client';

/**
 * @file src/presentation/components/Pagination.tsx
 *
 * Client-side Pagination Component for OtakuBazaar.
 *
 * Renders URL-driven Prev/Next and numbered page links using next/navigation.
 */

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps): React.JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper function to clone current searchParams, update page, and return URL string
  const createPageURL = (pageNumber: number | string): string => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('page', pageNumber.toString());
    return `${pathname || '/'}?${params.toString()}`;
  };

  const safeTotalPages = Math.max(1, totalPages || 1);
  const pages = Array.from({ length: safeTotalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-8 select-none">
      {/* Prev Link */}
      <Link
        href={createPageURL(currentPage - 1)}
        id="pagination-prev"
        aria-label="Go to previous page"
        className={`px-3 py-2 text-sm font-bold rounded-lg border border-stone-800 bg-[#0a0806] text-stone-300 hover:text-white hover:border-stone-700 transition-all ${
          currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        Prev
      </Link>

      {/* Numbered Page Links (1 to totalPages) */}
      {pages.map((page) => {
        const isActive = page === currentPage;
        return (
          <Link
            key={page}
            href={createPageURL(page)}
            id={`pagination-page-${page}`}
            aria-label={`Page ${page}`}
            aria-current={isActive ? 'page' : undefined}
            className={`min-w-[36px] h-9 px-3 flex items-center justify-center text-sm font-bold rounded-lg transition-all ${
              isActive
                ? 'bg-[#F85B1A] text-white shadow-[0_0_15px_rgba(248,91,26,0.5)] border border-[#F85B1A]'
                : 'bg-[#0a0806] text-stone-300 hover:text-white border border-stone-800 hover:border-stone-700'
            }`}
          >
            {page}
          </Link>
        );
      })}

      {/* Next Link */}
      <Link
        href={createPageURL(currentPage + 1)}
        id="pagination-next"
        aria-label="Go to next page"
        className={`px-3 py-2 text-sm font-bold rounded-lg border border-stone-800 bg-[#0a0806] text-stone-300 hover:text-white hover:border-stone-700 transition-all ${
          currentPage >= safeTotalPages ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        Next
      </Link>
    </div>
  );
}

export default Pagination;
