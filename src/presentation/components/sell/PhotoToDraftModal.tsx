'use client';

/**
 * @file src/presentation/components/sell/PhotoToDraftModal.tsx
 *
 * Interactive batch draft terminal for AI photo-to-listing extraction.
 * Features:
 * - Table / Grid view of detected collectible drafts with attached source photographs.
 * - Amber highlight badges and borders for low-confidence fields (< 0.75).
 * - "Select All", "Publish Selected", and per-item removal actions.
 * - Single item "Apply to Main Form" option.
 * - Server action batch publishing with real-time progress indicators.
 * - Strict dark brutalist vault aesthetic (#080808, #1F1F1F, 0px border-radius).
 */

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  SUPPORTED_CATEGORIES,
  SUPPORTED_FRANCHISES,
  SUPPORTED_MANUFACTURERS,
  type NormalizedDraftItem,
} from '@/domain/services/listingVisionService';
import { createListingAction } from '@/app/actions';

interface PhotoToDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: NormalizedDraftItem[];
  notice?: string;
  onApplySingleToForm?: (draft: NormalizedDraftItem) => void;
  onPublishedAll?: () => void;
}

export const PhotoToDraftModal: React.FC<PhotoToDraftModalProps> = ({
  isOpen,
  onClose,
  drafts: initialDrafts,
  notice,
  onApplySingleToForm,
  onPublishedAll,
}) => {
  const [drafts, setDrafts] = useState<NormalizedDraftItem[]>(initialDrafts);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialDrafts.map((d) => d.id))
  );

  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishProgress, setPublishProgress] = useState<{ current: number; total: number } | null>(null);
  const [publishSuccessCount, setPublishSuccessCount] = useState<number | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === drafts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(drafts.map((d) => d.id)));
    }
  };

  const handleRemoveDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleUpdateDraft = (id: string, updates: Partial<NormalizedDraftItem>) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const handlePublishSelected = async () => {
    const toPublish = drafts.filter((d) => selectedIds.has(d.id));
    if (toPublish.length === 0) return;

    // Validate minimum requirements for all selected
    for (const d of toPublish) {
      if (!d.title.trim()) {
        setPublishError(`Item "${d.title || 'Untitled'}" is missing a title.`);
        return;
      }
      if (!d.askingPriceINR || d.askingPriceINR < 500) {
        setPublishError(`Please specify an asking price of at least ₹500 for "${d.title}".`);
        return;
      }
    }

    setIsPublishing(true);
    setPublishError(null);
    setPublishProgress({ current: 0, total: toPublish.length });

    let successCount = 0;

    for (let i = 0; i < toPublish.length; i++) {
      const draft = toPublish[i];
      if (!draft) continue;
      setPublishProgress({ current: i + 1, total: toPublish.length });

      try {
        const res = await createListingAction({
          title: `[${draft.franchise}] ${draft.title}`,
          series: draft.franchise,
          category: draft.category,
          manufacturer: draft.manufacturer,
          condition: draft.condition,
          conditionGrade: draft.conditionGrade,
          askingPriceINR: draft.askingPriceINR,
          originalPriceINR: Math.round(draft.askingPriceINR * 1.25),
          imageUrl: draft.imageUrl || '/otakubazaar-logo.png',
          description: draft.description,
          pickupPincode: '400001',
          weightKg: 1.5,
          dimensionsCm: '30x20x15',
        });

        if (res.success) {
          successCount++;
        }
      } catch (err) {
        console.error('Failed to publish draft:', err);
      }
    }

    setIsPublishing(false);
    setPublishSuccessCount(successCount);

    if (onPublishedAll) {
      onPublishedAll();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#080808] border border-[#1F1F1F] text-[#F2EFE9] flex flex-col max-h-[92vh] shadow-2xl rounded-none">
        {/* Terminal Header */}
        <div className="p-5 border-b border-[#1F1F1F] bg-[#0C0C0C] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-[0.2em] text-[#D4AF37] mb-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>[ AI PHOTO DRAFT PARSER // {drafts.length} DETECTED ]</span>
            </div>
            <h2 className="text-lg md:text-xl font-serif uppercase tracking-[0.08em] font-bold text-[#F2EFE9]">
              Review &amp; Confirm Consignment Drafts
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close draft terminal"
            className="px-3 py-1.5 border border-[#262626] text-xs font-mono text-[#888888] hover:text-[#F2EFE9] hover:border-[#F2EFE9] transition-colors"
          >
            [ ESC // CLOSE ]
          </button>
        </div>

        {/* Truncation / Info Notice */}
        {notice && (
          <div className="px-5 py-2.5 bg-[#171206] border-b border-[#D97706]/40 text-[#FBBF24] text-xs font-mono flex items-center gap-2">
            <span>⚠</span>
            <span>{notice}</span>
          </div>
        )}

        {/* Success Screen after Bulk Publishing */}
        {publishSuccessCount !== null ? (
          <div className="p-10 text-center space-y-4 my-auto">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#10B981]/20 border border-[#10B981] flex items-center justify-center text-[#10B981] font-bold text-xl">
              ✓
            </div>
            <h3 className="font-serif text-2xl uppercase tracking-[0.1em] text-[#F2EFE9]">
              {publishSuccessCount} Lots Successfully Published to Live Vault
            </h3>
            <p className="text-xs text-[#888888] max-w-md mx-auto leading-relaxed">
              Your consigned items are now live in OtakuBazaar custody and visible across the marketplace catalog.
            </p>
            <div className="pt-4 flex items-center justify-center gap-4">
              <Link
                href="/vault"
                className="px-6 py-3 bg-[#10B981] text-[#080808] font-bold uppercase text-xs tracking-[0.15em] no-underline hover:bg-[#0ea572] transition-colors"
              >
                [ VIEW IN MY VAULT ]
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-[#262626] text-[#888888] hover:text-[#F2EFE9] text-xs font-mono uppercase tracking-[0.15em] transition-colors"
              >
                [ CLOSE TERMINAL ]
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Batch Action Toolbar */}
            <div className="px-5 py-3 border-b border-[#1F1F1F] bg-[#0A0A0A] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[#888888] hover:text-[#F2EFE9] underline uppercase tracking-wider"
                >
                  {selectedIds.size === drafts.length ? '[ DESELECT ALL ]' : '[ SELECT ALL ]'}
                </button>
                <span className="text-[#666666]">
                  {selectedIds.size} OF {drafts.length} SELECTED
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#FBBF24] border border-[#D97706]/40 px-2 py-0.5 uppercase tracking-wider">
                  ■ AMBER BORDER = REVIEW FIELD
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {publishError && (
              <div className="mx-5 mt-4 p-3 bg-[#1F0A0A] border border-[#EF4444] text-[#EF4444] text-xs font-mono">
                [ ERROR: {publishError} ]
              </div>
            )}

            {/* Draft Cards List (Scrollable) */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {drafts.map((draft, idx) => {
                const isSelected = selectedIds.has(draft.id);
                const hasLowConf = draft.lowConfidenceFields.length > 0;

                return (
                  <div
                    key={draft.id}
                    className={`p-4 border transition-colors ${
                      isSelected
                        ? 'border-[#2F2F2F] bg-[#0C0C0C]'
                        : 'border-[#171717] bg-[#080808] opacity-60'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Checkbox & Attached Photo Preview */}
                      <div className="flex md:flex-col items-center gap-3 shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(draft.id)}
                          aria-label={`Select lot ${idx + 1}`}
                          className="w-4 h-4 rounded-none accent-[#F2EFE9] bg-[#080808] border-[#262626] cursor-pointer"
                        />

                        {draft.imageUrl ? (
                          <div className="relative w-20 h-20 bg-[#050505] border border-[#1F1F1F] shrink-0 overflow-hidden">
                            <Image
                              src={draft.imageUrl}
                              alt={draft.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                            <span className="absolute bottom-0 right-0 bg-[#080808]/90 text-[9px] font-mono px-1 text-[#888888]">
                              #{draft.imageIndex + 1}
                            </span>
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-[#0C0C0C] border border-[#1F1F1F] flex items-center justify-center text-[10px] text-[#555555] font-mono">
                            NO PHOTO
                          </div>
                        )}
                      </div>

                      {/* Editable Form Inputs for this Draft */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] font-mono uppercase text-[#777777]">
                            SPECIMEN #{String(idx + 1).padStart(2, '0')}
                          </span>

                          <div className="flex items-center gap-2">
                            {onApplySingleToForm && (
                              <button
                                type="button"
                                onClick={() => onApplySingleToForm(draft)}
                                className="text-[10px] font-mono text-[#D4AF37] hover:underline uppercase tracking-wider"
                              >
                                [ APPLY TO MAIN FORM ]
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveDraft(draft.id)}
                              className="text-[10px] font-mono text-[#EF4444] hover:underline uppercase tracking-wider"
                            >
                              [ REMOVE ]
                            </button>
                          </div>
                        </div>

                        {/* Title Input */}
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">
                            Title {draft.lowConfidenceFields.includes('title') && (
                              <span className="text-[#FBBF24] ml-1">[VERIFY TITLE]</span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={draft.title}
                            onChange={(e) => handleUpdateDraft(draft.id, { title: e.target.value })}
                            className={`w-full bg-[#080808] border px-3 py-2 text-xs text-[#F2EFE9] outline-none rounded-none ${
                              draft.lowConfidenceFields.includes('title')
                                ? 'border-[#D97706] focus:border-[#FBBF24]'
                                : 'border-[#1F1F1F] focus:border-[#F2EFE9]'
                            }`}
                          />
                        </div>

                        {/* 4-Column Selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {/* Franchise */}
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">
                              Franchise
                            </label>
                            <input
                              type="text"
                              value={draft.franchise}
                              onChange={(e) => handleUpdateDraft(draft.id, { franchise: e.target.value })}
                              list={`franchises-${draft.id}`}
                              className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-2.5 py-1.5 text-xs text-[#F2EFE9] outline-none rounded-none"
                            />
                            <datalist id={`franchises-${draft.id}`}>
                              {SUPPORTED_FRANCHISES.map((f) => (
                                <option key={f} value={f} />
                              ))}
                            </datalist>
                          </div>

                          {/* Category */}
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">
                              Category {draft.lowConfidenceFields.includes('category') && (
                                <span className="text-[#FBBF24] ml-1">*</span>
                              )}
                            </label>
                            <select
                              value={draft.category}
                              onChange={(e) =>
                                handleUpdateDraft(draft.id, {
                                  category: e.target.value as (typeof SUPPORTED_CATEGORIES)[number],
                                })
                              }
                              className={`w-full bg-[#080808] border px-2.5 py-1.5 text-xs text-[#F2EFE9] outline-none rounded-none ${
                                draft.lowConfidenceFields.includes('category')
                                  ? 'border-[#D97706]'
                                  : 'border-[#1F1F1F]'
                              }`}
                            >
                              {SUPPORTED_CATEGORIES.map((c) => (
                                <option key={c} value={c} className="bg-[#080808] text-[#F2EFE9]">
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Manufacturer / Publisher */}
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">
                              Studio / Publisher
                            </label>
                            <select
                              value={draft.manufacturer}
                              onChange={(e) =>
                                handleUpdateDraft(draft.id, {
                                  manufacturer: e.target.value as (typeof SUPPORTED_MANUFACTURERS)[number],
                                })
                              }
                              className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-2.5 py-1.5 text-xs text-[#F2EFE9] outline-none rounded-none"
                            >
                              {SUPPORTED_MANUFACTURERS.map((m) => (
                                <option key={m} value={m} className="bg-[#080808] text-[#F2EFE9]">
                                  {m}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Price INR */}
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">
                              Price (₹ INR) {(!draft.askingPriceINR || draft.askingPriceINR < 500) && (
                                <span className="text-[#EF4444] ml-1">[REQ]</span>
                              )}
                            </label>
                            <input
                              type="number"
                              min="500"
                              value={draft.askingPriceINR || ''}
                              onChange={(e) =>
                                handleUpdateDraft(draft.id, {
                                  askingPriceINR: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              placeholder="2500"
                              className={`w-full bg-[#080808] border px-2.5 py-1.5 text-xs text-[#F2EFE9] outline-none rounded-none ${
                                !draft.askingPriceINR || draft.askingPriceINR < 500
                                  ? 'border-[#EF4444]'
                                  : 'border-[#1F1F1F] focus:border-[#F2EFE9]'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Description / Volume notes */}
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">
                            Curatorial Provenance &amp; Edition Notes
                          </label>
                          <textarea
                            rows={2}
                            value={draft.description}
                            onChange={(e) => handleUpdateDraft(draft.id, { description: e.target.value })}
                            className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3 py-1.5 text-xs text-[#F2EFE9] outline-none rounded-none resize-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Footer Actions */}
            <div className="p-5 border-t border-[#1F1F1F] bg-[#0C0C0C] flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs font-mono text-[#888888]">
                <span>CONFIRMATION REQUIRED: Nothing is committed to the live vault until you click publish.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPublishing}
                  className="px-5 py-3 border border-[#262626] text-xs font-mono uppercase tracking-[0.15em] text-[#888888] hover:text-[#F2EFE9] transition-colors"
                >
                  [ CANCEL / DISCARD ]
                </button>

                <button
                  type="button"
                  onClick={handlePublishSelected}
                  disabled={isPublishing || selectedIds.size === 0}
                  className={`px-6 py-3 text-xs font-mono uppercase tracking-[0.15em] font-semibold transition-all ${
                    selectedIds.size === 0
                      ? 'bg-[#1F1F1F] text-[#555555] border border-[#1F1F1F] cursor-not-allowed'
                      : isPublishing
                      ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981] cursor-wait'
                      : 'bg-[#F2EFE9] hover:bg-[#EAE6DF] text-[#080808] border border-[#F2EFE9] cursor-pointer'
                  }`}
                >
                  {isPublishing
                    ? `[ PUBLISHING ${publishProgress?.current || 1} OF ${publishProgress?.total || 1}... ]`
                    : `[ CONFIRM & PUBLISH ${selectedIds.size} LOTS TO LIVE VAULT ]`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
