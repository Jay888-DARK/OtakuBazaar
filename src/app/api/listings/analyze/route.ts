/**
 * @file src/app/api/listings/analyze/route.ts
 *
 * Server-only API endpoint for AI photo-to-listing analysis.
 * Accepts 1-5 images (JPG, PNG, WebP up to 5MB each).
 * Requires authenticated session, enforces rate limits, processes multiple images in parallel,
 * and calls Gemini Vision API (or Anthropic fallback) with strict structured JSON output.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { RBACGuard } from '@/infrastructure/security/RBACGuard';
import {
  validateAiVisionResponse,
  normalizeDraftItem,
  deduplicateDraftItems,
  SUPPORTED_CATEGORIES,
  SUPPORTED_FRANCHISES,
  SUPPORTED_MANUFACTURERS,
  type NormalizedDraftItem,
} from '@/domain/services/listingVisionService';

// ---------------------------------------------------------------------------
// Rate Limiter (In-Memory per user, 10/hour, 40/day)
// ---------------------------------------------------------------------------

interface UserQuota {
  hourlyCount: number;
  hourlyResetAt: number;
  dailyCount: number;
  dailyResetAt: number;
}

const userQuotaMap = new Map<string, UserQuota>();

function checkAndConsumeRateLimit(userId: string): {
  allowed: boolean;
  remainingHourly: number;
  error?: string;
} {
  const now = Date.now();
  let quota = userQuotaMap.get(userId);

  if (!quota) {
    quota = {
      hourlyCount: 0,
      hourlyResetAt: now + 60 * 60 * 1000,
      dailyCount: 0,
      dailyResetAt: now + 24 * 60 * 60 * 1000,
    };
    userQuotaMap.set(userId, quota);
  }

  // Reset hourly window
  if (now > quota.hourlyResetAt) {
    quota.hourlyCount = 0;
    quota.hourlyResetAt = now + 60 * 60 * 1000;
  }

  // Reset daily window
  if (now > quota.dailyResetAt) {
    quota.dailyCount = 0;
    quota.dailyResetAt = now + 24 * 60 * 60 * 1000;
  }

  const MAX_HOURLY = 10;
  const MAX_DAILY = 40;

  if (quota.hourlyCount >= MAX_HOURLY) {
    const minutesLeft = Math.ceil((quota.hourlyResetAt - now) / 60000);
    return {
      allowed: false,
      remainingHourly: 0,
      error: `Hourly AI photo analysis limit reached (10/hr). Resets in ${minutesLeft} minute(s).`,
    };
  }

  if (quota.dailyCount >= MAX_DAILY) {
    const hoursLeft = Math.ceil((quota.dailyResetAt - now) / 3600000);
    return {
      allowed: false,
      remainingHourly: 0,
      error: `Daily AI photo analysis limit reached (40/day). Resets in ${hoursLeft} hour(s).`,
    };
  }

  quota.hourlyCount += 1;
  quota.dailyCount += 1;

  return {
    allowed: true,
    remainingHourly: MAX_HOURLY - quota.hourlyCount,
  };
}

// ---------------------------------------------------------------------------
// Concurrency Runner Helper (Max 3 parallel tasks)
// ---------------------------------------------------------------------------

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      const item = items[idx];
      if (item !== undefined) {
        results[idx] = await fn(item, idx);
      }
    }
  });

  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// AI Prompt Template
// ---------------------------------------------------------------------------

const SYSTEM_INSTRUCTION = `
You are the OtakuBazaar Archival Catalog AI assistant.
Your task is to analyze user-submitted photographs of anime merchandise, Japanese figures, manga books/stacks, or physical price lists.

For each item detected in the photograph, extract:
- title: string (specific character name, scale, and version, e.g. "Satoru Gojo Shibuya Incident 1/7 Scale Figure" or "Chainsaw Man")
- franchise: string or null (e.g. ${SUPPORTED_FRANCHISES.join(', ')})
- category: string or null (must closely match one of: ${SUPPORTED_CATEGORIES.join(', ')})
- publisher_or_manufacturer: string or null (e.g. ${SUPPORTED_MANUFACTURERS.join(', ')}, or publisher like Shueisha, Kodansha, Viz)
- volume_or_edition: string or null (e.g. "Vol 1", "Vol 1-12", "Deluxe Edition", "First Print")
- language: string or null (e.g. "Japanese", "English")
- condition_grade: string or null (e.g. "MISB", "BIB", "Cabinet Displayed", "Mint in Sealed Box", or null if unclear)
- price_inr: number or null (ONLY if the image contains a handwritten or printed price tag/list in INR or JPY converted. Otherwise null)
- description: string or null (brief 1-2 sentence curatorial description)
- confidence: object with numerical score from 0.0 to 1.0 for each field: { title, franchise, category, publisher_or_manufacturer, volume_or_edition, condition_grade, price_inr }

RULES:
1. Return strict JSON array of objects. Never wrap with conversational prose.
2. If multiple items appear (e.g. a stack of manga or multiple figures), return one object per item up to 20 items.
3. NEVER invent values. If a field is not visible in the image, output null and a low confidence score (< 0.5).
4. If the image is unreadable or not anime/manga merchandise, return an empty array [].
`;

// ---------------------------------------------------------------------------
// Image Extraction via Google Gemini Vision API
// ---------------------------------------------------------------------------

const USER_FRIENDLY_ERROR = "We couldn't read your photo. Please enter the details yourself.";

async function callGeminiVision(
  apiKey: string,
  base64Data: string,
  mimeType: string
): Promise<string> {
  const models = [
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: `${SYSTEM_INSTRUCTION}\nExtract all visible collectible items from this image as a JSON array:` },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const json = await response.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return rawText;
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[AI Vision] Gemini model ${model} attempt failed:`, lastError.message);
    }
  }

  throw lastError || new Error('No response generated by Gemini Vision');
}

// ---------------------------------------------------------------------------
// Fallback: Anthropic Claude Vision API
// ---------------------------------------------------------------------------

async function callAnthropicVision(
  apiKey: string,
  base64Data: string,
  mimeType: string
): Promise<string> {
  const url = 'https://api.anthropic.com/v1/messages';
  const payload = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 3000,
    temperature: 0.1,
    system: SYSTEM_INSTRUCTION,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64Data,
            },
          },
          {
            type: 'text',
            text: 'Extract all visible collectible items from this image as a JSON array.',
          },
        ],
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  const text = json.content?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Anthropic Vision');
  }
  return text;
}

// ---------------------------------------------------------------------------
// Route Handler: POST /api/listings/analyze
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // 1. Authenticate user
    const authUser = await RBACGuard.authenticateAsync(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to use AI photo auto-fill.' },
        { status: 401 }
      );
    }

    // 2. Rate limit verification
    const rateCheck = checkAndConsumeRateLimit(authUser.userId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.error || 'Rate limit exceeded.' },
        { status: 429 }
      );
    }

    // 3. Resolve API Key (prefer GOOGLE_API_KEY and ANTHROPIC_API_KEY)
    const googleApiKey =
      process.env.GOOGLE_API_KEY ||
      process.env.Google_API_Key ||
      process.env.GEMINI_API_KEY;

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!googleApiKey && !anthropicApiKey) {
      console.error('[AI Vision] Error: Missing AI vision provider key. Set GOOGLE_API_KEY or ANTHROPIC_API_KEY.');
      return NextResponse.json(
        {
          success: false,
          error: USER_FRIENDLY_ERROR,
        },
        { status: 503 }
      );
    }

    // 4. Parse incoming payload (supports both JSON body with base64 data URIs or FormData)
    interface ParsedImage {
      base64Data: string;
      mimeType: string;
      dataUri: string;
    }

    const imagesToProcess: ParsedImage[] = [];
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      const rawImages: string[] = Array.isArray(body.images)
        ? body.images
        : body.image
          ? [body.image]
          : [];

      if (rawImages.length === 0) {
        console.warn('[AI Vision] Validation error: No images provided in payload.');
        return NextResponse.json(
          { success: false, error: USER_FRIENDLY_ERROR },
          { status: 400 }
        );
      }

      if (rawImages.length > 5) {
        console.warn('[AI Vision] Validation error: Exceeded 5 images limit.');
        return NextResponse.json(
          { success: false, error: USER_FRIENDLY_ERROR },
          { status: 400 }
        );
      }

      for (const uri of rawImages) {
        const match = uri.match(/^data:(image\/[a-zA-Z0-9.+]+);base64,(.+)$/);
        if (!match || !match[1] || !match[2]) {
          console.warn('[AI Vision] Validation error: Malformed data URI format.');
          return NextResponse.json(
            { success: false, error: USER_FRIENDLY_ERROR },
            { status: 400 }
          );
        }

        const mime = match[1].toLowerCase();
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(mime)) {
          console.warn(`[AI Vision] Validation error: Unsupported image MIME type: ${mime}`);
          return NextResponse.json(
            { success: false, error: USER_FRIENDLY_ERROR },
            { status: 400 }
          );
        }

        const b64 = match[2];
        const approxBytes = (b64.length * 3) / 4;
        if (approxBytes > 5 * 1024 * 1024) {
          console.warn(`[AI Vision] Validation error: Image exceeds 5MB size limit (~${approxBytes} bytes).`);
          return NextResponse.json(
            { success: false, error: USER_FRIENDLY_ERROR },
            { status: 400 }
          );
        }

        imagesToProcess.push({
          base64Data: b64,
          mimeType: mime === 'image/jpg' ? 'image/jpeg' : mime,
          dataUri: uri,
        });
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const files = formData.getAll('images') as File[];

      if (files.length === 0) {
        console.warn('[AI Vision] Validation error: No image files provided in form-data.');
        return NextResponse.json(
          { success: false, error: USER_FRIENDLY_ERROR },
          { status: 400 }
        );
      }

      if (files.length > 5) {
        console.warn('[AI Vision] Validation error: Exceeded 5 files limit in form-data.');
        return NextResponse.json(
          { success: false, error: USER_FRIENDLY_ERROR },
          { status: 400 }
        );
      }

      for (const file of files) {
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type.toLowerCase())) {
          console.warn(`[AI Vision] Validation error: Unsupported file type: ${file.name} (${file.type})`);
          return NextResponse.json(
            { success: false, error: USER_FRIENDLY_ERROR },
            { status: 400 }
          );
        }

        if (file.size > 5 * 1024 * 1024) {
          console.warn(`[AI Vision] Validation error: File ${file.name} exceeds 5MB size limit (${file.size} bytes).`);
          return NextResponse.json(
            { success: false, error: USER_FRIENDLY_ERROR },
            { status: 400 }
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const b64 = buffer.toString('base64');
        const mime = file.type === 'image/jpg' ? 'image/jpeg' : file.type;

        imagesToProcess.push({
          base64Data: b64,
          mimeType: mime,
          dataUri: `data:${mime};base64,${b64}`,
        });
      }
    } else {
      console.warn(`[AI Vision] Validation error: Unsupported content type: ${contentType}`);
      return NextResponse.json(
        { success: false, error: USER_FRIENDLY_ERROR },
        { status: 400 }
      );
    }

    // 5. Parallel Processing with Concurrency Limit 3
    const extractedDrafts: NormalizedDraftItem[] = [];

    const perImageResults = await runWithConcurrency(
      imagesToProcess,
      3,
      async (img, index) => {
        try {
          let rawJson = '';
          if (googleApiKey) {
            rawJson = await callGeminiVision(googleApiKey, img.base64Data, img.mimeType);
          } else if (anthropicApiKey) {
            rawJson = await callAnthropicVision(anthropicApiKey, img.base64Data, img.mimeType);
          }

          const parsed = validateAiVisionResponse(rawJson);
          if (parsed.success && parsed.items.length > 0) {
            return parsed.items.map((item) =>
              normalizeDraftItem(item, index, img.dataUri)
            );
          }
          return [];
        } catch (err: unknown) {
          console.warn(`[AI Vision] Error analyzing image #${index + 1}:`, err);
          return [];
        }
      }
    );

    for (const batch of perImageResults) {
      extractedDrafts.push(...batch);
    }

    // 6. Deduplicate by title + volume_or_edition
    const dedupedDrafts = deduplicateDraftItems(extractedDrafts);

    // 7. Cap at maximum 20 items per request
    const MAX_ITEMS = 20;
    const isTruncated = dedupedDrafts.length > MAX_ITEMS;
    const finalDrafts = dedupedDrafts.slice(0, MAX_ITEMS);

    const durationMs = Date.now() - startTime;

    // 8. Log usage for cost and audit monitoring
    console.info(
      JSON.stringify({
        tag: 'AI_VISION_USAGE',
        userId: authUser.userId,
        userEmail: authUser.email,
        imageCount: imagesToProcess.length,
        itemsDetected: dedupedDrafts.length,
        itemsReturned: finalDrafts.length,
        durationMs,
        provider: googleApiKey ? 'Google Gemini' : 'Anthropic Claude',
        timestamp: new Date().toISOString(),
      })
    );

    if (finalDrafts.length === 0) {
      return NextResponse.json({
        success: false,
        error: USER_FRIENDLY_ERROR,
        drafts: [],
        remainingHourlyQuota: rateCheck.remainingHourly,
      });
    }

    return NextResponse.json({
      success: true,
      drafts: finalDrafts,
      totalFound: dedupedDrafts.length,
      isTruncated,
      remainingHourlyQuota: rateCheck.remainingHourly,
      notice: isTruncated
        ? 'Found more than 20 items. Showing the first 20; please upload additional items separately.'
        : undefined,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error during AI photo analysis.';
    console.error('[AI Vision Server Error Details]:', errorMsg, err);
    return NextResponse.json(
      {
        success: false,
        error: USER_FRIENDLY_ERROR,
      },
      { status: 500 }
    );
  }
}
