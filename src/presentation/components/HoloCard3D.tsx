'use client';

/**
 * @file src/presentation/components/HoloCard3D.tsx
 *
 * Lightweight 3D Interactive Collectible Tilt Card — Gallery Craftsman Edition.
 * 1. Snappy cursor-tracking 3D tilt: perspective(1000px) rotateX/rotateY.
 * 2. Warm lacquered glassmorphism with gallery spotlight shadows.
 * 3. Bronze-accented authentication seals and collector grade badges.
 * 4. Enhanced warm-white cursor-tracked light glare.
 * 5. Audio feedback: plays katana sound on hover.
 */

import React, { useRef, useState, useCallback, useMemo } from 'react';


// ---------------------------------------------------------------------------
// Props Interface
// ---------------------------------------------------------------------------

export interface HoloCard3DProps {
  /** Card children (figure image, badges, details) */
  readonly children: React.ReactNode;
  /** Custom additional CSS styles */
  readonly style?: React.CSSProperties;
  /** Extra class names */
  readonly className?: string;
  /** Maximum tilt angle in degrees (default: 8) */
  readonly maxTilt?: number;
  /** Border accent color on hover (default: '#C9943E') */
  readonly accentColor?: string;
  /** Collector Grading Stamp (e.g., '[S-RANK] FACTORY SEALED') */
  readonly collectorGrade?: string;
  /** Whether to show the authentic Japanese Licensing Seal */
  readonly hasLicensingSeal?: boolean;
  /** Whether the card is in a locked/disabled state */
  readonly isLocked?: boolean;
  /** Whether the 2-second dynamic energy aura is active */
  readonly isAuraActive?: boolean;
  /** Optional click handler */
  readonly onClick?: () => void;
}

interface TiltTransform {
  readonly rotateX: number;
  readonly rotateY: number;
  readonly glareX: number;
  readonly glareY: number;
  readonly isHovered: boolean;
}

export function HoloCard3D({
  children,
  style,
  className = '',
  collectorGrade,
  hasLicensingSeal = true,
  isLocked = false,
  onClick,
}: HoloCard3DProps) {
  return (
    <div
      onClick={onClick}
      className={`border border-[#27272a] bg-[#0c0c0e] ${className}`.trim()}
      style={{
        position: 'relative',
        borderRadius: '0px',
        border: '1px solid #27272a',
        boxShadow: 'none',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {/* Official Authentication Seal — Minimal Flat Stamp */}
      {hasLicensingSeal && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            zIndex: 26,
            pointerEvents: 'none',
          }}
          title="Authentic Official Seal"
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '0px',
              background: '#141416',
              border: '1px solid #C9943E',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '7px',
              fontWeight: 900,
              color: '#F0E8DA',
              lineHeight: 1,
              letterSpacing: '0.04em',
            }}
          >
            <span>OFFICIAL</span>
            <span style={{ fontSize: '6px', fontWeight: 800, color: '#C9943E' }}>AUTH</span>
          </div>
        </div>
      )}

      {/* Collector Grade Badge — Minimal Flat Badge */}
      {collectorGrade && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 26,
          }}
        >
          <span
            style={{
              background: '#141416',
              border: '1px solid #C9943E',
              color: '#E8C36A',
              padding: '2px 8px',
              borderRadius: '0px',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.06em',
            }}
          >
            {collectorGrade}
          </span>
        </div>
      )}

      {/* Card Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          width: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}
