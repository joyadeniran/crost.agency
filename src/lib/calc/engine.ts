import type {
  DiagnosticInputs,
  DiagnosticResult,
  DerivedMetrics,
  DiagnosticOutputs,
  CacSource,
  Confidence,
  MissingInput,
} from "./types";

/**
 * Bump this whenever the formula changes. Stored on every diagnostic_submissions
 * row so a calculation can always be reproduced against the rules that produced
 * it, even after the engine evolves — never recompute historical rows.
 *
 * v2: confidence is no longer scored purely on which inputs arrived. A result
 * that cannot be priced (most commonly a ROAS goal with no stated ad spend, so
 * there is no base for the multiple to apply to) is now NEEDS_MORE_DATA rather
 * than HIGH-confidence-with-no-numbers. See SPEC 3.3.
 */
export const FORMULA_VERSION = "v2";

function resolveCac(inputs: DiagnosticInputs): {
  source: CacSource;
  value: number | null;
  note: string | null;
} {
  if (inputs.cac !== null && inputs.cac > 0) {
    return { source: "provided", value: inputs.cac, note: null };
  }
  if (
    inputs.monthlyAdSpend !== null &&
    inputs.monthlyAdSpend > 0 &&
    inputs.monthlyCustomersAcquired !== null &&
    inputs.monthlyCustomersAcquired > 0
  ) {
    const derived = inputs.monthlyAdSpend / inputs.monthlyCustomersAcquired;
    return {
      source: "derived",
      value: derived,
      note: `Derived from $${inputs.monthlyAdSpend.toLocaleString(
        "en-US"
      )} monthly ad spend ÷ ${inputs.monthlyCustomersAcquired.toLocaleString(
        "en-US"
      )} customers acquired last month.`,
    };
  }
  return {
    source: "unavailable",
    value: null,
    note: "Not enough acquisition data to price a target yet — no CAC given, and monthly ad spend / customers acquired weren't both provided to derive one.",
  };
}

function resolveTargets(
  inputs: DiagnosticInputs,
  months: number
): { targetCustomers: number | null; revenueTarget: number | null } {
  const aov = inputs.aovLtv;

  if (inputs.goalType === "customers") {
    const targetCustomers = inputs.targetValue;
    const revenueTarget = aov !== null ? targetCustomers * aov : null;
    return { targetCustomers, revenueTarget };
  }

  if (inputs.goalType === "revenue") {
    const revenueTarget = inputs.targetValue;
    const targetCustomers = aov !== null && aov > 0 ? revenueTarget / aov : null;
    return { targetCustomers, revenueTarget };
  }

  // roas: target value is a multiple (e.g. 3.5), applied against stated monthly
  // ad spend. With no stated spend there is nothing for the multiple to act on,
  // so the revenue target is genuinely unknowable rather than zero.
  const revenueTarget =
    inputs.monthlyAdSpend !== null && inputs.monthlyAdSpend > 0
      ? inputs.monthlyAdSpend * inputs.targetValue * months
      : null;
  const targetCustomers =
    aov !== null && aov > 0 && revenueTarget !== null ? revenueTarget / aov : null;
  return { targetCustomers, revenueTarget };
}

/**
 * What the prospect would need to supply to move the result forward, ordered by
 * how much it unlocks. Only surfaced when something is actually missing.
 */
function collectMissing(
  inputs: DiagnosticInputs,
  derived: DerivedMetrics
): MissingInput[] {
  const missing: MissingInput[] = [];

  if (derived.resolvedCac === null) {
    // Either of these paths resolves CAC, so both are worth asking for.
    missing.push("cac");
    if (inputs.monthlyAdSpend === null || inputs.monthlyAdSpend <= 0) {
      missing.push("monthlyAdSpend");
    }
    if (
      inputs.monthlyCustomersAcquired === null ||
      inputs.monthlyCustomersAcquired <= 0
    ) {
      missing.push("monthlyCustomersAcquired");
    }
  } else if (
    inputs.goalType === "roas" &&
    (inputs.monthlyAdSpend === null || inputs.monthlyAdSpend <= 0)
  ) {
    // A ROAS goal is a multiple of spend; without the spend there's no target.
    missing.push("monthlyAdSpend");
  }

  if (inputs.aovLtv === null || inputs.aovLtv <= 0) missing.push("aovLtv");
  if (inputs.grossMarginPct === null) missing.push("grossMarginPct");

  return missing;
}

function scoreConfidence(
  derived: DerivedMetrics,
  inputs: DiagnosticInputs,
  priceable: boolean
): Confidence {
  // A target we can't put a media figure against is not a low-confidence
  // answer, it's an absent one. Saying so is the whole point of the diagnostic.
  if (!priceable) return "NEEDS_MORE_DATA";

  if (
    derived.cacSource === "provided" &&
    inputs.aovLtv !== null &&
    inputs.grossMarginPct !== null
  ) {
    return "HIGH";
  }
  if (derived.resolvedCac !== null && inputs.aovLtv !== null) {
    return "MEDIUM";
  }
  return "NEEDS_MORE_DATA";
}

export function computeDiagnostic(inputs: DiagnosticInputs): DiagnosticResult {
  const months = Math.max(inputs.timeframeDays / 30, 1 / 30);

  const resolved = resolveCac(inputs);
  const derivedMetrics: DerivedMetrics = {
    cacSource: resolved.source,
    resolvedCac: resolved.value,
    derivationNote: resolved.note,
  };

  const { targetCustomers, revenueTarget } = resolveTargets(inputs, months);

  const totalAcquisitionSpend =
    resolved.value !== null && targetCustomers !== null
      ? targetCustomers * resolved.value
      : null;

  const estimatedMonthlyMediaRequired =
    totalAcquisitionSpend !== null ? totalAcquisitionSpend / months : null;

  const grossProfitPerCustomer =
    inputs.aovLtv !== null && inputs.grossMarginPct !== null
      ? inputs.aovLtv * (inputs.grossMarginPct / 100)
      : null;

  const grossProfitTotal =
    revenueTarget !== null && inputs.grossMarginPct !== null
      ? revenueTarget * (inputs.grossMarginPct / 100)
      : null;

  const ltvToCac =
    inputs.aovLtv !== null && resolved.value !== null && resolved.value > 0
      ? inputs.aovLtv / resolved.value
      : null;

  const expectedCustomersFromCurrentSpend =
    inputs.monthlyAdSpend !== null && resolved.value !== null && resolved.value > 0
      ? inputs.monthlyAdSpend / resolved.value
      : null;

  const outputs: DiagnosticOutputs = {
    months,
    targetCustomers,
    revenueTarget,
    totalAcquisitionSpend,
    estimatedMonthlyMediaRequired,
    estimatedCac: resolved.value,
    grossProfitPerCustomer,
    grossProfitTotal,
    ltvToCac,
    expectedCustomersFromCurrentSpend,
  };

  const priceable = estimatedMonthlyMediaRequired !== null;

  return {
    formulaVersion: FORMULA_VERSION,
    derivedMetrics,
    outputs,
    confidence: scoreConfidence(derivedMetrics, inputs, priceable),
    priceable,
    missing: collectMissing(inputs, derivedMetrics),
  };
}
