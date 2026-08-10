import { NextResponse } from "next/server";
import { diagnosticRequestSchema } from "@/lib/validation";
import { computeDiagnostic } from "@/lib/calc/engine";
import { generateNarrative } from "@/lib/ai/narrative";
import { sendDiagnosticEmails } from "@/lib/email/resend";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, clientIdentifier } from "@/lib/security/rateLimit";
import { isLikelyBot } from "@/lib/security/botCheck";

export async function POST(request: Request) {
  const identifier = clientIdentifier(request);
  const { allowed } = await checkRateLimit("diagnostic", identifier);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = diagnosticRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const body = parsed.data;

  if (isLikelyBot({ honeypot: body.honeypot, formRenderedAt: body.formRenderedAt })) {
    // Pretend success to avoid tipping the bot off, but do nothing.
    return NextResponse.json({ leadId: null, diagnosticId: null, result: null });
  }

  // The calculation is always done server-side from validated input — a
  // client can never post pre-computed numbers and have them trusted.
  const result = computeDiagnostic({
    monthlyAdSpend: body.monthlyAdSpend,
    cac: body.cac,
    monthlyCustomersAcquired: body.monthlyCustomersAcquired,
    aovLtv: body.aovLtv,
    grossMarginPct: body.grossMarginPct,
    monthlyVisitors: body.monthlyVisitors,
    conversionRatePct: body.conversionRatePct,
    goalType: body.goalType,
    targetValue: body.targetValue,
    timeframeDays: body.timeframeDays,
  });

  const narrative = await generateNarrative(body.goalType, body.timeframeDays, result);

  const db = supabaseAdmin();

  const { data: lead, error: leadError } = await db
    .from("leads")
    .insert({
      business_name: body.businessName,
      email: body.email,
      industry: body.industry ?? null,
      website: body.website ?? null,
    })
    .select("id")
    .single();

  if (leadError || !lead) {
    console.error("failed to insert lead", leadError);
    return NextResponse.json({ error: "Could not save submission" }, { status: 500 });
  }

  const { data: submission, error: submissionError } = await db
    .from("diagnostic_submissions")
    .insert({
      lead_id: lead.id,
      inputs: body,
      derived_metrics: result.derivedMetrics,
      outputs: result.outputs,
      confidence: result.confidence,
      formula_version: result.formulaVersion,
      ai_narrative: narrative,
    })
    .select("id")
    .single();

  if (submissionError || !submission) {
    console.error("failed to insert diagnostic_submission", submissionError);
    return NextResponse.json({ error: "Could not save submission" }, { status: 500 });
  }

  await sendDiagnosticEmails({
    businessName: body.businessName,
    email: body.email,
    industry: body.industry ?? null,
    inputs: body,
    result,
    diagnosticId: submission.id,
  }).catch((err) => console.error("email send failed (non-fatal)", err));

  return NextResponse.json({
    leadId: lead.id,
    diagnosticId: submission.id,
    result,
    narrative,
  });
}
