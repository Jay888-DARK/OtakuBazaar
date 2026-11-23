/**
 * @file src/infrastructure/services/mfcService.ts
 *
 * MyFigureCollection (MFC) Integration Service for OtakuBazaar.
 *
 * Provides safe, rate-limited, cached server-side metadata resolution
 * for Japanese collectible figures behind an abstract interface.
 *
 * Rate Limiting: max 5 requests per user per minute.
 * User-Agent: OtakuBazaar/1.0 (+https://otaku-bazaar.vercel.app; figure-metadata)
 *
 * TODO: Barcode (JAN / EAN-13) lookup is out of scope for now; planned for v2.2.
 */

import { prisma } from '@/lib/prismaClient';

export interface FigureMetadata {
  name: string;
  manufacturer: 'Alter' | 'MegaHouse' | 'Good Smile Company' | 'Kotobukiya' | 'Bandai Spirits' | 'Other';
  scale: '1/4' | '1/6' | '1/7' | '1/8' | 'Non-scale';
  releaseYear?: number;
  originalPriceJPY?: number;
  imageUrl?: string;
  mfcUrl: string;
  mfcItemId: string;
}

export interface IMFCService {
  parseMfcUrl(rawUrl: string): { valid: boolean; itemId?: string; error?: string };
  getFigureMetadata(mfcItemId: string, userIp?: string): Promise<{ success: boolean; data?: FigureMetadata; error?: string }>;
}

// In-memory rate limiting map: ip/user -> timestamp[]
const rateLimitMap = new Map<string, number[]>();
const MAX_REQUESTS_PER_MINUTE = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

/**
 * Validates a MyFigureCollection URL and extracts the numeric item ID.
 * Supports:
 * - https://myfigurecollection.net/item/123456
 * - http://myfigurecollection.net/item/123456
 * - https://www.myfigurecollection.net/item/123456/figure-name
 * - /item/123456
 * - 123456 (direct ID)
 */
export function parseMfcUrl(rawUrl: string): { valid: boolean; itemId?: string; error?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'Please provide a valid MyFigureCollection URL or item ID.' };
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'URL cannot be empty.' };
  }

  // Direct numeric ID
  if (/^\d+$/.test(trimmed)) {
    return { valid: true, itemId: trimmed };
  }

  // Relative path: /item/123456
  const relativeMatch = trimmed.match(/^\/?item\/(\d+)(?:\/.*)?$/i);
  if (relativeMatch && relativeMatch[1]) {
    return { valid: true, itemId: relativeMatch[1] };
  }

  // Full URL: https://(www.)?myfigurecollection.net/item/123456...
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if (host !== 'myfigurecollection.net') {
      return {
        valid: false,
        error: 'Invalid domain: URL must be from myfigurecollection.net (e.g. https://myfigurecollection.net/item/123456).',
      };
    }

    const itemMatch = parsed.pathname.match(/^\/item\/(\d+)(?:\/.*)?$/i);
    if (!itemMatch || !itemMatch[1]) {
      return {
        valid: false,
        error: 'Invalid MFC path: Path must include /item/[id] (e.g. /item/123456).',
      };
    }

    return { valid: true, itemId: itemMatch[1] };
  } catch {
    return { valid: false, error: 'Malformed URL provided.' };
  }
}

/**
 * Maps raw manufacturer text to known canonical dropdown values.
 */
function normalizeManufacturer(raw: string): FigureMetadata['manufacturer'] {
  const lower = raw.toLowerCase();
  if (lower.includes('alter')) return 'Alter';
  if (lower.includes('megahouse') || lower.includes('mega house')) return 'MegaHouse';
  if (lower.includes('good smile') || lower.includes('gsc') || lower.includes('max factory')) return 'Good Smile Company';
  if (lower.includes('kotobukiya')) return 'Kotobukiya';
  if (lower.includes('bandai') || lower.includes('tamashii') || lower.includes('spirit')) return 'Bandai Spirits';
  return 'Other';
}

/**
 * Maps raw scale text to canonical scale format.
 */
function normalizeScale(raw: string): FigureMetadata['scale'] {
  const lower = raw.toLowerCase();
  if (lower.includes('1/4')) return '1/4';
  if (lower.includes('1/6')) return '1/6';
  if (lower.includes('1/7')) return '1/7';
  if (lower.includes('1/8')) return '1/8';
  return 'Non-scale';
}

/**
 * Checks per-user / per-IP rate limiting.
 */
function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return true;
}

export class MFCService implements IMFCService {
  public parseMfcUrl(rawUrl: string) {
    return parseMfcUrl(rawUrl);
  }

