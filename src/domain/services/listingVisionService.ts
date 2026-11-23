/**
 * @file src/domain/services/listingVisionService.ts
 *
 * Domain service for AI photo-to-listing extraction, schema validation,
 * normalization, dropdown mapping, and batch deduplication.
 */

import { z } from 'zod';

export const SUPPORTED_CATEGORIES = [
  'Scale Figure',
  'Nendoroid',
  'Statues & Resin',
  'Manga Sets',
  'Mecha & Gunpla',
  'Cosplay & Props',
  'Other',
] as const;

export const SUPPORTED_FRANCHISES = [
  'Jujutsu Kaisen',
  'Demon Slayer',
  'One Piece',
  'Chainsaw Man',
  'Bleach',
  'Attack on Titan',
  'Naruto Shippuden',
  'Berserk',
  'Fate / Stay Night',
  'Neon Genesis Evangelion',
  'Fullmetal Alchemist',
  'Other / Retro',
] as const;

export const SUPPORTED_MANUFACTURERS = [
  'Alter',
  'MegaHouse',
  'Good Smile Company',
  'Kotobukiya',
  'Bandai Spirits',
  'Other',
] as const;

export const AiFieldConfidenceSchema = z.object({
  title: z.number().min(0).max(1).optional().default(0.8),
  franchise: z.number().min(0).max(1).optional().default(0.8),
  category: z.number().min(0).max(1).optional().default(0.8),
  publisher_or_manufacturer: z.number().min(0).max(1).optional().default(0.8),
  volume_or_edition: z.number().min(0).max(1).optional().default(0.8),
  condition_grade: z.number().min(0).max(1).optional().default(0.8),
  price_inr: z.number().min(0).max(1).optional().default(0.8),
});

export const RawAiDetectedItemSchema = z.object({
  title: z.string().trim().min(1),
  franchise: z.string().trim().nullable().optional(),
  category: z.string().trim().nullable().optional(),
  publisher_or_manufacturer: z.string().trim().nullable().optional(),
  volume_or_edition: z.string().trim().nullable().optional(),
  language: z.string().trim().nullable().optional(),
  condition_grade: z.string().trim().nullable().optional(),
  price_inr: z.number().positive().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  confidence: z
    .union([
      AiFieldConfidenceSchema,
      z.number().min(0).max(1).transform((num) => ({
        title: num,
        franchise: num,
        category: num,
        publisher_or_manufacturer: num,
        condition_grade: num,
        price_inr: num,
      })),
      z.record(z.string(), z.number()),
    ])
    .optional(),
});

export interface RawAiDetectedItem {
  title: string;
  franchise?: string | null;
  category?: string | null;
  publisher_or_manufacturer?: string | null;
  volume_or_edition?: string | null;
  language?: string | null;
  condition_grade?: string | null;
  price_inr?: number | null;
  description?: string | null;
  confidence?: Record<string, number> | number;
}

export interface NormalizedDraftItem {
  id: string;
  title: string;
  franchise: string;
  category: (typeof SUPPORTED_CATEGORIES)[number];
  manufacturer: (typeof SUPPORTED_MANUFACTURERS)[number];
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
  conditionGrade: string;
  askingPriceINR: number;
  volumeOrEdition: string | null;
  language: string | null;
  description: string;
  imageIndex: number;
  imageUrl?: string;
  lowConfidenceFields: string[];
  fieldConfidence: Record<string, number>;
}

/**
 * Normalizes an AI category string to one of the strictly supported categories.
 * If unmatched, falls back to "Other" and flags unmapped text.
 */
export function normalizeCategory(raw: string | null | undefined): {
  category: (typeof SUPPORTED_CATEGORIES)[number];
  unmappedRaw?: string;
} {
  if (!raw || !raw.trim()) {
    return { category: 'Other' };
  }
  const clean = raw.trim();

  // Exact match
  const exact = SUPPORTED_CATEGORIES.find(
    (c) => c.toLowerCase() === clean.toLowerCase()
  );
  if (exact) return { category: exact };

  // Heuristic fuzzy match
  const lower = clean.toLowerCase();
  if (lower.includes('scale') || lower.includes('figure') || lower.includes('pvc')) {
    return { category: 'Scale Figure' };
  }
  if (lower.includes('nendo') || lower.includes('chibi')) {
    return { category: 'Nendoroid' };
  }
  if (lower.includes('statue') || lower.includes('resin') || lower.includes('polystone')) {
    return { category: 'Statues & Resin' };
  }
  if (lower.includes('manga') || lower.includes('book') || lower.includes('comic') || lower.includes('tankobon')) {
    return { category: 'Manga Sets' };
  }
  if (lower.includes('gunpla') || lower.includes('mecha') || lower.includes('gundam') || lower.includes('model kit')) {
    return { category: 'Mecha & Gunpla' };
  }
  if (lower.includes('cosplay') || lower.includes('prop') || lower.includes('costume') || lower.includes('wig')) {
    return { category: 'Cosplay & Props' };
  }

  return { category: 'Other', unmappedRaw: clean };
}

