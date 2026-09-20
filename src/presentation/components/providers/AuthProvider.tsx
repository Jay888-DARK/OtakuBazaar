'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';

/**
 * @file src/presentation/components/providers/AuthProvider.tsx
 *
 * Client session provider wrapper for NextAuth.js.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export default AuthProvider;
