/**
 * @file src/app/api/upload/route.ts
 *
 * Server-only file upload endpoint for OtakuBazaar.
 * Requires authenticated session.
 * - `purpose=photo` (default): Uploads listing photos (JPEG/PNG/WebP, <= 4MB) to public Cloud Storage (Supabase Storage or Cloudinary).
 * - `purpose=invoice`: Uploads purchase invoices (PDF/JPEG/PNG/WebP, <= 4MB) to private Supabase Storage (`private://...`).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { RBACGuard } from '@/infrastructure/security/RBACGuard';
import { CloudStorageService } from '@/infrastructure/services/cloudStorageService';

// Keep under Vercel's 4.5MB serverless request body limit
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authUser = await RBACGuard.authenticateAsync(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to upload files.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const purpose = searchParams.get('purpose') === 'invoice' ? 'invoice' : 'photo';
    const contentType = request.headers.get('content-type') || '';

    // Handle Multipart Form Upload (recommended to respect Vercel's 4.5MB limit)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const formPurpose = formData.get('purpose') === 'invoice' ? 'invoice' : purpose;

      if (!file) {
        return NextResponse.json({ error: 'No file provided for upload.' }, { status: 400 });
      }

      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: 'File size exceeds 4MB limit for serverless upload.' },
          { status: 413 }
        );
      }

      const mimeType = file.type || 'image/jpeg';
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const prefix = `${formPurpose}_${authUser.userId.slice(-6)}`;

      const result =
        formPurpose === 'invoice'
          ? await CloudStorageService.uploadPrivateFile(buffer, mimeType, prefix)
          : await CloudStorageService.uploadImage(buffer, mimeType, prefix);

      if (!result.success || !result.url) {
        return NextResponse.json(
          { error: result.error || 'Failed to upload file to cloud storage.' },
          { status: 502 }
        );
      }

      return NextResponse.json({ success: true, url: result.url, provider: result.provider });
    }

    // Handle JSON payload with base64 Data URI
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const dataUri = body.dataUri || body.image;
      const bodyPurpose = body.purpose === 'invoice' ? 'invoice' : purpose;

      if (!dataUri || typeof dataUri !== 'string') {
        return NextResponse.json({ error: 'Missing dataUri in request body.' }, { status: 400 });
      }

      if (Buffer.byteLength(dataUri, 'utf8') > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: 'Payload size exceeds 4MB limit for serverless upload.' },
          { status: 413 }
        );
      }

      const prefix = `${bodyPurpose}_${authUser.userId.slice(-6)}`;
      let result;
      if (bodyPurpose === 'invoice') {
        const match = dataUri.match(/^data:((?:image\/[a-zA-Z0-9.+]+)|(?:application\/pdf));base64,(.+)$/);
        if (!match || !match[1] || !match[2]) {
          return NextResponse.json({ error: 'Invalid invoice data URI format.' }, { status: 400 });
        }
        result = await CloudStorageService.uploadPrivateFile(
          Buffer.from(match[2], 'base64'),
          match[1],
          prefix
        );
      } else {
        result = await CloudStorageService.uploadDataUri(dataUri, prefix);
      }

      if (!result.success || !result.url) {
        return NextResponse.json(
          { error: result.error || 'Failed to upload file to cloud storage.' },
          { status: 502 }
        );
      }

      return NextResponse.json({ success: true, url: result.url, provider: result.provider });
    }

    return NextResponse.json({ error: 'Unsupported Content-Type.' }, { status: 400 });
  } catch (err: unknown) {
    console.error('[Upload API Exception]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal upload server error.' },
      { status: 500 }
    );
  }
}