/**
 * Normalizes an AI franchise string to one of the supported franchises.
 */
export function normalizeFranchise(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) {
    return 'Other / Retro';
  }
  const clean = raw.trim();
  const lower = clean.toLowerCase();

  const exact = SUPPORTED_FRANCHISES.find(
    (f) => f.toLowerCase() === lower
  );
  if (exact) return exact;

  if (lower.includes('jujutsu') || lower.includes('jjk') || lower.includes('gojo')) return 'Jujutsu Kaisen';
  if (lower.includes('demon slayer') || lower.includes('kimetsu') || lower.includes('tanjiro')) return 'Demon Slayer';
  if (lower.includes('one piece') || lower.includes('luffy') || lower.includes('straw hat')) return 'One Piece';
  if (lower.includes('chainsaw') || lower.includes('denji') || lower.includes('makima')) return 'Chainsaw Man';
  if (lower.includes('bleach') || lower.includes('ichigo') || lower.includes('shinigami')) return 'Bleach';
  if (lower.includes('attack on titan') || lower.includes('aot') || lower.includes('shingeki') || lower.includes('eren')) return 'Attack on Titan';
  if (lower.includes('naruto') || lower.includes('boruto') || lower.includes('sasuke')) return 'Naruto Shippuden';
  if (lower.includes('berserk') || lower.includes('guts') || lower.includes('griffith')) return 'Berserk';
  if (lower.includes('fate') || lower.includes('saber') || lower.includes('stay night')) return 'Fate / Stay Night';
  if (lower.includes('evangelion') || lower.includes('eva') || lower.includes('asuka') || lower.includes('shinji')) return 'Neon Genesis Evangelion';
  if (lower.includes('fullmetal') || lower.includes('fma') || lower.includes('elric')) return 'Fullmetal Alchemist';

  return clean; // If custom franchise name, retain it
}

/**
 * Normalizes manufacturer to supported list or 'Other'.
 */
export function normalizeManufacturer(raw: string | null | undefined): {
  manufacturer: (typeof SUPPORTED_MANUFACTURERS)[number];
  unmappedRaw?: string;
} {
  if (!raw || !raw.trim()) {
    return { manufacturer: 'Other' };
  }
  const clean = raw.trim();
  const lower = clean.toLowerCase();

  const exact = SUPPORTED_MANUFACTURERS.find(
    (m) => m.toLowerCase() === lower
  );
  if (exact) return { manufacturer: exact };

  if (lower.includes('alter')) return { manufacturer: 'Alter' };
  if (lower.includes('megahouse')) return { manufacturer: 'MegaHouse' };
  if (lower.includes('good smile') || lower.includes('gsc') || lower.includes('orange rouge')) return { manufacturer: 'Good Smile Company' };
  if (lower.includes('kotobukiya')) return { manufacturer: 'Kotobukiya' };
  if (lower.includes('bandai') || lower.includes('banpresto') || lower.includes('tamashii')) return { manufacturer: 'Bandai Spirits' };

  return { manufacturer: 'Other', unmappedRaw: clean };
}

/**
 * Normalizes condition grade from visible clues.
 */
export function normalizeCondition(raw: string | null | undefined): {
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
  conditionGrade: string;
} {
  if (!raw || !raw.trim()) {
    return { condition: 'LIKE_NEW', conditionGrade: '[A-RANK // BIB]' };
  }
  const lower = raw.trim().toLowerCase();

  if (lower.includes('sealed') || lower.includes('misb') || lower.includes('mint') || lower.includes('new') || lower.includes('s-rank')) {
    return { condition: 'NEW', conditionGrade: '[S-RANK // MISB]' };
  }
  if (lower.includes('bib') || lower.includes('box') || lower.includes('opened') || lower.includes('cabinet') || lower.includes('a-rank')) {
    return { condition: 'LIKE_NEW', conditionGrade: '[A-RANK // BIB]' };
  }
  if (lower.includes('shelf') || lower.includes('dust') || lower.includes('scuff') || lower.includes('b-rank') || lower.includes('good')) {
    return { condition: 'GOOD', conditionGrade: '[B-RANK // OPEN]' };
  }
  return { condition: 'FAIR', conditionGrade: '[C-RANK // LOOSE]' };
}

