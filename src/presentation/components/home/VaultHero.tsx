'use client';

import React from 'react';
import DriftWall from '../ui/DriftWall';

interface VaultHeroProps {
  onSelectVaultItem?: (item: { id?: string; title: string }) => void;
}

const CURATED_VAULT_GRAILS = [
  { id: 'lot-0484', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=85', title: 'Saber Altria 1/7', href: '#catalog' },
  { id: 'lot-0482', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=85', title: 'Guts Berserker 1/4', href: '#catalog' },
  { id: 'lot-0481', image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=85', title: 'Rengoku Flame Breathing', href: '#catalog' },
  { id: 'lot-0483', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=85', title: 'Edward Elric GEM', href: '#catalog' },
  { id: 'lot-0485', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=85', title: 'Satoru Gojo Shibuya Scramble', href: '#catalog' },
  { id: 'lot-0486', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=85', title: 'EVA Unit-01 Metal Build', href: '#catalog' }
];

export default function VaultHero({ onSelectVaultItem }: VaultHeroProps) {
  return (
    <section className="relative w-full bg-[#09090b] overflow-hidden">
      {/* Top Edge Dissolve */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#09090b] via-[#09090b]/80 to-transparent pointer-events-none z-10" />

      {/* 3D Drifting Animation Canvas */}
      <div className="relative h-[480px] w-full">
        <DriftWall
          items={CURATED_VAULT_GRAILS}
          columns={5}
          tileWidth={230}
          tileHeight={150}
          gap={16}
          speed={18}
          grayscale={true}
          overlayColor="#09090b"
          pauseOnHover={true}
          onItemClick={(item) => {
            if (onSelectVaultItem) {
              onSelectVaultItem({ id: item.id, title: item.title || '' });
            } else if (item.id && typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('otaku_highlight_lot', { detail: { id: item.id } }));
              if (typeof document !== 'undefined') {
                const targetElement = document.getElementById(item.id);
                if (targetElement) {
                  targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }
            }
          }}
        />
      </div>

      {/* Deep Bottom Dissolve */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#09090b] via-[#09090b]/90 to-transparent pointer-events-none z-10" />

      {/* Floating Center Telemetry */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none z-20">
        <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 mb-2">
          TOKYO ARCHIVAL VAULT // ESCROW DIRECT
        </span>
        <h1 className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-zinc-100 uppercase">
          Authenticated Grails
        </h1>
        <p className="max-w-sm text-xs font-mono text-zinc-400 mt-2 mb-6">
          Pre-inspected Japanese scale figures backed by a 24-hour liquidity protocol.
        </p>
      </div>
    </section>
  );
}
