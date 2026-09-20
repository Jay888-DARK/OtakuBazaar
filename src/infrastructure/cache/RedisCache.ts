/**
 * @file src/infrastructure/cache/RedisCache.ts
 *
 * Infrastructure adapter for caching using Redis.
 * Provides a simple get/set/delete interface with TTL support.
 *
 * NOTE: This is a structural stub. Replace with actual ioredis or
 * @upstash/redis calls when integrating.
 */

// ---------------------------------------------------------------------------
// Cache Interface
// ---------------------------------------------------------------------------

/**
 * Generic cache port. Defined here (not in application/ports) because
 * caching is an infrastructure concern, not a business rule.
 */
export interface ICache {
  /**
   * Retrieves a cached value by key.
   *
   * @param key - The cache key.
   * @returns The cached value, or `null` if not found or expired.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Stores a value in the cache with an optional TTL.
   *
   * @param key - The cache key.
   * @param value - The value to cache (must be JSON-serializable).
   * @param ttlSeconds - Time-to-live in seconds. Omit for no expiry.
   */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /**
   * Removes a value from the cache.
   *
   * @param key - The cache key to delete.
   * @returns `true` if the key existed and was removed.
   */
  delete(key: string): Promise<boolean>;

  /**
   * Removes all keys matching a pattern.
   *
   * @param pattern - Glob-style pattern (e.g., 'listing:*').
   * @returns The number of keys removed.
   */
  deletePattern(pattern: string): Promise<number>;
}

// ---------------------------------------------------------------------------
// In-Memory Cache (Development Stub)
// ---------------------------------------------------------------------------

/** Internal cache entry with optional expiry tracking. */
interface CacheEntry<T> {
  readonly value: T;
  readonly expiresAt: number | null; // Unix timestamp in ms, null = no expiry
}

/**
 * In-memory cache implementation for local development.
 * Replace with Redis (ioredis) or Upstash for production.
 */
export class InMemoryCache implements ICache {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  /** {@inheritDoc ICache.get} */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check expiry
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /** {@inheritDoc ICache.set} */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds !== undefined ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  /** {@inheritDoc ICache.delete} */
  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  /** {@inheritDoc ICache.deletePattern} */
  async deletePattern(pattern: string): Promise<number> {
    // Simple glob: convert 'prefix:*' to a startsWith check
    const prefix = pattern.replace(/\*$/, '');
    let count = 0;

    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }

    return count;
  }
}
