'use client';

/**
 * @file src/app/template.tsx
 *
 * Next.js 15 App Router Template for fast, snappy anime action page wipe transitions.
 * Inspired by anime action sequence cuts using Framer Motion.
 */

import React from 'react';
import { motion } from 'framer-motion';

export default function Template({ children }: { readonly children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.99, y: -10 }}
      transition={{
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1], // Snappy anime action cut curve
      }}
      style={{ width: '100%', minHeight: '100%' }}
    >
      {children}
    </motion.div>
  );
}
