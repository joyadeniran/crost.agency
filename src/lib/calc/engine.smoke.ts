import { computeDiagnostic } from "./engine";
import { formatUsd, formatRatio } from "./format";

function assertClose(label: string, actual: number | null, expected: number) {
  if (actual === null || Math.abs(actual - expected) > 0.5) {
    throw new Error(`${label}: expected ~${expected}, got ${actual}`);
  }
  console.log(`  ok  ${label} = ${actual.toFixed(2)}`);
}

// Worked example from the brief: 1,000 customers x $12 CAC = $12,000 total spend,
// $4,000/mo over 90 days, $48 AOV/LTV -> $48,000 revenue, 60% margin -> $28,800
// gross profit, LTV:CAC 4.0x.
console.log("Example A — CAC known, goal = customers");
const a = computeDiagnostic({
  monthlyAdSpend: 1500,
  cac: 12,
  monthlyCustomersAcquired: null,
  aovLtv: 48,
  grossMarginPct: 60,
  monthlyVisitors: null,
  conversionRatePct: null,
  goalType: "customers",
  targetValue: 1000,
  timeframeDays: 90,
});
assertClose("totalAcquisitionSpend", a.outputs.totalAcquisitionSpend, 12000);
assertClose("estimatedMonthlyMediaRequired", a.outputs.estimatedMonthlyMediaRequired, 4000);
assertClose("revenueTarget", a.outputs.revenueTarget, 48000);
assertClose("grossProfitTotal", a.outputs.grossProfitTotal, 28800);
assertClose("ltvToCac", a.outputs.ltvToCac, 4.0);
if (a.confidence !== "HIGH") throw new Error(`confidence: expected HIGH, got ${a.confidence}`);
if (a.derivedMetrics.cacSource !== "provided")
  throw new Error(`cacSource: expected provided, got ${a.derivedMetrics.cacSource}`);
console.log(`  ok  confidence = ${a.confidence}`);
console.log(`  ${formatUsd(a.outputs.estimatedMonthlyMediaRequired)}/mo, LTV:CAC ${formatRatio(a.outputs.ltvToCac)}`);

// CAC unknown but derivable: $2,500 spend / 208 customers acquired last month.
console.log("\nExample B — CAC derived from spend ÷ customers acquired");
const b = computeDiagnostic({
  monthlyAdSpend: 2500,
  cac: null,
  monthlyCustomersAcquired: 208,
  aovLtv: 48,
  grossMarginPct: null,
  monthlyVisitors: null,
  conversionRatePct: null,
  goalType: "customers",
  targetValue: 500,
  timeframeDays: 90,
});
assertClose("resolvedCac", b.derivedMetrics.resolvedCac, 12.019);
if (b.derivedMetrics.cacSource !== "derived")
  throw new Error(`cacSource: expected derived, got ${b.derivedMetrics.cacSource}`);
if (b.confidence !== "MEDIUM") throw new Error(`confidence: expected MEDIUM, got ${b.confidence}`);
console.log(`  ok  confidence = ${b.confidence} (margin withheld, so capped below HIGH)`);
console.log(`  ${b.derivedMetrics.derivationNote}`);

// CAC neither known nor derivable at all.
console.log("\nExample C — no CAC, no spend/customers to derive it");
const c = computeDiagnostic({
  monthlyAdSpend: null,
  cac: null,
  monthlyCustomersAcquired: null,
  aovLtv: 48,
  grossMarginPct: 60,
  monthlyVisitors: null,
  conversionRatePct: null,
  goalType: "customers",
  targetValue: 500,
  timeframeDays: 90,
});
if (c.confidence !== "NEEDS_MORE_DATA")
  throw new Error(`confidence: expected NEEDS_MORE_DATA, got ${c.confidence}`);
if (c.outputs.estimatedMonthlyMediaRequired !== null)
  throw new Error("should not fabricate a media requirement without a CAC");
console.log(`  ok  confidence = ${c.confidence}, no media figure fabricated`);
console.log(`  ${c.derivedMetrics.derivationNote}`);

// ROAS goal type.
console.log("\nExample D — ROAS goal");
const d = computeDiagnostic({
  monthlyAdSpend: 10000,
  cac: 25,
  monthlyCustomersAcquired: null,
  aovLtv: 120,
  grossMarginPct: 55,
  monthlyVisitors: null,
  conversionRatePct: null,
  goalType: "roas",
  targetValue: 3.5,
  timeframeDays: 30,
});
assertClose("revenueTarget", d.outputs.revenueTarget, 35000);
assertClose("targetCustomers", d.outputs.targetCustomers, 291.67);
console.log(`  ok  revenueTarget=${formatUsd(d.outputs.revenueTarget)} targetCustomers=${d.outputs.targetCustomers?.toFixed(1)}`);

console.log("\nAll engine smoke tests passed.");
