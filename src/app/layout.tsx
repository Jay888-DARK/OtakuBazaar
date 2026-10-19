/**
 * @file src/app/layout.tsx
 *
 * Root layout for OtakuBazaar.
 * - Imports luxury archival font stack: Syne, Plus Jakarta Sans, and Chakra Petch.
 * - Wraps application in AuthProvider, ThemeProvider and SyncProviderWrapper.
 * - Embeds persistent Navbar, slide-over CartDrawer, and compliance banners.
 */

import type { Metadata } from 'next';
import { Michroma, Archivo, Chakra_Petch, Titillium_Web } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/presentation/components/providers/AuthProvider';
import { SyncProviderWrapper } from '@/presentation/components/providers/SyncProviderWrapper';
import { ThemeProvider } from '@/presentation/components/providers/ThemeProvider';
import { Navbar } from '@/presentation/components/Navbar';
import { CookieConsent } from '@/presentation/components/compliance/CookieConsent';
import { CartDrawer } from '@/presentation/components/cart/CartDrawer';
import { ProvenanceManifestModal } from '@/presentation/components/provenance/ProvenanceManifestModal';
import { RazorpayScript } from '@/presentation/components/payments/RazorpayScript';

const michroma = Michroma({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-brand',
  display: 'swap',
});

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-headline',
  display: 'swap',
});

const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-mechanical',
  display: 'swap',
});

const titilliumWeb = Titillium_Web({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-swiss',
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
      className={`antialiased ${michroma.variable} ${archivo.variable} ${chakraPetch.variable} ${titilliumWeb.variable}`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className={`${titilliumWeb.className} bg-[#0a0a0a] text-white selection:bg-[#F85B1A] selection:text-white`}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-swiss), sans-serif',
        }}
      >
        {/* Lazy Loaded Razorpay Checkout Script */}
        <RazorpayScript />
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

              {/* Slide-Over Cart Drawer */}
              <CartDrawer />

              {/* Feature 3: Expanded Full-Screen Cryptographic Provenance Manifest */}
              <ProvenanceManifestModal />
            </SyncProviderWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}