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
      const res = await fetch('/api/checkout/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotId: targetId,
          productId: targetId,
          price,
          amount: price,
          receipt: `rcpt_guest_${targetId}_${Date.now()}`,
          phone: phone.trim(),
          name: fullName.trim(),
          address: address.trim(),
          pinCode: pinCode.trim(),
        }),
      });

      const orderData = await res.json();
      if (!res.ok || orderData.error) {
        throw new Error(orderData.error || 'Server rejected instant order initialization.');
      }

      const orderId = orderData.order_id || orderData.id;
      const chargeAmountPaise = orderData.amount;

      // 3. Configure Razorpay with Magic Pre-fill and OTP network identification
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || orderData.key_id || 'rzp_test_TdBTiCyaOJ95KC',
        amount: chargeAmountPaise,
        currency: 'INR',
        name: 'OtakuBazaar Vault',
        description: `Instant Guest Escrow: ${itemTitle}`,
        order_id: orderId,
        // Razorpay Magic Contact & Address Pre-fill
        prefill: {
          name: fullName.trim(),
          contact: phone.replace(/\D/g, ''),
          email: `${phone.replace(/\D/g, '')}@buyer.otakubazaar.dev`,
          method: preferredWallet || initialWallet || undefined,
        },
        send_sms_hash: true,
        notes: {
          lotId: targetId,
          shipping_address: address.trim(),
          pincode: pinCode.trim(),
          buyer_name: fullName.trim(),
          phone: phone.trim(),
        },
        theme: {
          color: '#09090b',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) {
          try {
            // Server-side verification & silent account provisioning
            const verifyRes = await fetch('/api/checkout/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                lotId: targetId,
                productId: targetId,
                amount: chargeAmountPaise,
                name: fullName.trim(),
                phone: phone.trim(),
                address: address.trim(),
                pinCode: pinCode.trim(),
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || verifyData.error) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            // Execute 0ms brutalist confirmation state inversion
            setConfirmationData({
              orderId,
              paymentId: response.razorpay_payment_id,
            });
            setLoading(false);

            if (onSuccess) {
              onSuccess(response.razorpay_payment_id, orderId);
            }
          } catch (err: any) {
            console.error('[Instant Checkout Verification Error]:', err);
            setErrorMessage(err.message || 'Signature verification failure.');
            setLoading(false);
          }
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp: any) {
        setErrorMessage(resp.error?.description || 'Payment rejected. Please verify details.');
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error('[Instant Checkout Error]:', err);
      setErrorMessage(err.message || 'Failed to trigger checkout.');
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
              GUEST CUSTODY PROTOCOL • ZERO REGISTRATION
            </span>
            <h2
              style={{ fontFamily: "'Clash Display', 'Syne', sans-serif" }}
              className="text-base font-extrabold uppercase tracking-wider text-zinc-100"
            >
              [ INSTANT ACQUISITION ]
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-[#141418] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 text-[10px] font-bold uppercase tracking-widest border border-zinc-800 cursor-pointer rounded-none transition-none"
          >
            [ CLOSE ]
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
                  SETTLEMENT VERIFIED • SILENT PROFILE PROVISIONED
                </span>
                <h3
                  style={{ fontFamily: "'Clash Display', 'Syne', sans-serif" }}
                  className="text-xl font-black uppercase tracking-tight text-black leading-tight"
                >
                  [ ACQUISITION SECURED — CUSTODY TRANSFERRED ]
                </h3>
              </div>

              <div className="border border-black/15 bg-black/5 divide-y divide-black/10 text-xs font-semibold uppercase tracking-wider">
                <div className="p-3 flex justify-between">
                  <span className="text-neutral-600">LOT SPECIMEN</span>
                  <span className="text-black font-extrabold truncate max-w-[200px]">{itemTitle}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-neutral-600">ORDER TOKEN</span>
                  <span className="text-black font-extrabold truncate">{confirmationData.orderId}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-neutral-600">PAYMENT REFERENCE</span>
                  <span className="text-black font-extrabold truncate">{confirmationData.paymentId}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-neutral-600">CUSTODY STATUS</span>
                  <span className="text-black font-extrabold">DOUBLE-ENTRY ESCROW LOCKED</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-neutral-600">INSPECTION WINDOW</span>
                  <span className="text-black font-extrabold">48 HOURS POST-DELIVERY</span>
                </div>
              </div>

              <div className="border border-black/20 p-3.5 bg-black/5 text-[11px] leading-relaxed text-neutral-800">
                <span className="font-bold block uppercase mb-1">AUTOMATED COLLECTOR PROFILE CREATED</span>
                A secure cryptographic session has been bound to <span className="font-bold text-black">{phone}</span>. Future orders will automatically bypass input gates for seamless 1-Click acquisition.
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-4 bg-black hover:bg-neutral-900 text-white font-extrabold text-xs uppercase tracking-[0.2em] border border-black cursor-pointer rounded-none transition-none mt-6"
            >
              [ RETURN TO ARCHIVE ]
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
                    style={{ fontFamily: "'Clash Display', 'Syne', sans-serif" }}
                    className="text-base font-extrabold tracking-wider text-zinc-100"
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
                style={{ fontFamily: "'Clash Display', 'Syne', sans-serif" }}
                className="w-full py-4 bg-[#f4f4f4] hover:bg-white text-black font-extrabold text-xs sm:text-sm uppercase tracking-[0.2em] border border-[#f4f4f4] cursor-pointer rounded-none transition-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
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
                    <span>TRANSMITTING TO ESCROW GATEWAY...</span>
                  </>
                ) : (
                  <span>[ EXECUTE PAYMENT — {formattedPrice} ]</span>
                )}
              </button>

              {/* Express Payment Wallets for Instant Biometric Checkout */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                  <span>EXPRESS BIOMETRIC WALLETS</span>
                  <span>NETWORK PRE-FILL ACTIVE</span>
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

              {/* Assurance Telemetry Footer */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[9px] uppercase tracking-widest text-zinc-500 font-medium">
                <span>INSURED COURIER DISPATCH</span>
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
