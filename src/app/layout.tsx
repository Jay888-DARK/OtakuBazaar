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
  metadataBase: new URL('https://otakubazaar.jaybhatt.me'),
  alternates: {
    canonical: '/',
  },
  title: 'OtakuBazaar — Anime Figures & Collectibles Marketplace India',
  description:
    'Buy, sell, and negotiate anime scale figures, Nendoroids, manga box sets, and collectibles from Indian collectors with a 48-hour unboxing inspection window.',
  icons: {
    icon: [
      { url: '/icon.png' },
      { url: '/otakubazaar-logo.png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/otakubazaar-logo.png',
  },
  openGraph: {
    title: 'OtakuBazaar — Anime Figures & Collectibles Marketplace India',
    description: 'Collector-to-collector anime scale figures, Nendoroids, and manga in India.',
    url: 'https://otakubazaar.jaybhatt.me',
    siteName: 'OtakuBazaar',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://otakubazaar.jaybhatt.me/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'OtakuBazaar — Anime Figures & Collectibles Marketplace India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OtakuBazaar — Anime Figures & Collectibles Marketplace India',
    description: 'Collector-to-collector anime scale figures, Nendoroids, and manga in India.',
    images: ['https://otakubazaar.jaybhatt.me/opengraph-image'],
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
        {/* Purge stale client legacy caches */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(typeof localStorage!=='undefined'){localStorage.removeItem('otaku_custom_listings');}}catch(e){}`,
          }}
        />

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
