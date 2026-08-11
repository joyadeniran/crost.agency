import { NextResponse } from "next/server";
import { diagnosticRequestSchema } from "@/lib/validation";
import { computeDiagnostic } from "@/lib/calc/engine";
import { generateNarrative } from "@/lib/ai/narrative";
import { sendDiagnosticEmails } from "@/lib/email/resend";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import { checkRateLimit, clientIdentifier } from "@/lib/security/rateLimit";
import { isLikelyBot } from "@/lib/security/botCheck";

export async function POST(request: Request) {
  const identifier = clientIdentifier(request);
  const { allowed, retryAfterSeconds } = await checkRateLimit("diagnostic", identifier);
  if (!allowed) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "That's a few submissions in quick succession. Try again in a minute.",
      },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  const json = await request.json().catch(() => null);
  if (!json) {
    return NextResponse.json(
      { error: "invalid_json", message: "We couldn't read that submission." },
      { status: 400 }
    );
  }

  const parsed = diagnosticRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_input",
        message: "Some of those figures didn't look right. Check them and try again.",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }
  const body = parsed.data;

  if (isLikelyBot({ honeypot: body.honeypot, formElapsedMs: body.formElapsedMs })) {
    // Accepted-looking, but nothing is stored. The client renders a neutral
    // "couldn't verify this submission" message rather than a generic failure,
    // so a false positive at least tells a real person to try again.
    return NextResponse.json({ error: "unverified", message: null }, { status: 202 });
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

  if (!isSupabaseConfigured()) {
    console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set");
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "We can't save diagnostics right now. Please try again shortly, or email hello@crost.agency.",
      },
      { status: 503 }
    );
  }

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
    return NextResponse.json(
      {
        error: "save_failed",
        message: "We couldn't save your diagnostic. Please try again.",
      },
      { status: 500 }
    );
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
    return NextResponse.json(
      {
        error: "save_failed",
        message: "We couldn't save your diagnostic. Please try again.",
      },
      { status: 500 }
    );
  }

  // Email is best-effort: the result is already stored and is about to be shown
  // on screen, so a mail failure must not fail the request.
  const emailResult = await sendDiagnosticEmails({
    businessName: body.businessName,
    email: body.email,
    industry: body.industry ?? null,
    website: body.website ?? null,
    inputs: body,
    result,
    leadId: lead.id,
    diagnosticId: submission.id,
  }).catch((err) => {
    console.error("email send failed (non-fatal)", err);
    return null;
  });

  return NextResponse.json({
    leadId: lead.id,
    diagnosticId: submission.id,
    result,
    narrative,
    // Lets the results screen promise a copy in the inbox only when one is
    // genuinely on its way.
    emailed: emailResult?.prospect.sent ?? false,
  });
}
