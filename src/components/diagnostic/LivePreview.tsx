"use client";

import { computeDiagnostic } from "@/lib/calc/engine";
import { formatCount, formatRatio, formatUsd } from "@/lib/calc/format";
import { numOrNull } from "@/lib/forms";
import { Eyebrow } from "@/components/ui/Badge";
import type { WizardState } from "./types";
import type { DiagnosticResult } from "@/lib/calc/types";

/**
 * Runs the same pure engine client-side purely for the "feels alive" preview.
 * The authoritative, stored result is always recomputed server-side on submit —
 * this preview is never trusted for anything else.
 */
function preview(state: WizardState): DiagnosticResult {
  return computeDiagnostic({
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
}

function hasSignal(result: DiagnosticResult): boolean {
  return (
    result.outputs.expectedCustomersFromCurrentSpend !== null ||
    result.derivedMetrics.resolvedCac !== null ||
    result.outputs.ltvToCac !== null
  );
}

export function LivePreview({ state }: { state: WizardState }) {
  const result = preview(state);
  const { outputs, derivedMetrics } = result;
  const live = hasSignal(result);

  return (
    <div className="rounded-lg bg-crost-black text-white p-6 flex flex-col gap-5 min-h-80">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>CURRENT MODEL</Eyebrow>
        <span
          className={`font-mono text-[10px] tracking-[0.1em] ${
            live ? "text-crost-pink" : "text-text-inv-low"
          }`}
        >
          {live ? "● LIVE" : "○ WAITING"}
        </span>
      </div>

      {/* aria-live so the numbers updating as you type are announced, not silent. */}
      <div aria-live="polite" className="flex flex-col gap-5 flex-1">
        {!live ? (
          <p className="font-text text-[13.5px] leading-relaxed text-text-inv-mid">
            Fill in your economics and this updates as you go. It runs the same
            maths as your final result — nothing here is an estimate.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <Stat
              label="Customers / mo at today's spend"
              value={formatCount(outputs.expectedCustomersFromCurrentSpend)}
            />
            <Stat
              label={
                derivedMetrics.cacSource === "derived"
                  ? "Derived CAC"
                  : "Your CAC"
              }
              value={formatUsd(derivedMetrics.resolvedCac)}
            />
            <Stat label="LTV:CAC" value={formatRatio(outputs.ltvToCac)} />
          </div>
        )}
      </div>

      {derivedMetrics.derivationNote && derivedMetrics.cacSource === "derived" && (
        <p className="mt-auto font-mono text-[11px] leading-relaxed text-text-inv-low border-t border-border-inv pt-4">
          {derivedMetrics.derivationNote}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display font-semibold text-[28px] leading-none text-white tabular-nums">
        {value}
      </div>
      <div className="font-text text-[11.5px] text-text-inv-low mt-1.5">{label}</div>
    </div>
  );
}

/**
 * Mobile counterpart to the desktop panel. The full panel was hidden below the
 * large breakpoint, which meant most people filling the form on a phone got no
 * feedback at all — the one thing the live model is for.
 */
export function PreviewSummaryBar({ state }: { state: WizardState }) {
  const result = preview(state);
  if (!hasSignal(result)) return null;

  const { outputs, derivedMetrics } = result;

  return (
    <div
      aria-live="polite"
      className="rounded-lg bg-crost-black text-white px-5 py-4 flex items-center justify-between gap-4"
    >
      <Eyebrow className="shrink-0">LIVE</Eyebrow>
      <dl className="flex items-center gap-5 overflow-x-auto">
        <MiniStat label="CAC" value={formatUsd(derivedMetrics.resolvedCac)} />
        <MiniStat label="LTV:CAC" value={formatRatio(outputs.ltvToCac)} />
        <MiniStat
          label="Cust/mo"
          value={formatCount(outputs.expectedCustomersFromCurrentSpend)}
        />
      </dl>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="shrink-0">
      <dd className="font-display font-semibold text-[17px] leading-none text-white tabular-nums">
        {value}
      </dd>
      <dt className="font-text text-[10.5px] text-text-inv-low mt-1">{label}</dt>
    </div>
  );
}
