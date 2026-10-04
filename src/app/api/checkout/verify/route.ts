/**
 * @file src/app/api/checkout/verify/route.ts
 *
 * Direct verification endpoint for Razorpay payment callbacks.
 * Re-exports the canonical server-side HMAC signature verification,
 * database updates, and escrow ledger recording logic.
 */

export { POST } from '../razorpay/verify/route';
