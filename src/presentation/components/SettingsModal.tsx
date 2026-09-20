'use client';

/**
 * @file src/presentation/components/SettingsModal.tsx
 *
 * Ultra-Premium Japanese Craftsman Settings Modal for OtakuBazaar.
 * Allows users to configure:
 * 1. Theme Mode (Day / Sunrise Washi vs Night / Midnight Manga Ink)
 * 2. Katana Sound Effects (Toggle ON/OFF with live audio slash tester)
 * 3. Sakura Ambient BGM (Toggle Play/Pause and Volume Slider)
 * 4. Active Collector Persona (Tanjiro Kamado, Kyojuro Rengoku, Toshinori Yagi)
 * 5. Escrow Protection & Concurrency Lock Status
 */

import React, { useEffect, useState, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { useTheme, type ThemeMode } from '@/presentation/components/providers/ThemeProvider';
import { DEMO_PERSONAS, type UserRole, type UserPersona } from '@/presentation/components/Navbar';

interface SettingsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly isSoundOn: boolean;
  readonly onToggleSound: () => void;
}

/** Miniature Katana SVG for the settings toggle & buttons */
function KatanaSwordIcon({ active = true, size = 20 }: { active?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: active ? 'drop-shadow(0 0 5px rgba(232, 195, 106, 0.7))' : 'none',
        opacity: active ? 1 : 0.45,
      }}
    >
      <path
        d="M38 8 C34 12 28 20 20 28 L18 26 C26 18 32 10 38 8 Z"
        fill="#E2E8F0"
        stroke="#FFFFFF"
        strokeWidth="0.5"
      />
      <path
        d="M38 8 C35 13 29 21 21 29"
        stroke="#FFFBEB"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="37" cy="9" r="1.5" fill="#FFFFFF" />
      <rect x="18" y="26" width="3.5" height="3" rx="0.5" transform="rotate(45 18 26)" fill="#D97706" />
      <ellipse cx="17.5" cy="28.5" rx="5" ry="2.2" transform="rotate(-45 17.5 28.5)" fill="#D97706" stroke="#78350F" strokeWidth="0.75" />
      <path
        d="M16 30 L8 38 C7 39 6 39 5 38 C4 37 4 36 5 35 L13 27 Z"
        fill="#1C1917"
        stroke="#451A03"
        strokeWidth="0.8"
      />
      <line x1="14" y1="30" x2="12" y2="32" stroke="#E8C36A" strokeWidth="0.8" />
      <line x1="11" y1="33" x2="9" y2="35" stroke="#E8C36A" strokeWidth="0.8" />
      <line x1="8" y1="36" x2="6" y2="38" stroke="#E8C36A" strokeWidth="0.8" />
      <circle cx="5.5" cy="37.5" r="1.5" fill="#D97706" />
      {!active && (
        <line x1="10" y1="10" x2="38" y2="38" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      )}
    </svg>
  );
}

