// In-process rate limiter with TTL.
//
// ⚠️  HONEST THREAT MODEL — DO NOT TRUST THIS IN PRODUCTION
//
// Vercel runs API routes on serverless functions. Each cold start gets a
// fresh process, so the `buckets` Map below resets unpredictably. An
// attacker that varies request patterns can effectively bypass the limit
// without effort — there is NO cross-invocation persistence.
//
// We ship this anyway because:
//   1. It blocks accidental double-click / refresh hammering on warm instances
//   2. It logs intent: "the right place for a real limiter is here"
//
// Pre-launch blocker tracked in `_brain/notes/SECURITY_CHECKLIST.md` §6.
// Real solution: Upstash Redis with a shared bucket. Until then, treat
// `/api/contact` defense as honeypot + 2-second timing check only.

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = buckets.get(key);

  // Poor man's TTL — sweep expired buckets only when the map grows. Using
  // forEach to stay compatible with tsconfig target=es5 without downlevel
  // iteration flag.
  if (buckets.size > 1000) {
    buckets.forEach((v, k) => {
      if (v.resetAt < now) buckets.delete(k);
    });
  }

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { success: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

// Extract client IP from a Next.js Request. Vercel sets `x-forwarded-for`;
// other proxies set `x-real-ip`. Falls back to 'unknown' so the limiter
// still applies a global ceiling to anonymous traffic.
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}
