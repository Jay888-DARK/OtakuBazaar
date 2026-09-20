'use client';

/**
 * @file src/presentation/components/providers/ThemeProvider.tsx
 *
 * Dual-Theme Context Provider (NAMIHARA Style) for OtakuBazaar:
 * - Day Mode (Light Theme): Soft off-white (#F8FAFC), icy pastel blue (#F3FAFE), frost glass (rgba(255,255,255,0.7)).
 * - Night Mode (Dark Theme): Deep manga ink (#121216), midnight obsidian (#0B0F19), slate glass (rgba(30,41,59,0.7)).
 * - Synchronizes with document.documentElement attributes and local storage.
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  readonly theme: ThemeMode;
  readonly toggleTheme: () => void;
  readonly setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { readonly children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('otaku_theme') as ThemeMode | null;
      if (saved === 'light' || saved === 'dark') {
        queueMicrotask(() => {
          setThemeState(saved);
        });
        document.documentElement.setAttribute('data-theme', saved);
        if (saved === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
      }
    } catch {
      // Ignore
    }
    queueMicrotask(() => {
      setMounted(true);
    });
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('otaku_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // Ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('otaku_theme', next);
        document.documentElement.setAttribute('data-theme', next);
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {/* Ensure hydration consistency */}
      <div data-theme={mounted ? theme : 'dark'} className={mounted ? theme : 'dark'} style={{ minHeight: '100%' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}