/**
 * Normalizes an extracted AI item into a verified draft card for OtakuBazaar.
 */
export function normalizeDraftItem(
  raw: RawAiDetectedItem,
  imageIndex = 0,
  sourceImageUrl?: string
): NormalizedDraftItem {
  const { category, unmappedRaw: unmappedCat } = normalizeCategory(raw.category);
  const franchise = normalizeFranchise(raw.franchise);
  const { manufacturer, unmappedRaw: unmappedMfg } = normalizeManufacturer(raw.publisher_or_manufacturer);
  const { condition, conditionGrade } = normalizeCondition(raw.condition_grade);

  let description = raw.description?.trim() || '';
  const notesToAdd: string[] = [];
  if (unmappedCat) notesToAdd.push(`Original Category: ${unmappedCat}`);
  if (unmappedMfg) notesToAdd.push(`Publisher/Manufacturer: ${unmappedMfg}`);
  if (raw.volume_or_edition) notesToAdd.push(`Volume/Edition: ${raw.volume_or_edition}`);
  if (raw.language) notesToAdd.push(`Language: ${raw.language}`);

  if (notesToAdd.length > 0) {
    description = description
      ? `${description}\n\n[Specs: ${notesToAdd.join(' | ')}]`
      : `[Specs: ${notesToAdd.join(' | ')}]`;
  }

  if (!description) {
    description = 'Verified archival anime collectible consigned to OtakuBazaar vault custody.';
  }

  // Parse confidence
  const confObj: Record<string, number> =
    typeof raw.confidence === 'object' && raw.confidence !== null
      ? (raw.confidence as Record<string, number>)
      : {};

  const lowConfidenceFields: string[] = [];
  const CONFIDENCE_THRESHOLD = 0.75;

  const fieldsToCheck: Array<{ key: string; value: any }> = [
    { key: 'title', value: raw.title },
    { key: 'category', value: raw.category },
    { key: 'franchise', value: raw.franchise },
    { key: 'publisher_or_manufacturer', value: raw.publisher_or_manufacturer },
    { key: 'condition_grade', value: raw.condition_grade },
  ];

  fieldsToCheck.forEach(({ key, value }) => {
    const score = confObj[key] !== undefined ? confObj[key] : (value ? 0.8 : 0.4);
    confObj[key] = score;
    if (score < CONFIDENCE_THRESHOLD) {
      lowConfidenceFields.push(key);
    }
  });

  return {
    id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: raw.title.trim(),
    franchise,
    category,
    manufacturer,
    condition,
    conditionGrade,
    askingPriceINR: raw.price_inr && raw.price_inr >= 500 ? Math.round(raw.price_inr) : 0,
    volumeOrEdition: raw.volume_or_edition?.trim() || null,
    language: raw.language?.trim() || null,
    description,
    imageIndex,
    imageUrl: sourceImageUrl,
    lowConfidenceFields,
    fieldConfidence: confObj,
  };
}

/**
 * Deduplicates multiple detected items by title + volume_or_edition (case-insensitive).
 */
export function deduplicateDraftItems(items: NormalizedDraftItem[]): NormalizedDraftItem[] {
  const seen = new Set<string>();
  const deduped: NormalizedDraftItem[] = [];

  for (const item of items) {
    const normTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normVol = (item.volumeOrEdition || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = `${normTitle}__${normVol}`;

    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  return deduped;
}

/**
 * Validates raw JSON output from the AI model against the draft schema.
 */
export function validateAiVisionResponse(jsonText: string): {
  success: boolean;
  items: RawAiDetectedItem[];
  error?: string;
} {
  try {
    // Strip markdown formatting if enclosed in ```json ... ```
    let clean = jsonText.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    const parsed = JSON.parse(clean);
    const rawArray = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.items)
      ? parsed.items
      : Array.isArray(parsed.drafts)
      ? parsed.drafts
      : [parsed];

    const validatedItems: RawAiDetectedItem[] = [];
    for (const item of rawArray) {
      const parsedItem = RawAiDetectedItemSchema.safeParse(item);
      if (parsedItem.success) {
        validatedItems.push(parsedItem.data);
      }
    }

    if (validatedItems.length === 0) {
      return {
        success: false,
        items: [],
        error: 'No recognizable collectibles or items could be detected in this photo.',
      };
    }

    return {
      success: true,
      items: validatedItems.slice(0, 20), // Max 20 items per request cap
    };
  } catch (err: unknown) {
    return {
      success: false,
      items: [],
      error: `Failed to parse AI vision output: ${err instanceof Error ? err.message : 'Invalid JSON'}`,
    };
  }
}
