/**
 * @file src/presentation/components/checkout/InstantCheckoutDrawer.tsx
 *
 * Single-Step Guest Checkout Drawer for First-Time Buyers.
 * Flat, sharp tactile brutalist design:
 * - 0px border-radius, 1px solid charcoal borders (#27272a), flat background (#0c0c0e).
 * - Instant 0ms transition time into drawer.
 * - Eliminates all account creation / passwords prior to payment.
 * - Razorpay Magic / contact & address pre-fill network integration.
 * - Compact 4-input delivery form: Full Name, Phone Number, Delivery Address, PIN Code.
 * - Silent account provisioning upon payment verification setting secure auth cookies.
 * - 0ms Brutalist Confirmation State Inversion: [ ACQUISITION SECURED — CUSTODY TRANSFERRED ].
 * - Zero drop shadows, glassmorphism, hover animations, emojis, or checkmark icons.
 */

'use client';

import React, { useState, useEffect } from 'react';

export interface InstantCheckoutProps {
  productId: string;
  lotId?: string;
  price: number;
  itemTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (paymentId: string, orderId: string) => void;
  initialWallet?: string;
}

export function InstantCheckoutDrawer({
  productId,
  lotId,
  price,
  itemTitle,
  isOpen,
  onClose,
  onSuccess,
  initialWallet,
}: InstantCheckoutProps): React.JSX.Element | null {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isSavedProfile, setIsSavedProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<{
    orderId: string;
    paymentId: string;
  } | null>(null);

  const targetId = lotId || productId;
  const formattedPrice = `₹${price.toLocaleString('en-IN')}`;

  // Read saved profile from cookie or localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const match = document.cookie.match(/otaku_saved_delivery=([^;]+)/);
      if (match && match[1]) {
        const decoded = JSON.parse(decodeURIComponent(match[1]));
        if (decoded.name) setFullName(decoded.name);
        if (decoded.phone) setPhone(decoded.phone);
        if (decoded.address) setAddress(decoded.address);
        if (decoded.pinCode) setPinCode(decoded.pinCode);
        setIsSavedProfile(true);
      } else {
        const local = localStorage.getItem('otaku_guest_profile');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed.name) setFullName(parsed.name);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.address) setAddress(parsed.address);
          if (parsed.pinCode) setPinCode(parsed.pinCode);
          setIsSavedProfile(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  if (!isOpen) return null;

  const handleInstantPay = async (preferredWallet?: string) => {
    try {
      setErrorMessage(null);

      // Validate compact delivery form if not already filled
      if (!fullName.trim()) {
        setErrorMessage('Full Name is required for insured shipping custody.');
        return;
      }
      if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
        setErrorMessage('A valid 10-digit mobile number is required.');
        return;
      }
      if (!address.trim()) {
        setErrorMessage('Physical delivery address is required.');
        return;
      }
      if (!pinCode.trim() || pinCode.replace(/\D/g, '').length < 6) {
        setErrorMessage('A valid 6-digit postal PIN code is required.');
        return;
      }

      setLoading(true);

      // Store locally for subsequent instant bypass
      try {
        localStorage.setItem(
          'otaku_guest_profile',
          JSON.stringify({
            name: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            pinCode: pinCode.trim(),
          })
        );
      } catch {}

      // 1. Ensure Razorpay client script loaded
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
              else reject(new Error('Payment gateway loading timed out.'));
            }, 3500);
          } else {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to initialize payment gateway'));
            document.body.appendChild(script);
          }
        });
      }

      // 2. Authoritative server order generation
      const cleanPrice = String(price || 999).replace(/,/g, '').replace(/₹/g, '').trim();
      const amountInPaiseFallback = Math.round(Number(cleanPrice) * 100);

      const res = await fetch('/api/checkout/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotId: targetId,
          productId: targetId,
          price: Number(cleanPrice) || 999,
          amount: !isNaN(amountInPaiseFallback) && amountInPaiseFallback > 0 ? amountInPaiseFallback : 99900,
          receipt: `rcpt_guest_${targetId}_${Date.now()}`,
          phone: phone.trim(),
          name: fullName.trim(),
          address: address.trim(),
          pinCode: pinCode.trim(),
        }),
      });

      const responseData = await res.json();
      console.log('[Razorpay Order Response]:', responseData);

      if (!res.ok || responseData.error) {
        throw new Error(responseData.error || 'Server rejected instant order initialization.');
      }

      // 3. Sync the Exact Amount: Use exact integer amount returned directly by backend
      const exactAmountPaise = responseData.amount;

      // 3. Configure Razorpay with key mode validation
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

      const orderData = responseData;
      const recipientPhone = phone || '';
      const setIsLoading = setLoading;

      // Ensure orderData exists before proceeding
      if (!orderData?.id) {
        console.error("Missing Order ID:", orderData);
        setIsLoading(false);
        return;
      }

      // Strip all non-digit characters for Razorpay's strict prefill validation
      const cleanPhone = recipientPhone ? recipientPhone.replace(/[^0-9]/g, '').slice(-10) : "";

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || activeKey,
        order_id: orderData.id,
        name: "OTAKUBAZAAR",
        prefill: {
          contact: cleanPhone,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          escape: true,
          ondismiss: function() {
            setIsLoading(false); // Free the user if they close the window
          }
        },
        handler: async function (response: any) {
          try {
            setIsLoading(true);
            console.log('[Instant Checkout] Payment received, verifying signature...', response);
            // Server-side verification & silent account provisioning
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                razorpay_order_id: response.razorpay_order_id || orderData.id,
                lotId: targetId,
                productId: targetId,
                amount: exactAmountPaise,
                name: fullName.trim(),
                phone: cleanPhone,
                address: address.trim(),
                pinCode: pinCode.trim(),
              }),
            });

            if (verifyRes.ok) {
              setConfirmationData({
                orderId: orderData.id,
                paymentId: response.razorpay_payment_id,
              });
              if (onSuccess) {
                onSuccess(response.razorpay_payment_id, orderData.id);
              }
            } else {
              const rawText = await verifyRes.text();
              console.error('[Instant Checkout Verification Failed]:', rawText);
              setErrorMessage('Payment verification failed.');
            }
          } catch (err: any) {
            console.error('[Instant Checkout Verification Error]:', err);
            setErrorMessage(err?.message || 'Signature verification failure.');
          } finally {
            setIsLoading(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error("Razorpay inner failure:", response.error);
        setIsLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('[Instant Checkout Initialization Error]:', err);
      setErrorMessage(err?.message || 'Failed to trigger checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Instant Guest Acquisition Drawer"
      className="fixed inset-0 z-[9999] flex justify-end bg-black/85 select-none"
      style={{
        transition: 'none',
        borderRadius: '0px',
      }}
    >
      {/* Distraction-Free Single-Pane Drawer (0ms transition time, flat background, 1px charcoal border) */}
      <div
        className="w-full max-w-lg h-full bg-[#0c0c0e] border-l border-[#27272a] flex flex-col justify-between overflow-y-auto text-zinc-100"
        style={{
          borderRadius: '0px',
          boxShadow: 'none',
          fontFamily: "'Satoshi', 'Cabinet Grotesk', sans-serif",
          transition: 'none',
        }}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#27272a] bg-[#09090b] flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-0.5">
              GUEST CHECKOUT • NO ACCOUNT REQUIRED
            </span>
            <h2
              style={{ fontFamily: "'Clash Display', 'Cabinet Grotesk', sans-serif", letterSpacing: '-0.02em' }}
              className="text-base font-semibold uppercase tracking-tight text-white"
            >
              [ FAST CHECKOUT ]
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            data-testid="close-checkout-button"
            className="w-8 h-8 bg-[#141418] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center border border-zinc-800 cursor-pointer rounded-none transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 3. Instant Confirmation State (0ms Brutalist State Inversion) */}
        {confirmationData ? (
          <div
            className="flex-1 p-6 sm:p-8 bg-[#f4f4f4] text-black flex flex-col justify-between"
            style={{
              transition: 'none',
              borderRadius: '0px',
            }}
          >
            <div className="space-y-6">
              <div className="border-b border-black/25 pb-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-600 font-bold block mb-1">
                  PAYMENT SUCCESSFUL • ORDER VERIFIED
                </span>
                <h3
                  style={{ fontFamily: "'Clash Display', 'Cabinet Grotesk', sans-serif", letterSpacing: '-0.02em' }}
                  className="text-lg sm:text-xl font-semibold uppercase tracking-tight text-black leading-tight"
                >
                  [ ORDER CONFIRMED — PAYMENT RECEIVED ]
                </h3>
              </div>

              <div className="border border-black/15 bg-black/5 divide-y divide-black/10 text-xs font-semibold uppercase tracking-wider">
                <div className="p-3 flex justify-between">
                  <span className="text-neutral-600">ITEM</span>
                  <span className="text-black font-extrabold truncate max-w-[200px]">{itemTitle}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-neutral-600">ORDER ID</span>
                  <span className="text-black font-extrabold truncate">{confirmationData.orderId}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-neutral-600">PAYMENT ID</span>
                  <span className="text-black font-extrabold truncate">{confirmationData.paymentId}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-neutral-600">STATUS</span>
                  <span className="text-black font-extrabold">SECURE ESCROW ACTIVE</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-neutral-600">INSPECTION WINDOW</span>
                  <span className="text-black font-extrabold">48 HOURS POST-DELIVERY</span>
                </div>
              </div>

              <div className="border border-black/20 p-3.5 bg-black/5 text-[11px] leading-relaxed text-neutral-800">
                <span className="font-bold block uppercase mb-1">PROFILE SAVED FOR FUTURE ORDERS</span>
                Your details have been saved for mobile number <span className="font-bold text-black">{phone}</span>. Future orders will automatically pre-fill for fast, seamless checkout.
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-4 bg-black hover:bg-neutral-900 text-white font-extrabold text-xs uppercase tracking-[0.2em] border border-black cursor-pointer rounded-none transition-none mt-6"
            >
              [ CONTINUE BROWSING ]
            </button>
          </div>
        ) : (
          /* Drawer Body: Transparent Pre-Calculation + Compact 4-Input Form */
          <div className="flex-1 p-5 sm:p-6 space-y-6">
            {/* Transparent Pre-Calculation Data Matrix */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                <span>ORDER SUMMARY</span>
                <span className="text-emerald-400 font-medium">ZERO HIDDEN CHARGES</span>
              </div>

              <div className="border border-[#27272a] bg-[#09090b] divide-y divide-[#1f1f23] text-xs uppercase tracking-wide">
                <div className="flex justify-between items-center p-3 text-zinc-300">
                  <span className="truncate max-w-[240px] font-medium">{itemTitle}</span>
                  <span className="font-bold text-zinc-100">{formattedPrice}</span>
                </div>
                <div className="flex justify-between items-center px-3 py-2 text-zinc-500 text-[11px]">
                  <span>Insured Express Courier Dispatch</span>
                  <span className="text-emerald-400 font-medium">₹0 (INCLUDED)</span>
                </div>
                <div className="flex justify-between items-center px-3 py-2 text-zinc-500 text-[11px]">
                  <span>48-Hour Inspection Escrow Fee</span>
                  <span className="text-emerald-400 font-medium">₹0 (INCLUDED)</span>
                </div>
                <div className="flex justify-between items-center px-3 py-2 text-zinc-500 text-[11px]">
                  <span>GST &amp; Transit Insurance</span>
                  <span className="text-emerald-400 font-medium">₹0 (INCLUDED)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#111114] text-zinc-100 font-bold border-t border-[#27272a]">
                  <span className="text-xs uppercase tracking-[0.15em]">Total Due (INR):</span>
                  <span
                    style={{ fontFamily: "'Satoshi', sans-serif" }}
                    className="text-xl font-bold tracking-tight text-white"
                  >
                    {formattedPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Compact 4-Input Delivery Form */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold">
                  DISPATCH RECIPIENT &amp; TRANSIT DESTINATION
                </span>
                {isSavedProfile && (
                  <span className="text-[8px] uppercase tracking-wider text-emerald-400 font-bold border border-emerald-900 bg-emerald-950/40 px-1.5 py-0.5">
                    AUTO-PREFILLED
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {/* 1. Full Name */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
                    FULL NAME (LEGAL RECIPIENT)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kenjiro Sato"
                    className="w-full bg-[#09090b] border border-[#27272a] focus:border-zinc-400 px-3 py-2 text-xs text-zinc-100 uppercase tracking-wider outline-none rounded-none transition-none"
                  />
                </div>

                {/* 2. Phone Number */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
                    MOBILE NUMBER (FOR COURIER OTP &amp; RAZORPAY PRE-FILL)
                  </label>
                  <div className="flex border border-[#27272a] bg-[#09090b] focus-within:border-zinc-400">
                    <span className="px-3 py-2 text-xs text-zinc-500 border-r border-[#27272a] bg-[#111114] select-none font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full bg-transparent px-3 py-2 text-xs text-zinc-100 uppercase tracking-wider outline-none rounded-none transition-none"
                    />
                  </div>
                </div>

                {/* 3. Delivery Address */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
                    DELIVERY ADDRESS (PREMISES, STREET, LANDMARK)
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Flat 402, Sakura Arcade, Bandra West, Mumbai"
                    className="w-full bg-[#09090b] border border-[#27272a] focus:border-zinc-400 px-3 py-2 text-xs text-zinc-100 uppercase tracking-wider outline-none rounded-none transition-none resize-none"
                  />
                </div>

                {/* 4. PIN Code */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
                    PIN CODE (6 DIGITS)
                  </label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="400050"
                    maxLength={6}
                    className="w-full bg-[#09090b] border border-[#27272a] focus:border-zinc-400 px-3 py-2 text-xs text-zinc-100 uppercase tracking-wider outline-none rounded-none transition-none"
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-950/40 border border-red-800 text-red-300 text-[10px] uppercase tracking-wider font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Payment Trigger CTA */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                id="instant-pay-trigger"
                onClick={() => handleInstantPay()}
                disabled={loading}
                style={{ fontFamily: "'Satoshi', sans-serif" }}
                className="w-full py-4 bg-[#f4f4f4] hover:bg-white text-black font-bold text-xs sm:text-sm uppercase tracking-[0.15em] border border-[#f4f4f4] cursor-pointer rounded-none transition-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>PROCESSING PAYMENT...</span>
                  </>
                ) : (
                  <span>[ PAY NOW — {formattedPrice} ]</span>
                )}
              </button>

              {/* Express Payment Wallets for Instant Checkout */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                  <span>EXPRESS PAYMENT METHODS</span>
                  <span>INSTANT CHECKOUT</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleInstantPay('google_pay')}
                    disabled={loading}
                    className="py-2.5 px-2 bg-[#141418] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-[#27272a] text-[10px] font-bold uppercase tracking-wider transition-none cursor-pointer text-center rounded-none"
                  >
                    Google Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstantPay('apple_pay')}
                    disabled={loading}
                    className="py-2.5 px-2 bg-[#141418] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-[#27272a] text-[10px] font-bold uppercase tracking-wider transition-none cursor-pointer text-center rounded-none"
                  >
                    Apple Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstantPay('card')}
                    disabled={loading}
                    className="py-2.5 px-2 bg-[#141418] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-[#27272a] text-[10px] font-bold uppercase tracking-wider transition-none cursor-pointer text-center rounded-none"
                  >
                    Saved Cards
                  </button>
                </div>
              </div>

              {/* Assurance Footer */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[9px] uppercase tracking-widest text-zinc-500 font-medium">
                <span>INSURED SHIPPING</span>
                <span className="text-zinc-300 font-bold">48H INSPECTION WINDOW</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InstantCheckoutDrawer;
