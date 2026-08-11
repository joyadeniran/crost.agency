import { NextResponse } from "next/server";
import { applicationRequestSchema } from "@/lib/validation";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import { checkRateLimit, clientIdentifier } from "@/lib/security/rateLimit";
import { isLikelyBot } from "@/lib/security/botCheck";
import { sendApplicationEmails } from "@/lib/email/resend";

const ANSWER_LABELS: Record<string, string> = {
  companyStage: "Company stage",
  currentAgency: "Current agency",
  decisionTimeline: "Decision timeline",
  heardAbout: "Heard about Crost via",
  notes: "Notes",
};

export async function POST(request: Request) {
  const identifier = clientIdentifier(request);
  const { allowed, retryAfterSeconds } = await checkRateLimit("apply", identifier);
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

  const parsed = applicationRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_input",
        message: "Some of those details didn't look right. Check them and try again.",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }
  const body = parsed.data;

  if (isLikelyBot({ honeypot: body.honeypot, formElapsedMs: body.formElapsedMs })) {
    return NextResponse.json({ error: "unverified", message: null }, { status: 202 });
  }

  if (!isSupabaseConfigured()) {
    console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set");
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "We can't accept applications right now. Please email hello@crost.agency and we'll pick it up.",
      },
      { status: 503 }
    );
  }

  const db = supabaseAdmin();

  /*
   * Two entry points converge here. Applying straight from the site (the "Apply
   * to Crost" CTAs in the nav, hero and footer) carries no lead, so we create
   * one from the details supplied on the form. Applying from a completed
   * diagnostic carries the lead id, and we use the details already on file.
   * Previously only the second path existed, so every direct CTA dead-ended.
   */
  let leadId: string;
  let businessName: string;
  let email: string;
  let website: string | null = null;

  if (body.leadId) {
    const { data: lead, error: leadError } = await db
      .from("leads")
      .select("id, business_name, email, website")
      .eq("id", body.leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        {
          error: "unknown_lead",
          message:
            "We couldn't find that diagnostic. Run it again and we'll bring your numbers through.",
        },
        { status: 404 }
      );
    }
    leadId = lead.id;
    businessName = lead.business_name;
    email = lead.email;
    website = lead.website ?? null;
  } else {
    // Guaranteed present by the schema refinement when leadId is absent.
    businessName = body.businessName!;
    email = body.email!;

    const { data: created, error: createError } = await db
      .from("leads")
      .insert({ business_name: businessName, email, industry: null, website: null })
      .select("id")
      .single();

    if (createError || !created) {
      console.error("failed to insert lead from application", createError);
      return NextResponse.json(
        {
          error: "save_failed",
          message: "We couldn't save your application. Please try again.",
        },
        { status: 500 }
      );
    }
    leadId = created.id;
  }

  /*
   * A diagnostic id arrives from a query string the applicant can edit, so it
   * is only trusted once we've confirmed it belongs to this lead — otherwise a
   * hand-typed id would staple someone else's model onto this application.
   */
  let diagnosticId: string | null = null;
  if (body.diagnosticId) {
    const { data: diagnostic } = await db
      .from("diagnostic_submissions")
      .select("id")
      .eq("id", body.diagnosticId)
      .eq("lead_id", leadId)
      .maybeSingle();
    diagnosticId = diagnostic?.id ?? null;
  }

  const { data: application, error: applicationError } = await db
    .from("applications")
    .insert({
      lead_id: leadId,
      diagnostic_id: diagnosticId,
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
    return NextResponse.json(
      {
        error: "save_failed",
        message: "We couldn't save your application. Please try again.",
      },
      { status: 500 }
    );
  }

  const answers = (
    ["companyStage", "currentAgency", "decisionTimeline", "heardAbout", "notes"] as const
  ).map((key) => ({ label: ANSWER_LABELS[key], value: body[key] ?? null }));

  await sendApplicationEmails({
    businessName,
    email,
    website,
    applicationId: application.id,
    hasDiagnostic: diagnosticId !== null,
    answers,
  }).catch((err) => console.error("email send failed (non-fatal)", err));

  return NextResponse.json({ applicationId: application.id, leadId });
}