export function SettingsModal({ isOpen, onClose, isSoundOn, onToggleSound }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [activePersonaRole, setActivePersonaRole] = useState<UserRole>('BUYER');
  const [bgmPlaying, setBgmPlaying] = useState<boolean>(false);
  const [bgmVolume, setBgmVolume] = useState<number>(0.2);
  const [isSlashing, setIsSlashing] = useState<boolean>(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  // Sync initial persona from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('otaku_user_role') as UserRole | null;
      if (savedRole && DEMO_PERSONAS[savedRole]) {
        setActivePersonaRole(savedRole);
      }
    }
  }, [isOpen]);

  // Sync BGM state via custom events
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    const handleBgmState = (e: Event) => {
      const detail = (e as CustomEvent<{ isPlaying: boolean; volume: number }>).detail;
      if (detail) {
        if (typeof detail.isPlaying === 'boolean') setBgmPlaying(detail.isPlaying);
        if (typeof detail.volume === 'number') setBgmVolume(detail.volume);
      }
    };

    window.addEventListener('otaku_bgm_state', handleBgmState);
    // Request current state from BgmPlayer
    window.dispatchEvent(new CustomEvent('otaku_bgm_query'));

    return () => {
      window.removeEventListener('otaku_bgm_state', handleBgmState);
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Switch persona handler
  const handleSelectPersona = (role: UserRole) => {
    setActivePersonaRole(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('otaku_user_role', role);
      window.dispatchEvent(new CustomEvent('otaku_persona_change', { detail: DEMO_PERSONAS[role] }));
    }
  };

  // Test slash visual feedback (audio engine disabled)
  const handleTestSlash = useCallback(() => {
    if (typeof window === 'undefined') return;
    setIsSlashing(true);
    setTimeout(() => setIsSlashing(false), 500);
  }, []);

  // Control BGM from modal
  const handleToggleBgm = () => {
    const nextState = !bgmPlaying;
    setBgmPlaying(nextState);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('otaku_bgm_command', {
          detail: { action: nextState ? 'play' : 'pause' },
        })
      );
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setBgmVolume(val);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('otaku_bgm_command', {
          detail: { action: 'setVolume', volume: val },
        })
      );
    }
  };

  const handleDeleteAccountData = async () => {
    setIsDeleting(true);
    setDeleteStatus(null);
    try {
      const activePersona = DEMO_PERSONAS[activePersonaRole];
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoUserId: activePersona?.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDeleteStatus('Data purged. Redirecting to gateway...');
        setTimeout(async () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('otaku_user_role');
            localStorage.removeItem('otaku_session');
          }
          await signOut({ callbackUrl: '/' }).catch(() => {
            window.location.href = '/';
          });
        }, 1200);
      } else {
        setDeleteStatus(data.error || 'Failed to delete account data.');
        setIsDeleting(false);
      }
    } catch {
      setDeleteStatus('Error connecting to deletion service.');
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: 'rgba(8, 6, 4, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl transition-all relative border border-[#B48C50]/30 animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: 'linear-gradient(165deg, #241A13 0%, #150E09 50%, #0D0906 100%)',
          color: '#F0E8DA',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 25px rgba(201, 148, 62, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b border-[#B48C50]/20"
          style={{
            background: 'linear-gradient(90deg, rgba(36,26,19,0.95) 0%, rgba(26,20,16,0.95) 100%)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C9943E]/15 border border-[#C9943E]/30 flex items-center justify-center text-[#E8C36A]">
              ⚙
            </div>
            <div>
              <h2 id="settings-title" className="text-base font-bold tracking-wide m-0 text-zinc-100 font-mono uppercase">
                PREFERENCES & VAULT SETTINGS
              </h2>
              <p className="text-[10px] font-bold text-[#A89880] tracking-wider uppercase m-0 mt-0.5">
                ESCROW DIRECTIVES & AUDIO ATMOSPHERE
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-[#A89880] hover:text-[#E8C36A] transition-colors border border-stone-800 cursor-pointer"
            aria-label="Close Settings"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* 1. DISPLAY ATMOSPHERE (Theme Mode) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#C9943E] flex items-center gap-1.5">
                <span>🏮</span> Display Atmosphere
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 text-[#A89880] border border-stone-800">
                {theme === 'dark' ? 'Night (Manga Ink)' : 'Day (Washi Light)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                  theme === 'dark'
                    ? 'border-[#C9943E] bg-[#C9943E]/15 shadow-[0_0_12px_rgba(201,148,62,0.25)] text-[#E8C36A]'
                    : 'border-stone-800 bg-black/30 hover:border-stone-700 text-[#A89880]'
                }`}
              >
                <span className="text-xl">🌙</span>
                <span className="text-xs font-black">Night Mode</span>
                <span className="text-[9px] font-medium opacity-75">Manga ink obsidian & cloud drift</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                  theme === 'light'
                    ? 'border-[#C9943E] bg-[#C9943E]/15 shadow-[0_0_12px_rgba(201,148,62,0.25)] text-[#E8C36A]'
                    : 'border-stone-800 bg-black/30 hover:border-stone-700 text-[#A89880]'
                }`}
              >
                <span className="text-xl">☀️</span>
                <span className="text-xs font-black">Day Mode</span>
                <span className="text-[9px] font-medium opacity-75">Sunrise washi paper & cranes</span>
              </button>
            </div>
          </div>

          {/* 2. AUDIO & IMMERSION (Katana SFX & Sakura BGM) */}
          <div className="space-y-3.5 pt-2 border-t border-[#B48C50]/15">
            <span className="text-xs font-black uppercase tracking-wider text-[#C9943E] flex items-center gap-1.5">
              <span>⚔️</span> Audio & Sound FX
            </span>

            {/* Katana Sound Setting */}
            <div
              className="p-3.5 rounded-xl border border-stone-800/80 bg-black/30 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#241A13] border border-[#B48C50]/30 flex items-center justify-center shrink-0">
                  <KatanaSwordIcon active={isSoundOn} size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#F0E8DA]">Katana Slash SFX</span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                        isSoundOn
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {isSoundOn ? 'ENABLED' : 'MUTED'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A89880] m-0 mt-0.5 leading-tight">
                    Crisp blade unsheathing feedback on route transitions and grail hovers.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleTestSlash}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer border ${
                    isSlashing
                      ? 'bg-amber-500 text-stone-950 border-amber-400 scale-95'
                      : 'bg-black/50 text-[#E8C36A] border-[#C9943E]/40 hover:bg-[#C9943E]/20'
                  }`}
                  title="Test Katana Slash Audio"
                >
                  ⚡ Test Slash
                </button>
                <button
                  type="button"
                  onClick={onToggleSound}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer border ${
                    isSoundOn
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 border-amber-400'
                      : 'bg-stone-800 border-stone-700'
                  }`}
                  aria-label="Toggle Katana Sound"
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      isSoundOn ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Sakura Ambient BGM Setting */}
            <div
              className="p-3.5 rounded-xl border border-stone-800/80 bg-black/30 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#241A13] border border-[#B48C50]/30 flex items-center justify-center shrink-0 text-base">
                    🎵
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#F0E8DA]">Sakura Ambient Lo-Fi BGM</span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                          bgmPlaying
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {bgmPlaying ? 'PLAYING' : 'PAUSED'}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#A89880] m-0 mt-0.5 leading-tight">
                      Infinite relaxing background melody for exploring grails (/sakura.mp3).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleBgm}
                  className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider transition-all cursor-pointer border ${
                    bgmPlaying
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-stone-500'
                  }`}
                >
                  {bgmPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 pt-1 border-t border-stone-800/60">
                <span className="text-[10px] text-[#A89880] font-bold shrink-0">Volume: {Math.round(bgmVolume * 100)}%</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={bgmVolume}
                  onChange={handleVolumeChange}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-[#C9943E]"
                />
              </div>
            </div>
          </div>

          {/* 3. COLLECTOR PERSONA SWITCHER */}
          <div className="space-y-2.5 pt-2 border-t border-[#B48C50]/15">
            <span className="text-xs font-black uppercase tracking-wider text-[#C9943E] flex items-center gap-1.5">
              <span>👤</span> Active Vault Persona
            </span>

            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(DEMO_PERSONAS) as UserRole[]).map((role) => {
                const persona = DEMO_PERSONAS[role];
                const isSelected = activePersonaRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleSelectPersona(role)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'border-[#C9943E] bg-[#C9943E]/15 text-[#E8C36A] shadow-[0_0_10px_rgba(201,148,62,0.2)]'
                        : 'border-stone-800 bg-black/30 hover:border-stone-700 text-[#A89880]'
                    }`}
                  >
                    <span className="text-xl">{persona.avatar}</span>
                    <span className="text-[11px] font-black truncate max-w-full">{persona.name.split(' ')[0]}</span>
                    <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/50 text-[#C9943E]">
                      {persona.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. DANGER ZONE: DATA & ACCOUNT DELETION */}
          <div className="p-3.5 rounded-xl border border-rose-600/40 bg-rose-950/20 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <span aria-hidden="true">⚠️</span> Privacy &amp; Data Sovereignty
              </span>
              <span className="text-[10px] text-rose-300 font-mono">Irreversible Action</span>
            </div>

            <p className="text-[11px] text-stone-300 m-0 leading-relaxed">
              Permanently delete your profile, chat messages, active sessions, and transactional history from our database.
            </p>

            {deleteStatus && (
              <div className="p-2 rounded-lg bg-rose-900/40 border border-rose-500/50 text-[11px] font-bold text-rose-200">
                {deleteStatus}
              </div>
            )}

            {!isConfirmingDelete ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                aria-label="Request permanent account and personal data deletion"
                className="w-full py-2 px-3 rounded-xl bg-rose-900/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-600/50 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#F85B1A] focus-visible:outline-none"
              >
                <span aria-hidden="true">🗑️</span>
                <span>Delete Account Data</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-black/60 border border-rose-500/60 space-y-2">
                <p className="text-[11px] font-bold text-rose-300 m-0 leading-tight">
                  Are you absolutely certain? This will wipe your account, listings, and messages forever.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDeleteAccountData}
                    aria-label="Confirm permanent account deletion"
                    className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all cursor-pointer shadow-md disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  >
                    {isDeleting ? 'Purging Records...' : 'Yes, Delete Permanently'}
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => {
                      setIsConfirmingDelete(false);
                      setDeleteStatus(null);
                    }}
                    aria-label="Cancel account deletion"
                    className="py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:outline-none"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. ESCROW DIRECTIVES & SECURITY BANNER */}
          <div className="p-3 rounded-xl border border-[#C9943E]/20 bg-[#1A1410] text-[10px] space-y-1 text-[#A89880]">
            <div className="flex items-center gap-1.5 text-[#E8C36A] font-bold">
              <span>🛡️</span> Escrow Authenticated Marketplace Directives
            </div>
            <p className="m-0 leading-relaxed">
              Every checkout is backed by a 48-Hour Double-Escrow Inspection Window and a 15-Minute Concurrency Reservation Lock. Multi-tab BroadcastChannel presence is active.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 border-t border-[#B48C50]/20 flex items-center justify-between"
          style={{ background: 'rgba(20, 14, 10, 0.95)' }}
        >
          <span className="text-[10px] text-[#A89880] font-bold">
            OtakuBazaar v0.1.0 • Japanese Craftsman Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-stone-950 bg-[#C9943E] hover:bg-[#E8C36A] transition-colors cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
