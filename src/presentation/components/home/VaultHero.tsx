'use client';

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
  { id: 'lot-0489', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=85', title: 'NICHIRIN SWORD 1:1', href: '/lot/lot-0489' },
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
    <section className="relative w-full h-screen min-h-screen overflow-hidden bg-[#0a0a0a] flex flex-col justify-center items-center select-none">
      {/* 3D Drifting Animation Canvas filling full viewport */}
      <div className="absolute inset-0 w-full h-full pointer-events-auto opacity-75">
        <DriftWall
          items={CURATED_VAULT_GRAILS}
          columns={6}
          tileWidth={260}
          tileHeight={180}
          gap={18}
          speed={16}
          grayscale={false}
          overlayColor="#0a0a0a"
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
        <span
          className="uppercase mb-3 border border-[#262626] bg-[#0a0a0a] px-3 py-1 font-swiss"
          style={{
            fontFamily: 'var(--font-swiss), sans-serif',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#8a8a8a',
          }}
        >
          TOKYO ARCHIVAL VAULT · ESCROW DIRECT
        </span>
        <h1
          className="uppercase select-none font-gta"
          style={{
            fontFamily: "var(--font-gta), 'Pricedown Bl', 'Pricedown', sans-serif",
            fontSize: 'clamp(4.5rem, 11vw, 9.5rem)',
            lineHeight: 0.88,
            letterSpacing: '0.02em',
            color: '#ffffff',
            WebkitTextStroke: '2px #0a0a0a',
          }}
        >
          AUTHENTICATED GRAILS
        </h1>
        <p
          className="max-w-xl mt-4 font-swiss"
          style={{
            fontFamily: 'var(--font-swiss), sans-serif',
            fontSize: '1.05rem',
            fontWeight: 400,
            letterSpacing: '0.02em',
            lineHeight: 1.5,
            color: '#d4d4d4',
          }}
        >
          Pre-inspected Japanese scale figures backed by a 24-hour liquidity protocol. Double-entry escrow custody with 48-hour inspection protection.
        </p>
      </div>

      {/* Stage 1 subtle bottom scroll indicator anchored at bottom center of the 100vh frame */}
      <button
        onClick={handleScrollToStage2}
        type="button"
        aria-label="Scroll to access archival index"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 cursor-pointer flex flex-col items-center gap-1.5 border border-[#262626] bg-[#0a0a0a] hover:bg-[#141414] hover:border-white px-4 py-2 transition-none rounded-none group"
      >
        <span
          style={{
            fontFamily: 'var(--font-swiss), sans-serif',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
          className="uppercase font-semibold text-zinc-300 group-hover:text-white font-swiss"
        >
          [ SCROLL TO ACCESS ARCHIVAL INDEX ]
        </span>
        <svg
          className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    </section>
  );
}
