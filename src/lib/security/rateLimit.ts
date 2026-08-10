import { supabaseAdmin } from "@/lib/supabase/server";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

/**
 * Simple IP-bucketed rate limit backed by Postgres. Not trying to be
 * clever — a public lead-gen endpoint just needs "stop the obvious
 * hammering," not a distributed token-bucket system.
 */
export async function checkRateLimit(
  bucket: "diagnostic" | "apply" | "analytics",
  identifier: string
): Promise<{ allowed: boolean }> {
  const db = supabaseAdmin();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();

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
    return { allowed: true };
  }

  if ((count ?? 0) >= MAX_PER_WINDOW) {
    return { allowed: false };
  }

  await db.from("rate_limit_events").insert({ bucket, identifier });
  return { allowed: true };
}

export function clientIdentifier(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
