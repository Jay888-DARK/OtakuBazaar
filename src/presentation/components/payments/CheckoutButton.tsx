'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRazorpayOrder } from '@/app/actions/paymentActions';

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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // Check if Razorpay script has been loaded, or load safely
      if (typeof window !== 'undefined' && !(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          if ((window as any).Razorpay) {
            resolve();
            return;
          }
          const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
          if (existingScript) {
            existingScript.addEventListener('load', () => resolve());
            setTimeout(() => {
              if ((window as any).Razorpay) resolve();
              else reject(new Error('Razorpay SDK loading timed out. Please try again.'));
            }, 3500);
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

      // Parse price/amount cleanly handling formatted strings (e.g. "1,24,000")
      const rawPriceInput = String(price ?? amount ?? 999);
      const cleanPrice = rawPriceInput.replace(/,/g, '').replace(/₹/g, '').trim();
      const amountInPaiseFallback = Math.round(Number(cleanPrice) * 100);

      // Enforce Server-Side Price Authority via /api/checkout/razorpay
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

      const responseData = await res.json();
      console.log('[Razorpay Order Response]:', responseData);

      if (!res.ok || responseData.error) {
        throw new Error(responseData.error || 'Failed to initialize server-authorized escrow order.');
      }

      // 2. Fix the Order ID Mismatch: Razorpay returns order id as `id`
      const orderId = responseData.id || responseData.orderId || responseData.order_id;

      // 3. Sync the Exact Amount: Use exact integer amount returned directly by backend
      const exactAmountPaise = responseData.amount;

      // Step 2: Configure Razorpay Checkout options with key mode validation
      const serverKey = responseData.key_id?.trim();
      const envClientKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
      
      let effectiveKey = envClientKey || serverKey || 'rzp_test_TjnMsPZWKcfEdt';
      if (envClientKey && serverKey) {
        const isServerTest = serverKey.startsWith('rzp_test_');
        const isClientTest = envClientKey.startsWith('rzp_test_');
        if (isServerTest !== isClientTest) {
          console.warn(
            `[Razorpay Auth] Key mode mismatch: server returned ${isServerTest ? 'TEST' : 'LIVE'} mode key, ` +
            `but NEXT_PUBLIC_RAZORPAY_KEY_ID is ${isClientTest ? 'TEST' : 'LIVE'} mode. Aligning to server key mode.`
          );
          effectiveKey = serverKey;
        }
      }

      const activeKey = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || effectiveKey || '').trim();
      if (!activeKey) {
        throw new Error('Razorpay Public Key is missing or invalid.');
      }

      const rawPhone = customerContact || '';
      const cleanPhone = rawPhone.replace(/[^0-9]/g, '').slice(-10);

      // Minimal, bulletproof options (omit amount so order_id governs the transaction securely)
      const options = {
        key: activeKey,
        order_id: orderId,
        name: 'OTAKUBAZAAR',
        prefill: {
          contact: cleanPhone || '9999999999',
        },
        theme: {
          color: '#000000',
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) {
          console.log('Payment Successful!', response);

          try {
            setLoading(true);
            // Verify payment signature server-side before updating order status
            const verifyRes = await fetch('/api/checkout/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                lotId: lotId || productId || '',
                productId: productId || lotId || '',
                dealOfferId: dealOfferId || '',
                amount: exactAmountPaise,
              }),
            });

            const rawText = await verifyRes.text();
            let verifyData: any = null;
            try {
              verifyData = JSON.parse(rawText);
            } catch {
              // Server returned non-JSON text or HTML
            }

            if (!verifyRes.ok || (verifyData && verifyData.error)) {
              const errorMessageStr =
                verifyData?.error ||
                verifyData?.message ||
                rawText ||
                `Payment verification failed with HTTP status ${verifyRes.status}`;
              const fullErrorObj = {
                status: verifyRes.status,
                statusText: verifyRes.statusText,
                response: verifyData || rawText,
                razorpay_response: response,
              };
              console.error('[Razorpay Checkout] Verification Failed:', fullErrorObj);
              throw new Error(errorMessageStr);
            }

            console.log('[Razorpay Checkout] Signature verified! Escrow status:', verifyData?.escrowStatus);

            if (onSuccess) {
              onSuccess(response.razorpay_payment_id, orderId);
            } else {
              router.push(
                `/orders/success?payment_id=${encodeURIComponent(
                  response.razorpay_payment_id
                )}&order_id=${encodeURIComponent(orderId)}`
              );
            }
          } catch (verifyErr: any) {
            console.error('[Razorpay Checkout Error]:', verifyErr);
            setErrorMessage(verifyErr?.message || 'Signature verification failed. Escrow locked.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            console.log('Checkout modal closed by user.');
            setLoading(false);
          },
          onerror: function (err: any) {
            console.error('Razorpay Modal Error:', err);
            alert(`Razorpay Error: ${err?.description || 'Check console for details.'}`);
            setLoading(false);
          },
        },
      };

      // Strict guardrail before opening the modal
      if (!options.order_id) {
        throw new Error('Missing Razorpay Order ID from backend response.');
      }

      // Step 3: Open Razorpay Checkout modal
      const razorpayInstance = new (window as any).Razorpay(options);

      razorpayInstance.on('payment.failed', function (resp: any) {
        console.error('[Razorpay Payment Failed]:', resp?.error || resp);
        const description =
          resp?.error?.description ||
          resp?.error?.reason ||
          resp?.error?.message ||
          'Payment failed. Please try again.';
        setErrorMessage(description);
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error('[Razorpay Checkout Initialization Error]:', err);
      setErrorMessage(err?.message || 'An error occurred initiating payment.');
    } finally {
      setLoading(false);
    }
  };

  const defaultClasses =
    'w-full max-w-md mx-auto py-3 bg-zinc-900 hover:bg-zinc-100 text-zinc-300 hover:text-black border border-zinc-700 hover:border-zinc-100 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none disabled:hover:bg-zinc-900 disabled:hover:text-zinc-300 disabled:hover:border-zinc-700';

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <button
        type="button"
        id="pay-securely-btn"
        data-testid="pay-securely-button"
        onClick={handlePayment}
        disabled={disabled || loading}
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
