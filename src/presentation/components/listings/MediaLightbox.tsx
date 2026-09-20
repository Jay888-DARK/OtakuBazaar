'use client';

/**
 * @file src/presentation/components/listings/MediaLightbox.tsx
 *
 * Media Inspection Lightbox Modal for OtakuBazaar.
 * Supports high-resolution collectible photos and MP4/WebM inspection videos.
 *
 * Features:
 * - Full-screen dark backdrop with lacquer craftsman aesthetic
 * - Keyboard navigation (Escape to close, Left/Right arrow keys to cycle media)
 * - Active media viewer with format detection (Images vs MP4/WebM videos)
 * - Horizontal bottom thumbnail carousel with active-state rings
 * - Body scroll locking during inspection
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';

export interface MediaItem {
  readonly url: string;
  readonly type?: 'image' | 'video';
  readonly title?: string;
  readonly alt?: string;
}

export interface MediaLightboxProps {
  /** Whether the inspection lightbox is open */
  readonly isOpen: boolean;
  /** Callback fired when the lightbox requests to close */
  readonly onClose: () => void;
  /** Array of media URLs or structured media items */
  readonly media: ReadonlyArray<string | MediaItem>;
  /** Initial selected media index (defaults to 0) */
  readonly initialIndex?: number;
  /** Optional title of the collectible being inspected */
  readonly title?: string;
}

/**
 * Detects if a URL points to an MP4 or WebM video file.
 */
