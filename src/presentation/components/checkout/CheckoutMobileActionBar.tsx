'use client';

import React from 'react';

interface CheckoutMobileActionBarProps {
  finalAmount: number;
  isOfferLocked: boolean;
}

export const CheckoutMobileActionBar: React.FC<CheckoutMobileActionBarProps> = ({
  finalAmount,
  isOfferLocked,
}) => {
  const handleMobilePayClick = () => {
    if (typeof document !== 'undefined') {
      const payBtn = document.getElementById('pay-securely-btn') as HTMLButtonElement | null;
      if (payBtn) {
        payBtn.click();
      }
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-[#09090b]/80 backdrop-blur-xl border-t border-zinc-800/80 p-4 pb-safe flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Total Valuation</span>
        <span className="text-sm font-mono font-bold text-zinc-100">
          ₹{finalAmount.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Universal Button Token */}
      <button
        type="button"
        onClick={handleMobilePayClick}
        disabled={isOfferLocked}
        className="px-6 py-3 bg-zinc-900 hover:bg-zinc-100 text-zinc-300 hover:text-black border border-zinc-700 hover:border-zinc-100 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] rounded-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
      >
        {isOfferLocked ? 'Escrow Locked' : 'Lock Escrow'}
      </button>
    </div>
  );
};

export default CheckoutMobileActionBar;
