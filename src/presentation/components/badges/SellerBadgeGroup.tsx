/**
 * @file src/presentation/components/badges/SellerBadgeGroup.tsx
 *
 * Neon bracket style Seller Reputation Badges for OtakuBazaar.
 * Strictly displays earned badges computed from real statistics.
 * Shows [ NEW SELLER ] for accounts under the 5 completed orders threshold.
 */

'use client';

import React, { useState } from 'react';
import type { BadgeDefinition } from '@/domain/services/sellerBadgeService';

export interface SellerBadgeGroupProps {
  badges?: BadgeDefinition[];
  isNewSeller?: boolean;
  compact?: boolean;
  className?: string;
}

export function SellerBadgeGroup({
  badges = [],
  isNewSeller = false,
  compact = false,
  className = '',
}: SellerBadgeGroupProps): React.JSX.Element {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  if (isNewSeller || badges.length === 0) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div
          className="relative inline-flex items-center px-2 py-0.5 border border-[#262626] bg-[#0A0A0A] text-[#888888] font-sans text-[9px] font-semibold uppercase tracking-[0.16em] cursor-help"
          onMouseEnter={() => setActiveTooltip('new-seller')}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <span>[ NEW SELLER ]</span>

          {activeTooltip === 'new-seller' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 w-48 p-2 bg-[#0C0C0C] border border-[#2A2A2A] text-[#CCCCCC] text-[10px] leading-tight text-center normal-case shadow-2xl pointer-events-none">
              Seller is establishing their verified vault transaction track record (under 5 completed orders).
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      {badges.map((badge) => {
        const isCurator = badge.id === 'VERIFIED_VAULT_CURATOR';
        const isDispute = badge.id === 'ZERO_DISPUTES';
        const isFast = badge.id === 'FAST_DISPATCH';

        const borderBgClass = isCurator
          ? 'border-[#D4AF37]/40 bg-[#141005] text-[#D4AF37] hover:border-[#D4AF37]'
          : isDispute
          ? 'border-[#10B981]/40 bg-[#06140D] text-[#10B981] hover:border-[#10B981]'
          : 'border-[#38BDF8]/40 bg-[#061118] text-[#38BDF8] hover:border-[#38BDF8]';

        return (
          <div
            key={badge.id}
            className={`relative inline-flex items-center px-2 py-0.5 border font-sans text-[9px] font-semibold uppercase tracking-[0.16em] transition-colors cursor-help ${borderBgClass}`}
            onMouseEnter={() => setActiveTooltip(badge.id)}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <span>[ {compact ? badge.shortLabel : badge.label} ]</span>

            {activeTooltip === badge.id && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 w-56 p-2.5 bg-[#0C0C0C] border border-[#2A2A2A] text-[#F2EFE9] text-[10px] leading-relaxed text-center normal-case shadow-2xl pointer-events-none">
                <div className="font-bold uppercase tracking-wider text-[9px] mb-1 text-white">
                  {badge.label}
                </div>
                <div className="text-[#999999]">{badge.description}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
