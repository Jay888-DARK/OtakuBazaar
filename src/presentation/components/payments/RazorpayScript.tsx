'use client';

import Script from 'next/script';

/**
 * Loads Razorpay's Checkout.js script asynchronously for client-side payment modals.
 */
export function RazorpayScript() {
  return (
    <Script
      src="https://checkout.razorpay.com/v1/checkout.js"
      strategy="afterInteractive"
    />
  );
}

export default RazorpayScript;
