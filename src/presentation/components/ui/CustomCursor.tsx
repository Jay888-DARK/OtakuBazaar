'use client';

/**
 * @file src/presentation/components/ui/CustomCursor.tsx
 *
 * Cinematic Monochromatic Custom Cursor & Ambient Spotlight.
 * - 4px solid white dot tracking clientX/clientY in real-time.
 * - 24px trailing ring with subtle spring physics (border-white/30).
 * - Fixed pointer-events-none spotlight with 600px monochromatic radial gradient.
 * - Strictly monochromatic: pure white, gray, black (no colors, no neon).
 * - Graceful fallback / auto-disabled on touch/coarse devices.
 */

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor(): React.JSX.Element | null {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  // High-performance motion coordinates (bypass React render loop)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth trailing spring for the outer ring & spotlight
  const springConfig = { damping: 28, stiffness: 220, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    setIsEnabled(true);

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer')
        );
        setIsPointer(isInteractive);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isEnabled) return null;

  return (
    <>
      {/* Monochromatic 600px Radial Spotlight Background */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-0 overflow-hidden cursor-circle"
        style={{
          width: 600,
          height: 600,
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
          background:
            'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 30%, transparent 60%)',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* 24px Trailing Ring */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[99998] cursor-circle"
        style={{
          width: isPointer ? 32 : 24,
          height: isPointer ? 32 : 24,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
          backgroundColor: isPointer ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
          transition: 'width 0.2s ease, height 0.2s ease, background-color 0.2s ease, opacity 0.2s ease',
        }}
      />

      {/* 4px Solid White Dot */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[99999] bg-white cursor-circle"
        style={{
          width: 4,
          height: 4,
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
      />
    </>
  );
}
