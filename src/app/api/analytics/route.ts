import { NextResponse } from "next/server";
import { analyticsEventSchema } from "@/lib/validation";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import { checkRateLimit, clientIdentifier } from "@/lib/security/rateLimit";

/**
 * First-party event log. Every failure path here is deliberately quiet and
 * non-blocking: analytics must never be the reason a prospect can't finish the
 * funnel it exists to measure.
 */
export async function POST(request: Request) {
  const identifier = clientIdentifier(request);
  const { allowed } = await checkRateLimit("analytics", identifier);
  if (!allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = json ? analyticsEventSchema.safeParse(json) : null;
  if (!parsed?.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    // Not an error worth surfacing — the site works fine without a log.
    return NextResponse.json({ ok: true, stored: false });
  }

  const db = supabaseAdmin();
  const { error } = await db.from("analytics_events").insert({
    event_name: parsed.data.eventName,
    lead_id: parsed.data.leadId ?? null,
    properties: parsed.data.properties ?? null,
  });

  if (error) {
    console.error("analytics insert failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true });
}
