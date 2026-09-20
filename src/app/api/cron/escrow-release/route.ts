/**
 * @file src/app/api/cron/escrow-release/route.ts
 *
 * Next.js 15 App Router Route Handler for automated Escrow Release Cron Job.
 *
 * Invoked on a recurring schedule (e.g., every hour via Vercel Cron,
 * Google Cloud Scheduler, or an internal timer).
 *
 * Enforces:
 *   - Bearer token authentication against `CRON_SECRET`.
 *   - Auto-disbursement to sellers whose 48-hour inspection timer has elapsed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { EscrowReleaseJob } from '@/infrastructure/jobs/EscrowReleaseJob';

export async function GET(req: NextRequest): Promise<NextResponse> {
  return handleCron(req);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handleCron(req);
}

async function handleCron(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'otaku_bazaar_cron_secret_key';

  // 1. Authenticate Cron Trigger
  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[CronEscrowRelease] 401 Unauthorized: Invalid or missing CRON_SECRET');
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Valid CRON_SECRET bearer token required' },
      { status: 401 }
    );
  }

  // 2. Execute Background Job
  try {
    const result = await EscrowReleaseJob.run();
    console.info(
      `[CronEscrowRelease] Completed: ${result.successfulReleases} released, ${result.failedReleases} failed.`
    );
    return NextResponse.json(
      {
        status: 'success',
        result,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to execute escrow release job';
    console.error('[CronEscrowRelease] Unexpected job execution failure:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message,
      },
      { status: 500 }
    );
  }
}
