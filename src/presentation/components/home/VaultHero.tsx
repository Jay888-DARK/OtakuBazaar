'use client';

/**
 * @file src/presentation/components/home/VaultHero.tsx
 *
 * Full-Viewport Hero Presentation for OtakuBazaar.
 * Strictly adheres to the dark archival auction-house aesthetic:
 * - Headline: High-contrast editorial Serif (Playfair Display), uppercase, wide tracking, #F2EFE9.
 * - Subtitle: Clean geometric sans, sentence case, #8E8E8E.
 * - Architectural hairline bracketed CTA ([ ACCESS ARCHIVAL INDEX ]).
 * - Zero GTA fonts, zero animated arrows, zero emoji.
 */

import React from 'react';
import DriftWall from '../ui/DriftWall';

interface VaultHeroProps {
  onSelectVaultItem?: (item: { id?: string; title: string }) => void;
}

const CURATED_VAULT_GRAILS = [
  { id: 'lot-0482', image: '/showcase/guts_berserker_statue.jpg', title: 'GUTS BERSERKER 1/4', href: '/lot/lot-0482' },
  { id: 'lot-0481', image: '/showcase/bay1_clean.png', title: 'RENGOKU FLAME 1/8', href: '/lot/lot-0481' },
  { id: 'lot-0484', image: '/showcase/bay2_clean.png', title: 'SABER ALTRIA 1/7', href: '/lot/lot-0484' },
  { id: 'lot-0485', image: '/showcase/bay3_clean.png', title: 'GOJO HOLLOW PURPLE 1/7', href: '/lot/lot-0485' },
  { id: 'lot-0483', image: '/showcase/figure_umbreon.png', title: 'EDWARD ELRIC GEM', href: '/lot/lot-0483' },
  { id: 'lot-0486', image: '/showcase/cabinet_clean.png', title: 'EVA UNIT-01 METAL BUILD', href: '/lot/lot-0486' },
  { id: 'lot-0488', image: '/showcase/manga_shelf_bottom.png', title: 'BERSERK DELUXE 1-14', href: '/lot/lot-0488' },
  { id: 'lot-0489', image: '/Firefly_clean.png', title: 'NICHIRIN SWORD 1:1', href: '/lot/lot-0489' },
];

export default function VaultHero({ onSelectVaultItem }: VaultHeroProps) {
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
        <DriftWall
          items={CURATED_VAULT_GRAILS}
          columns={6}
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

        {/* Dual Primary CTAs (Task 2) */}
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

      {/* Stage 1 subtle bottom scroll indicator anchored at bottom center of the frame */}
      <button
        onClick={handleScrollToStage2}
        type="button"
        aria-label="Scroll to access archival index"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 cursor-pointer flex flex-col items-center gap-1.5 border border-[#1F1F1F] bg-[#0C0C0C] hover:bg-[#F2EFE9] hover:border-[#F2EFE9] px-5 py-2.5 transition-colors duration-75 rounded-none group"
      >
        <span className="font-sans text-[10px] font-semibold tracking-[0.16em] uppercase text-[#888888] group-hover:text-[#080808] transition-colors duration-75">
          [ ACCESS ARCHIVAL INDEX ]
        </span>
      </button>
    </section>
  );
}
