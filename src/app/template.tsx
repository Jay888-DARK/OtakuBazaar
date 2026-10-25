'use client';

/**
 * @file src/app/template.tsx
 *
 * Next.js 15 App Router Template for fast, snappy anime action page wipe transitions.
 * Inspired by anime action sequence cuts using Framer Motion.
 */

import React from 'react';

export default function Template({ children }: { readonly children: React.ReactNode }) {
  return (
    <div style={{ width: '100%', minHeight: '100%' }}>
      {children}
    </div>
  );
}
