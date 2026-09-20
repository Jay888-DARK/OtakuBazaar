/**
 * @file src/presentation/hooks/useHoverSound.ts
 *
 * Audio Hook (Katana SFX and Audio Engines Disabled).
 */

'use client';

import { useCallback } from 'react';

export function useHoverSound(_soundSrc?: string) {
  const playHoverSound = useCallback(() => {
    // Audio engine disabled
  }, []);

  return { playHoverSound };
}

export default useHoverSound;
