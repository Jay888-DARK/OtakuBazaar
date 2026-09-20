/**
 * @file src/app/loading.tsx
 *
 * App-wide suspense boundary loading state.
 * Renders 9 obsidian skeleton cards in a responsive CSS grid.
 */

import React from 'react';
import { CatalogSkeleton } from '@/presentation/components/ui/CatalogSkeleton';

export default function Loading(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-start">
      <CatalogSkeleton count={9} />
    </div>
  );
}
