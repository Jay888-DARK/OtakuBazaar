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
  { id: 'lot-0481', image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=85', title: 'RENGOKU FLAME 1/8', href: '/lot/lot-0481' },
  { id: 'lot-0484', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=85', title: 'SABER ALTRIA 1/7', href: '/lot/lot-0484' },
  { id: 'lot-0485', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=85', title: 'GOJO HOLLOW PURPLE 1/7', href: '/lot/lot-0485' },
  { id: 'lot-0483', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=85', title: 'EDWARD ELRIC GEM', href: '/lot/lot-0483' },
  { id: 'lot-0486', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=85', title: 'EVA UNIT-01 METAL BUILD', href: '/lot/lot-0486' },
  { id: 'lot-0488', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=85', title: 'BERSERK DELUXE 1-14', href: '/lot/lot-0488' },
  { id: 'lot-0489', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=85', title: 'NICHIRIN SWORD 1:1', href: '/lot/lot-0489' },
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
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto pointer-events-none">
        <span className="uppercase mb-4 border border-[#1F1F1F] bg-[#0C0C0C] px-3.5 py-1.5 font-sans text-[10px] tracking-[0.2em] text-[#777777] font-semibold">
          TOKYO ARCHIVAL VAULT • ESCROW CUSTODY DIRECT
        </span>
        <h1 className="font-serif text-[42px] sm:text-[64px] lg:text-[76px] font-bold text-[#F2EFE9] uppercase tracking-[0.08em] leading-[0.95] max-w-4xl">
          AUTHENTICATED GRAILS
        </h1>
        <p className="max-w-xl mt-5 font-sans text-[14px] font-normal leading-relaxed text-[#8E8E8E]">
          Pre-inspected Japanese scale figures and authenticated anime grails backed by double-entry escrow custody with a guaranteed 48-hour physical inspection window.
        </p>
      </div>

      {/* Stage 1 subtle bottom scroll indicator anchored at bottom center of the frame */}
      <button
        onClick={handleScrollToStage2}
        type="button"
        aria-label="Scroll to access archival index"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 cursor-pointer flex flex-col items-center gap-1.5 border border-[#1F1F1F] bg-[#0C0C0C] hover:bg-[#F2EFE9] hover:border-[#F2EFE9] px-5 py-2.5 transition-colors rounded-none group"
      >
        <span className="font-sans text-[10px] font-semibold tracking-[0.16em] uppercase text-[#888888] group-hover:text-[#080808] transition-colors">
          [ ACCESS ARCHIVAL INDEX ]
        </span>
      </button>
    </section>
  );
}
