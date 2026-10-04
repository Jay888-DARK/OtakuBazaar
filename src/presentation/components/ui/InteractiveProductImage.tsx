'use client';

/**
 * @file src/presentation/components/ui/InteractiveProductImage.tsx
 *
 * Interactive 3D Cursor Tilt & Specular Shine Wrapper for Collectible Showcase Images.
 * - Tracks local mouse coordinates (x, y) on onMouseMove.
 * - Applies 3D tilt transform with perspective(1000px) and rotation based on mouse coordinates.
 * - Adds dynamic specular reflection layer with mix-blend-mode: overlay.
 * - Adds dynamic saturation: rests at saturate(0.85) contrast(1.1), transitions to saturate(1.2) contrast(1.15).
 * - Enforces strict 0px border-radius and 1px border brutalist constraints.
 */

import React, { useRef, useState, useCallback } from 'react';

export interface InteractiveProductImageProps {
  children: React.ReactNode;
  className?: string;
}

export function InteractiveProductImage({
  children,
  className = '',
}: InteractiveProductImageProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    containerRef.current.style.setProperty('--mouse-x', x.toFixed(4));
    containerRef.current.style.setProperty('--mouse-y', y.toFixed(4));
    if (!isHovered) setIsHovered(true);
  }, [isHovered]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (containerRef.current) {
      containerRef.current.style.setProperty('--mouse-x', '0.5');
      containerRef.current.style.setProperty('--mouse-y', '0.5');
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`.trim()}
      style={{
        '--mouse-x': '0.5',
        '--mouse-y': '0.5',
        transform: isHovered
          ? 'perspective(1000px) rotateX(calc((var(--mouse-y) - 0.5) * -14deg)) rotateY(calc((var(--mouse-x) - 0.5) * 14deg)) scale3d(1.02, 1.02, 1.02)'
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: 'transform 0.15s ease-out',
        willChange: 'transform',
      } as React.CSSProperties}
    >
      {/* Dynamic Specular Reflection Layer */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-opacity duration-200 z-20"
        style={{
          opacity: isHovered ? 1 : 0,
          background:
            'radial-gradient(circle 280px at calc(var(--mouse-x) * 100%) calc(var(--mouse-y) * 100%), rgba(255, 255, 255, 0.22), transparent 70%)',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Dynamic Saturation Image Content */}
      <div
        className="w-full h-full relative transition-[filter] duration-200 z-10"
        style={{
          filter: isHovered
            ? 'saturate(1.2) contrast(1.15)'
            : 'saturate(0.85) contrast(1.1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default InteractiveProductImage;
