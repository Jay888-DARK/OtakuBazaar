/**
 * @file src/infrastructure/services/cloudStorageService.ts
 *
 * Cloud Object Storage Service for OtakuBazaar.
 * Stores uploaded collectible photographs in public Cloud Storage
 * (Supabase Storage or Cloudinary) and stores purchase invoices
 * in a private Supabase Storage bucket accessible only via server-side RBAC.
 */

import crypto from 'crypto';

export interface UploadResult {
  success: boolean;
  url?: string;
  provider?: 'SUPABASE' | 'CLOUDINARY';
  error?: string;
}

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const INVOICE_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

function getExtensionForMime(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('webp')) return 'webp';
  return 'jpg';
}

export class CloudStorageService {
  /**
   * Uploads a public collectible photograph to Supabase Storage or Cloudinary.
   */
  public static async uploadImage(
    buffer: Buffer,
    mimeType: string,
    filenamePrefix = 'lot'
  ): Promise<UploadResult> {
    if (!IMAGE_MIME_TYPES.has(mimeType.toLowerCase())) {
      return {
        success: false,
        error: 'Unsupported image format. Only JPEG, PNG, and WebP images are allowed.',
      };
    }

    const ext = getExtensionForMime(mimeType);
    const filename = `${filenamePrefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;

    // 1. Supabase Storage Provider (Public bucket for listing photos)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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

    // 2. Cloudinary Provider
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

    return {
      success: false,
      error:
        'Cloud storage provider not configured. Set SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY (or Cloudinary credentials) in your environment variables.',
    };
  }

  /**
   * Uploads a private invoice proof (PDF, JPEG, PNG, or WebP) to a private Supabase bucket.
   * Returns an internal `private://supabase/<bucket>/<filename>` reference (never a public URL).
   */
  public static async uploadPrivateFile(
    buffer: Buffer,
    mimeType: string,
    filenamePrefix = 'invoice'
  ): Promise<UploadResult> {
    const normalizedMime = mimeType.toLowerCase();
    if (!INVOICE_MIME_TYPES.has(normalizedMime)) {
      return {
        success: false,
        error: 'Unsupported invoice format. Only PDF, JPEG, PNG, and WebP files are allowed.',
      };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const privateBucket = process.env.SUPABASE_INVOICES_BUCKET || 'private-invoices';

    if (!supabaseUrl || !serviceRoleKey) {
      return {
        success: false,
        error:
          'Private invoice storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables.',
      };
    }

    const ext = getExtensionForMime(normalizedMime);
    const filename = `${filenamePrefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const cleanBaseUrl = supabaseUrl.replace(/\/$/, '');
    const uploadEndpoint = `${cleanBaseUrl}/storage/v1/object/${privateBucket}/${filename}`;

    try {
      const uploadRes = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': normalizedMime,
          'x-upsert': 'true',
        },
        body: new Uint8Array(buffer),
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        return {
          success: false,
          error: `Private invoice upload failed (${uploadRes.status}): ${errText}`,
        };
      }

      return {
        success: true,
        url: `private://supabase/${privateBucket}/${filename}`,
        provider: 'SUPABASE',
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Private invoice upload failed.',
      };
    }
  }

  /**
   * Downloads a private invoice file from Supabase private storage using the service role key.
   */
  public static async fetchPrivateFile(
    privateRef: string
  ): Promise<{ success: true; buffer: Buffer; contentType: string } | { success: false; error: string }> {
    const match = privateRef.match(/^private:\/\/supabase\/([^/]+)\/(.+)$/);
    if (!match || !match[1] || !match[2]) {
      return { success: false, error: 'Invalid private storage reference.' };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return { success: false, error: 'Private storage credentials are not configured.' };
    }

    const cleanBaseUrl = supabaseUrl.replace(/\/$/, '');
    const bucket = match[1];
    const objectPath = match[2];
    const endpoint = `${cleanBaseUrl}/storage/v1/object/${bucket}/${objectPath}`;

    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
      });

      if (!res.ok) {
        return { success: false, error: `Failed to retrieve private invoice (${res.status}).` };
      }

      const arrayBuf = await res.arrayBuffer();
      const contentType = res.headers.get('content-type') || 'application/octet-stream';
      return {
        success: true,
        buffer: Buffer.from(arrayBuf),
        contentType,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch private invoice.',
      };
    }
  }

  /**
   * Parses a base64 Data URI and uploads to persistent storage.
   */
  public static async uploadDataUri(dataUri: string, prefix = 'lot'): Promise<UploadResult> {
    const match = dataUri.match(/^data:((?:image\/[a-zA-Z0-9.+]+)|(?:application\/pdf));base64,(.+)$/);
    if (!match || !match[1] || !match[2]) {
      return {
        success: false,
        error: 'Invalid data URI format.',
      };
    }

    const mimeType = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (mimeType === 'application/pdf') {
      return this.uploadPrivateFile(buffer, mimeType, prefix);
    }
    return this.uploadImage(buffer, mimeType, prefix);
  }
}
