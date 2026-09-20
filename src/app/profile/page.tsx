'use client';

/**
 * @file src/app/profile/page.tsx
 *
 * Unified User Profile & Collector Hub — OtakuBazaar.
 */

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import Link from 'next/link';
import {
  fetchProfileDashboardAction,
  acceptOfferAction,
  rejectOfferAction,
  type ProfileDashboardData,
} from '@/app/actions';

export default function ProfilePage() {
  const [dashboardData, setDashboardData] = useState<ProfileDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activePersona, setActivePersona] = useState<'SELLER' | 'BUYER'>('SELLER');
  const [auraOfferId, setAuraOfferId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteAccountError(null);
    try {
      const userId = activePersona === 'SELLER' ? 'user_seller_rengoku' : 'user_buyer_tanjiro';
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoUserId: userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification('Account data permanently purged. Redirecting...');
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            localStorage.clear();
            window.location.href = '/';
          }
        }, 1200);
      } else {
        setDeleteAccountError(data.error || 'Failed to delete account data.');
        setIsDeletingAccount(false);
      }
    } catch {
      setDeleteAccountError('Error contacting account deletion endpoint.');
      setIsDeletingAccount(false);
    }
  };

  // Load profile dashboard data via Server Action
  const loadDashboard = useCallback(async (userId: string) => {
    setIsLoading(true);
    const res = await fetchProfileDashboardAction(userId);
    if (res.success && res.data) {
      setDashboardData(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    const userId = activePersona === 'SELLER' ? 'user_seller_rengoku' : 'user_buyer_tanjiro';

    fetchProfileDashboardAction(userId).then((res) => {
      if (!ignore && res.success && res.data) {
        setDashboardData(res.data);
      }
      if (!ignore) setIsLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [activePersona]);

  // Handle Accept Offer with 2-second Goku Energy Aura
  const handleAcceptOffer = (offer: {
    offerId: string;
    listingId: string;
    buyerName: string;
    offeredPriceINR: number;
  }) => {
    setAuraOfferId(offer.offerId);

    setTimeout(() => {
      startTransition(async () => {
        const res = await acceptOfferAction({
          offerId: offer.offerId,
          listingId: offer.listingId,
          buyerId: 'user_buyer_tanjiro',
          agreedPricePaise: offer.offeredPriceINR * 100,
        });

        setAuraOfferId(null);

        if (res.success) {
          setNotification(`🎉 Offer of ₹${offer.offeredPriceINR.toLocaleString()} accepted! 15-minute checkout lock engaged.`);
          loadDashboard('user_seller_rengoku');
        } else {
          setNotification(`❌ ${res.error ?? 'Failed to accept offer'}`);
        }
      });
    }, 2000);
  };

  // Handle Reject Offer
  const handleRejectOffer = (offerId: string, listingId: string) => {
    startTransition(async () => {
      const res = await rejectOfferAction(offerId, listingId);
      if (res.success) {
        setNotification('Offer politely declined.');
        loadDashboard('user_seller_rengoku');
      }
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        {notification && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-6 flex justify-between items-center">
            <span>{notification}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-200 font-black cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ============================================================= */}
        {/* 1. Header: Unified User Profile Bento Card                    */}
        {/* ============================================================= */}
        <div className="bento-big-box mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F85B1A] flex items-center justify-center text-3xl sm:text-4xl shadow-md border border-white/30 text-white">
              {dashboardData?.sellerAvatar ?? (activePersona === 'SELLER' ? '🔥' : '🗡️')}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-xl sm:text-2xl font-bold tracking-wider uppercase m-0 text-zinc-100">
                  {dashboardData?.sellerName ?? (activePersona === 'SELLER' ? 'Kyojuro Rengoku' : 'Tanjiro Kamado')}
                </h1>
                <span className="text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Verified Collector
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 mb-0">
                {dashboardData?.sellerHandle ?? '@flame_hashira'} • Member since 2024 • 100% Authenticity Trust Score
              </p>
            </div>
          </div>

          {/* Persona Mode Switcher & CTA */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center p-1 rounded-full border border-[var(--surface-glass-border)] bg-[var(--bg-secondary)]">
              <button
                type="button"
                onClick={() => setActivePersona('BUYER')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${activePersona === 'BUYER'
                    ? 'bg-[#072083] text-white hover:brightness-90'
                    : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
              >
                🗡️ Buyer Mode
              </button>

              <button
                type="button"
                onClick={() => setActivePersona('SELLER')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${activePersona === 'SELLER'
                    ? 'bg-[#F85B1A] text-white hover:brightness-90'
                    : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
              >
                🔥 Seller Mode
              </button>
            </div>

            <Link
              href="/sell"
              className="px-5 py-2.5 rounded-full bg-[#F85B1A] hover:brightness-90 active:brightness-75 text-white text-xs font-black uppercase tracking-wider no-underline shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Drop a Grail </span>
            </Link>
          </div>
        </div>

        {/* ============================================================= */}
        {/* 2. Content: Active Listings or Premium Empty State            */}
        {/* ============================================================= */}
        {isLoading ? (
          <div className="bento-big-box p-16 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full border-4 border-[#F85B1A] border-t-transparent animate-spin mb-4" />
            <p className="text-sm font-bold text-[var(--text-secondary)]">Synchronizing Collector Vault...</p>
          </div>
        ) : activePersona === 'BUYER' ? (
          /* ============================================================= */
          /* BUYER DASHBOARD (NEW)                                         */
          /* ============================================================= */
          <div className="space-y-8 animate-fade-in">
            <div>
              <span className="text-xs font-black text-[#072083] dark:text-sky-400 uppercase tracking-wider block">
                Buyer Protection Hub
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight mt-1">
                Your Secured Grails & Escrow
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bento-big-box border-t-4 border-t-amber-500">
                <span className="text-xs font-black text-amber-500 uppercase tracking-wider block">ACTIVE ESCROW LOCKS</span>
                <div className="text-3xl font-black text-[var(--text-primary)] my-2">0</div>
                <p className="text-xs text-[var(--text-secondary)] m-0 leading-relaxed">Funds secured in escrow. Awaiting seller shipment and delivery.</p>
              </div>
              <div className="bento-big-box border-t-4 border-t-[#072083]">
                <span className="text-xs font-black text-[#072083] dark:text-sky-400 uppercase tracking-wider block">LIFETIME COLLECTION</span>
                <div className="text-3xl font-black text-[var(--text-primary)] my-2">₹0</div>
                <p className="text-xs text-[var(--text-secondary)] m-0 leading-relaxed">Total value of authentic figures successfully collected.</p>
              </div>
              <div className="bento-big-box border-t-4 border-t-rose-500">
                <span className="text-xs font-black text-rose-500 uppercase tracking-wider block">WATCHLISTED</span>
                <div className="text-3xl font-black text-[var(--text-primary)] my-2">0</div>
                <p className="text-xs text-[var(--text-secondary)] m-0 leading-relaxed">Grails you are currently tracking for price drops.</p>
              </div>
            </div>

            <div className="bento-big-box p-12 flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-4">🛒</div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">No active purchases.</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">You haven&apos;t purchased any anime collectibles yet. Discover authentic figures with 100% escrow fraud protection.</p>
              <Link href="/" className="px-6 py-3 rounded-2xl bg-[#072083] hover:brightness-90 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all">
                Browse Marketplace Feed
              </Link>
            </div>
          </div>
        ) : activePersona === 'SELLER' ? (
          /* ============================================================= */
          /* ADVANCED SELLER DASHBOARD (ALWAYS VISIBLE)                    */
          /* ============================================================= */
          <div className="space-y-8 animate-fade-in">
            {/* 1. Header Section */}
            <div>
              <span className="text-xs font-black text-[#F85B1A] uppercase tracking-wider block">
                Seller Analytics & Escrow Hub
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight mt-1">
                Advanced Performance Metrics
              </h2>
            </div>

            {/* 2. Advanced KPI Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bento-big-box border-t-4 border-t-emerald-500 p-5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Revenue</span>
                <div className="text-2xl font-black text-[var(--text-primary)] mt-1">₹42,500</div>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mt-2">↑ 12.5% this month</span>
              </div>
              <div className="bento-big-box border-t-4 border-t-sky-500 p-5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Profile Views</span>
                <div className="text-2xl font-black text-[var(--text-primary)] mt-1">1,204</div>
                <span className="text-[10px] font-bold text-sky-500 flex items-center gap-1 mt-2">↑ 8.2% this week</span>
              </div>
              <div className="bento-big-box border-t-4 border-t-amber-500 p-5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Conversion Rate</span>
                <div className="text-2xl font-black text-[var(--text-primary)] mt-1">3.4%</div>
                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1 mt-2">Steady</span>
              </div>
              <div className="bento-big-box border-t-4 border-t-[#F85B1A] p-5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Active Escrow</span>
                <div className="text-2xl font-black text-[var(--text-primary)] mt-1">
                  ₹{dashboardData?.escrowVaultHeldINR?.toLocaleString() || 0}
                </div>
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-2">Secured Funds</span>
              </div>
            </div>

            {/* 3. Revenue Over Time (CSS Bar Chart) */}
            <div className="bento-big-box">
              <h3 className="text-xs font-black text-slate-500 mb-6 uppercase tracking-wider">Revenue Over Time (30 Days)</h3>
              <div className="h-40 flex items-end justify-between gap-1 sm:gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                {[40, 70, 45, 90, 65, 80, 30, 100, 60, 85, 50, 75].map((height, i) => (
                  <div 
                    key={i} 
                    className="w-full bg-[#F85B1A]/20 hover:bg-[#F85B1A] transition-colors rounded-t-md relative group cursor-pointer" 
                    style={{ height: `${height}%` }}
                  >
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      ₹{height * 120}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>

            {/* 4. Incoming Offers Panel */}
            {dashboardData?.incomingOffers && dashboardData.incomingOffers.length > 0 && (
              <div className="bento-big-box">
                <div className="mb-4">
                  <h3 className="text-lg font-black text-[var(--text-primary)] m-0">⚡ Incoming Bargain Offers</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 mb-0">Buyers awaiting your decision. Accepting locks the grail exclusively for 15 minutes.</p>
                </div>
                <div className="space-y-4">
                  {dashboardData.incomingOffers.map((offer) => {
                    const isAura = auraOfferId === offer.offerId;
                    return (
                      <div key={offer.offerId} className={`p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--surface-glass-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${isAura ? 'goku-aura' : ''}`}>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{offer.buyerAvatar}</span>
                            <strong className="text-xs font-black text-[var(--text-primary)]">{offer.buyerName}</strong>
                            <span className="text-[11px] text-[var(--text-muted)]">• {offer.timestamp}</span>
                          </div>
                          <p className="text-xs font-bold text-[var(--text-secondary)] m-0">
                            Negotiating: <span className="text-[#F85B1A] font-black">{offer.listingTitle}</span>
                          </p>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-lg font-black text-[#F85B1A]">₹{offer.offeredPriceINR.toLocaleString()}</span>
                            <span className="text-xs text-[var(--text-muted)] line-through">₹{offer.originalAskingPriceINR.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] italic mt-1 mb-0">&ldquo;{offer.message}&rdquo;</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => handleAcceptOffer(offer)} className="px-5 py-2 rounded-xl bg-emerald-600 hover:brightness-90 text-white font-black text-xs cursor-pointer transition-all shadow-sm">
                            {isAura ? '⚡ Locking Listing...' : 'Accept & Lock (15m)'}
                          </button>
                          <button type="button" onClick={() => handleRejectOffer(offer.offerId, offer.listingId)} className="px-4 py-2 rounded-xl border border-[var(--surface-glass-border)] bg-transparent hover:bg-[var(--surface-glass)] text-[var(--text-secondary)] font-bold text-xs cursor-pointer transition-all">
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Active Listings Grid */}
            <div className="bento-big-box">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-[var(--text-primary)] m-0">
                  Your Listed Grails ({dashboardData?.activeListings?.length || 0})
                </h3>
                <Link href="/sell" className="px-4 py-2 rounded-xl bg-[#F85B1A] text-white text-[10px] font-black uppercase tracking-wider hover:brightness-90 transition-all shadow-sm">
                  + Drop New Grail
                </Link>
              </div>

              {dashboardData?.activeListings && dashboardData.activeListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {dashboardData.activeListings.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--surface-glass-border)] overflow-hidden flex flex-col">
                      <div className="h-44 bg-cover bg-center relative" style={{ backgroundImage: `url(${item.imageUrls[0]})` }}>
                        <span className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase text-white ${item.status === 'RESERVED' ? 'bg-[#F85B1A]' : 'bg-emerald-600'}`}>
                          {item.status === 'RESERVED' ? '🔒 IN CHECKOUT' : 'ACTIVE'}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <span className="text-[10px] font-black text-[#072083] dark:text-sky-400 uppercase tracking-wider">{item.category} • {item.condition}</span>
                        <h4 className="text-sm font-black text-[var(--text-primary)] my-1.5 line-clamp-1">{item.title}</h4>
                        <div className="mt-auto pt-3 border-t border-[var(--surface-glass-border)] flex items-center justify-between">
                          <span className="text-base font-black text-[#F85B1A]">₹{Math.round(item.askingPriceAmount / 100).toLocaleString()}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[var(--surface-glass-border)] flex justify-end items-center">
                          <button type="button" onClick={async () => { try { await fetch(`/api/listings/${item.id}`, { method: 'DELETE' }); window.location.reload(); } catch { alert('Failed to delete listing.'); } }} className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-black transition-all cursor-pointer border border-rose-500/30">
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Localized Empty State just for the Grid */
                <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                  <span className="text-4xl mb-4 opacity-50">📦</span>
                  <h4 className="text-sm font-black text-[var(--text-primary)]">No Active Listings</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    You haven&apos;t listed any items yet. Your metrics above will update automatically once your first grail is live.
                  </p>
                </div>
              )}
            </div>

            {/* 6. Account Sovereignty & Data Deletion (Compliance) */}
            <div className="p-6 rounded-2xl border-2 border-rose-600/30 bg-rose-950/15 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-black text-rose-400 m-0 flex items-center gap-2">
                    <span aria-hidden="true">⚠️</span> Data Sovereignty &amp; Account Erasure
                  </h4>
                  <p className="text-xs text-stone-300 mt-1 mb-0 max-w-xl leading-relaxed">
                    Under applicable data protection guidelines, you can request permanent erasure of your account, active NextAuth sessions, chat messages, and transactional records.
                  </p>
                </div>

                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    aria-label="Request permanent account and personal data deletion"
                    className="px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shrink-0 focus-visible:ring-2 focus-visible:ring-[#F85B1A] focus-visible:outline-none"
                  >
                    Delete Account Data
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5 p-3 rounded-xl bg-black/70 border border-rose-500/60">
                    <span className="text-xs font-bold text-rose-300">
                      Permanently wipe all records?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isDeletingAccount}
                        onClick={handleDeleteAccount}
                        aria-label="Confirm permanent account erasure"
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs cursor-pointer shadow-md disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                      >
                        {isDeletingAccount ? 'Purging...' : 'Yes, Delete Permanently'}
                      </button>
                      <button
                        type="button"
                        disabled={isDeletingAccount}
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteAccountError(null);
                        }}
                        aria-label="Cancel account erasure"
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:outline-none"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {deleteAccountError && (
                <div className="mt-3 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/50 text-xs font-bold text-rose-200">
                  {deleteAccountError}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}