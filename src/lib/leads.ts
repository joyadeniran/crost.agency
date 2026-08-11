// Server-only: reaches the database through the service-role client. Never
// import this from a "use client" module.
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Confidence, GoalType } from "@/lib/calc/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export interface DiagnosticContext {
  leadId: string;
  businessName: string;
  email: string;
  diagnosticId: string | null;
  summary: {
    goalType: GoalType;
    targetValue: number;
    timeframeDays: number;
    confidence: Confidence;
    estimatedMonthlyMediaRequired: number | null;
    targetCustomers: number | null;
    revenueTarget: number | null;
    ltvToCac: number | null;
    priceable: boolean;
  } | null;
}

/**
 * Loads the lead (and, when it belongs to that lead, the diagnostic) behind an
 * /apply link.
 *
 * The diagnostic is looked up scoped to the lead rather than by id alone: both
 * values come from a query string the visitor can edit, and an unscoped lookup
 * would let a hand-typed id attach someone else's model to this application.
 *
 * Returns null for anything that doesn't resolve — a stale link, a mistyped id,
 * an unconfigured database — so the caller can fall back to the standalone
 * application form instead of showing an error.
 */
export async function loadDiagnosticContext(
  leadParam: string | null,
  diagnosticParam: string | null
): Promise<DiagnosticContext | null> {
  if (!isUuid(leadParam) || !isSupabaseConfigured()) return null;

  try {
    const db = supabaseAdmin();

    const { data: lead, error: leadError } = await db
      .from("leads")
      .select("id, business_name, email")
      .eq("id", leadParam)
      .maybeSingle();

    if (leadError || !lead) return null;

    const context: DiagnosticContext = {
      leadId: lead.id,
      businessName: lead.business_name,
      email: lead.email,
      diagnosticId: null,
      summary: null,
    };

    if (!isUuid(diagnosticParam)) return context;

    const { data: diagnostic } = await db
      .from("diagnostic_submissions")
      .select("id, inputs, outputs, confidence")
      .eq("id", diagnosticParam)
      .eq("lead_id", lead.id)
      .maybeSingle();

    if (!diagnostic) return context;

    const inputs = (diagnostic.inputs ?? {}) as Record<string, unknown>;
    const outputs = (diagnostic.outputs ?? {}) as Record<string, unknown>;
    const monthlyMedia = numberOrNull(outputs.estimatedMonthlyMediaRequired);

    context.diagnosticId = diagnostic.id;
    context.summary = {
      goalType: (inputs.goalType as GoalType) ?? "customers",
      targetValue: numberOrNull(inputs.targetValue) ?? 0,
      timeframeDays: numberOrNull(inputs.timeframeDays) ?? 90,
      confidence: (diagnostic.confidence as Confidence) ?? "NEEDS_MORE_DATA",
      estimatedMonthlyMediaRequired: monthlyMedia,
      targetCustomers: numberOrNull(outputs.targetCustomers),
      revenueTarget: numberOrNull(outputs.revenueTarget),
      ltvToCac: numberOrNull(outputs.ltvToCac),
      priceable: monthlyMedia !== null,
    };

    return context;
  } catch (err) {
    console.error("failed to load diagnostic context", err);
    return null;
  }
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
