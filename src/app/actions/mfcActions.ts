/**
 * @file src/app/actions/mfcActions.ts
 * Server action for MyFigureCollection auto-fill
 */

'use server';

import { headers } from 'next/headers';
import { mfcService, type FigureMetadata } from '@/infrastructure/services/mfcService';

export interface MfcAutoFillResponse {
  success: boolean;
  data?: FigureMetadata;
  error?: string;
}

export async function fetchMfcMetadataAction(rawUrl: string): Promise<MfcAutoFillResponse> {
  const parseResult = mfcService.parseMfcUrl(rawUrl);
  if (!parseResult.valid || !parseResult.itemId) {
    return {
      success: false,
      error: parseResult.error || 'Invalid MyFigureCollection URL format.',
    };
  }

  const reqHeaders = await headers();
  const clientIp = reqHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

  return mfcService.getFigureMetadata(parseResult.itemId, clientIp);
}
