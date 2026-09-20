/**
 * @file src/app/layout.tsx
 *
 * Root layout for OtakuBazaar.
 * - Loads Plus Jakarta Sans (premium geometric body font) and Shojumaru (logo & hero heading font).
 * - Wraps application in AuthProvider, ThemeProvider and SyncProviderWrapper.
 * - Renders dynamic ambient SVG backgrounds (birds for light mode, anime clouds for dark mode).
 * - Embeds persistent Navbar, route change sound effect, and footer BGM player.
 * - Zero Japanese characters.
 */

import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Shojumaru } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/presentation/components/providers/AuthProvider';
import { SyncProviderWrapper } from '@/presentation/components/providers/SyncProviderWrapper';
import { ThemeProvider } from '@/presentation/components/providers/ThemeProvider';
import { Navbar } from '@/presentation/components/Navbar';
import { CookieConsent } from '@/presentation/components/compliance/CookieConsent';
import { CartDrawer } from '@/presentation/components/cart/CartDrawer';

const jakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const shojumaru = Shojumaru({
  weight: '400',
  variable: '--font-shojumaru',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OtakuBazaar — Premium Anime Collectibles Marketplace',
  description:
    'Buy, sell, and negotiate authentic anime scale figures, Nendoroids, manga box sets, and grails with 15-minute checkout locks and 48-hour escrow protection.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${shojumaru.variable} antialiased`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="bg-[#09090b] text-white selection:bg-[#F85B1A] selection:text-white"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-sans), sans-serif',
        }}
      >
        {/* Cinematic Physical Film Noise Overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
          }}
        />

        <AuthProvider>
          <ThemeProvider>
            <SyncProviderWrapper>
              {/* Persistent Global Navigation */}
              <Navbar />

              {/* Main Buyer & Seller Views */}
              <main style={{ flex: 1, position: 'relative', zIndex: 10 }}>{children}</main>

              {/* Privacy & Escrow Security Cookie Banner */}
              <CookieConsent />

              {/* Slide-Over Cart Drawer for Item Negotiation */}
              <CartDrawer />
            </SyncProviderWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}