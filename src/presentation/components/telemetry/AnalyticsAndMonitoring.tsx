'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

export function AnalyticsAndMonitoring(): React.JSX.Element | null {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  useEffect(() => {
    // Sentry / Error Monitoring placeholder initialization
    if (sentryDsn && typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        // Safe forwarder hook when Sentry SDK is linked
        if ((window as unknown as { Sentry?: { captureException: (e: unknown) => void } }).Sentry) {
          (window as unknown as { Sentry: { captureException: (e: unknown) => void } }).Sentry.captureException(event.error);
        }
      });
      window.addEventListener('unhandledrejection', (event) => {
        if ((window as unknown as { Sentry?: { captureException: (e: unknown) => void } }).Sentry) {
          (window as unknown as { Sentry: { captureException: (e: unknown) => void } }).Sentry.captureException(event.reason);
        }
      });
    }
  }, [sentryDsn]);

  return (
    <>
      {/* Google Analytics 4 (GA4) */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* Plausible Analytics (Privacy-Friendly Alternative) */}
      {plausibleDomain && (
        <Script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
