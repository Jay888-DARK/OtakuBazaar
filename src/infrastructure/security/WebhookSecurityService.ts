/**
 * @file src/infrastructure/security/WebhookSecurityService.ts
 *
 * Single Responsibility: Cryptographic verification of incoming webhook payloads.
 * Protects against tampering and unauthorized calls by enforcing HMAC-SHA256
 * signature validation using timing-safe buffer comparisons.
 */

import crypto from 'crypto';

export class WebhookSecurityService {
  /**
   * Verifies Razorpay webhook signature (HMAC-SHA256).
   *
   * Razorpay computes: HMAC-SHA256(request_raw_body, secret) -> hex digest
   * Delivered in header: `x-razorpay-signature`
   *
   * @param rawBody - Raw unparsed HTTP request body string
   * @param signature - Signature provided in `x-razorpay-signature`
   * @param secret - Webhook secret configured in Razorpay Dashboard
   * @returns `true` if signature matches exactly, `false` otherwise
   */
  public static verifyRazorpaySignature(
    rawBody: string,
    signature: string | null | undefined,
    secret: string
  ): boolean {
    if (!signature || !rawBody || !secret) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
      const actualBuffer = Buffer.from(signature, 'utf-8');

      if (expectedBuffer.length !== actualBuffer.length) {
        return false;
      }

      // Constant-time comparison to prevent timing attacks
      return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    } catch (err) {
      console.error('[WebhookSecurityService] Error verifying Razorpay signature:', err);
      return false;
    }
  }

  /**
   * Verifies Shiprocket webhook payload authenticity.
   *
   * Supports both HMAC-SHA256 signature verification and secret token matching
   * depending on the Shiprocket webhook configuration profile.
   *
   * @param rawBody - Raw unparsed HTTP request body string
   * @param signature - Signature or token in header (`x-shiprocket-signature` or `x-api-key`)
   * @param secret - Webhook secret token configured in Shiprocket
   * @returns `true` if authentic, `false` otherwise
   */
  public static verifyShiprocketSignature(
    rawBody: string,
    signature: string | null | undefined,
    secret: string
  ): boolean {
    if (!signature || !secret) {
      return false;
    }

    try {
      // 1. Direct Secret Token matching (common in Shiprocket webhooks)
      const tokenBuffer = Buffer.from(signature.trim(), 'utf-8');
      const secretBuffer = Buffer.from(secret.trim(), 'utf-8');

      if (tokenBuffer.length === secretBuffer.length && crypto.timingSafeEqual(tokenBuffer, secretBuffer)) {
        return true;
      }

      // 2. HMAC-SHA256 verification (if signature mode is enabled in Shiprocket)
      if (rawBody) {
        const expectedHmac = crypto
          .createHmac('sha256', secret)
          .update(rawBody)
          .digest('hex');

        const expectedHmacBuffer = Buffer.from(expectedHmac, 'utf-8');
        if (expectedHmacBuffer.length === tokenBuffer.length && crypto.timingSafeEqual(expectedHmacBuffer, tokenBuffer)) {
          return true;
        }
      }

      return false;
    } catch (err) {
      console.error('[WebhookSecurityService] Error verifying Shiprocket signature:', err);
      return false;
    }
  }
}
