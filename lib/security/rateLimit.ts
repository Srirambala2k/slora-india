export interface RateLimitDecision {
  allowed: boolean;
  /** Seconds until the caller may retry (0 when allowed). */
  retryAfterSeconds: number;
}

export interface RateLimiter {
  check(key: string, now?: number): RateLimitDecision;
}

/**
 * Sliding-window limiter held in process memory.
 *
 * Good enough to stop a single client hammering the endpoint in development and
 * on one server. On serverless/multi-instance hosting each instance keeps its own
 * counts, so production should swap this for a shared store (e.g. Upstash Redis)
 * behind the same interface — Phase 3 task.
 */
export function createRateLimiter(options: { limit: number; windowMs: number }): RateLimiter {
  const { limit, windowMs } = options;
  const hits = new Map<string, number[]>();

  return {
    check(key, now = Date.now()) {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        const retryAfterMs = windowMs - (now - recent[0]);
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
      }
      recent.push(now);
      hits.set(key, recent);

      if (hits.size > 5000) {
        for (const [k, times] of hits) {
          if (times.every((t) => now - t >= windowMs)) hits.delete(k);
        }
      }
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}
