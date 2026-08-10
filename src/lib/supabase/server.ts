import { createClient } from "@supabase/supabase-js";

/**
 * Server-only client using the service role key. Never import this from a
 * "use client" component — the key bypasses RLS entirely. All public writes
 * go through our own API routes, which apply their own validation/rate
 * limiting before touching the database, so the client never talks to
 * Supabase directly.
 */
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. See .env.example."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
