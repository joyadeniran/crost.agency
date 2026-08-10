import type {
  DiagnosticInputs,
  DiagnosticResult,
  DerivedMetrics,
  DiagnosticOutputs,
  CacSource,
  Confidence,
} from "./types";

/**
 * Bump this whenever the formula changes. Stored on every diagnostic_submissions
 * row so a calculation can always be reproduced against the rules that produced
 * it, even after the engine evolves — never recompute historical rows.
 */
export const FORMULA_VERSION = "v1";

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

  // roas: target value is a multiple (e.g. 3.5), applied against stated monthly ad spend.
  const revenueTarget =
    inputs.monthlyAdSpend !== null
      ? inputs.monthlyAdSpend * inputs.targetValue * months
      : null;
  const targetCustomers =
    aov !== null && aov > 0 && revenueTarget !== null ? revenueTarget / aov : null;
  return { targetCustomers, revenueTarget };
}

function scoreConfidence(derived: DerivedMetrics, inputs: DiagnosticInputs): Confidence {
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

  return {
    formulaVersion: FORMULA_VERSION,
    derivedMetrics,
    outputs,
    confidence: scoreConfidence(derivedMetrics, inputs),
  };
}
