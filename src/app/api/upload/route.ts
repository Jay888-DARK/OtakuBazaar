/**
 * @file src/app/api/upload/route.ts
 *
 * Server-only file upload endpoint for OtakuBazaar.
 * Requires authenticated session. Uploads photographs directly to
 * persistent Cloud Storage (Supabase Storage or Cloudinary) and returns
 * permanent HTTPS image URLs.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { RBACGuard } from '@/infrastructure/security/RBACGuard';
import { CloudStorageService } from '@/infrastructure/services/cloudStorageService';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authUser = await RBACGuard.authenticateAsync(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to upload specimen photographs.' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type') || '';

    // Handle Multipart Form Upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided for upload.' }, { status: 400 });
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size exceeds 5MB limit.' }, { status: 400 });
      }

      const mimeType = file.type || 'image/jpeg';
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await CloudStorageService.uploadImage(buffer, mimeType, `user_${authUser.userId.slice(-6)}`);
      if (!result.success || !result.url) {
        return NextResponse.json(
          { error: result.error || 'Failed to upload photo to cloud storage.' },
          { status: 502 }
        );
      }

      return NextResponse.json({ success: true, url: result.url, provider: result.provider });
    }

    // Handle JSON payload with base64 Data URI
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const dataUri = body.dataUri || body.image;

      if (!dataUri || typeof dataUri !== 'string') {
        return NextResponse.json({ error: 'Missing dataUri in request body.' }, { status: 400 });
      }

      const result = await CloudStorageService.uploadDataUri(dataUri, `user_${authUser.userId.slice(-6)}`);
      if (!result.success || !result.url) {
        return NextResponse.json(
          { error: result.error || 'Failed to upload photo to cloud storage.' },
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
