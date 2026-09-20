import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/presentation/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Turtle School & Goku Palette
        goku: {
          orange: '#F85B1A', // Primary Action
          DEFAULT: '#F85B1A',
        },
        resolution: {
          blue: '#072083', // Secondary Action / Accent
          DEFAULT: '#072083',
        },
        // Universal Accents
        sakura: {
          DEFAULT: '#FF6584',
          light: '#FF8DA4',
          dark: '#E04E6E',
        },
        // Light Mode (Day) Accents
        pastel: {
          mint: '#BDF0E3',
          blue: '#F3FAFE',
          sky: '#89CFF0',
        },
        // Dark Mode (Night) Accents
        manga: {
          ink: '#121216',
          obsidian: '#0B0F19',
        },
        shonen: {
          gold: '#FFB800',
        },
        neon: {
          cyan: '#38BDF8',
        },
        // Glassmorphic surfaces
        frost: 'rgba(255, 255, 255, 0.7)',
        slateGlass: 'rgba(30, 41, 59, 0.7)',
      },
      boxShadow: {
        diffused: '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
        diffusedDark: '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
        aura: '0 0 25px rgba(255, 184, 0, 0.7), 0 0 45px rgba(56, 189, 248, 0.5)',
      },
      borderRadius: {
        anime: '16px',
      },
      fontFamily: {
        shojumaru: ['var(--font-shojumaru)', 'cursive', 'fantasy', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
