'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRazorpayOrder } from '@/app/actions/paymentActions';

export interface CheckoutButtonProps {
  /** Optional amount in INR (fallback only; server overrides with authoritative price) */
  amount?: number;
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
  /** Optional custom button CSS classes */
  className?: string;
  /** Disable button */
  disabled?: boolean;
}

export function CheckoutButton({
  amount = 999,
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

      // Check if Razorpay script has been loaded
      if (typeof window === 'undefined' || !(window as any).Razorpay) {
        throw new Error(
          'Razorpay SDK not loaded yet. Please ensure <RazorpayScript /> is included in your page or layout.'
        );
      }

      let orderId: string;
      let chargeAmountPaise = Math.round(amount * 100);

      // Enforce Server-Side Price Authority via /api/orders
      if (lotId || productId || dealOfferId) {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lotId: lotId || productId, productId, dealOfferId }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Failed to initialize server-authorized escrow order.');
        }
        orderId = data.id;
        chargeAmountPaise = data.amount;
      } else {
        orderId = await createRazorpayOrder(amount, receiptId);
      }

      if (!orderId) {
        throw new Error('Could not retrieve order ID from server.');
      }

      // Step 2: Configure Razorpay Checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TdBTiCyaOJ95KC',
        amount: chargeAmountPaise, // authoritative amount in paise
        currency: 'INR',
        name: title,
        description: description,
        order_id: orderId,
        handler: function (response: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) {
          console.log('Payment Successful! Razorpay Payment ID:', response.razorpay_payment_id);

          if (onSuccess) {
            onSuccess(response.razorpay_payment_id, orderId);
          } else {
            router.push(
              `/orders/success?payment_id=${encodeURIComponent(
                response.razorpay_payment_id
              )}&order_id=${encodeURIComponent(orderId)}`
            );
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerContact,
        },
        theme: {
          color: '#09090b',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      // Step 3: Open Razorpay Checkout modal
      const razorpayInstance = new (window as any).Razorpay(options);

      razorpayInstance.on('payment.failed', function (resp: any) {
        console.error('Razorpay Payment Failed:', resp.error);
        setErrorMessage(resp.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'An error occurred initiating payment.');
      setLoading(false);
    }
  };

  const defaultClasses =
    'w-full max-w-md mx-auto py-3 bg-zinc-900 hover:bg-zinc-100 text-zinc-300 hover:text-black border border-zinc-700 hover:border-zinc-100 font-mono text-xs font-semibold uppercase tracking-[0.2em] rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none disabled:hover:bg-zinc-900 disabled:hover:text-zinc-300 disabled:hover:border-zinc-700';

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
            <span>🔒</span>
            <span>Escrow Payment Locked</span>
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
        <p className="text-xs text-red-400 font-mono max-w-xs text-center">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default CheckoutButton;
