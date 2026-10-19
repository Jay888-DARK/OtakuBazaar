'use client';

/**
 * @file src/app/lot/[id]/page.tsx
 *
 * Dedicated Archival Lot Inspection Page for OtakuBazaar.
 *
 * Architecture:
 * - Top Breadcrumb Bar: [ <- BACK TO ARCHIVAL INDEX ] / [CATEGORY] / LOT #[ID]
 * - 2-Column Asymmetric Split Layout (60% Left Media Showcase / 40% Right Telemetry & Purchase Panel):
 *   - Left: Interactive Media Stage (Interactive 360° Turnaround, 60fps Video Inspection, Click-to-Zoom Still)
 *     and Extra Pictures Thumbnail Strip (5 to 8 photos, instant 0ms swap).
 *   - Right: Category Header, Full Lot Title, Price in INR with tax/insurance breakdown,
 *     4-Cell Archival Telemetry Grid (WEIGHT, AUTHENTICITY SEAL, ORIGIN, CONDITION),
 *     Comprehensive Product Description & Provenance (sculptor, manufacturer, box dimensions, 48h escrow),
 *     Action Controls: [ ADD TO CART ] and [ PROCEED TO ESCROW DISPATCH — ₹... ] (triggers InstantCheckoutDrawer).
 * - Archival Footer with verifiable links to /terms-of-service and /privacy-policy.
 */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MOCK_PRODUCTS, MockProduct, ProductMediaItem } from '@/infrastructure/data/mockProducts';
import { addToCart } from '@/app/actions/dealActions';
import { InstantCheckoutDrawer } from '@/presentation/components/checkout/InstantCheckoutDrawer';
import { ArchivalFooter } from '@/presentation/components/footer/ArchivalFooter';

interface LotPageProps {
  params: Promise<{ id: string }> | { id: string };
}

// 4 distinct physical inspection angles for 360 turnaround
const TURNAROUND_ANGLES = [
  { deg: 0, label: '000° FRONT ELEVATION' },
  { deg: 90, label: '090° LATERAL FLANK' },
  { deg: 180, label: '180° REAR CAPE & DETAIL' },
  { deg: 270, label: '270° WEAPON CLEARANCE' },
];

