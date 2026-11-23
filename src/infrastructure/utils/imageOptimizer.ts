/**
 * @file src/infrastructure/utils/imageOptimizer.ts
 *
 * Production image transformation helper for OtakuBazaar.
 * Automatically injects optimal delivery parameters (f_auto, q_auto, w_800)
 * into Cloudinary URLs while preserving local or external asset URLs.
 */

export function optimizeImageUrl(url: string | null | undefined, width = 800): string {
  if (!url || typeof url !== 'string') {
    return '/otakubazaar-logo.png';
  }

  // Optimize Cloudinary URLs
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (url.includes('f_auto') || url.includes('q_auto')) {
      return url;
    }
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }

  return url;
}
