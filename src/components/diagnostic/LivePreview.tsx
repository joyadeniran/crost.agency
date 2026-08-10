"use client";

import { computeDiagnostic } from "@/lib/calc/engine";
import { formatCount, formatRatio, formatUsd } from "@/lib/calc/format";
import { numOrNull } from "@/lib/forms";
import type { WizardState } from "./types";

/**
 * Runs the same pure engine client-side purely for the "feels alive" preview
 * (brief section 37). The authoritative, stored result is always recomputed
 * server-side on submit — this preview is never trusted for anything else.
 */
export function LivePreview({ state }: { state: WizardState }) {
  const result = computeDiagnostic({
    monthlyAdSpend: numOrNull(state.monthlyAdSpend),
    cac: numOrNull(state.cac),
    monthlyCustomersAcquired: numOrNull(state.monthlyCustomersAcquired),
    aovLtv: numOrNull(state.aovLtv),
    grossMarginPct: numOrNull(state.grossMarginPct),
    monthlyVisitors: numOrNull(state.monthlyVisitors),
    conversionRatePct: numOrNull(state.conversionRatePct),
    goalType: state.goalType,
    targetValue: numOrNull(state.targetValue) ?? 0,
    timeframeDays: state.timeframeDays,
  });

  const { outputs, derivedMetrics } = result;
  const hasAnything =
    outputs.expectedCustomersFromCurrentSpend !== null ||
    derivedMetrics.resolvedCac !== null ||
    outputs.ltvToCac !== null;

  return (
    <div className="rounded-lg bg-crost-black text-white p-6 flex flex-col gap-5 h-full">
      <div className="font-text font-semibold text-[11px] tracking-[0.18em] text-crost-pink">
        CURRENT MODEL
      </div>
      {!hasAnything ? (
        <p className="font-text text-[13.5px] leading-relaxed text-text-inv-mid">
          Fill in your economics and this updates as you go.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <Stat label="Estimated customers / mo" value={formatCount(outputs.expectedCustomersFromCurrentSpend)} />
          <Stat label="Estimated CAC" value={formatUsd(derivedMetrics.resolvedCac)} />
          <Stat label="LTV:CAC" value={formatRatio(outputs.ltvToCac)} />
        </div>
      )}
      {derivedMetrics.derivationNote && (
        <p className="mt-auto font-mono text-[11px] leading-relaxed text-text-inv-low border-t border-[#24242B] pt-4">
          {derivedMetrics.derivationNote}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display font-semibold text-[28px] leading-none text-white">
        {value}
      </div>
      <div className="font-text text-[11.5px] text-text-inv-low mt-1.5">{label}</div>
    </div>
  );
}
