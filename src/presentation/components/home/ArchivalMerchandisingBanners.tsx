'use client';

/**
 * @file src/presentation/components/home/ArchivalMerchandisingBanners.tsx
 *
 * 4-Column Curated Archival Merchandising Showcase — Museum Mat Layout.
 *
 * Strict Architectural Rules:
 * - Outer 1px solid #1F1F1F card frame with p-6 bg-[#080808].
 * - Kicker (#777777) and editorial serif title (#F2EFE9) at the top.
 * - Padded aspect-[16/10] studio well (p-2 bg-[#0C0C0C] border border-[#1A1A1A]).
 * - ZERO overlay pills covering the collectible photography.
 * - Clean bottom hairline row with curation spec and bracketed action link.
 * - ZERO dummy Unsplash URLs.
 * - Handles 0 active lots gracefully with OtakuBazaar dark archival empty state.
 */

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BannerData {
  id: string;
  header: string;
  subtitle: string;
  spec: string;
  image: string;
  filterType: 'filter' | 'category';
  filterValue: string;
}

interface ArchivalMerchandisingBannersProps {
  initialListingCount?: number;
}

export function ArchivalMerchandisingBanners({ initialListingCount }: ArchivalMerchandisingBannersProps): React.JSX.Element {
  const [activeListings, setActiveListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(initialListingCount === undefined);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/listings')
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (!isMounted) return;
        setActiveListings(Array.isArray(data.items) ? data.items : []);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setActiveListings([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBannerClick = (banner: BannerData) => {
    if (typeof window !== 'undefined') {
      if (banner.filterType === 'filter') {
        window.dispatchEvent(
          new CustomEvent('otaku_filter_select', {
            detail: { filter: banner.filterValue },
          })
        );
      } else {
        window.dispatchEvent(
          new CustomEvent('otaku_category_select', {
            detail: { category: banner.filterValue },
          })
        );
      }

      const catalogElement = document.getElementById('catalog');
      if (catalogElement) {
        catalogElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Helper to resolve an authentic image from live listings
  const resolveListingImage = (filterFn: (l: any) => boolean, fallbackImg = '/otakubazaar-logo.png'): string => {
    const match = activeListings.find(filterFn);
    if (!match) return fallbackImg;
    if (Array.isArray(match.imageUrls) && match.imageUrls[0]) return match.imageUrls[0];
    if (typeof match.imageUrls === 'string') {
      try {
        const parsed = JSON.parse(match.imageUrls);
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
        return match.imageUrls;
      } catch {
        return match.imageUrls;
      }
    }
    return fallbackImg;
  };

  const banners: BannerData[] = [
    {
      id: 'b-under30k',
      header: 'UNDER ₹30,000 GRAILS',
      subtitle: 'AUTHENTIC JAPANESE LOTS',
      spec: 'ENTRY-LEVEL ESCROW VERIFIED',
      image: resolveListingImage((l) => (l.askingPriceAmount || 0) < 3000000, '/otakubazaar-logo.png'),
      filterType: 'filter',
      filterValue: 'UNDER_30K',
    },
    {
      id: 'b-srank',
      header: 'S-RANK FACTORY SEALED',
      subtitle: 'UNOPENED COLLECTOR VAULT',
      spec: 'VERIFIED IN-HAND CUSTODY',
      image: resolveListingImage((l) => l.condition === 'NEW', '/otakubazaar-logo.png'),
      filterType: 'filter',
      filterValue: 'FACTORY_SEALED',
    },
    {
      id: 'b-prime1',
      header: 'HIGH-SCALE STATUES',
      subtitle: 'MONUMENTAL RESIN & POLYSTONE',
      spec: 'ESCROW VERIFIED CUSTODY',
      image: resolveListingImage((l) => (l.askingPriceAmount || 0) >= 5000000, '/otakubazaar-logo.png'),
      filterType: 'filter',
      filterValue: 'PRIME_1',
    },
    {
      id: 'b-manga',
      header: 'MANGA & COLLECTIBLE EDITIONS',
      subtitle: 'COMPLETE ARCHIVAL RUNS',
      spec: 'VERIFIED PHYSICAL CONDITION',
      image: resolveListingImage((l) => (l.category || '').toLowerCase().includes('manga'), '/otakubazaar-logo.png'),
      filterType: 'category',
      filterValue: 'Manga Sets',
    },
  ];

  if (!loading && activeListings.length === 0) {
    return (
      <section className="w-full bg-[#080808] border-b border-[#1F1F1F] py-8 px-4 sm:px-6 lg:px-8 select-none">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6 border-b border-[#1F1F1F] pb-3">
            <span className="font-sans text-[10px] tracking-[0.18em] text-[#777777] uppercase font-semibold">
              CURATED ARCHIVAL MERCHANDISING • 4-STAGE LOT FOCUS
            </span>
            <span className="font-mono text-[10px] text-[#555555] tracking-[0.15em] uppercase">
              STAGE STATUS: STANDBY
            </span>
          </div>

          <div className="p-10 sm:p-14 border border-[#1F1F1F] bg-[#0C0C0C] text-center">
            <p className="font-mono text-[10px] text-[#777777] tracking-[0.2em] uppercase mb-2">
              MERCHANDISING MATRIX // 0 LOTS QUEUED
            </p>
            <h3 className="font-serif text-[18px] sm:text-[20px] text-[#F2EFE9] uppercase tracking-[0.06em] mb-2">
              FEATURED CURATION STAGES PAUSED — CONSIGNMENTS UNDERGOING AUTHENTICATION
            </h3>
            <p className="font-sans text-[12px] text-[#8E8E8E] max-w-lg mx-auto mb-6 leading-relaxed">
              Curated showcase brackets automatically populate as verified Japanese grails enter vault custody. Consign high-tier scale figures or complete sets for escrow clearance.
            </p>
            <Link
              href="/sell"
              className="inline-block px-5 py-2.5 border border-[#F2EFE9] bg-[#080808] text-[#F2EFE9] hover:bg-[#F2EFE9] hover:text-[#080808] transition-colors font-sans text-[11px] tracking-[0.16em] uppercase font-semibold no-underline"
            >
              [ CONSIGN A LOT ]
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#080808] border-b border-[#1F1F1F] py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 border-b border-[#1F1F1F] pb-3">
          <span className="font-sans text-[10px] tracking-[0.18em] text-[#777777] uppercase font-semibold">
            CURATED ARCHIVAL MERCHANDISING • 4-STAGE LOT FOCUS
          </span>
          <span className="font-sans text-[10px] tracking-[0.15em] text-[#555555] uppercase">
            CLICK TO FILTER CATALOG
          </span>
        </div>

        {/* 4-Column Grid: Museum Mat Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              onClick={() => handleBannerClick(banner)}
              className="group border border-[#1F1F1F] bg-[#080808] p-6 flex flex-col justify-between transition-colors duration-0 hover:border-[#333333] cursor-pointer"
            >
              {/* Top: Kicker & Editorial Title */}
              <div>
                <span className="font-sans text-[9px] tracking-[0.2em] text-[#777777] uppercase block mb-1.5 font-medium">
                  {banner.subtitle}
                </span>
                <h3 className="font-serif text-[17px] text-[#F2EFE9] uppercase tracking-[0.04em] leading-snug">
                  {banner.header}
                </h3>
              </div>

              {/* Middle: Padded Aspect-[16/10] Studio Well (Clean Frame, Zero Overlay Pills) */}
              <div className="my-5 p-2 bg-[#0C0C0C] border border-[#1A1A1A]">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0A0A0A]">
                  <Image
                    src={banner.image}
                    alt={banner.header}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-2"
                  />
                </div>
              </div>

              {/* Bottom: Clean Hairline Row with Spec & Action Link */}
              <div className="border-t border-[#161616] pt-3.5 flex justify-between items-center text-[10px] tracking-[0.14em] uppercase">
                <span className="font-sans text-[#777777] truncate mr-2">
                  {banner.spec}
                </span>
                <span className="font-sans text-[#F2EFE9] font-medium shrink-0 group-hover:text-white">
                  [ VIEW LOT INDEX ]
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
