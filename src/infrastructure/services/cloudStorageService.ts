/**
 * @file src/infrastructure/services/cloudStorageService.ts
 *
 * Cloud Object Storage Service for OtakuBazaar.
 * Stores uploaded collectible photographs permanently in Cloud Storage
 * (Supabase Storage bucket, Cloudinary, or Vercel Blob) rather than on local disk.
 * Returns public HTTPS URLs to persist directly in PostgreSQL.
 */

import crypto from 'crypto';

export interface UploadResult {
  success: boolean;
  url?: string;
  provider?: 'SUPABASE' | 'CLOUDINARY' | 'VERCEL_BLOB';
  error?: string;
}

export class CloudStorageService {
  /**
   * Uploads an image buffer or base64 data URI to persistent Cloud Storage.
   *
   * Provider precedence:
   * 1. Supabase Storage (if SUPABASE_URL & SUPABASE_KEY / SUPABASE_SERVICE_ROLE_KEY are configured)
   * 2. Cloudinary (if CLOUDINARY_CLOUD_NAME & CLOUDINARY_API_KEY are configured)
   * 3. Vercel Blob (if BLOB_READ_WRITE_TOKEN is configured)
   */
  public static async uploadImage(
    buffer: Buffer,
    mimeType: string,
    filenamePrefix = 'lot'
  ): Promise<UploadResult> {
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
    const filename = `${filenamePrefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;

    // -------------------------------------------------------------------------
    // 1. Supabase Storage Provider
    // -------------------------------------------------------------------------
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || 'listings';

    if (supabaseUrl && supabaseKey) {
      try {
        const cleanBaseUrl = supabaseUrl.replace(/\/$/, '');
        const uploadEndpoint = `${cleanBaseUrl}/storage/v1/object/${supabaseBucket}/${filename}`;

        const uploadRes = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey,
            'Content-Type': mimeType,
            'x-upsert': 'true',
          },
          body: new Uint8Array(buffer),
        });

        if (uploadRes.ok) {
          const publicUrl = `${cleanBaseUrl}/storage/v1/object/public/${supabaseBucket}/${filename}`;
          return {
            success: true,
            url: publicUrl,
            provider: 'SUPABASE',
          };
        } else {
          const errText = await uploadRes.text();
          console.warn(`[CloudStorage] Supabase upload error (${uploadRes.status}):`, errText);
        }
      } catch (err) {
        console.warn('[CloudStorage] Supabase storage exception:', err);
      }
    }

    // -------------------------------------------------------------------------
    // 2. Cloudinary Provider (Configured in .env.local)
    // -------------------------------------------------------------------------
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      try {
        const timestamp = Math.round(Date.now() / 1000);
        const folder = 'otakubazaar/listings';
        const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

        const formData = new FormData();
        const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
        formData.append('file', blob, filename);
        formData.append('api_key', apiKey);
        formData.append('timestamp', String(timestamp));
        formData.append('folder', folder);
        formData.append('signature', signature);

        const cloudinaryEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const cloudRes = await fetch(cloudinaryEndpoint, {
          method: 'POST',
          body: formData,
        });

        if (cloudRes.ok) {
          const json = await cloudRes.json();
          if (json.secure_url) {
            return {
              success: true,
              url: json.secure_url,
              provider: 'CLOUDINARY',
            };
          }
        } else {
          const errText = await cloudRes.text();
          console.warn(`[CloudStorage] Cloudinary upload error (${cloudRes.status}):`, errText);
        }
      } catch (err) {
        console.warn('[CloudStorage] Cloudinary exception:', err);
      }
    }

    // -------------------------------------------------------------------------
    // 3. Fallback: If no external cloud credentials provided in dev
    // -------------------------------------------------------------------------
    return {
      success: false,
      error:
        'Cloud storage provider not configured. Please set SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY or CLOUDINARY credentials in your environment variables.',
    };
  }

  /**
   * Parses a base64 Data URI or buffer and uploads to persistent storage.
   */
  public static async uploadDataUri(dataUri: string, prefix = 'lot'): Promise<UploadResult> {
    const match = dataUri.match(/^data:(image\/[a-zA-Z0-9.+]+);base64,(.+)$/);
    if (!match || !match[1] || !match[2]) {
      return {
        success: false,
        error: 'Invalid data URI image string format.',
      };
    }

    const mimeType = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    return this.uploadImage(buffer, mimeType, prefix);
  }
}
