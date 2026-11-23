/**
 * @file src/app/vault/loading.tsx
 *
 * Dedicated suspense skeleton for the /vault portfolio and ledger page.
 * Strictly adheres to OtakuBazaar's dark archival vault aesthetic.
 */

import React from 'react';

export default function VaultLoading(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F2EFE9] py-8 px-4 sm:px-6 lg:px-8 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        {/* Navigation Breadcrumb Skeleton */}
        <div className="h-4 w-64 bg-[#141414] border border-[#1F1F1F]" />

        {/* Masthead Banner Skeleton */}
        <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-8 flex flex-col lg:flex-row justify-between gap-6">
          <div className="space-y-3">
            <div className="h-4 w-36 bg-[#181818]" />
            <div className="h-8 w-64 bg-[#1F1F1F]" />
            <div className="h-4 w-96 bg-[#141414]" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 w-28 bg-[#080808] border border-[#1F1F1F]" />
            ))}
          </div>
        </div>

        {/* Tabs Bar Skeleton */}
        <div className="flex border-b border-[#1F1F1F] gap-2 pb-px">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-36 bg-[#0C0C0C] border border-[#1F1F1F]" />
          ))}
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-[#1F1F1F] bg-[#0C0C0C] p-4 space-y-4">
              <div className="w-full h-56 bg-[#080808] border border-[#161616]" />
              <div className="h-4 w-3/4 bg-[#181818]" />
              <div className="h-3 w-1/2 bg-[#141414]" />
              <div className="h-8 w-full bg-[#161616]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
