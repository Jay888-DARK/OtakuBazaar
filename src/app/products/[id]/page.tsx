'use client';

/**
 * @file src/app/products/[id]/page.tsx
 *
 * Product Details Page for OtakuBazaar.
 * Displays real product demo gallery (360° turnaround and physical video clips),
 * figure specs, holographic authenticity guarantee, and instant checkout.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductDemoGallery } from '@/presentation/components/products/ProductDemoGallery';
import { ProductDetailSkeleton } from '@/presentation/components/ui/SkeletonLoaders';

interface ProductDetailsProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function ProductDetailsPage({ params }: ProductDetailsProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.resolve(params).then((p) => {
      setResolvedParams(p);
      const timer = setTimeout(() => setIsLoading(false), 200);
      return () => clearTimeout(timer);
    });
  }, [params]);

  const lotId = resolvedParams?.id?.toUpperCase() || 'LOT-0482';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-4 w-40 bg-[#141418] border border-zinc-800" />
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-10 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">
          <Link href="/" className="hover:text-zinc-300 transition-colors no-underline text-zinc-500">
            Vault Home
          </Link>
          <span>/</span>
          <Link href="/#catalog" className="hover:text-zinc-300 transition-colors no-underline text-zinc-500">
            Archival Grails
          </Link>
          <span>/</span>
          <span className="text-zinc-300">{lotId}</span>
        </div>

        {/* Main Product Details Card */}
        <div className="border border-[#27272a] bg-[#0c0c0e] p-6 sm:p-8 space-y-8">
          {/* Feature 5: Real Product Demo Gallery (360 Turnaround & Video Inspection) */}
          <ProductDemoGallery
            initialTitle="Guts Berserker Armor Unleashed 1/4 Scale"
            lotId={lotId}
          />

          {/* Details & Actions Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 border-t border-[#27272a]">
            {/* Left 7 Cols: Curatorial Description & Provenance Ledger */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-bold border border-zinc-700 bg-zinc-900 px-2 py-0.5">
                    SPECIMEN AUTHENTICATED
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-medium">
                    PRIME 1 STUDIO • EDITION #042
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 uppercase tracking-tight">
                  Guts Berserker Armor Unleashed 1/4 Scale Masterwork
                </h1>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                  Factory sealed Prime 1 Studio museum-grade polystone statue. Includes interchangeable blood-drenched Dragon Slayer blade, LED illuminating helm eyes, and tamper-evident holographic serial seal registered in the OtakuBazaar Mumbai custody vault.
                </p>
              </div>

              {/* Specifications Matrix */}
              <div className="border border-[#27272a] bg-[#09090b] divide-y divide-[#27272a]">
                <div className="flex items-center justify-between p-3 text-[11px]">
                  <span className="text-zinc-500 uppercase tracking-wider">Manufacturer</span>
                  <span className="text-zinc-200 font-semibold uppercase">Prime 1 Studio / Kadokawa</span>
                </div>
                <div className="flex items-center justify-between p-3 text-[11px]">
                  <span className="text-zinc-500 uppercase tracking-wider">Scale &amp; Dimensions</span>
                  <span className="text-zinc-200 font-semibold uppercase">1/4 Scale • H: 95cm W: 57cm D: 52cm</span>
                </div>
                <div className="flex items-center justify-between p-3 text-[11px]">
                  <span className="text-zinc-500 uppercase tracking-wider">Condition Grade</span>
                  <span className="text-zinc-200 font-semibold uppercase">[S-RANK] FACTORY SEALED</span>
                </div>
                <div className="flex items-center justify-between p-3 text-[11px]">
                  <span className="text-zinc-500 uppercase tracking-wider">Escrow Inspection Window</span>
                  <span className="text-zinc-200 font-semibold uppercase">48 Hours Post-Delivery</span>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Acquisition & Escrow Purchase Box */}
            <div className="lg:col-span-5 border border-[#27272a] bg-[#09090b] p-6 space-y-6">
              <div>
                <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 block font-semibold mb-1">
                  CURRENT ARCHIVAL VALUATION
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold uppercase tracking-wider text-zinc-100">
                    ₹89,000
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-700 bg-zinc-900 px-2 py-0.5">
                    ESCROW LOCKED
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2">
                  All taxes &amp; insured courier transit included. Backed by 100% full refund guarantee if inspection fails.
                </p>
              </div>

              {/* Actions: Add to Cart & Proceed to Checkout */}
              <div className="space-y-3 pt-2">
                <Link href="/checkout" className="block w-full no-underline">
                  <button
                    type="button"
                    id="add-to-cart-btn"
                    data-testid="add-to-cart"
                    className="w-full py-3.5 px-6 font-bold text-xs uppercase tracking-[0.22em] text-black bg-zinc-100 hover:bg-white border border-zinc-100 transition-colors cursor-pointer block rounded-none text-center"
                  >
                    Acquire via 15-Min Safe Lock →
                  </button>
                </Link>

                <Link
                  href="/checkout"
                  id="go-to-checkout"
                  data-testid="checkout-button"
                  className="w-full py-3 px-6 font-semibold text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 bg-zinc-900/60 text-center transition-colors block no-underline rounded-none"
                >
                  Proceed to Escrow Checkout
                </Link>
              </div>

              {/* Escrow Guarantee Telemetry */}
              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                  <span className="inline-block w-1.5 h-1.5 bg-zinc-400" />
                  <span>Double-Entry Escrow Vault Active</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                  <span className="inline-block w-1.5 h-1.5 bg-zinc-400" />
                  <span>Tamper-Proof Hologram Seal Verified</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                  <span className="inline-block w-1.5 h-1.5 bg-zinc-400" />
                  <span>Insured Express Courier Dispatch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
