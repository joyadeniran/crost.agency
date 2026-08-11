import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

export type RateLimitBucket = "diagnostic" | "apply" | "analytics";

/**
 * Per-bucket limits. These are not one number for a reason: a single diagnostic
 * run legitimately fires eight or more analytics events (started, five step
 * completions, completed, result viewed), so a shared 5-per-minute ceiling
 * dropped most of the funnel telemetry on the floor — and dropped it silently,
 * because analytics is fire-and-forget. Submission endpoints stay tight; the
 * event log gets headroom for a normal session, plus a few users behind one
 * office NAT.
 */
const LIMITS: Record<RateLimitBucket, { windowMs: number; max: number }> = {
  diagnostic: { windowMs: 60_000, max: 5 },
  apply: { windowMs: 60_000, max: 5 },
  analytics: { windowMs: 60_000, max: 120 },
};

/**
 * Simple IP-bucketed rate limit backed by Postgres. Not trying to be
 * clever — a public lead-gen endpoint just needs "stop the obvious
 * hammering," not a distributed token-bucket system.
 */
export async function checkRateLimit(
  bucket: RateLimitBucket,
  identifier: string
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const { windowMs, max } = LIMITS[bucket];
  const retryAfterSeconds = Math.ceil(windowMs / 1000);

  // Nothing to rate-limit against without a database. The route itself reports
  // the misconfiguration; the limiter shouldn't throw first and mask it.
  if (!isSupabaseConfigured()) return { allowed: true, retryAfterSeconds };

  const db = supabaseAdmin();
  const since = new Date(Date.now() - windowMs).toISOString();

  const { count, error } = await db
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("bucket", bucket)
    .eq("identifier", identifier)
    .gte("created_at", since);

  if (error) {
    // Fail open on infra errors — a broken rate limiter shouldn't take down
    // the funnel — but log so it gets noticed.
    console.error("rate limit check failed", error);
    return { allowed: true, retryAfterSeconds };
  }

  if ((count ?? 0) >= max) {
    return { allowed: false, retryAfterSeconds };
  }

  const { error: insertError } = await db
    .from("rate_limit_events")
    .insert({ bucket, identifier });
  if (insertError) console.error("rate limit write failed", insertError);

  return { allowed: true, retryAfterSeconds };
}

export function clientIdentifier(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}
