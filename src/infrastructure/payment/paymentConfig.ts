/**
 * @file src/infrastructure/payment/paymentConfig.ts
 *
 * Server-side payment feature flag.
 * Off by default; must be explicitly enabled via PAYMENTS_ENABLED=true.
 */

export const PAYMENTS_COMING_SOON_MESSAGE = 'Payments coming soon';

export function isPaymentsEnabled(): boolean {
  return process.env.PAYMENTS_ENABLED === 'true';
}
