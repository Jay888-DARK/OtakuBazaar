import { NextResponse } from 'next/server';
import { isPaymentsEnabled, PAYMENTS_COMING_SOON_MESSAGE } from '@/infrastructure/payment/paymentConfig';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const paymentsEnabled = isPaymentsEnabled();
  return NextResponse.json(
    {
      paymentsEnabled,
      message: paymentsEnabled ? null : PAYMENTS_COMING_SOON_MESSAGE,
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
