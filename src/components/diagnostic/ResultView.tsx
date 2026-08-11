"use client";

import { ConfidenceBadge, Eyebrow } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  formatCount,
  formatRatio,
  formatUsd,
  formatTimeframe,
  CONFIDENCE_EXPLANATION,
  MISSING_INPUT_LABEL,
  MISSING_INPUT_UNLOCKS,
} from "@/lib/calc/format";
import { track } from "@/lib/analytics/track";
import type { WizardState } from "./types";

export function ResultView({
  state,
  onEdit,
}: {
  state: WizardState;
  onEdit: () => void;
}) {
  const { result, narrative, leadId, diagnosticId, emailed } = state;
  if (!result) return null;

  const { outputs, derivedMetrics, confidence, priceable, missing } = result;

  const targetLabel =
    state.goalType === "customers"
      ? `${formatCount(outputs.targetCustomers)} new customers`
      : state.goalType === "revenue"
        ? `${formatUsd(outputs.revenueTarget)} revenue`
        : `${formatUsd(outputs.revenueTarget)} revenue at ${state.targetValue}× ROAS`;

  const applyHref =
    leadId && diagnosticId
      ? `/apply?lead=${encodeURIComponent(leadId)}&diagnostic=${encodeURIComponent(diagnosticId)}`
      : "/apply";

  return (
    <div className="flex flex-col gap-10">
      <header>
        <Eyebrow className="mb-3">YOUR DIAGNOSTIC</Eyebrow>
        <h1 className="font-display font-semibold text-[34px] sm:text-[40px] leading-[1.05] tracking-[-0.01em] text-crost-black">
          {priceable
            ? "Here’s what the math says."
            : "We can’t price this one yet."}
        </h1>
        <p className="mt-3 font-text text-[15px] leading-relaxed text-text-mid max-w-xl">
          {priceable
            ? `${targetLabel} over ${formatTimeframe(state.timeframeDays)}, modelled on the numbers you gave us.`
            : "Rather than show you a number we’d be guessing at, here’s exactly what’s missing."}
        </p>
      </header>

      {priceable ? (
        <PriceableResult
          targetLabel={targetLabel}
          monthlyMedia={outputs.estimatedMonthlyMediaRequired}
          confidence={confidence}
        />
      ) : (
        <MissingDataPanel missing={missing} onEdit={onEdit} confidence={confidence} />
      )}

      {priceable && (
        <section
          className="rounded-lg border border-border-subtle p-6"
          aria-labelledby="working"
        >
          <Eyebrow id="working" tone="muted" className="mb-4">
            HOW WE GOT HERE
          </Eyebrow>
          <p className="font-mono text-[14px] leading-[2] text-text-hi">
            {formatCount(outputs.targetCustomers)} customers
            <span className="text-text-low"> × </span>
            {formatUsd(derivedMetrics.resolvedCac)} CAC
            <span className="text-text-low"> = </span>
            {formatUsd(outputs.totalAcquisitionSpend)} total acquisition spend
            <br />
            <span className="text-text-low">
              ÷ {formatTimeframe(state.timeframeDays)} ={" "}
            </span>
            {formatUsd(outputs.estimatedMonthlyMediaRequired)} per month
          </p>
          {derivedMetrics.derivationNote && derivedMetrics.cacSource === "derived" && (
            <p className="mt-3 font-text text-[13px] text-text-low">
              {derivedMetrics.derivationNote}
            </p>
          )}
          <p className="mt-4 font-text text-[13px] text-crost-pink-700">
            The maths comes from your inputs. Not an AI guess.
          </p>
        </section>
      )}

      {priceable && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ResultCard
            label="GROSS PROFIT / CUSTOMER"
            value={formatUsd(outputs.grossProfitPerCustomer)}
            hint={
              outputs.grossProfitPerCustomer === null
                ? "Add your gross margin to see this."
                : undefined
            }
          />
          <ResultCard
            label="LTV:CAC"
            value={formatRatio(outputs.ltvToCac)}
            hint={
              outputs.ltvToCac === null
                ? "Add order value to see this."
                : outputs.ltvToCac < 3
                  ? "Below 3× — acquisition is expensive relative to value."
                  : "3× or better is generally healthy."
            }
          />
        </div>
      )}

      {narrative && (
        <section className="rounded-lg bg-crost-black text-white p-6">
          <Eyebrow className="mb-3">WHAT THIS MEANS</Eyebrow>
          <p className="font-text text-[15px] leading-[1.6] text-text-inv-mid">
            {narrative}
          </p>
        </section>
      )}

      <div className="flex flex-col gap-3 border-t border-border-subtle pt-8">
        <p className="font-text text-[13px] leading-relaxed text-text-low max-w-2xl">
          This is an indicative planning model, not a guarantee. A Crost
          strategist reviews every target before anything is signed.
        </p>
        {emailed && (
          <p className="font-text text-[13px] text-text-mid">
            A copy is on its way to{" "}
            <span className="font-semibold text-text-hi">{state.email}</span>.
          </p>
        )}
      </div>

      <div className="flex flex-col items-start gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink
            href={applyHref}
            variant="gradient"
            size="lg"
            onClick={() => track("cta_clicked", { cta: "apply_with_numbers" }, leadId)}
          >
            {priceable ? "Apply with these numbers →" : "Apply anyway →"}
          </ButtonLink>
          <Button type="button" variant="secondary" size="lg" onClick={onEdit}>
            Adjust my numbers
          </Button>
        </div>
        <span className="font-text text-[12px] text-text-low">
          A human reviews every application. No obligation either way.
        </span>
      </div>
    </div>
  );
}

