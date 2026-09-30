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
          setNotification(`Offer of ₹${offer.offeredPriceINR.toLocaleString()} accepted! 15-minute checkout lock engaged.`);
          loadDashboard('user_seller_rengoku');
        } else {
          setNotification(`${res.error ?? 'Failed to accept offer'}`);
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
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-xs mb-6 flex justify-between items-center">
            <span>{notification}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              aria-label="Dismiss notification"
              className="text-emerald-400 hover:text-white cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* ============================================================= */}
        {/* 1. Header: Unified User Profile Card                          */}
        {/* ============================================================= */}
        <div className="bg-[#111114] border border-zinc-800 p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-900 flex items-center justify-center text-xl font-bold tracking-widest border border-zinc-700 text-zinc-100">
              {dashboardData?.sellerAvatar ?? (activePersona === 'SELLER' ? 'KR' : 'TK')}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-[0.15em] uppercase m-0 text-zinc-100">
                  {dashboardData?.sellerName ?? (activePersona === 'SELLER' ? 'Kyojuro Rengoku' : 'Tanjiro Kamado')}
                </h1>
                <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 uppercase tracking-widest">
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
            <div className="flex items-center p-1 border border-zinc-800 bg-[#0c0c0e]">
              <button
                type="button"
                onClick={() => setActivePersona('BUYER')}
                className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${activePersona === 'BUYER'
                    ? 'bg-[#072083] text-white'
                    : 'bg-transparent text-zinc-400 hover:text-zinc-100'
                  }`}
              >
                Buyer Mode
              </button>

              <button
                type="button"
                onClick={() => setActivePersona('SELLER')}
                className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${activePersona === 'SELLER'
                    ? 'bg-zinc-100 text-black'
                    : 'bg-transparent text-zinc-400 hover:text-zinc-100'
                  }`}
              >
                Seller Mode
              </button>
            </div>

            <Link
              href="/sell"
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold uppercase tracking-wider no-underline transition-colors flex items-center gap-1.5"
            >
              <span>Drop a Grail</span>
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
              <div className="bg-[#111114] border border-zinc-800 p-5 border-t-2 border-t-zinc-400">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">ACTIVE ESCROW LOCKS</span>
                <div className="text-3xl font-extrabold text-zinc-100 my-2">0</div>
                <p className="text-xs text-zinc-400 m-0 leading-relaxed">Funds secured in escrow. Awaiting seller shipment and delivery.</p>
              </div>
              <div className="bg-[#111114] border border-zinc-800 p-5 border-t-2 border-t-[#072083]">
                <span className="text-xs font-bold text-[#072083] dark:text-sky-400 uppercase tracking-wider block">LIFETIME COLLECTION</span>
                <div className="text-3xl font-extrabold text-zinc-100 my-2">₹0</div>
                <p className="text-xs text-zinc-400 m-0 leading-relaxed">Total value of authentic figures successfully collected.</p>
              </div>
              <div className="bg-[#111114] border border-zinc-800 p-5 border-t-2 border-t-zinc-600">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">WATCHLISTED</span>
                <div className="text-3xl font-extrabold text-zinc-100 my-2">0</div>
                <p className="text-xs text-zinc-400 m-0 leading-relaxed">Grails you are currently tracking for price drops.</p>
              </div>
            </div>

            <div className="bg-[#111114] border border-zinc-800 p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 mx-auto mb-4 border border-zinc-800 flex items-center justify-center text-zinc-500 bg-[#0c0c0e]">
                <svg className="w-6 h-6 stroke-[1.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-wider mb-2">No active purchases.</h3>
              <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">You haven&apos;t purchased any anime collectibles yet. Discover authentic figures with 100% escrow fraud protection.</p>
              <Link href="/" className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-[0.2em] border border-zinc-700 transition-colors no-underline">
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
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Seller Analytics &amp; Escrow Hub
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 uppercase tracking-wider mt-1">
                Advanced Performance Metrics
              </h2>
            </div>

            {/* 2. Advanced KPI Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-[#111114] border border-zinc-800 p-5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Revenue</span>
                <div className="text-2xl font-extrabold text-zinc-100 mt-1">₹42,500</div>
                <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 mt-2">↑ 12.5% this month</span>
              </div>
              <div className="bg-[#111114] border border-zinc-800 p-5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Profile Views</span>
                <div className="text-2xl font-extrabold text-zinc-100 mt-1">1,204</div>
                <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1 mt-2">↑ 8.2% this week</span>
              </div>
              <div className="bg-[#111114] border border-zinc-800 p-5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Conversion Rate</span>
                <div className="text-2xl font-extrabold text-zinc-100 mt-1">3.4%</div>
                <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1 mt-2">Steady</span>
              </div>
              <div className="bg-[#111114] border border-zinc-800 p-5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Active Escrow</span>
                <div className="text-2xl font-extrabold text-zinc-100 mt-1">
                  ₹{dashboardData?.escrowVaultHeldINR?.toLocaleString() || 0}
                </div>
                <span className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1 mt-2">Secured Funds</span>
              </div>
            </div>

            {/* 3. Revenue Over Time (CSS Bar Chart) */}
            <div className="bg-[#111114] border border-zinc-800 p-6">
              <h3 className="text-xs font-bold text-zinc-400 mb-6 uppercase tracking-wider">Revenue Over Time (30 Days)</h3>
              <div className="h-40 flex items-end justify-between gap-1 sm:gap-2 border-b border-zinc-800 pb-2">
                {[40, 70, 45, 90, 65, 80, 30, 100, 60, 85, 50, 75].map((height, i) => (
                  <div 
                    key={i} 
                    className="w-full bg-zinc-800 hover:bg-zinc-600 transition-colors relative group cursor-pointer" 
                    style={{ height: `${height}%` }}
                  >
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-white text-[10px] font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      ₹{height * 120}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>

            {/* 4. Incoming Offers Panel */}
            {dashboardData?.incomingOffers && dashboardData.incomingOffers.length > 0 && (
              <div className="bg-[#111114] border border-zinc-800 p-6">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-zinc-100 uppercase tracking-wider m-0">Incoming Bargain Offers</h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-0">Buyers awaiting your decision. Accepting locks the grail exclusively for 15 minutes.</p>
                </div>
                <div className="space-y-4">
                  {dashboardData.incomingOffers.map((offer) => {
                    const isAura = auraOfferId === offer.offerId;
                    return (
                      <div key={offer.offerId} className="p-5 bg-[#0c0c0e] border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-5 h-5 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-300">
                              {offer.buyerName ? offer.buyerName.substring(0, 2).toUpperCase() : 'TK'}
                            </span>
                            <strong className="text-xs font-bold text-zinc-100">{offer.buyerName}</strong>
                            <span className="text-[11px] text-zinc-500">• {offer.timestamp}</span>
                          </div>
                          <p className="text-xs font-medium text-zinc-300 m-0">
                            Negotiating: <span className="font-bold text-zinc-100">{offer.listingTitle}</span>
                          </p>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-base font-bold text-zinc-100">₹{offer.offeredPriceINR.toLocaleString()}</span>
                            <span className="text-xs text-zinc-500 line-through">₹{offer.originalAskingPriceINR.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-zinc-400 italic mt-1 mb-0">&ldquo;{offer.message}&rdquo;</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => handleAcceptOffer(offer)} className="px-5 py-2 bg-zinc-100 hover:bg-white text-black font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors">
                            {isAura ? 'Locking Listing...' : 'Accept & Lock (15m)'}
                          </button>
                          <button type="button" onClick={() => handleRejectOffer(offer.offerId, offer.listingId)} className="px-4 py-2 border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors">
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
            <div className="bg-[#111114] border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-zinc-100 uppercase tracking-wider m-0">
                  Your Listed Grails ({dashboardData?.activeListings?.length || 0})
                </h3>
                <Link href="/sell" className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-[10px] font-bold uppercase tracking-wider transition-colors no-underline">
                  + Drop New Grail
                </Link>
              </div>

              {dashboardData?.activeListings && dashboardData.activeListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {dashboardData.activeListings.map((item) => (
                    <div key={item.id} className="bg-[#0c0c0e] border border-zinc-800 overflow-hidden flex flex-col">
                      <div className="h-44 bg-cover bg-center relative" style={{ backgroundImage: `url(${item.imageUrls[0]})` }}>
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white bg-zinc-900 border border-zinc-700">
                          {item.status === 'RESERVED' ? 'RESERVED IN CHECKOUT' : 'ACTIVE'}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{item.category} • {item.condition}</span>
                        <h4 className="text-sm font-bold text-zinc-100 my-1.5 line-clamp-1 uppercase tracking-wide">{item.title}</h4>
                        <div className="mt-auto pt-3 border-t border-zinc-800 flex items-center justify-between">
                          <span className="text-base font-bold text-zinc-100">₹{Math.round(item.askingPriceAmount / 100).toLocaleString()}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-end items-center">
                          <button type="button" onClick={async () => { try { await fetch(`/api/listings/${item.id}`, { method: 'DELETE' }); window.location.reload(); } catch { alert('Failed to delete listing.'); } }} className="px-3 py-1.5 bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-zinc-800 hover:border-rose-800">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Localized Empty State just for the Grid */
                <div className="py-16 flex flex-col items-center justify-center text-center border border-dashed border-zinc-800">
                  <div className="w-10 h-10 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-3 bg-[#0c0c0e]">
                    <svg className="w-5 h-5 stroke-[1.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">No Active Listings</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                    You haven&apos;t listed any items yet. Your metrics above will update automatically once your first grail is live.
                  </p>
                </div>
              )}
            </div>

            {/* 6. Account Sovereignty & Data Deletion (Compliance) */}
            <div className="p-6 border border-zinc-800 bg-[#0c0c0e]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider m-0 flex items-center gap-2">
                    Data Sovereignty &amp; Account Erasure
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 mb-0 max-w-xl leading-relaxed">
                    Under applicable data protection guidelines, you can request permanent erasure of your account, active NextAuth sessions, chat messages, and transactional records.
                  </p>
                </div>

                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    aria-label="Request permanent account and personal data deletion"
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                  >
                    Delete Account Data
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5 p-3 bg-zinc-900 border border-zinc-700">
                    <span className="text-xs font-medium text-zinc-300">
                      Permanently wipe all records?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isDeletingAccount}
                        onClick={handleDeleteAccount}
                        aria-label="Confirm permanent account erasure"
                        className="px-3.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-50"
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
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider cursor-pointer border border-zinc-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {deleteAccountError && (
                <div className="mt-3 p-2.5 bg-rose-950/40 border border-rose-800 text-xs font-bold text-rose-300">
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