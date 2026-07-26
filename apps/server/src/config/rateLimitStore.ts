import type { Store } from 'express-rate-limit';

/**
 * Factory for the rate-limit backing store. Returns undefined today, which
 * makes express-rate-limit fall back to its built-in in-memory store — fine
 * for the single-instance deployment target. Swapping to a shared store
 * (e.g. rate-limit-redis) for horizontal scaling only requires changing the
 * body of this function, not any of its call sites.
 */
export function createRateLimitStore(): Store | undefined {
  return undefined;
}
