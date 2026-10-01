/**
 * @file src/presentation/components/BrandEmblem.tsx
 *
 * High-resolution geometric vector SVG emblem for OtakuBazaar.
 * Renders with exact dimensions (28px height) and crisp geometric paths
 * without any rasterization artifacts.
 */

import React from 'react';

interface BrandEmblemProps {
  size?: number;
  className?: string;
}

export function BrandEmblem({ size = 28, className = '' }: BrandEmblemProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      shapeRendering="geometricPrecision"
      aria-label="OtakuBazaar Vault Emblem"
      role="img"
    >
      {/* Outer Sharp Obsidian Frame */}
      <rect
        x="0.75"
        y="0.75"
        width="26.5"
        height="26.5"
        stroke="#27272A"
        strokeWidth="1.2"
        fill="#0C0C0E"
      />

      {/* Primary Geometric Diamond Facet */}
      <path
        d="M14 2.5L25.5 14L14 25.5L2.5 14L14 2.5Z"
        stroke="#E4E4E7"
        strokeWidth="1.2"
        fill="#141418"
      />

      {/* Inner Nested Vault Chamber */}
      <path
        d="M14 6L22 14L14 22L6 14L14 6Z"
        stroke="#71717A"
        strokeWidth="0.8"
        fill="#09090B"
      />

      {/* Central Geometric Core Key */}
      <polygon
        points="14,9.5 18.5,14 14,18.5 9.5,14"
        fill="#F85B1A"
      />

      {/* Precision Micro-Crosshair Alignment */}
      <line x1="14" y1="2.5" x2="14" y2="7" stroke="#A1A1AA" strokeWidth="0.8" />
      <line x1="14" y1="21" x2="14" y2="25.5" stroke="#A1A1AA" strokeWidth="0.8" />
      <line x1="2.5" y1="14" x2="7" y2="14" stroke="#A1A1AA" strokeWidth="0.8" />
      <line x1="21" y1="14" x2="25.5" y2="14" stroke="#A1A1AA" strokeWidth="0.8" />

      {/* Top-Left & Bottom-Right Corner Precision Marks */}
      <path d="M2.5 5.5V2.5H5.5" stroke="#F85B1A" strokeWidth="1.2" />
      <path d="M25.5 22.5V25.5H22.5" stroke="#F85B1A" strokeWidth="1.2" />
    </svg>
  );
}

export default BrandEmblem;
