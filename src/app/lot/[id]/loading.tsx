/**
 * @file src/app/lot/[id]/loading.tsx
 *
 * Dedicated suspense skeleton for the /lot/[id] inspection page.
 * Strictly adheres to OtakuBazaar's dark archival vault aesthetic.
 */

import React from 'react';

export default function LotDetailLoading(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F2EFE9] py-8 px-4 sm:px-6 lg:px-8 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Breadcrumb Skeleton */}
        <div className="h-4 w-48 bg-[#141414] animate-pulse border border-[#1F1F1F]" />

        {/* Two-Column Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Gallery Elevation Skeleton */}
          <div className="lg:col-span-7 space-y-4">
            <div className="w-full h-[520px] bg-[#0C0C0C] border border-[#1F1F1F] animate-pulse relative">
              <div className="absolute top-4 left-4 h-5 w-32 bg-[#181818]" />
              <div className="absolute bottom-4 left-4 h-4 w-44 bg-[#141414]" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-[#0C0C0C] border border-[#1F1F1F] animate-pulse" />
              ))}
            </div>
          </div>

          {/* Right Column: Specimen Details & Escrow Actions Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-6 space-y-5 animate-pulse">
              <div className="h-3 w-32 bg-[#181818]" />
              <div className="h-8 w-3/4 bg-[#1F1F1F]" />
              <div className="h-4 w-1/2 bg-[#161616]" />

              <div className="pt-4 border-t border-[#161616] space-y-3">
                <div className="h-3 w-24 bg-[#141414]" />
                <div className="h-10 w-48 bg-[#1F1F1F]" />
              </div>

              <div className="pt-4 border-t border-[#161616] space-y-3">
                <div className="h-12 w-full bg-[#181818]" />
                <div className="h-12 w-full bg-[#141414]" />
              </div>
            </div>

            {/* Custody Checklist Skeleton */}
            <div className="border border-[#1F1F1F] bg-[#0C0C0C] p-6 space-y-3 animate-pulse">
              <div className="h-4 w-40 bg-[#181818]" />
              <div className="h-3 w-full bg-[#141414]" />
              <div className="h-3 w-5/6 bg-[#141414]" />
              <div className="h-3 w-2/3 bg-[#141414]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