export default function LotDetailPage({ params }: LotPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [activeStageMode, setActiveStageMode] = useState<'STILL' | '360' | 'VIDEO'>('STILL');
  const [currentAngleIndex, setCurrentAngleIndex] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(true);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [zoomCoords, setZoomCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [addedToCart, setAddedToCart] = useState<boolean>(false);
  const [isCheckoutDrawerOpen, setIsCheckoutDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    Promise.resolve(params).then((p) => {
      setResolvedParams(p);
    });
  }, [params]);

  const rawId = resolvedParams?.id || 'lot-0482';
  const product: MockProduct =
    MOCK_PRODUCTS.find(
      (p) =>
        p.id.toLowerCase() === rawId.toLowerCase() ||
        p.lotNumber.toLowerCase() === rawId.toLowerCase()
    ) ||
    MOCK_PRODUCTS[0] ||
    ({
      id: 'lot-0482',
      lotNumber: '0482',
      title: 'GUTS BERSERKER ARMOR 1/4 SCALE STATUE',
      category: 'Statues & Resin',
      categorySubtitle: 'PRE-PAINTED POLYSTONE STATUE',
      edition: 'EDITION: 042 / 350',
      price: 124000,
      imageUrl: '/showcase/guts_berserker_statue.jpg',
      condition: 'NEW',
      gradeCondition: 'GRADE S (MINT)',
      origin: 'TOKYO, JAPAN',
      scale: '1/4 SCALE',
      weight: '18.4 KG',
      seal: 'HOLOGRAM S-01',
      sculptor: 'Prime 1 Studio Artisans / Head Sculpt by Kojima',
      manufacturer: 'Prime 1 Studio',
      boxDimensions: '74cm × 52cm × 48cm • Flight Crate 24.2 KG',
      provenance:
        'Cast in heavy polystone resin with battle-damaged enamel finish, removable magnetic cape, and illuminated LED base. Acquired directly from Prime 1 Tokyo archival stock. Inspected under high-magnification optical sensors with zero micro-fractures.',
      gallery: [
        { src: '/showcase/guts_berserker_statue.jpg', label: 'FRONT ELEVATION', caption: 'Primary front view showcasing battle-hardened Berserker armor patina' },
        { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'BACK CAPE DETAIL', caption: 'Fabric weave texture, wired cape armature, and rear spinal plates' },
        { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'HEAD SCULPT MACRO', caption: 'Close-up macro of helmet teeth, crimson optical slits, and teeth gradient' },
        { src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', label: 'BASE SERIAL STAMP', caption: 'Solid cold-cast bronze edition plaque stamped 042 / 350' },
        { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', label: 'HOLOGRAM SEAL', caption: 'Tamper-evident holographic authenticity seal with Tokyo Vault serial' },
        { src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=85', label: 'FACTORY BOX INTEGRITY', caption: 'Original art box with reinforced corner guards and styrofoam inserts' },
      ],
    } as MockProduct);

  const galleryItems = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [
        { src: product.imageUrl, label: 'FRONT ELEVATION', caption: 'Primary archival photography' },
        { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'REAR DETAIL', caption: 'Secondary inspection profile' },
        { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'MACRO FOCUS', caption: 'High magnification surface resolution' },
        { src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', label: 'BASE SERIAL', caption: 'Cold-cast stamped serial identification' },
        { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', label: 'HOLOGRAM SEAL', caption: 'Holographic tamper-evident verification seal' },
        { src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=85', label: 'FACTORY BOX', caption: 'Pristine original outer shipper box' },
      ];

  const activeMedia: ProductMediaItem = galleryItems[activeMediaIndex] ?? galleryItems[0]!;

  // 360 auto rotation
  useEffect(() => {
    if (!isAutoRotating || activeStageMode !== '360') return;
    const interval = setInterval(() => {
      setCurrentAngleIndex((prev) => (prev + 1) % TURNAROUND_ANGLES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isAutoRotating, activeStageMode]);

  const handleMouseMoveZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomCoords({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id);
    } catch (err) {
      console.warn('[LotDetailPage] Add to cart note:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('otaku_cart_updated'));
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleOpenEscrowDispatch = () => {
    setIsCheckoutDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-14 select-none">
      {/* Top Breadcrumb Bar */}
      <div className="w-full border-b border-[#262626] bg-[#0a0a0a] px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em]">
          <div className="flex items-center space-x-3 text-[#8c8c8c]">
            <Link
              href="/#stage-2"
              className="text-zinc-300 hover:text-white transition-none no-underline border border-[#262626] bg-[#141414] px-2.5 py-1 hover:border-white"
            >
              [ &lt;- BACK TO ARCHIVAL INDEX ]
            </Link>
            <span className="text-[#404040]">/</span>
            <span className="text-zinc-300">{product.category.toUpperCase()}</span>
            <span className="text-[#404040]">/</span>
            <span className="text-white">LOT #{product.lotNumber}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-[#10b981] inline-block animate-pulse" />
            <span className="text-[10px] text-[#10b981] font-bold tracking-[0.2em]">
              TOKYO CUSTODY • ESCROW ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 2-Column Asymmetric Split Layout: 60% Left Media Showcase / 40% Right Telemetry & Purchase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#262626] bg-[#141414]">
          {/* Left Column (60%): Interactive Media & Extra Gallery Pictures */}
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#262626] bg-[#0a0a0a] p-4 sm:p-6 flex flex-col justify-between">
            <div>
              {/* Media Mode Switcher */}
              <div className="flex items-center justify-between border-b border-[#262626] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white border border-[#262626] bg-[#141414] px-2 py-0.5">
                    MEDIA STAGE
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#8c8c8c]">
                    HIGH-RESOLUTION OPTICAL TELEMETRY
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveStageMode('STILL')}
                    className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold border transition-none cursor-pointer rounded-none ${
                      activeStageMode === 'STILL'
                        ? 'border-white bg-white text-black'
                        : 'border-[#262626] bg-[#141414] text-zinc-300 hover:border-zinc-500 hover:text-white'
                    }`}
                  >
                    [ STILL ZOOM ]
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStageMode('360')}
                    className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold border transition-none cursor-pointer rounded-none ${
                      activeStageMode === '360'
                        ? 'border-white bg-white text-black'
                        : 'border-[#262626] bg-[#141414] text-zinc-300 hover:border-zinc-500 hover:text-white'
                    }`}
                  >
                    [ 360° TURNAROUND ]
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStageMode('VIDEO')}
                    className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold border transition-none cursor-pointer rounded-none ${
                      activeStageMode === 'VIDEO'
                        ? 'border-white bg-white text-black'
                        : 'border-[#262626] bg-[#141414] text-zinc-300 hover:border-zinc-500 hover:text-white'
                    }`}
                  >
                    [ 60FPS VIDEO ]
                  </button>
                </div>
              </div>

              {/* Primary Media Stage Viewport */}
              <div className="relative w-full aspect-[4/3] bg-[#070709] border border-[#262626] overflow-hidden flex items-center justify-center">
                {/* MODE 1: STILL PHOTOGRAPHY WITH CLICK-TO-ZOOM */}
                {activeStageMode === 'STILL' && (
                  <div
                    className="relative w-full h-full cursor-crosshair"
                    onClick={() => setIsZoomed(!isZoomed)}
                    onMouseMove={handleMouseMoveZoom}
                  >
                    {isZoomed ? (
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url(${activeMedia.src})`,
                          backgroundPosition: `${zoomCoords.x}% ${zoomCoords.y}%`,
                          backgroundSize: '280%',
                          backgroundRepeat: 'no-repeat',
                        }}
                      />
                    ) : (
                      <Image
                        src={activeMedia.src}
                        alt={`${product.title} — ${activeMedia.label}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-contain p-6 contrast-105"
                        priority
                        unoptimized={activeMedia.src.startsWith('http')}
                      />
                    )}

                    {/* HUD Overlays */}
                    <div className="absolute top-3 left-3 border border-[#262626] bg-[#0a0a0a]/90 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-zinc-300 pointer-events-none">
                      VIEW: {activeMedia.label}
                    </div>

                    <div className="absolute bottom-3 left-3 border border-[#262626] bg-[#0a0a0a]/90 px-2.5 py-1 text-[8px] uppercase tracking-wider text-zinc-400 pointer-events-none">
                      {isZoomed ? '[ 2.8X OPTICAL LOUPE ACTIVE — CLICK TO EXIT ]' : '[ CLICK IMAGE TO ACTIVATE 2.8X JEWELER LOUPE ]'}
                    </div>

                    <div className="absolute top-3 right-3 border border-[#262626] bg-[#0a0a0a]/90 px-2 py-0.5 text-[8px] uppercase tracking-wider text-zinc-400 pointer-events-none">
                      FRAME {activeMediaIndex + 1} / {galleryItems.length}
                    </div>
                  </div>
                )}

                {/* MODE 2: 360-DEGREE TURNAROUND VIEWER */}
                {activeStageMode === '360' && (
                  <div className="relative w-full h-full">
                    <Image
                      src={galleryItems[currentAngleIndex % galleryItems.length]?.src || activeMedia.src}
                      alt={`${product.title} — 360 Turnaround`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-contain p-6 contrast-105"
                      priority
                      unoptimized={true}
                    />

                    {/* Angle HUD */}
                    <div className="absolute top-3 left-3 border border-[#262626] bg-[#0a0a0a]/90 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-zinc-200">
                      ANGLE: {TURNAROUND_ANGLES[currentAngleIndex]?.label || '000° FRONT'}
                    </div>

                    {/* Stepper Controls */}
                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentAngleIndex(
                            (prev) => (prev - 1 + TURNAROUND_ANGLES.length) % TURNAROUND_ANGLES.length
                          )
                        }
                        className="px-2.5 py-1 bg-[#0a0a0a] border border-[#262626] text-zinc-300 hover:text-white text-[9px] uppercase tracking-wider font-bold transition-none"
                      >
                        ← PREV
                      </button>

                      <div className="flex items-center gap-1 bg-[#0a0a0a] border border-[#262626] p-1">
                        {TURNAROUND_ANGLES.map((angle, idx) => (
                          <button
                            key={angle.deg}
                            type="button"
                            onClick={() => setCurrentAngleIndex(idx)}
                            className={`px-2 py-0.5 text-[8px] uppercase font-bold border transition-none ${
                              currentAngleIndex === idx
                                ? 'bg-white text-black border-white'
                                : 'bg-[#141414] text-zinc-400 border-[#262626] hover:text-white'
                            }`}
                          >
                            {angle.deg}°
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setIsAutoRotating(!isAutoRotating)}
                          className={`ml-1 px-2 py-0.5 text-[8px] uppercase font-bold border transition-none ${
                            isAutoRotating
                              ? 'bg-[#10b981] text-black border-[#10b981]'
                              : 'bg-[#141414] text-zinc-300 border-[#262626]'
                          }`}
                        >
                          {isAutoRotating ? '[ PAUSE AUTO ]' : '[ PLAY 360° ]'}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentAngleIndex((prev) => (prev + 1) % TURNAROUND_ANGLES.length)
                        }
                        className="px-2.5 py-1 bg-[#0a0a0a] border border-[#262626] text-zinc-300 hover:text-white text-[9px] uppercase tracking-wider font-bold transition-none"
                      >
                        NEXT →
                      </button>
                    </div>
                  </div>
                )}

                {/* MODE 3: 60FPS VIDEO INSPECTION CLIP */}
                {activeStageMode === 'VIDEO' && (
                  <div className="relative w-full h-full flex flex-col justify-between p-4 bg-[#070709]">
                    <div className="relative w-full h-full overflow-hidden border border-[#262626] bg-[#0a0a0a] flex items-center justify-center">
                      <Image
                        src={product.imageUrl}
                        alt="Macro video frame"
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-contain p-6 contrast-110 filter"
                        unoptimized={true}
                      />

                      {/* Simulated Telemetry Video HUD */}
                      <div className="absolute inset-0 bg-black/40 pointer-events-none flex flex-col justify-between p-4">
                        <div className="flex justify-between items-start">
                          <div className="border border-[#262626] bg-[#0a0a0a]/90 p-2 text-[8px] text-zinc-300 space-y-0.5">
                            <div>STREAM: 4K 60FPS OPTICAL MACRO</div>
                            <div>LENS: LEICA 90MM APO-MACRO F/2.8</div>
                            <div>TAMPER SEAL: VALIDATED (GRADE S)</div>
                          </div>
                          <div className="flex items-center gap-1.5 border border-[#262626] bg-[#0a0a0a]/90 px-2 py-1 text-[8px] uppercase tracking-widest text-zinc-300">
                            <span className="w-1.5 h-1.5 bg-red-600 inline-block animate-pulse" />
                            <span>OPTICAL REC</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-end">
                          <div className="text-[9px] text-zinc-400 bg-[#0a0a0a]/90 px-2 py-1 border border-[#262626]">
                            TIMESTAMP: 00:04:18:22 / 00:06:00:00
                          </div>
                          <button
                            type="button"
                            onClick={() => setVideoPlaying(!videoPlaying)}
                            className="pointer-events-auto px-3 py-1.5 border border-[#262626] bg-[#141414] hover:bg-white hover:text-black hover:border-white text-zinc-200 text-[9px] uppercase tracking-widest font-bold transition-none"
                          >
                            {videoPlaying ? '[ PAUSE FEED ]' : '[ RESUME 60FPS FEED ]'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Extra Pictures Thumbnail Strip (5 to 8 photos, instant 0ms swap) */}
              <div className="mt-4 pt-4 border-t border-[#262626]">
                <div className="flex items-center justify-between mb-2">
                  <span
                    style={{ fontFamily: "var(--font-telemetry), 'Chakra Petch', sans-serif" }}
                    className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8c8c8c]"
                  >
                    EXTRA SPECIMEN PICTURES ({galleryItems.length} ANGLES)
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-zinc-500">
                    CLICK THUMBNAIL TO SWAP ACTIVE MEDIA
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-7 gap-2">
                  {galleryItems.map((item, idx) => {
                    const isSelected = activeMediaIndex === idx;
                    return (
                      <button
                        key={`${item.label}-${idx}`}
                        type="button"
                        onClick={() => {
                          setActiveMediaIndex(idx);
                          setActiveStageMode('STILL');
                        }}
                        className={`relative aspect-square border overflow-hidden transition-none cursor-pointer p-1 bg-[#0a0a0a] rounded-none ${
                          isSelected
                            ? 'border-white ring-1 ring-white'
                            : 'border-[#262626] hover:border-zinc-500'
                        }`}
                        title={item.label}
                      >
                        <Image
                          src={item.src}
                          alt={item.label}
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized={item.src.startsWith('http')}
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1 py-0.5 text-[7px] text-zinc-300 uppercase tracking-tighter truncate text-center">
                          {item.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Captioned Curator Note on Active Media */}
            <div className="mt-4 p-3 bg-[#141414] border border-[#262626] text-[10px] text-zinc-400">
              <span className="font-bold text-white uppercase tracking-wider mr-2">
                ACTIVE TELEMETRY:
              </span>
              <span>{activeMedia.caption}</span>
            </div>
          </div>

          {/* Right Column (40%): Full Product Telemetry & Escrow Actions */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#141414] space-y-6">
            <div>
              {/* Category Header */}
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-2 font-bold">
                <span>TOKYO ARCHIVAL VAULT • {product.category.toUpperCase()}</span>
                <span className="text-white border border-[#262626] bg-[#0a0a0a] px-2 py-0.5">
                  {product.edition}
                </span>
              </div>

              {/* Full Lot Title */}
              <h1
                style={{ fontFamily: "var(--font-display), 'Syne', sans-serif", letterSpacing: '-0.025em' }}
                className="text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-tight text-white mb-3 leading-tight"
              >
                {product.title}
              </h1>

              {/* Formatted Price & Breakdown */}
              <div className="p-4 bg-[#0a0a0a] border border-[#262626] mb-6">
                <span className="text-[10px] uppercase tracking-wider text-[#8c8c8c] block font-medium">
                  ARCHIVAL VALUATION &amp; ESCROW SETTLEMENT
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-400 pt-2 mt-2 border-t border-[#262626]">
                  <span>GST &amp; TRANSIT INSURANCE:</span>
                  <span className="text-[#10b981] font-bold">₹0 (INCLUDED IN CUSTODY)</span>
                </div>
              </div>

              {/* 4-Cell Archival Telemetry Grid */}
              <div className="mb-6">
                <span
                  style={{ fontFamily: "'Satoshi', sans-serif" }}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c8c8c] block mb-2"
                >
                  PHYSICAL SPECIFICATION MATRIX
                </span>
                <div className="grid grid-cols-2 divide-x divide-y divide-[#262626] border border-[#262626] bg-[#0a0a0a] text-[11px]">
                  {/* Cell 1: WEIGHT */}
                  <div className="p-3.5 space-y-1">
                    <span className="text-[9px] uppercase tracking-[0.16em] text-[#8c8c8c] block">
                      WEIGHT
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-100">
                      {product.weight}
                    </span>
                  </div>

                  {/* Cell 2: AUTHENTICITY SEAL */}
                  <div className="p-3.5 space-y-1">
                    <span className="text-[9px] uppercase tracking-[0.16em] text-[#8c8c8c] block">
                      AUTHENTICITY SEAL
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#10b981]">
                      {product.seal}
                    </span>
                  </div>

                  {/* Cell 3: ORIGIN */}
                  <div className="p-3.5 space-y-1">
                    <span className="text-[9px] uppercase tracking-[0.16em] text-[#8c8c8c] block">
                      ORIGIN
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-100">
                      {product.origin}
                    </span>
                  </div>

                  {/* Cell 4: CONDITION */}
                  <div className="p-3.5 space-y-1">
                    <span className="text-[9px] uppercase tracking-[0.16em] text-[#8c8c8c] block">
                      CONDITION
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-100">
                      {product.gradeCondition}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comprehensive Product Description & Provenance */}
              <div className="space-y-4 text-xs leading-relaxed text-zinc-300 mb-6">
                <div className="space-y-2 border-t border-[#262626] pt-4">
                  <span
                    style={{ fontFamily: "'Satoshi', sans-serif" }}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c8c8c] block"
                  >
                    PROVENANCE &amp; CURATORIAL NOTES
                  </span>
                  <p className="font-normal text-zinc-400">
                    {product.provenance}
                  </p>
                </div>

                <div className="space-y-1.5 border-t border-[#262626] pt-3 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#8c8c8c] uppercase tracking-wider">SCULPTOR:</span>
                    <span className="font-semibold text-zinc-200 uppercase">{product.sculptor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8c8c8c] uppercase tracking-wider">MANUFACTURER:</span>
                    <span className="font-semibold text-zinc-200 uppercase">{product.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8c8c8c] uppercase tracking-wider">BOX DIMENSIONS:</span>
                    <span className="font-semibold text-zinc-200 uppercase">{product.boxDimensions}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#0a0a0a] border border-[#262626] text-[10px] space-y-1">
                  <div className="flex items-center gap-2 text-[#10b981] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-[#10b981] inline-block" />
                    <span>48-Hour Escrow Inspection Guarantee</span>
                  </div>
                  <p className="text-zinc-400 leading-normal">
                    Custody payment is held in escrow during transit. You have 48 hours upon physical receipt to verify joints, paint, and authentication hologram seal.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Controls */}
            <div className="space-y-3 pt-4 border-t border-[#262626]">
              {/* Primary: ADD TO CART */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-3 px-4 border text-xs font-bold uppercase tracking-[0.2em] transition-none cursor-pointer flex items-center justify-center rounded-none ${
                  addedToCart
                    ? 'border-[#10b981] bg-[#10b981] text-black font-extrabold'
                    : 'border-[#262626] bg-[#0a0a0a] hover:bg-white hover:text-black hover:border-white text-white'
                }`}
              >
                {addedToCart ? '[ ADDED TO VAULT CART ]' : '[ ADD TO CART ]'}
              </button>

              {/* Secondary Direct Escrow Trigger: PROCEED TO ESCROW DISPATCH */}
              <button
                type="button"
                onClick={handleOpenEscrowDispatch}
                className="w-full py-3.5 px-4 bg-white text-black hover:bg-zinc-200 border border-white text-xs font-extrabold uppercase tracking-[0.2em] transition-none cursor-pointer flex items-center justify-center rounded-none shadow-none"
              >
                [ PROCEED TO ESCROW DISPATCH — ₹{product.price.toLocaleString('en-IN')} ]
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Instant Checkout Drawer for Direct Escrow Dispatch */}
      <InstantCheckoutDrawer
        productId={product.id}
        lotId={product.lotNumber}
        price={product.price}
        itemTitle={product.title}
        isOpen={isCheckoutDrawerOpen}
        onClose={() => setIsCheckoutDrawerOpen(false)}
      />

      {/* Archival Footer */}
      <ArchivalFooter />
    </div>
  );
}
