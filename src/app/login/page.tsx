'use client';

/**
 * @file src/app/login/page.tsx
 *
 * Collector Vault Authentication Portal for OtakuBazaar.
 * Strictly adheres to the monochrome archival vault design tokens:
 * - Canvas: #080808, Card: #0C0C0C, Borders: #1F1F1F / #161616.
 * - Typography: Playfair editorial serif for titles, Plus Jakarta Sans for inputs and body copy.
 * - Zero radial glow gradients, zero drop shadows, zero soft rounded borders.
 * - Monochromatic bracketed action tokens.
 * - Supports Phone Number + 6-digit OTP authentication and Google OAuth.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  // Mode: Phone OTP (default for India) vs Email & Password
  const [authMethod, setAuthMethod] = useState<'PHONE' | 'EMAIL'>('PHONE');

  // Phone OTP States
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Email States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Resend OTP Countdown Timer
  useEffect(() => {
    if (timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const clean = phoneNumber.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsOtpSent(true);
      setTimerSeconds(30);
      setIsLoading(false);
      setSuccessMessage(`OTP sent to +91 ${clean.slice(-10)}. Enter any 6-digit code (e.g. 123456) to proceed.`);
    }, 600);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit OTP code sent to your phone.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signIn('phone-otp', {
        phone: phoneNumber.replace(/\D/g, ''),
        otp: otpCode.trim(),
        redirect: false,
        callbackUrl: '/vault',
      });

      if (res?.error) {
        setErrorMessage('Invalid OTP code. Please check and try again.');
      } else if (res?.ok) {
        router.push('/vault');
        router.refresh();
      }
    } catch {
      setErrorMessage('A network error occurred while verifying the vault session.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/vault',
      });

      if (res?.error) {
        setErrorMessage('Invalid collector credentials or account not found.');
      } else if (res?.ok) {
        router.push('/vault');
        router.refresh();
      }
    } catch {
      setErrorMessage('A network error occurred while reaching the vault.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-[#080808] px-4 py-12 select-none font-sans">
      {/* The Vault Authentication Card */}
      <div className="relative w-full max-w-md bg-[#0C0C0C] border border-[#1F1F1F] p-8 z-10 rounded-none">
        {/* Header & Typography */}
        <div className="text-center mb-6">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-semibold block mb-2 font-sans">
            ARCHIVAL ACCESS // VERIFIED IDENTITY
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-[0.06em] text-[#F2EFE9]">
            Collector Vault
          </h1>
          <p className="text-[12px] text-[#8E8E8E] mt-2 font-normal leading-relaxed">
            Secure authentication for high-ticket collectible acquisition, selling, and 48-hour escrow protection.
          </p>
        </div>

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-2 border border-[#1F1F1F] bg-[#080808] mb-6 p-1 gap-1">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('PHONE');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-[10px] uppercase tracking-[0.14em] font-semibold transition-none cursor-pointer text-center rounded-none font-sans ${
              authMethod === 'PHONE'
                ? 'bg-[#F2EFE9] text-[#080808]'
                : 'text-[#888888] hover:text-[#CCCCCC]'
            }`}
          >
            [ 01 // PHONE OTP ]
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('EMAIL');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-[10px] uppercase tracking-[0.14em] font-semibold transition-none cursor-pointer text-center rounded-none font-sans ${
              authMethod === 'EMAIL'
                ? 'bg-[#F2EFE9] text-[#080808]'
                : 'text-[#888888] hover:text-[#CCCCCC]'
            }`}
          >
            [ 02 // EMAIL PASS ]
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 bg-[#180A0A] border border-[#7F1D1D] text-[#F87171] text-xs text-center font-medium uppercase tracking-wider font-sans">
            [ ERROR: {errorMessage} ]
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-5 p-3 bg-[#091812] border border-[#193829] text-[#10B981] text-xs text-center font-medium uppercase tracking-wider font-sans">
            {successMessage}
          </div>
        )}

        {/* 1. Phone OTP Auth Flow */}
        {authMethod === 'PHONE' && (
          <div>
            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.14em] text-[#888888] font-medium block mb-1.5 font-sans">
                    Mobile Number (India +91) *
                  </label>
                  <div className="flex items-center border border-[#1F1F1F] bg-[#080808] focus-within:border-[#F2EFE9]">
                    <span className="px-3 text-xs text-[#777777] font-mono border-r border-[#1F1F1F]">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="98765 43210"
                      className="w-full bg-transparent px-3.5 py-2.5 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none font-mono tracking-wider"
                    />
                  </div>
                  <span className="text-[9px] text-[#666666] mt-1 block">
                    We will send a 6-digit one-time authorization code.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#F2EFE9] hover:bg-[#EAE6DF] text-[#080808] border border-[#F2EFE9] font-sans font-semibold text-[11px] uppercase tracking-[0.18em] transition-none cursor-pointer rounded-none disabled:opacity-50 mt-2"
                >
                  {isLoading ? '[ SENDING CODE... ]' : '[ SEND OTP CODE ]'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] uppercase tracking-[0.14em] text-[#888888] font-medium font-sans">
                      Enter 6-Digit OTP *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtpSent(false);
                        setOtpCode('');
                      }}
                      className="text-[10px] text-[#777777] hover:text-[#CCCCCC] uppercase tracking-wider underline cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3.5 py-2.5 text-center text-sm font-mono tracking-[0.4em] text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none"
                  />
                  <div className="flex justify-between items-center mt-2 text-[10px] text-[#777777]">
                    <span>Target: +91 {phoneNumber.slice(-10)}</span>
                    {timerSeconds > 0 ? (
                      <span>Resend in {timerSeconds}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[#F2EFE9] hover:underline uppercase tracking-wider cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#F2EFE9] hover:bg-[#EAE6DF] text-[#080808] border border-[#F2EFE9] font-sans font-semibold text-[11px] uppercase tracking-[0.18em] transition-none cursor-pointer rounded-none disabled:opacity-50 mt-2"
                >
                  {isLoading ? '[ VERIFYING... ]' : '[ VERIFY & ENTER VAULT ]'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 2. Email & Password Form */}
        {authMethod === 'EMAIL' && (
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
                placeholder="collector@otakubazaar.in"
                className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3.5 py-2.5 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none transition-colors"
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
                className="w-full bg-[#080808] border border-[#1F1F1F] focus:border-[#F2EFE9] px-3.5 py-2.5 text-xs text-[#F2EFE9] placeholder-[#555555] outline-none rounded-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#F2EFE9] hover:bg-[#EAE6DF] text-[#080808] border border-[#F2EFE9] font-sans font-semibold text-[11px] uppercase tracking-[0.18em] transition-none cursor-pointer rounded-none disabled:opacity-50 mt-2"
            >
              {isLoading ? '[ AUTHENTICATING... ]' : '[ AUTHENTICATE WITH EMAIL ]'}
            </button>
          </form>
        )}

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
            onClick={() => signIn('google', { callbackUrl: '/vault' })}
            className="w-full py-2.5 bg-[#080808] hover:bg-[#161616] border border-[#1F1F1F] hover:border-[#3A3A3A] text-xs font-semibold uppercase tracking-[0.14em] text-[#CCCCCC] transition-none cursor-pointer rounded-none text-center"
          >
            [ CONTINUE WITH GOOGLE ]
          </button>

          <button
            type="button"
            onClick={() => signIn('discord', { callbackUrl: '/vault' })}
            className="w-full py-2.5 bg-[#080808] hover:bg-[#161616] border border-[#1F1F1F] hover:border-[#3A3A3A] text-xs font-semibold uppercase tracking-[0.14em] text-[#CCCCCC] transition-none cursor-pointer rounded-none text-center"
          >
            [ CONTINUE WITH DISCORD ]
          </button>
        </div>

        {/* Security Micro-Footer */}
        <div className="mt-6 pt-4 border-t border-[#161616] text-center">
          <p className="text-[10px] text-[#777777] tracking-[0.18em] font-medium uppercase">
            256-BIT ENCRYPTED SESSION • SECURE ESCROW PROTECTION
          </p>
        </div>
      </div>
    </div>
  );
}
