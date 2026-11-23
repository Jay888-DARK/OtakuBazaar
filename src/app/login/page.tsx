'use client';

/**
 * @file src/app/login/page.tsx
 *
 * Collector Vault Authentication Portal for OtakuBazaar.
 * Strictly adheres to the monochrome archival vault design tokens:
 * - Canvas: #080808, Card: #0C0C0C, Borders: #1F1F1F / #161616.
 * - Typography: Playfair editorial serif for titles, Plus Jakarta Sans for inputs and body copy.
 * - Zero radial glow gradients, zero drop shadows, zero soft rounded borders.
 * - Dynamic callbackUrl preservation (e.g. redirecting straight to /sell after authentication).
 * - Descriptive inline alerts for OAuth and credentials errors.
 */

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get('callbackUrl') || '/vault';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Map NextAuth URL error query codes to human-readable archival warnings
  let activeError = errorMessage;
  if (!activeError && urlError) {
    if (urlError === 'OAuthSignin' || urlError === 'OAuthCallback') {
      activeError = 'OAuth verification failed or was interrupted. Please ensure OAuth credentials and callback URLs are configured.';
    } else if (urlError === 'OAuthCreateAccount') {
      activeError = 'Could not create collector account with third-party OAuth provider.';
    } else if (urlError === 'Configuration') {
      activeError = 'Vault authentication provider misconfiguration. Please sign in with email and passphrase.';
    } else if (urlError === 'AccessDenied') {
      activeError = 'Access denied by authentication server.';
    } else if (urlError === 'CredentialsSignin') {
      activeError = 'Invalid collector email or vault passphrase.';
    } else {
      activeError = `Authentication error [${urlError}]. Please retry with email.`;
    }
  }

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setErrorMessage('Invalid collector credentials or account authentication error.');
      } else if (res?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage('A network error occurred while reaching the vault authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'discord') => {
    setIsLoading(true);
    signIn(provider, { callbackUrl }).catch(() => {
      setErrorMessage(`Failed to initiate ${provider} authentication.`);
      setIsLoading(false);
    });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-[#080808] px-4 py-12 select-none font-sans">
      {/* The Vault Authentication Card */}
      <div className="relative w-full max-w-md bg-[#0C0C0C] border border-[#1F1F1F] p-8 z-10 rounded-none">
        {/* Header & Typography */}
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold block mb-2">
            ARCHIVAL ACCESS // VERIFIED IDENTITY
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-[0.06em] text-[#F2EFE9]">
            Collector Vault
          </h1>
          <p className="text-[12px] text-[#8E8E8E] mt-2 font-normal leading-relaxed">
            Secure authentication for high-ticket collectible acquisition and consignment.
          </p>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="mb-5 p-3 bg-[#180A0A] border border-[#7F1D1D] text-[#F87171] text-xs text-center font-medium uppercase tracking-wider">
            [ ERROR: {activeError} ]
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-[0.14em] text-[#888888] font-medium block mb-1.5">
              Collector Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collector@otakubazaar.com"
              className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3.5 py-2.5 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none transition-colors font-sans"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-[0.14em] text-[#888888] font-medium block mb-1.5">
              Vault Passphrase *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3.5 py-2.5 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none transition-colors font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#F2EFE9] hover:bg-[#EAE6DF] text-[#080808] border border-[#F2EFE9] font-sans font-semibold text-[11px] uppercase tracking-[0.18em] transition-colors cursor-pointer rounded-none disabled:opacity-50 mt-2"
          >
            {isLoading ? '[ AUTHENTICATING... ]' : '[ AUTHENTICATE WITH EMAIL ]'}
          </button>
        </form>

        {/* Understated Hairline Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#161616]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
            <span className="bg-[#0C0C0C] px-3 text-[#777777] font-semibold">OR CONTINUE WITH</span>
          </div>
        </div>

        {/* Monochrome Social Auth Cluster */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
            className="w-full py-2.5 bg-[#080808] hover:bg-[#161616] border border-[#1F1F1F] hover:border-[#3A3A3A] text-xs font-semibold uppercase tracking-[0.14em] text-[#CCCCCC] transition-colors cursor-pointer rounded-none text-center disabled:opacity-50 font-sans"
          >
            [ CONTINUE WITH GOOGLE ]
          </button>

          <button
            type="button"
            onClick={() => handleOAuthLogin('discord')}
            disabled={isLoading}
            className="w-full py-2.5 bg-[#080808] hover:bg-[#161616] border border-[#1F1F1F] hover:border-[#3A3A3A] text-xs font-semibold uppercase tracking-[0.14em] text-[#CCCCCC] transition-colors cursor-pointer rounded-none text-center disabled:opacity-50 font-sans"
          >
            [ CONTINUE WITH DISCORD ]
          </button>
        </div>

        {/* Security Micro-Footer */}
        <div className="mt-6 pt-4 border-t border-[#161616] text-center">
          <p className="text-[10px] text-[#777777] tracking-[0.18em] font-medium uppercase font-sans">
            256-BIT ENCRYPTED SESSION • SECURE ESCROW PROTECTION
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-5rem)] bg-[#080808] flex items-center justify-center font-sans text-xs uppercase tracking-widest text-[#777777]">
          [ INITIALIZING VAULT AUTHENTICATION... ]
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
