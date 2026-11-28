'use client';

/**
 * @file src/app/login/page.tsx
 *
 * Collector Vault Authentication Portal for OtakuBazaar.
 * OAuth-only sign-in (Google and Discord).
 */

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

function LoginForm(): React.JSX.Element {
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get('callbackUrl') || '/vault';
  const urlError = searchParams.get('error');

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
      activeError = 'Authentication provider misconfiguration. Please contact support.';
    } else if (urlError === 'AccessDenied') {
      activeError = 'Access denied by authentication server.';
    } else {
      activeError = `Authentication error (${urlError}). Please try again.`;
    }
  }

  const handleOAuthLogin = (provider: 'google' | 'discord') => {
    setIsLoading(true);
    setErrorMessage(null);
    signIn(provider, { callbackUrl }).catch(() => {
      setErrorMessage(`Failed to initiate ${provider} authentication.`);
      setIsLoading(false);
    });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-[#080808] px-4 py-12 select-none font-sans">
      <div className="relative w-full max-w-md bg-[#0C0C0C] border border-[#1F1F1F] p-8 z-10 rounded-none">
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold block mb-2">
            ARCHIVAL ACCESS • VERIFIED IDENTITY
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-[0.06em] text-[#F2EFE9]">
            Collector Vault
          </h1>
          <p className="text-[12px] text-[#8E8E8E] mt-2 font-normal leading-relaxed">
            Sign in with your verified Google or Discord account to buy or sell collectibles.
          </p>
        </div>

        {activeError && (
          <div className="mb-5 p-3 bg-[#180A0A] border border-[#7F1D1D] text-[#F87171] text-xs text-center font-medium uppercase tracking-wider">
            {activeError}
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
            className="w-full py-3 bg-[#F2EFE9] hover:bg-[#EAE6DF] border border-[#F2EFE9] text-xs font-semibold uppercase tracking-[0.14em] text-[#080808] transition-colors cursor-pointer rounded-none text-center disabled:opacity-50 font-sans"
          >
            {isLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <button
            type="button"
            onClick={() => handleOAuthLogin('discord')}
            disabled={isLoading}
            className="w-full py-3 bg-[#080808] hover:bg-[#161616] border border-[#1F1F1F] hover:border-[#3A3A3A] text-xs font-semibold uppercase tracking-[0.14em] text-[#CCCCCC] transition-colors cursor-pointer rounded-none text-center disabled:opacity-50 font-sans"
          >
            Continue with Discord
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-[#161616] text-center">
          <p className="text-[10px] text-[#777777] tracking-[0.18em] font-medium uppercase font-sans">
            OAuth 2.0 Protected Session
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
          Initializing authentication...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
