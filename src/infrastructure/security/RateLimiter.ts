/**
 * @file src/infrastructure/security/RateLimiter.ts
 *
 * Real-Time Negotiation Rate Limiter for OtakuBazaar.
 * Protects Pusher WebSocket broadcast endpoints from brute-force spam and DDoS.
 */

// In-memory rate store mapping IP/client identifiers to timestamp (ms)
const rateLimitStore = new Map<string, number>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

export class RateLimiter {
  /**
   * Evaluates if a given IP or client key is rate-limited within a sliding window.
   *
   * @param key - IP address or unique client identifier (e.g., from 'x-forwarded-for')
   * @param windowMs - Cooldown period in milliseconds (default: 3000ms = 3s)
   */
  public static check(key: string, windowMs: number = 3000): RateLimitResult {
    const now = Date.now();
    const lastRequest = rateLimitStore.get(key);

    if (lastRequest && now - lastRequest < windowMs) {
      const retryAfterMs = windowMs - (now - lastRequest);
      return { allowed: false, retryAfterMs };
    }

    rateLimitStore.set(key, now);

    // Housekeeping: prevent unbounded map memory growth
    if (rateLimitStore.size > 10000) {
      const threshold = now - windowMs * 10;
      for (const [k, timestamp] of rateLimitStore.entries()) {
        if (timestamp < threshold) {
          rateLimitStore.delete(k);
        }
      }
    }

    return { allowed: true, retryAfterMs: 0 };
  }

  /**
   * Resets rate limit for a key (useful in test suites)
   */
  public static reset(key?: string): void {
    if (key) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.clear();
    }
  }
}
