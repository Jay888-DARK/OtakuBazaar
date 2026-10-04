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
        // Surfaces (Solid flat charcoal and obsidian)
        frost: '#18181b',
        slateGlass: '#121214',
      },
      boxShadow: {
        none: 'none',
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        inner: 'none',
        diffused: 'none',
        diffusedDark: 'none',
        aura: 'none',
      },
      dropShadow: {
        none: 'none',
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
        anime: '0px',
      },
      fontFamily: {
        sans: [
          '"Satoshi"',
          'sans-serif',
        ],
        display: [
          '"Clash Display"',
          '"Cabinet Grotesk"',
          'sans-serif',
        ],
        heading: [
          '"Clash Display"',
          '"Cabinet Grotesk"',
          'sans-serif',
        ],
        editorial: [
          '"Clash Display"',
          '"Cabinet Grotesk"',
          'sans-serif',
        ],
        serif: [
          '"Clash Display"',
          '"Cabinet Grotesk"',
          'sans-serif',
        ],
        mono: [
          '"Satoshi"',
          'sans-serif',
        ],
        shojumaru: [
          '"Clash Display"',
          '"Cabinet Grotesk"',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
