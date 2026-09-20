/**
 * @file src/app/api/webhooks/shiprocket/route.ts
 *
 * Next.js 15 App Router Route Handler for Shiprocket Logistics Webhooks.
 *
 * Enforces:
 *   1. HMAC-SHA256 signature verification / secret token check (401 on mismatch).
 *   2. Idempotency logging via `IdempotencyLog` (HTTP 200 no-op on duplicates).
 *   3. Logistics lifecycle transition to `DELIVERED_INSPECTION` upon `shipment.delivered`.
 *   4. Automated 48-Hour Inspection Timer initialization (`inspection_ends_at = NOW + 48h`).
 */

import { NextRequest, NextResponse } from 'next/server';
import { WebhookSecurityService } from '@/infrastructure/security/WebhookSecurityService';
import { IdempotencyService } from '@/infrastructure/database/IdempotencyService';
import { OrderRepository } from '@/infrastructure/database/repositories/OrderRepository';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  console.info(`[ShiprocketWebhook] Received webhook at ${timestamp}`);

  // 1. Read Raw Body
  const rawBody = await req.text();
  const signature =
    req.headers.get('x-shiprocket-signature') ||
    req.headers.get('x-api-key') ||
    req.headers.get('authorization');
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET || 'test_shiprocket_webhook_secret';

  // 2. Webhook Security: Signature / Secret Token Verification
  const isValid = WebhookSecurityService.verifyShiprocketSignature(rawBody, signature, secret);

  if (!isValid) {
    console.warn('[ShiprocketWebhook] 401 Unauthorized: Invalid or missing Shiprocket signature');
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Shiprocket webhook authentication failed',
      },
      { status: 401 }
    );
  }

  // 3. Parse JSON Event Payload
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch (err) {
    console.error('[ShiprocketWebhook] Failed to parse JSON body:', err);
    return NextResponse.json({ error: 'Bad Request', message: 'Malformed JSON payload' }, { status: 400 });
  }

  // Shiprocket sends tracking updates with current_status or event
  const currentStatus = String(payload.current_status || payload.event || payload.status || '').toUpperCase();
  const orderId = String(payload.order_id || payload.channel_order_id || payload.reference_id || '');
  const awb = String(payload.awb_code || payload.awb || payload.courier_awb || '');
  const shipmentId = payload.shipment_id ? String(payload.shipment_id) : undefined;
  void shipmentId; // Referenced for logistics payload audit trail

  // Composite event identifier for idempotency
  const eventId = `sr_${orderId || 'no_order'}_${awb || 'no_awb'}_${currentStatus}`;

  // 4. Idempotency Check
  const alreadyProcessed = await IdempotencyService.isEventProcessed('SHIPROCKET', eventId);
  if (alreadyProcessed) {
    console.info(`[ShiprocketWebhook] Idempotent hit: Event ${eventId} already processed. Returning HTTP 200.`);
    return NextResponse.json(
      {
        status: 'ok',
        duplicate: true,
        message: `Event ${eventId} has already been processed`,
      },
      { status: 200 }
    );
  }

  // 5. Process Shipment Lifecycle
  try {
    const isDelivered =
      currentStatus === 'DELIVERED' ||
      currentStatus === 'SHIPMENT.DELIVERED' ||
      payload.current_status_id === 7 || // Shiprocket standard delivered code
      currentStatus.includes('DELIVERED');

    if (isDelivered) {
      if (!orderId) {
        throw new Error('Missing order_id in Shiprocket delivery webhook');
      }

      // Initialize 48-Hour Inspection Window: NOW() + 48 HOURS
      const inspectionDurationMs = 48 * 60 * 60 * 1000;
      const inspectionEndsAt = new Date(Date.now() + inspectionDurationMs);

      console.info(
        `[ShiprocketWebhook] Processing shipment.delivered for Order ${orderId}. Inspection window ends at ${inspectionEndsAt.toISOString()}`
      );

      // Atomically update Order status to DELIVERED_INSPECTION with inspection expiration timestamp
      await OrderRepository.updateEscrowStatus(orderId, {
        escrowStatus: 'DELIVERED_INSPECTION',
        inspectionEndsAt,
        shiprocketAwb: awb || undefined,
      });

      // Record in IdempotencyLog
      await IdempotencyService.recordEventProcessed('SHIPROCKET', eventId, rawBody);

      console.info(
        `[ShiprocketWebhook] Order ${orderId} moved to DELIVERED_INSPECTION. 48h inspection countdown started.`
      );

      return NextResponse.json(
        {
          status: 'success',
          orderId,
          escrowStatus: 'DELIVERED_INSPECTION',
          inspectionEndsAt: inspectionEndsAt.toISOString(),
          awb,
          eventId,
        },
        { status: 200 }
      );
    }

    // Acknowledge other statuses (e.g. IN_TRANSIT, OUT_FOR_DELIVERY)
    console.info(`[ShiprocketWebhook] Status "${currentStatus}" recorded. Order ${orderId}.`);
    await IdempotencyService.recordEventProcessed('SHIPROCKET', eventId, rawBody);

    return NextResponse.json(
      {
        status: 'acknowledged',
        currentStatus,
        orderId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process logistics webhook event';
    console.error(`[ShiprocketWebhook] Server processing failure for event ${eventId}:`, error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message,
      },
      { status: 500 }
    );
  }
}
