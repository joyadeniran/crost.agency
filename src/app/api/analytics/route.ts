import { NextResponse } from "next/server";
import { analyticsEventSchema } from "@/lib/validation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, clientIdentifier } from "@/lib/security/rateLimit";

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

  const db = supabaseAdmin();
  await db.from("analytics_events").insert({
    event_name: parsed.data.eventName,
    lead_id: parsed.data.leadId ?? null,
    properties: parsed.data.properties ?? null,
  });

  return NextResponse.json({ ok: true });
}
