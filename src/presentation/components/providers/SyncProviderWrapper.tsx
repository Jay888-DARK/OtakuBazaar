'use client';

/**
 * @file src/presentation/components/providers/SyncProviderWrapper.tsx
 *
 * Client Component wrapper for SyncProvider.
 * Next.js App Router requires "use client" at the boundary between
 * Server and Client Components. This thin wrapper lets the root layout
 * (Server Component) include the SyncProvider (Client Component)
 * without making the entire layout a Client Component.
 */

import React, { type ReactNode } from 'react';
import { SyncProvider } from '@/presentation/components/providers/SyncProvider';

/**
 * Default WebSocket configuration.
 * In production, source these from environment variables.
 */
const DEFAULT_WS_CONFIG = {
  url: process.env['NEXT_PUBLIC_WS_URL'] ?? 'ws://localhost:3001/ws',
  authToken: 'dev-token-placeholder', // Replace with real auth in production
} as const;

/** Props for the SyncProviderWrapper. */
interface SyncProviderWrapperProps {
  readonly children: ReactNode;
}

/**
 * Client-side wrapper that initializes the SyncProvider with default config.
 * Place at the app root (inside layout.tsx) to enable multi-window sync.
 *
 * @param props - Wrapper props containing children.
 * @returns The SyncProvider wrapping children.
 */
export function SyncProviderWrapper({ children }: SyncProviderWrapperProps): React.JSX.Element {
  return (
    <SyncProvider wsConfig={DEFAULT_WS_CONFIG}>
      {children}
    </SyncProvider>
  );
}
