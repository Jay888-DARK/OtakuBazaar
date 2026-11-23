/**
 * @file src/app/loading.tsx
 *
 * App-wide suspense boundary loading state for OtakuBazaar.
 * Adheres strictly to dark archival vault aesthetic with hairline borders and sharp edges.
 */

import React from 'react';
import { CatalogSkeleton } from '@/presentation/components/ui/CatalogSkeleton';

export default function Loading(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F2EFE9] flex flex-col justify-start">
      <CatalogSkeleton count={9} />
    </div>
  );
}
