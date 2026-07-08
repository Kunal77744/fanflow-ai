/**
 * Minimal in-memory TTL cache.
 *
 * Shared by any module that needs "remember a value for N ms, then treat
 * it as stale." Good enough for a single-instance demo deployment. In a
 * production/multi-instance setup this would be backed by Redis or a
 * similar shared store instead of process memory.
 */
export class TTLCache<T> {
  private store = new Map<string, { value: T; timestamp: number }>();

  constructor(private ttlMs: number) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp >= this.ttlMs) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    this.pruneExpired();
    this.store.set(key, { value, timestamp: Date.now() });
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now - entry.timestamp >= this.ttlMs) {
        this.store.delete(key);
      }
    }
  }
}
