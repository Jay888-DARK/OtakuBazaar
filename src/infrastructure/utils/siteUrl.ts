/**
 * @file src/infrastructure/utils/siteUrl.ts
 *
 * Canonical site URL and SEO metadata formatting helpers for OtakuBazaar.
 */

const DEFAULT_SITE_URL = 'https://otakubazaar.jaybhatt.me';

/**
 * Resolves the canonical base URL from NEXT_PUBLIC_SITE_URL (or NEXT_PUBLIC_APP_URL),
 * defaulting to https://otakubazaar.jaybhatt.me and stripping trailing slashes.
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    DEFAULT_SITE_URL;
  return raw.trim().replace(/\/+$/, '');
}

/**
 * Builds a concise page title segment so that `<segment> | OtakuBazaar` stays under 60 characters.
 */
export function buildListingSeoTitle(itemTitle: string): string {
  const clean = itemTitle.replace(/\s+/g, ' ').trim();
  const suffix = ' | OtakuBazaar';
  const maxSegmentLength = 60 - suffix.length; // 46 chars
  if (clean.length <= maxSegmentLength) {
    return clean;
  }
  return `${clean.slice(0, maxSegmentLength - 1).trimEnd()}…`;
}

/**
 * Generates a 150–160 character meta description for a listing using brand, series, condition, and INR price.
 */
export function buildListingMetaDescription(params: {
  title: string;
  brand?: string;
  series?: string;
  condition?: string;
  priceINR: number;
}): string {
  const priceStr = `₹${Math.round(params.priceINR).toLocaleString('en-IN')}`;
  const conditionLabel =
    params.condition === 'NEW'
      ? 'Sealed MISB'
      : params.condition === 'LIKE_NEW'
        ? 'Like New'
        : params.condition || 'Pre-owned';
  const brandPart = params.brand && params.brand.trim() ? ` by ${params.brand.trim()}` : '';
  const seriesPart =
    params.series && params.series.trim() && params.series.trim() !== params.title.trim()
      ? ` (${params.series.trim()})`
      : '';

  const base = `Buy ${params.title.trim()}${brandPart}${seriesPart}, ${conditionLabel}, for ${priceStr} INR on OtakuBazaar India.`;
  const padding = ' Tracked pan-India delivery & 48-hour unboxing inspection window.';

  let full = base.length < 150 ? `${base}${padding}` : base;
  if (full.length > 160) {
    full = `${full.slice(0, 159).trimEnd()}…`;
  }
  if (full.length < 150) {
    const extra = ' Shop authentic anime collectibles from Indian collectors today.';
    full = `${full}${extra}`.slice(0, 160).trimEnd();
  }
  return full;
}
