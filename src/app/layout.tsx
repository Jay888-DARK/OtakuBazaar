/**
 * @file src/app/layout.tsx
 *
 * Root layout for OtakuBazaar.
 * - High-contrast editorial typography system: Playfair Display, Plus Jakarta Sans, Archivo, Titillium Web, Michroma, Chakra Petch.
 * - Wraps application in AuthProvider, ThemeProvider and SyncProviderWrapper.
 * - Embeds persistent Navbar, slide-over CartDrawer, and compliance banners.
 * - Strictly zero grid grain, zero noise filter, 0px border-radius containers.
 */

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/presentation/components/providers/AuthProvider';
import { SyncProviderWrapper } from '@/presentation/components/providers/SyncProviderWrapper';
import { ThemeProvider } from '@/presentation/components/providers/ThemeProvider';
import { Navbar } from '@/presentation/components/Navbar';
import { CookieConsent } from '@/presentation/components/compliance/CookieConsent';
import { CartDrawer } from '@/presentation/components/cart/CartDrawer';
import { VaultCartToast } from '@/presentation/components/cart/VaultCartToast';
import { ProvenanceManifestModal } from '@/presentation/components/provenance/ProvenanceManifestModal';
import { RazorpayScript } from '@/presentation/components/payments/RazorpayScript';
import { AnalyticsAndMonitoring } from '@/presentation/components/telemetry/AnalyticsAndMonitoring';

export const metadata: Metadata = {
  metadataBase: new URL('https://otaku-bazaar.vercel.app'),
  title: 'OtakuBazaar — Premium Anime Collectibles Marketplace',
  description:
    'Buy, sell, and negotiate authentic anime scale figures, Nendoroids, manga box sets, and grails with 15-minute checkout locks and 48-hour escrow protection.',
  icons: {
    icon: [
      { url: '/icon.png' },
      { url: '/otakubazaar-logo.png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/otakubazaar-logo.png',
  },
  openGraph: {
    title: 'OtakuBazaar — Authenticated Anime Figures & Collectibles',
    description: '0% Bootleg Tolerance • 48h Escrow Protection • Pan-India Insured Delivery',
    url: 'https://otaku-bazaar.vercel.app',
    siteName: 'OtakuBazaar',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://otaku-bazaar.vercel.app/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'OtakuBazaar — Authenticated Anime Figures & Collectibles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OtakuBazaar — Authenticated Anime Figures & Collectibles',
    description: '0% Bootleg Tolerance • 48h Escrow Protection • Pan-India Insured Delivery',
    images: ['https://otaku-bazaar.vercel.app/opengraph-image'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-[#080808] text-white selection:bg-[#F2EFE9] selection:text-[#080808]"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-sans), sans-serif',
        }}
      >
        {/* Lazy Loaded Razorpay Checkout Script */}
        <RazorpayScript />

        {/* Analytics & Error Monitoring Telemetry */}
        <AnalyticsAndMonitoring />

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

              {/* Seamless Dark Archival Cart Notification Toast */}
              <VaultCartToast />

              {/* Feature 3: Expanded Full-Screen Cryptographic Provenance Manifest */}
              <ProvenanceManifestModal />
            </SyncProviderWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
