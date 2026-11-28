/**
 * @file src/app/api/webhooks/courier/route.ts
 *
 * Next.js App Router Route Handler for Courier / Shiprocket Logistics Webhooks.
 *
 * Enforces:
 *   1. `x-api-key` (or HMAC-SHA256 signature) verification against `SHIPROCKET_WEBHOOK_SECRET` (401 on mismatch).
 *   2. Idempotency logging via `IdempotencyLog` (HTTP 200 no-op on duplicates).
 *   3. Logistics lifecycle transition to `DELIVERED_INSPECTION` upon delivery.
 *   4. Automated 48-Hour Inspection Timer initialization (`inspection_ends_at = NOW + 48h`).
 */

import { NextRequest, NextResponse } from 'next/server';
import { WebhookSecurityService } from '@/infrastructure/security/WebhookSecurityService';
import { IdempotencyService } from '@/infrastructure/database/IdempotencyService';
import { OrderRepository } from '@/infrastructure/database/repositories/OrderRepository';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  console.info(`[CourierWebhook] Received webhook at ${timestamp}`);

  // 1. Read Raw Body & Verify x-api-key / signature against SHIPROCKET_WEBHOOK_SECRET
  const rawBody = await req.text();
  const signature =
    req.headers.get('x-api-key') ||
    req.headers.get('x-shiprocket-signature') ||
    req.headers.get('authorization');
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;

  if (!secret) {
    console.error('[CourierWebhook] CRITICAL: SHIPROCKET_WEBHOOK_SECRET is not configured.');
    return NextResponse.json({ error: 'Server misconfiguration: Webhook secret missing' }, { status: 500 });
  }

  const isValid = WebhookSecurityService.verifyShiprocketSignature(rawBody, signature, secret);

  if (!isValid) {
    console.warn('[CourierWebhook] 401 Unauthorized: Invalid or missing x-api-key / signature');
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Courier webhook authentication failed',
      },
      { status: 401 }
    );
  }

  // 2. Parse JSON Event Payload
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch (err) {
    console.error('[CourierWebhook] Failed to parse JSON body:', err);
    return NextResponse.json({ error: 'Bad Request', message: 'Malformed JSON payload' }, { status: 400 });
  }

  const currentStatus = String(payload.current_status || payload.event || payload.status || '').toUpperCase();
  // Prefer channel_order_id / reference_id (our internal Order.id) over courier's numeric order_id
  const orderId = String(payload.channel_order_id || payload.reference_id || payload.order_id || '');
  const awb = String(payload.awb_code || payload.awb || payload.courier_awb || '');
  const shipmentId = payload.shipment_id ? String(payload.shipment_id) : undefined;
  void shipmentId;

  const eventId = `sr_${orderId || 'no_order'}_${awb || 'no_awb'}_${currentStatus}`;

  // 3. Idempotency Check
  const alreadyProcessed = await IdempotencyService.isEventProcessed('SHIPROCKET', eventId);
  if (alreadyProcessed) {
    console.info(`[CourierWebhook] Idempotent hit: Event ${eventId} already processed. Returning HTTP 200.`);
    return NextResponse.json(
      {
        status: 'ok',
        duplicate: true,
        message: `Event ${eventId} has already been processed`,
      },
      { status: 200 }
    );
  }

  // 4. Process Shipment Lifecycle
  try {
    const isDelivered =
      currentStatus === 'DELIVERED' ||
      currentStatus === 'SHIPMENT.DELIVERED' ||
      payload.current_status_id === 7 ||
      currentStatus.includes('DELIVERED');

    if (isDelivered) {
      if (!orderId) {
        throw new Error('Missing order_id in courier delivery webhook');
      }

      const inspectionDurationMs = 48 * 60 * 60 * 1000;
      const inspectionEndsAt = new Date(Date.now() + inspectionDurationMs);

      await OrderRepository.updateEscrowStatus(orderId, {
        escrowStatus: 'DELIVERED_INSPECTION',
        inspectionEndsAt,
        shiprocketAwb: awb || undefined,
      });

      await IdempotencyService.recordEventProcessed('SHIPROCKET', eventId, rawBody);

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
    console.error(`[CourierWebhook] Server processing failure for event ${eventId}:`, error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message,
      },
      { status: 500 }
    );
  }
}
