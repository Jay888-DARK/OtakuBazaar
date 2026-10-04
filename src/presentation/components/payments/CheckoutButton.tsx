'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRazorpayOrder } from '@/app/actions/paymentActions';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface CheckoutButtonProps {
  /** Optional amount in INR (number or string formatted e.g. "1,24,000") */
  amount?: number | string;
  price?: number | string;
  /** Product or Lot ID for server-side price lookup */
  lotId?: string;
  productId?: string;
  /** Deal Offer ID for negotiated bargain price lookup */
  dealOfferId?: string;
  /** Custom receipt or reference ID */
  receiptId?: string;
  /** Product or order title */
  title?: string;
  /** Description shown in the checkout modal */
  description?: string;
  /** Customer prefill data */
  customerName?: string;
  customerEmail?: string;
  customerContact?: string;
  /** Optional callback upon successful payment */
  onSuccess?: (paymentId: string, orderId: string) => void;
  /** Optional custom button label */
  buttonText?: string;
  /** Optional custom button children */
  children?: React.ReactNode;
  /** Optional custom button CSS classes */
  className?: string;
  /** Disable button */
  disabled?: boolean;
}

export function CheckoutButton({
  amount = 999,
  price,
  lotId,
  productId,
  dealOfferId,
  receiptId = `rcpt_${Date.now()}`,
  title = 'OtakuBazaar Collectibles',
  description = 'Secure Escrow Checkout',
  customerName = 'Otaku Collector',
  customerEmail = 'collector@otakubazaar.dev',
  customerContact = '9999999999',
  onSuccess,
  buttonText,
  children,
  className = '',
  disabled = false,
}: CheckoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const loading = isLoading;
  const setLoading = setIsLoading;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      // Check if Razorpay script has been loaded
      if (typeof window !== 'undefined' && !window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          if (window.Razorpay) return resolve();
          const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
          if (existingScript) {
            existingScript.addEventListener('load', () => resolve());
            setTimeout(() => resolve(), 2000);
          } else {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
            document.body.appendChild(script);
          }
        });
      }

      // 1. Call your backend to create the order
      const rawPriceInput = String(price ?? amount ?? 999);
      const cleanPrice = rawPriceInput.replace(/,/g, '').replace(/₹/g, '').trim();
      const amountInPaiseFallback = Math.round(Number(cleanPrice) * 100);

      const res = await fetch('/api/checkout/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotId: lotId || productId || '',
          productId: productId || lotId || '',
          dealOfferId: dealOfferId || '',
          price: Number(cleanPrice) || 999,
          amount: !isNaN(amountInPaiseFallback) && amountInPaiseFallback > 0 ? amountInPaiseFallback : 99900,
          receipt: receiptId || `rcpt_${Date.now()}`,
        }),
      });
      
      const orderData = await res.json();

      // 2. STRICT GUARDRAIL: Did the backend actually return an order?
      if (!res.ok || !orderData.id) {
        console.error("BACKEND FAILED TO CREATE ORDER:", orderData);
        alert("Server error: Could not initialize Razorpay order. Check console.");
        return; // STOP execution. Do not open Razorpay.
      }

      // 3. STRICT SANITIZATION: Razorpay will crash if phone is not exactly numbers.
      // Temporarily hardcoding a safe fallback to guarantee it doesn't crash.
      const safePhone = "9999999999"; 

      // 4. BULLETPROOF OPTIONS
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim(),
        order_id: orderData.id,
        name: "OTAKUBAZAAR",
        prefill: {
          contact: safePhone,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          escape: true,
          ondismiss: function() {
            console.log("Modal closed by user.");
            setIsLoading(false);
          }
        },
        handler: function (response: any) {
          console.log("PAYMENT SUCCESS PAYLOAD:", response);
          alert("Payment Successful! ID: " + response.razorpay_payment_id);
          // We will add the backend verify route here AFTER we confirm the modal works
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error("RAZORPAY INTERNAL CRASH:", response.error);
        alert("Razorpay Error: " + response.error.description);
      });
      rzp.open();

    } catch (error) {
      console.error("CHECKOUT FUNCTION CRASHED:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = handleCheckout;

  const defaultClasses =
    'w-full max-w-md mx-auto py-3 bg-zinc-900 hover:bg-zinc-100 text-zinc-300 hover:text-black border border-zinc-700 hover:border-zinc-100 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none disabled:hover:bg-zinc-900 disabled:hover:text-zinc-300 disabled:hover:border-zinc-700';

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <button
        type="button"
        id="pay-securely-btn"
        data-testid="pay-securely-button"
        onClick={handleCheckout}
        disabled={disabled || isLoading}
        className={className || defaultClasses}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span>Processing...</span>
          </>
        ) : disabled ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <rect x="3" y="11" width="18" height="11" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span>Escrow Payment Locked</span>
          </>
        ) : children ? (
          children
        ) : buttonText ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>{buttonText}</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Pay Securely</span>
          </>
        )}
      </button>

      {errorMessage && (
        <p className="text-xs text-red-400 uppercase tracking-wider max-w-xs text-center font-medium">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default CheckoutButton;
