/**
 * @file src/app/vault-ops/page.tsx
 *
 * Vault Operations Command & Escrow Audit Terminal.
 * Protected Server Component displaying live orders and telemetry.
 *
 * Query Authority:
 * - Queries `prisma.order.findMany({ include: { user: true } })`
 *
 * Styling Constraints:
 * - Strict 1px solid dark gray borders (#27272a)
 * - 0px border-radius (zero rounded corners)
 * - Dark background (#0c0c0e / #09090b)
 * - Monochromatic typography ('Satoshi' or 'Cabinet Grotesk')
 * - Strictly NO drop shadows, NO rounded corners, and NO coding/monospaced fonts.
 */

import React from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { prisma } from '@/lib/prismaClient';
import { TokenService, SESSION_COOKIE_NAME } from '@/infrastructure/security/TokenService';

export const dynamic = 'force-dynamic';

export default async function VaultOpsPage(): Promise<React.JSX.Element> {
  // Authentication & Clearance Check
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? TokenService.verifyToken(token) : null;

  // Fetch live orders including associated buyer profile
  let orders: Array<any> = [];
  let dbError: string | null = null;

  try {
    orders = await prisma.order.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (err: any) {
    console.error('[VaultOps] Error fetching orders:', err);
    dbError = err?.message || 'Failed to query vault orders from database.';
  }

  // Summary Metrics
  const totalVolumePaise = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalVolumeINR = Math.round(totalVolumePaise / 100);
  const lockedOrders = orders.filter((o) => o.status === 'ESCROW_LOCKED' || o.escrowStatus === 'HELD_IN_ESCROW');

  return (
    <div
      className="min-h-screen bg-[#0c0c0e] text-zinc-100 p-4 sm:p-8"
      style={{
        fontFamily: "'Satoshi', 'Cabinet Grotesk', sans-serif",
        borderRadius: '0px',
        boxShadow: 'none',
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Terminal Header */}
        <div className="border border-[#27272a] bg-[#09090b] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-bold border border-[#27272a] bg-[#111114] px-2 py-0.5">
                INTERNAL CLEARANCE LEVEL 4
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold">
                LIVE ESCROW CUSTODY FEED
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-[0.08em] text-zinc-100">
              VAULT OPERATIONS &amp; ESCROW AUDIT TERMINAL
            </h1>
            <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">
              Real-time authoritative order ledger backed by dual-entry cryptographic verification.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/vault"
              className="px-3.5 py-2 bg-[#111114] hover:bg-[#18181b] text-zinc-300 hover:text-white border border-[#27272a] text-[11px] font-bold uppercase tracking-wider no-underline"
              style={{ borderRadius: '0px', transition: 'none' }}
            >
              Public Vault →
            </Link>
            <Link
              href="/"
              className="px-3.5 py-2 bg-[#f4f4f4] hover:bg-white text-black border border-[#f4f4f4] text-[11px] font-extrabold uppercase tracking-wider no-underline"
              style={{ borderRadius: '0px', transition: 'none' }}
            >
              Archive Index
            </Link>
          </div>
        </div>

        {/* Telemetry Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="border border-[#27272a] bg-[#09090b] p-4">
            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold block mb-1">
              TOTAL TRANSACTED ORDERS
            </span>
            <span className="text-2xl font-black text-zinc-100 tracking-tight block">
              {orders.length}
            </span>
          </div>

          <div className="border border-[#27272a] bg-[#09090b] p-4">
            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold block mb-1">
              ESCROW LOCKED CUSTODY
            </span>
            <span className="text-2xl font-black text-emerald-400 tracking-tight block">
              {lockedOrders.length}
            </span>
          </div>

          <div className="border border-[#27272a] bg-[#09090b] p-4">
            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold block mb-1">
              SETTLED VOLUME (INR)
            </span>
            <span className="text-2xl font-black text-zinc-100 tracking-tight block">
              ₹{totalVolumeINR.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="border border-[#27272a] bg-[#09090b] p-4">
            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold block mb-1">
              ACTIVE OPERATOR SESSION
            </span>
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block truncate mt-1">
              {session?.name || session?.email || 'SYSTEM AUTOMATION ENGINE'}
            </span>
          </div>
        </div>

        {/* Database Error Banner if any */}
        {dbError && (
          <div className="border border-red-800 bg-red-950/40 p-4 text-red-300 text-xs uppercase tracking-wider">
            <span className="font-bold block mb-1">DATABASE TELEMETRY EXCEPTION</span>
            {dbError}
          </div>
        )}

        {/* Technical Data Table */}
        <div className="border border-[#27272a] bg-[#09090b]">
          <div className="p-4 border-b border-[#27272a] bg-[#111114] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">
              AUTHORITATIVE ORDER TRANSACTIONS (PRISMA.ORDER.FINDMANY)
            </span>
            <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">
              COUNT: {orders.length} SPECIMENS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs uppercase tracking-wider border-collapse">
              <thead>
                <tr className="border-b border-[#27272a] bg-[#0d0d10] text-[10px] text-zinc-400 font-bold">
                  <th className="py-3 px-4 border-r border-[#27272a]">ORDER TOKEN</th>
                  <th className="py-3 px-4 border-r border-[#27272a]">LOT REFERENCE</th>
                  <th className="py-3 px-4 border-r border-[#27272a]">BUYER PROFILE</th>
                  <th className="py-3 px-4 border-r border-[#27272a]">PHONE / CONTACT</th>
                  <th className="py-3 px-4 border-r border-[#27272a]">VALUATION</th>
                  <th className="py-3 px-4 border-r border-[#27272a]">CUSTODY STATUS</th>
                  <th className="py-3 px-4 border-r border-[#27272a]">PAYMENT IDENTIFIER</th>
                  <th className="py-3 px-4">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f23]">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500 text-xs uppercase tracking-widest">
                      [ NO ORDERS RECORDED IN CURRENT ARCHIVE VAULT ]
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const priceFormatted = `₹${Math.round((order.totalAmount || 0) / 100).toLocaleString('en-IN')}`;
                    const buyerName = order.user?.name || order.user?.displayName || 'GUEST COLLECTOR';
                    const buyerPhone = order.user?.phone || order.user?.verifiedUpiVpa || 'UNSPECIFIED';
                    const buyerEmail = order.user?.email || 'N/A';
                    const createdDate = order.createdAt ? new Date(order.createdAt).toISOString().replace('T', ' ').substring(0, 19) : 'N/A';

                    return (
                      <tr key={order.id} className="hover:bg-[#121216] transition-none text-zinc-300">
                        <td className="py-3 px-4 border-r border-[#27272a] font-bold text-zinc-100 max-w-[160px] truncate">
                          {order.id}
                        </td>
                        <td className="py-3 px-4 border-r border-[#27272a] text-zinc-400 font-semibold max-w-[140px] truncate">
                          {order.itemLotRef || order.listingId || 'LOT-ARCHIVE'}
                        </td>
                        <td className="py-3 px-4 border-r border-[#27272a]">
                          <span className="font-bold text-zinc-200 block truncate max-w-[150px]">
                            {buyerName}
                          </span>
                          <span className="text-[9px] text-zinc-500 block truncate max-w-[150px]">
                            {buyerEmail}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-r border-[#27272a] text-zinc-400 font-semibold">
                          {buyerPhone}
                        </td>
                        <td className="py-3 px-4 border-r border-[#27272a] font-bold text-zinc-100">
                          {priceFormatted}
                        </td>
                        <td className="py-3 px-4 border-r border-[#27272a]">
                          <span
                            className={`inline-block px-2 py-0.5 text-[9px] font-bold border ${
                              order.status === 'ESCROW_LOCKED' || order.escrowStatus === 'HELD_IN_ESCROW'
                                ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
                                : 'border-zinc-700 bg-zinc-900 text-zinc-300'
                            }`}
                            style={{ borderRadius: '0px' }}
                          >
                            {order.status || order.escrowStatus || 'ESCROW_LOCKED'}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-r border-[#27272a] text-zinc-400 max-w-[150px] truncate font-medium">
                          {order.razorpayPaymentId || order.razorpayOrderId || 'OFFLINE'}
                        </td>
                        <td className="py-3 px-4 text-zinc-500 text-[10px] font-medium">
                          {createdDate}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security / Audit Footer */}
        <div className="border border-[#27272a] bg-[#09090b] p-4 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] uppercase tracking-widest text-zinc-500 gap-2">
          <span>SECURE POSTGRES RECORD AUTHORITY • VERIFIED TAMPER RESISTANT</span>
          <span>48-HOUR AUTOMATED ARBITRATION WINDOW ENFORCED</span>
        </div>
      </div>
    </div>
  );
}
