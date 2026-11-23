'use client';

/**
 * @file src/presentation/components/home/VaultHero.tsx
 *
 * Full-Viewport Hero Presentation for OtakuBazaar.
 * Strictly adheres to the dark archival auction-house aesthetic:
 * - Headline: High-contrast editorial Serif (Playfair Display), uppercase, wide tracking, #F2EFE9.
 * - Subtitle: Clean geometric sans, sentence case, #8E8E8E.
 * - Architectural hairline bracketed CTA ([ BROWSE FIGURES ] / [ SELL YOUR COLLECTION ]).
 * - Pure database-driven showcase with clean architectural fallback when vault items are 0.
 */

import React, { useEffect, useState } from 'react';
import DriftWall, { DriftWallItem } from '../ui/DriftWall';

interface VaultHeroProps {
  onSelectVaultItem?: (item: { id?: string; title: string }) => void;
  initialItems?: DriftWallItem[];
}

export default function VaultHero({ onSelectVaultItem, initialItems }: VaultHeroProps) {
  const [items, setItems] = useState<DriftWallItem[]>(initialItems || []);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
      return;
    }

    let isMounted = true;
    fetch('/api/listings')
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (!isMounted) return;
        const validListings = Array.isArray(data.items) ? data.items : [];
        const mapped: DriftWallItem[] = validListings
          .filter((l: any) => l.status === 'ACTIVE' || l.status === 'RESERVED')
          .map((l: any) => {
            let img = '/otakubazaar-logo.png';
            if (Array.isArray(l.imageUrls) && l.imageUrls[0]) {
              img = l.imageUrls[0];
            } else if (typeof l.imageUrls === 'string') {
              try {
                const parsed = JSON.parse(l.imageUrls);
                if (Array.isArray(parsed) && parsed[0]) img = parsed[0];
                else img = l.imageUrls;
              } catch {
                img = l.imageUrls;
              }
            }
            return {
              id: l.id,
              image: img,
              title: l.title,
              href: `/lot/${l.id}`,
            };
          });
        setItems(mapped);
      })
      .catch(() => {
        if (isMounted) setItems([]);
      });

    return () => {
      isMounted = false;
    };
  }, [initialItems]);

  const handleScrollToStage2 = () => {
    if (typeof document !== 'undefined') {
      const stage2 = document.getElementById('stage-2');
      if (stage2) {
        stage2.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative w-full h-[calc(100vh-5rem)] min-h-[520px] overflow-hidden bg-[#080808] flex flex-col justify-center items-center select-none border-b border-[#1F1F1F]">
      {/* 3D Drifting Animation Canvas filling full viewport */}
      <div className="absolute inset-0 w-full h-full pointer-events-auto opacity-45">
        {items.length > 0 ? (
          <DriftWall
            items={items}
            columns={Math.min(6, Math.max(3, items.length))}
            tileWidth={260}
            tileHeight={180}
            gap={18}
            speed={16}
            grayscale={false}
            overlayColor="#080808"
            pauseOnHover={true}
            onItemClick={(item) => {
              if (onSelectVaultItem) {
                onSelectVaultItem({ id: item.id, title: item.title || '' });
              } else if (item.id && typeof window !== 'undefined') {
                window.location.href = `/lot/${item.id}`;
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] flex items-center justify-center">
            <span className="border border-[#1F1F1F] px-4 py-2 text-[#444444] font-mono text-[10px] tracking-[0.2em] uppercase">
              ARCHIVAL VAULT CUSTODY // ZERO ACTIVE SPECIMENS IN ROTATION
            </span>
          </div>
        )}
      </div>

      {/* Floating Center Hero Text */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
        <span className="font-mono text-[10px] tracking-[0.25em] text-[#888888] uppercase mb-4 pointer-events-none">
          INDIA’S C2C ANIME COLLECTIBLES MARKETPLACE // ESCROW SECURED
        </span>
        <h1 className="font-serif text-[38px] sm:text-[46px] md:text-[54px] text-[#F2EFE9] tracking-[0.04em] uppercase font-bold leading-[1.08] pointer-events-none">
          Authentic Anime Figures &amp; Collectibles
        </h1>
        <p className="font-sans text-[13px] sm:text-[14px] text-[#8E8E8E] max-w-xl mx-auto font-normal leading-relaxed mt-4 pointer-events-none">
          Buy and sell verified Japanese scale figures and statues with peace of mind. Buyer payments are held safely in escrow until you unbox and inspect your collectible.
        </p>

        {/* Dual Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 pointer-events-auto">
          <button
            onClick={handleScrollToStage2}
            type="button"
            className="w-full sm:w-auto px-6 py-3 bg-[#F2EFE9] hover:bg-[#EAE6DF] text-[#080808] border border-[#F2EFE9] font-sans font-semibold text-[11px] uppercase tracking-[0.16em] transition-none cursor-pointer rounded-none text-center"
          >
            [ BROWSE FIGURES ]
          </button>
          <a
            href="/sell"
            className="w-full sm:w-auto px-6 py-3 bg-[#0C0C0C] hover:bg-[#161616] text-[#F2EFE9] hover:text-white border border-[#1F1F1F] hover:border-[#3A3A3A] font-sans font-semibold text-[11px] uppercase tracking-[0.16em] transition-none rounded-none text-center no-underline"
          >
            [ SELL YOUR COLLECTION ]
          </a>
        </div>
      </div>

      {/* Stage 1 subtle bottom scroll indicator */}
      <button
        onClick={handleScrollToStage2}
        type="button"
        aria-label="Scroll to access archival index"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.24em] text-[#666666] hover:text-[#CCCCCC] transition-none cursor-pointer z-20 border border-transparent hover:border-[#222222] px-3 py-1 bg-[#080808]/80 backdrop-blur-sm"
      >
        <span>[ SCROLL TO ACCESS ARCHIVAL INDEX ]</span>
      </button>
    </section>
  );
}
