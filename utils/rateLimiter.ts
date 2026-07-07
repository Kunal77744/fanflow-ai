/**
 * Minimal in-memory rate limiter.
 *
 * Good enough for a single-instance demo deployment. In a
 * production/multi-instance setup this would be backed by Redis or a
 * similar shared store instead of process memory.
 */

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

export function isRateLimited(clientKey: string): boolean {
  const now = Date.now();

  // Periodic pruning of expired buckets to prevent memory leaks
  if (buckets.size > 1000) {
    for (const [key, value] of buckets.entries()) {
      if (now - value.windowStart > WINDOW_MS) {
        buckets.delete(key);
      }
    }
  }

  const existing = buckets.get(clientKey);

  if (!existing || now - existing.windowStart > WINDOW_MS) {
    buckets.set(clientKey, { count: 1, windowStart: now });
    return false;
  }

  existing.count += 1;

  if (existing.count > MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  return false;
}
