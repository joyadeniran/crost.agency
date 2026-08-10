"use client";

import Link from "next/link";
import { ConfidenceBadge } from "@/components/ui/Badge";
import { formatCount, formatRatio, formatUsd } from "@/lib/calc/format";
import { track } from "@/lib/analytics/track";
import type { WizardState } from "./types";

export function ResultView({ state }: { state: WizardState }) {
  const { result, narrative, leadId, diagnosticId } = state;
  if (!result) return null;

  const { outputs, derivedMetrics, confidence } = result;

  const targetLabel =
    state.goalType === "customers"
      ? `${formatCount(outputs.targetCustomers)} new customers`
      : state.goalType === "revenue"
        ? `${formatUsd(outputs.revenueTarget)} revenue`
        : `${formatUsd(outputs.revenueTarget)} revenue at ${state.targetValue}× ROAS`;

  const applyHref = `/apply?lead=${leadId ?? ""}&diagnostic=${diagnosticId ?? ""}`;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="font-text font-semibold text-[11px] tracking-[0.18em] text-crost-pink mb-3">
          YOUR DIAGNOSTIC
        </div>
        <h1 className="font-display font-semibold text-[40px] leading-[1.05] tracking-[-0.01em] text-crost-black">
          Here&rsquo;s what the math says.
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResultCard label="INDICATIVE TARGET" value={targetLabel} />
        <ResultCard
          label="EST. MONTHLY MEDIA"
          value={formatUsd(outputs.estimatedMonthlyMediaRequired)}
        />
        <div className="rounded-lg bg-surface-1 p-5 flex flex-col justify-between gap-3">
          <div className="font-text font-semibold text-[11px] tracking-[0.18em] text-text-low">
            CONFIDENCE
          </div>
          <ConfidenceBadge confidence={confidence} />
        </div>
      </div>

      <div className="rounded-lg border border-[#E4E7EC] p-6">
        <div className="font-text font-semibold text-[11px] tracking-[0.18em] text-text-low mb-4">
          HOW WE GOT HERE
        </div>
        <div className="font-mono text-[14px] leading-[2] text-text-hi">
          {formatCount(outputs.targetCustomers)} customers
          <span className="text-text-low"> × </span>
          {formatUsd(derivedMetrics.resolvedCac)} CAC
          <span className="text-text-low"> = </span>
          {formatUsd(outputs.totalAcquisitionSpend)} total acquisition spend
        </div>
        {derivedMetrics.derivationNote && (
          <div className="mt-3 font-text text-[13px] text-text-low">
            {derivedMetrics.derivationNote}
          </div>
        )}
        <div className="mt-4 font-text text-[13px] text-crost-pink-700">
          The maths comes from your inputs. Not an AI guess.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultCard
          label="GROSS PROFIT / CUSTOMER"
          value={formatUsd(outputs.grossProfitPerCustomer)}
        />
        <ResultCard label="LTV:CAC" value={formatRatio(outputs.ltvToCac)} />
      </div>

      {narrative && (
        <div className="rounded-lg bg-crost-black text-white p-6">
          <div className="font-text font-semibold text-[11px] tracking-[0.18em] text-crost-pink mb-3">
            WHAT THIS MEANS
          </div>
          <p className="font-text text-[15px] leading-[1.6] text-text-inv-mid">
            {narrative}
          </p>
        </div>
      )}

      <p className="font-text text-[13px] leading-relaxed text-text-low max-w-2xl">
        This is an indicative planning model, not a guarantee. A Crost strategist
        reviews every target before anything is signed.
      </p>

      <div className="flex flex-col items-start gap-2 pt-2">
        <Link
          href={applyHref}
          onClick={() => track("cta_clicked", { cta: "apply_with_numbers" }, leadId)}
          className="inline-flex items-center justify-center gap-2 rounded-md font-text font-semibold whitespace-nowrap h-[52px] px-7 text-[16px] text-white bg-[linear-gradient(115deg,#FF40D8,#A64CFF)] hover:brightness-110 transition-[filter] duration-[var(--dur-quick)]"
        >
          Apply with these numbers →
        </Link>
        <span className="font-text text-[12px] text-text-low">
          A human reviews every application.
        </span>
      </div>
    </div>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-1 p-5 flex flex-col gap-2">
      <div className="font-text font-semibold text-[11px] tracking-[0.18em] text-text-low">
        {label}
      </div>
      <div className="font-display font-semibold text-[32px] leading-none text-crost-black">
        {value}
      </div>
    </div>
  );
}