function isVideoMedia(item: string | MediaItem): boolean {
  if (typeof item === 'object' && item.type) {
    return item.type === 'video';
  }
  const url = typeof item === 'string' ? item : item.url;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

/**
 * Normalizes string or object media items into unified structure.
 */
function normalizeMediaItem(item: string | MediaItem, index: number, defaultTitle?: string): MediaItem {
  if (typeof item === 'string') {
    return {
      url: item,
      type: isVideoMedia(item) ? 'video' : 'image',
      title: defaultTitle ? `${defaultTitle} — Media ${index + 1}` : `Media ${index + 1}`,
      alt: defaultTitle ? `${defaultTitle} inspection ${index + 1}` : `Inspection image ${index + 1}`,
    };
  }
  return {
    url: item.url,
    type: item.type || (isVideoMedia(item.url) ? 'video' : 'image'),
    title: item.title || (defaultTitle ? `${defaultTitle} — Media ${index + 1}` : `Media ${index + 1}`),
    alt: item.alt || defaultTitle || `Inspection media ${index + 1}`,
  };
}

export function MediaLightbox({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
  title = 'Collectible Media Inspection',
}: MediaLightboxProps): React.JSX.Element | null {
  const normalizedMedia = useMemo(() => {
    return media.map((item, idx) => normalizeMediaItem(item, idx, title));
  }, [media, title]);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);

  // Sync initialIndex when modal opens
  useEffect(() => {
    if (isOpen) {
      const validIndex = Math.max(0, Math.min(initialIndex, normalizedMedia.length - 1));
      setCurrentIndex(validIndex);
    }
  }, [isOpen, initialIndex, normalizedMedia.length]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleNext = useCallback(() => {
    if (normalizedMedia.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % normalizedMedia.length);
  }, [normalizedMedia.length]);

  const handlePrev = useCallback(() => {
    if (normalizedMedia.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + normalizedMedia.length) % normalizedMedia.length);
  }, [normalizedMedia.length]);

  // Keyboard accessibility: Escape to close, Arrow keys to navigate
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || normalizedMedia.length === 0) {
    return null;
  }

  const activeItem = normalizedMedia[currentIndex] ?? normalizedMedia[0];
  if (!activeItem) {
    return null;
  }

  const isVideo = activeItem.type === 'video';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media Inspection Lightbox"
      className="fixed inset-0 z-[100] bg-[#0a0806]/95 backdrop-blur-md flex flex-col justify-between select-none animate-fadeIn"
      onClick={onClose}
    >
      {/* ----------------------------------------------------------------- */}
      {/* 1. Header Bar: Title, Inspection Badge, Media Counter & Close Btn */}
      {/* ----------------------------------------------------------------- */}
      <header
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-amber-900/30 bg-[#140F0B]/80 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-amber-950/70 border border-amber-600/40 text-amber-300 text-xs font-mono font-bold tracking-wide">
            <span className="text-[#F85B1A]">🔍</span>
            <span>48H INSPECTION VAULT</span>
          </div>

          <div className="flex flex-col truncate">
            <h2 className="text-sm sm:text-base font-bold text-zinc-100 truncate font-mono uppercase tracking-wider">
              {title}
            </h2>
            <span className="text-[11px] text-[#A89880] hidden sm:inline">
              Authentic high-resolution zoom & video inspection
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Media Count Badge */}
          <span className="text-xs font-mono font-bold text-amber-400/90 bg-black/40 px-2.5 py-1 rounded border border-amber-900/40">
            {currentIndex + 1} / {normalizedMedia.length}
          </span>

          {/* Close Button with Escape Badge */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close inspection lightbox (Esc)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-[#F85B1A]/20 border border-amber-900/40 hover:border-[#F85B1A] text-slate-300 hover:text-white transition-all cursor-pointer group"
          >
            <span className="text-sm font-bold group-hover:rotate-90 transition-transform duration-200">
              ✕
            </span>
            <span className="text-[10px] text-amber-400/70 uppercase tracking-widest hidden sm:inline">
              Esc
            </span>
          </button>
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* 2. Main Stage: Active Media (Image or Video) + Nav Controls       */}
      {/* ----------------------------------------------------------------- */}
      <main
        className="flex-1 relative flex items-center justify-center p-2 sm:p-6 overflow-hidden min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button (if multiple items) */}
        {normalizedMedia.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous media"
            className="absolute left-2 sm:left-6 z-30 p-3 rounded-full bg-black/60 hover:bg-[#F85B1A] border border-amber-700/40 hover:border-[#F85B1A] text-amber-100 transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Media Frame */}
        <div className="relative max-h-[68vh] max-w-[88vw] flex items-center justify-center">
          {isVideo ? (
            <div className="relative rounded-xl overflow-hidden border border-amber-900/40 bg-black shadow-2xl">
              <video
                key={activeItem.url}
                src={activeItem.url}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[66vh] max-w-[86vw] object-contain rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300">
                ▶ MP4/WEBM VIDEO
              </span>
            </div>
          ) : (
            <div className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={activeItem.url}
                src={activeItem.url}
                alt={activeItem.alt || title}
                className="max-h-[66vh] max-w-[86vw] object-contain rounded-xl shadow-2xl border border-amber-900/40 bg-black/40 transition-all duration-300"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 pointer-events-none">
                📸 HI-RES MACRO
              </span>
            </div>
          )}
        </div>

        {/* Next Button (if multiple items) */}
        {normalizedMedia.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next media"
            className="absolute right-2 sm:right-6 z-30 p-3 rounded-full bg-black/60 hover:bg-[#F85B1A] border border-amber-700/40 hover:border-[#F85B1A] text-amber-100 transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </main>

      {/* ----------------------------------------------------------------- */}
      {/* 3. Bottom Carousel: Scrollable Thumbnails with Vermilion Rings    */}
      {/* ----------------------------------------------------------------- */}
      <footer
        className="w-full py-3 px-4 bg-[#140F0B]/90 border-t border-amber-900/30 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 overflow-x-auto py-1 px-2 scrollbar-thin">
          {normalizedMedia.map((item, idx) => {
            const isSelected = idx === currentIndex;
            const itemIsVideo = item.type === 'video';

            return (
              <button
                key={`${item.url}-${idx}`}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`View media ${idx + 1}`}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-2 border-[#F85B1A] ring-2 ring-[#F85B1A]/50 scale-105 opacity-100 shadow-lg'
                    : 'border border-amber-900/40 opacity-50 hover:opacity-90 hover:border-amber-500/60'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt || `Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {itemIsVideo && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold">
                    <span className="w-5 h-5 rounded-full bg-[#F85B1A]/90 flex items-center justify-center text-[9px] shadow">
                      ▶
                    </span>
                  </div>
                )}

                {isSelected && (
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-[#F85B1A]" />
                )}
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
}

export default MediaLightbox;
