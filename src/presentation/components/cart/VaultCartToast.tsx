'use client';

/**
 * @file src/presentation/components/cart/VaultCartToast.tsx
 *
 * Seamless Dark Archival Cart Notification Toast for OtakuBazaar.
 * Blends into the obsidian theme (#080808 / #0C0C0C) with 0ms instant trigger.
 *
 * Specs:
 * - Frame: fixed bottom-8 right-8 z-[100] w-[380px] bg-[#0C0C0C] border border-[#222222] p-4 shadow-2xl.
 * - Header: Emerald dot (#10B981), monospace label (VAULT CUSTODY: LOT #[NUMBER] ADDED), close [ X ].
 * - Details: Item title in serif (14px, #F2EFE9, uppercase), price in monospace (12px, #A0A0A0), escrow tag.
 * - Actions: Flat 0px buttons [ CONTINUE ] and [ VIEW CART -> ].
 */

import React, { useState, useEffect, useCallback } from 'react';
import { openCartDrawer } from './CartDrawer';

export interface CartToastPayload {
  lotNumber: string;
  title: string;
  price: number;
  imageUrl?: string;
}

export function showVaultCartToast(payload: CartToastPayload) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<CartToastPayload>('otaku_show_cart_toast', {
        detail: payload,
      })
    );
  }
}

export function VaultCartToast(): React.JSX.Element | null {
  const [toastData, setToastData] = useState<CartToastPayload | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const dismissToast = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setToastData(null);
    }, 150);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timer: NodeJS.Timeout;

    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<CartToastPayload>;
      if (customEvent.detail) {
        setToastData(customEvent.detail);
        setIsVisible(true);

        clearTimeout(timer);
        timer = setTimeout(() => {
          dismissToast();
        }, 6000);
      }
    };

    window.addEventListener('otaku_show_cart_toast', handleToastEvent);
    return () => {
      window.removeEventListener('otaku_show_cart_toast', handleToastEvent);
      clearTimeout(timer);
    };
  }, [dismissToast]);

  const handleViewCart = () => {
    dismissToast();
    openCartDrawer();
  };

  if (!toastData || !isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-8 right-8 z-[100] w-[380px] max-w-[calc(100vw-2rem)] bg-[#0C0C0C] border border-[#222222] p-4 shadow-2xl select-none font-sans rounded-none transition-opacity duration-75"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-none bg-[#10B981] inline-block shrink-0" />
          <span className="font-mono text-[9px] tracking-[0.2em] text-[#CCCCCC] uppercase font-semibold">
            VAULT CUSTODY: LOT #{toastData.lotNumber} ADDED
          </span>
        </div>
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Close notification"
          className="text-[10px] font-mono tracking-widest text-[#888888] hover:text-white transition-colors duration-75 cursor-pointer bg-transparent border-none p-0"
        >
          [ X ]
        </button>
      </div>

      {/* Item Details */}
      <div className="space-y-1 mb-4">
        <h4 className="font-serif text-[14px] text-[#F2EFE9] uppercase tracking-[0.04em] leading-snug line-clamp-1">
          {toastData.title}
        </h4>
        <div className="flex items-center justify-between pt-1">
          <span className="font-mono text-[12px] text-[#A0A0A0]">
            ₹{toastData.price.toLocaleString('en-IN')}
          </span>
          <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-[#10B981] border border-[#193829] bg-[#091812] px-2 py-0.5">
            48H ESCROW SECURED
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-[#161616]">
        <button
          type="button"
          onClick={dismissToast}
          className="flex-1 py-2 bg-[#080808] border border-[#1F1F1F] hover:border-[#3A3A3A] text-[#888888] hover:text-[#CCCCCC] text-[10px] uppercase font-mono tracking-[0.14em] transition-colors duration-75 cursor-pointer rounded-none text-center"
        >
          [ CONTINUE ]
        </button>
        <button
          type="button"
          onClick={handleViewCart}
          className="flex-1 py-2 bg-[#F2EFE9] hover:bg-white text-[#080808] border border-[#F2EFE9] text-[10px] uppercase font-mono font-semibold tracking-[0.14em] transition-colors duration-75 cursor-pointer rounded-none text-center"
        >
          [ VIEW CART -&gt; ]
        </button>
      </div>
    </div>
  );
}

export default VaultCartToast;
