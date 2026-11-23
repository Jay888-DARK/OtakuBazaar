/**
 * @file src/app/twitter-image.tsx
 *
 * Dedicated Twitter / X Large Summary Card (1200x630px).
 * Re-uses the exact high-fidelity OpenGraph card for unified social indexing.
 */

import OpenGraphImage, { size, contentType, alt } from './opengraph-image';

export const runtime = 'nodejs';
export { size, contentType, alt };
export default OpenGraphImage;
