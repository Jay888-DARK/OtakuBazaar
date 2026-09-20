'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.665 0 3.18.675 4.29 1.77l2.4-2.4C17.475 3.915 15.015 3 12.24 3 7.275 3 3.24 7.035 3.24 12s4.035 9 9 9c5.19 0 8.805-3.66 8.805-8.955 0-.6-.06-1.185-.18-1.76H12.24z" />
    </svg>
  );
}

function DiscordIcon({ className = 'w-4 h-4 text-zinc-400' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-4 h-4 text-zinc-400' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

/**
 * @file src/app/login/page.tsx
 *
 * Classic Black & Grey Luxury Gallery Authentication Portal for OtakuBazaar.
 * - Archival access and verified identity protocol.
 * - Uniform monochromatic dark-glass social buttons.
 * - Credentials email & password vault access.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/',
      });

      if (res?.error) {
        setErrorMessage('Invalid collector credentials or account not found.');
      } else if (res?.ok) {
        router.push('/');
        router.refresh();
      }
    } catch {
      setErrorMessage('A network error occurred while reaching the vault.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#09090b] px-4 py-12 relative overflow-hidden">
      {/* Subtle radial ambient light behind the card */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.02)_0%,_transparent_65%)] pointer-events-none" />

      {/* The Vault Authentication Card */}
      <div className="relative w-full max-w-md bg-[#121214] border border-zinc-800/80 rounded-xl p-8 shadow-2xl z-10">
        {/* Header & Typography */}
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500 block mb-2">
            ARCHIVAL ACCESS // VERIFIED IDENTITY
          </span>
          <h1 className="text-xl font-bold font-mono tracking-wider text-zinc-100 uppercase">
            Collector Vault
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Secure authentication for high-ticket acquisition.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs text-center font-mono font-medium">
            {errorMessage}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleCredentialsLogin}>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-2">
              Collector Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collector@otakubazaar.com"
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 font-mono focus:border-zinc-400 focus:bg-zinc-900 outline-none transition-colors mb-4"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-2">
              Vault Passphrase
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 font-mono focus:border-zinc-400 focus:bg-zinc-900 outline-none transition-colors mb-4"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-zinc-100 hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer mt-2 disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Authenticate With Email'}
          </button>
        </form>

        {/* Understated Hairline Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800/80" />
          </div>
          <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-widest">
            <span className="bg-[#121214] px-3 text-zinc-500">Or continue with</span>
          </div>
        </div>

        {/* Monochrome Social Auth Cluster */}
        <div className="space-y-2.5">
          {/* Google Button */}
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center space-x-3 py-2.5 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Continue with Google</span>
          </button>

          {/* Discord Button */}
          <button
            type="button"
            onClick={() => signIn('discord', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center space-x-3 py-2.5 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <DiscordIcon className="w-4 h-4 text-zinc-400" />
            <span>Continue with Discord</span>
          </button>

          {/* Facebook / Alternative Button */}
          <button
            type="button"
            onClick={() => signIn('facebook', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center space-x-3 py-2.5 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <FacebookIcon className="w-4 h-4 text-zinc-400" />
            <span>Continue with Facebook</span>
          </button>
        </div>

        {/* Security Micro-Footer */}
        <p className="text-[10px] font-mono text-zinc-600 text-center tracking-wider mt-6">
          256-BIT ENCRYPTED SESSION • VERIFIED ESCROW PROTOCOL
        </p>

        {/* Return to Marketplace Link */}
        <div className="mt-4 pt-4 border-t border-zinc-800/60 text-center">
          <Link
            href="/"
            className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors no-underline inline-flex items-center gap-1.5"
          >
            <span>← Return to Marketplace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