function PriceableResult({
  targetLabel,
  monthlyMedia,
  confidence,
}: {
  targetLabel: string;
  monthlyMedia: number | null;
  confidence: "HIGH" | "MEDIUM" | "NEEDS_MORE_DATA";
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ResultCard label="INDICATIVE TARGET" value={targetLabel} />
      <ResultCard label="EST. MONTHLY MEDIA" value={formatUsd(monthlyMedia)} />
      <div className="rounded-lg bg-surface-1 p-5 flex flex-col justify-between gap-3">
        <Eyebrow tone="muted">CONFIDENCE</Eyebrow>
        <div className="flex flex-col gap-2">
          <ConfidenceBadge confidence={confidence} />
          <p className="font-text text-[12px] leading-relaxed text-text-mid">
            {CONFIDENCE_EXPLANATION[confidence]}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * The honest branch. The old results screen rendered the normal card grid with
 * em dashes in it, so a prospect we couldn't model for saw what looked like a
 * completed model with the numbers redacted. Spec section 3.3 requires us to
 * say plainly that there isn't enough data — and, since we know exactly which
 * inputs are missing, to ask for them.
 */
function MissingDataPanel({
  missing,
  onEdit,
  confidence,
}: {
  missing: string[];
  onEdit: () => void;
  confidence: "HIGH" | "MEDIUM" | "NEEDS_MORE_DATA";
}) {
  return (
    <section className="rounded-lg border-[1.5px] border-danger-tint bg-danger-tint/40 p-6 flex flex-col gap-5">
      {/* The heading above already explains the state — repeating
          CONFIDENCE_EXPLANATION here just says the same thing twice. */}
      <ConfidenceBadge confidence={confidence} />

      <div>
        <Eyebrow tone="muted" className="mb-3">
          WHAT WE STILL NEED
        </Eyebrow>
        <ul className="flex flex-col gap-2.5">
          {missing.map((key) => {
            const label = MISSING_INPUT_LABEL[key as keyof typeof MISSING_INPUT_LABEL];
            const unlocks =
              MISSING_INPUT_UNLOCKS[key as keyof typeof MISSING_INPUT_UNLOCKS];
            if (!label) return null;
            return (
              <li key={key} className="flex items-baseline gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-crost-pink"
                />
                <span className="font-text text-[14.5px] leading-relaxed text-text-hi">
                  {label}
                  {unlocks && (
                    <span className="text-text-low"> — {unlocks}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <Button type="button" variant="primary" onClick={onEdit}>
          Add these numbers →
        </Button>
      </div>
    </section>
  );
}

function ResultCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg bg-surface-1 p-5 flex flex-col gap-2">
      <Eyebrow tone="muted">{label}</Eyebrow>
      <div className="font-display font-semibold text-[28px] sm:text-[32px] leading-[1.1] text-crost-black tabular-nums">
        {value}
      </div>
      {hint && (
        <p className="font-text text-[12px] leading-relaxed text-text-low mt-auto">
          {hint}
        </p>
      )}
    </div>
  );
}
