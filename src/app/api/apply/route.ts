import { NextResponse } from "next/server";
import { applicationRequestSchema } from "@/lib/validation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, clientIdentifier } from "@/lib/security/rateLimit";
import { isLikelyBot } from "@/lib/security/botCheck";
import { sendApplicationEmails } from "@/lib/email/resend";

export async function POST(request: Request) {
  const identifier = clientIdentifier(request);
  const { allowed } = await checkRateLimit("apply", identifier);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = applicationRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const body = parsed.data;

  if (isLikelyBot({ honeypot: body.honeypot, formRenderedAt: body.formRenderedAt })) {
    return NextResponse.json({ applicationId: null });
  }

  const db = supabaseAdmin();

  const { data: lead, error: leadError } = await db
    .from("leads")
    .select("business_name, email")
    .eq("id", body.leadId)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: "Unknown lead" }, { status: 404 });
  }

  const { data: application, error: applicationError } = await db
    .from("applications")
    .insert({
      lead_id: body.leadId,
      diagnostic_id: body.diagnosticId ?? null,
      company_stage: body.companyStage ?? null,
      current_agency: body.currentAgency ?? null,
      decision_timeline: body.decisionTimeline ?? null,
      heard_about: body.heardAbout ?? null,
      notes: body.notes ?? null,
    })
    .select("id")
    .single();

  if (applicationError || !application) {
    console.error("failed to insert application", applicationError);
    return NextResponse.json({ error: "Could not save application" }, { status: 500 });
  }

  const summaryHtml = `
    <ul>
      <li>Company stage: ${body.companyStage ?? "—"}</li>
      <li>Current agency: ${body.currentAgency ?? "—"}</li>
      <li>Decision timeline: ${body.decisionTimeline ?? "—"}</li>
      <li>Heard about Crost via: ${body.heardAbout ?? "—"}</li>
      <li>Notes: ${body.notes ?? "—"}</li>
    </ul>
  `;

  await sendApplicationEmails({
    businessName: lead.business_name,
    email: lead.email,
    summaryHtml,
  }).catch((err) => console.error("email send failed (non-fatal)", err));

  return NextResponse.json({ applicationId: application.id });
}
