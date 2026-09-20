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
  maxTilt = 12,
  accentColor = '#C9943E',
  collectorGrade,
  hasLicensingSeal = true,
  isLocked = false,
  isAuraActive = false,
  onClick,
}: HoloCard3DProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Simple tilt transform
  const [tilt, setTilt] = useState<TiltTransform>({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });

  const handleMouseEnter = useCallback(() => {
    // hover sound removed
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || isLocked) return;

      const rect = cardRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Normalize between -1 and +1
      const normalizedX = (mouseX / rect.width) * 2 - 1;
      const normalizedY = (mouseY / rect.height) * 2 - 1;

      // Snappy, gentle 3D tilt
      const rotateX = -normalizedY * maxTilt;
      const rotateY = normalizedX * maxTilt;

      const glareX = Math.round((mouseX / rect.width) * 100);
      const glareY = Math.round((mouseY / rect.height) * 100);

      setTilt({
        rotateX,
        rotateY,
        glareX,
        glareY,
        isHovered: true,
      });
    },
    [maxTilt, isLocked]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false,
    });
  }, []);

  // Compute transform style
  const cardTransform = useMemo(() => {
    if (!tilt.isHovered) {
      return 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
    return `perspective(1000px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
  }, [tilt.isHovered, tilt.rotateX, tilt.rotateY]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`glass-card rounded-3xl ${isAuraActive ? 'energy-aura' : ''} ${className}`.trim()}
      style={{
        position: 'relative',
        borderRadius: '24px',
        backgroundColor: 'var(--surface-glass)',
        backdropFilter: 'blur(18px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
        border: `1.5px solid ${
          isAuraActive
            ? '#F85B1A'
            : isLocked
            ? '#FF6584'
            : tilt.isHovered
            ? accentColor
            : 'var(--surface-glass-border)'
        }`,
        boxShadow: isAuraActive
          ? '0 0 35px rgba(248, 91, 26, 0.7), 0 0 50px rgba(201, 148, 62, 0.6)'
          : isLocked
          ? '0 20px 40px -15px rgba(255, 101, 132, 0.3)'
          : tilt.isHovered
          ? '0 -15px 30px -10px rgba(201, 148, 62, 0.06), 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 8px 24px -4px rgba(0, 0, 0, 0.35)'
          : 'var(--shelf-shadow)',
        transform: cardTransform,
        transition: tilt.isHovered
          ? 'transform 0.08s ease-out, box-shadow 0.2s ease, border-color 0.2s ease'
          : 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s ease, border-color 0.3s ease',
        transformStyle: 'preserve-3d',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        willChange: 'transform',
        ...style,
      }}
    >
      {/* Enhanced Warm Specular Glare Overlay on Hover */}
      {tilt.isHovered && !isLocked && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 248, 230, 0.25) 0%, rgba(201, 148, 62, 0.05) 30%, transparent 65%)`,
            pointerEvents: 'none',
            zIndex: 25,
            opacity: 0.9,
            transition: 'opacity 0.2s ease',
          }}
        />
      )}

      {/* Subtle Warm Halftone Screentone */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(180, 140, 80, 0.03) 1px, transparent 0)',
          backgroundSize: '12px 12px',
          pointerEvents: 'none',
          zIndex: 15,
        }}
      />

      {/* Official Authentication Seal — Bronze/Gold */}
      {hasLicensingSeal && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            zIndex: 26,
            transform: 'translateZ(30px)',
            pointerEvents: 'none',
          }}
          title="Authentic Official Seal"
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1A1410 0%, #2A2118 100%)',
              border: '1.5px solid #C9943E',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(201, 148, 62, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '7px',
              fontWeight: 900,
              color: '#F0E8DA',
              lineHeight: 1,
              letterSpacing: '0.02em',
            }}
          >
            <span>OFFICIAL</span>
            <span style={{ fontSize: '6px', fontWeight: 800, color: '#C9943E' }}>AUTH</span>
          </div>
        </div>
      )}

      {/* Collector Grade Badge — Bronze/Gold */}
      {collectorGrade && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 26,
            transform: 'translateZ(30px)',
          }}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #1A1410 0%, #2A2118 100%)',
              border: '1.5px solid #C9943E',
              color: '#E8C36A',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 900,
              boxShadow: '2px 2px 0px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201, 148, 62, 0.15)',
              letterSpacing: '0.04em',
            }}
          >
            {collectorGrade}
          </span>
        </div>
      )}

      {/* Card Content with 3D Depth */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          width: '100%',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
}