  /**
   * Fetches figure metadata from DB cache first, then upstream if not cached.
   * Fails gracefully without throwing uncaught exceptions.
   */
  public async getFigureMetadata(
    mfcItemId: string,
    userIdentifier: string = 'global'
  ): Promise<{ success: boolean; data?: FigureMetadata; error?: string }> {
    // 1. Rate Limit Check
    if (!checkRateLimit(userIdentifier)) {
      return {
        success: false,
        error: 'MFC lookup rate limit reached (max 5 requests per minute). Please enter specs manually or wait a moment.',
      };
    }

    // 2. Check Database Cache
    try {
      const cached = await prisma.mfcCache.findUnique({ where: { mfcItemId } });
      if (cached && cached.data) {
        const parsed = JSON.parse(cached.data) as FigureMetadata;
        return { success: true, data: parsed };
      }
    } catch (dbErr) {
      console.warn('[MFCService] DB cache lookup notice:', dbErr);
    }

    // 3. Server-Side Fetch with Clear User-Agent and Graceful Failure
    const targetUrl = `https://myfigurecollection.net/item/${mfcItemId}`;
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'OtakuBazaar/1.0 (+https://otaku-bazaar.vercel.app; figure-metadata)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        // Fast timeout to prevent blocking UI
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: `MFC item #${mfcItemId} was not found on MyFigureCollection. Please check the ID or enter details manually.`,
          };
        }
        return {
          success: false,
          error: `MyFigureCollection returned status ${response.status}. Please enter specifications manually.`,
        };
      }

      const html = await response.text();

      // Extract details via resilient meta/microdata and HTML regexes
      // Title
      let name = '';
      const ogTitle = html.match(/<meta property=["']og:title["'] content=["']([^"']+)["']/i);
      if (ogTitle && ogTitle[1]) {
        name = ogTitle[1].replace(/\s*-\s*MyFigureCollection.*$/i, '').trim();
      } else {
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          name = titleMatch[1].replace(/\s*-\s*MyFigureCollection.*$/i, '').trim();
        }
      }

      // Image
      let imageUrl: string | undefined;
      const ogImage = html.match(/<meta property=["']og:image["'] content=["']([^"']+)["']/i);
      if (ogImage && ogImage[1]) {
        imageUrl = ogImage[1];
      }

      // Manufacturer: <span class="data-field">Company</span> or regex search
      let rawManufacturer = 'Other';
      const companyMatch =
        html.match(/Company<\/span>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i) ||
        html.match(/Manufacturers?<\/span>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i) ||
        html.match(/brand["']:\s*["']([^"']+)["']/i);
      if (companyMatch && companyMatch[1]) {
        rawManufacturer = companyMatch[1].trim();
      }

      // Scale: 1/4, 1/7, 1/8, Non-scale
      let rawScale = 'Non-scale';
      const scaleMatch =
        html.match(/Scale<\/span>[\s\S]*?<span[^>]*class=["'][^"']*data-value[^"']*["'][^>]*>([^<]+)<\/span>/i) ||
        html.match(/\b(1\/4|1\/6|1\/7|1\/8)\b/i) ||
        name.match(/\b(1\/4|1\/6|1\/7|1\/8)\b/i);
      if (scaleMatch && scaleMatch[1]) {
        rawScale = scaleMatch[1].trim();
      }

      // Release Year
      let releaseYear: number | undefined;
      const dateMatch =
        html.match(/Release date<\/span>[\s\S]*?<a[^>]*>([0-9]{4})<\/a>/i) ||
        html.match(/([0-9]{4})\/[0-9]{2}\/[0-9]{2}/) ||
        html.match(/([0-9]{4})\/[0-9]{2}/);
      if (dateMatch && dateMatch[1]) {
        const yr = parseInt(dateMatch[1], 10);
        if (yr >= 1980 && yr <= 2030) releaseYear = yr;
      }

      // Original Price in JPY: "¥ 15,000" or "15000 JPY"
      let originalPriceJPY: number | undefined;
      const priceMatch =
        html.match(/Price<\/span>[\s\S]*?([0-9,]+)\s*(?:JPY|円|¥)/i) ||
        html.match(/¥\s*([0-9,]+)/i) ||
        html.match(/([0-9,]+)\s*JPY/i);
      if (priceMatch && priceMatch[1]) {
        const cleaned = parseInt(priceMatch[1].replace(/,/g, ''), 10);
        if (cleaned > 0 && cleaned < 1000000) originalPriceJPY = cleaned;
      }

      const metadata: FigureMetadata = {
        name: name || `MFC #${mfcItemId} Collectible`,
        manufacturer: normalizeManufacturer(rawManufacturer),
        scale: normalizeScale(rawScale),
        releaseYear,
        originalPriceJPY,
        imageUrl,
        mfcUrl: targetUrl,
        mfcItemId,
      };

      // 4. Save to Database Cache
      try {
        await prisma.mfcCache.upsert({
          where: { mfcItemId },
          update: { data: JSON.stringify(metadata) },
          create: {
            mfcItemId,
            data: JSON.stringify(metadata),
          },
        });
      } catch (cacheErr) {
        console.warn('[MFCService] Cache write notice:', cacheErr);
      }

      return { success: true, data: metadata };
    } catch (err: unknown) {
      console.warn('[MFCService] Upstream fetch notice:', err);
      return {
        success: false,
        error:
          'Could not reach MyFigureCollection at this time. Please proceed with manual specification entry.',
      };
    }
  }
}

export const mfcService = new MFCService();
