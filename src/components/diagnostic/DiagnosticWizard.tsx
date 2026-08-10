"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ProgressSteps } from "@/components/ui/Badge";
import { Honeypot } from "@/components/ui/Honeypot";
import { Logo } from "@/components/brand/Logo";
import { LivePreview } from "./LivePreview";
import { ResultView } from "./ResultView";
import { initialWizardState, type WizardState } from "./types";
import { numOrNull } from "@/lib/forms";
import { track } from "@/lib/analytics/track";

const TIMEFRAMES = [
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
  { value: 180, label: "6 months" },
  { value: 365, label: "12 months" },
];

const GOAL_OPTIONS = [
  { value: "customers" as const, label: "New customers" },
  { value: "revenue" as const, label: "Revenue" },
  { value: "roas" as const, label: "ROAS" },
];

export function DiagnosticWizard() {
  const [state, setState] = useState<WizardState>(initialWizardState);
  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  useEffect(() => {
    if (state.step === 0) return;
    track("diagnostic_step_completed", { step: state.step });
  }, [state.step]);

  function start() {
    setState((s) => ({ ...s, step: 1, formRenderedAt: Date.now() }));
    track("diagnostic_started");
  }

  async function submit() {
    setState((s) => ({ ...s, submitting: true, submitError: null }));
    try {
      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: state.businessName,
          email: state.email,
          industry: state.industry || null,
          website: state.website || null,
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
          honeypot: state.honeypot,
          formRenderedAt: state.formRenderedAt,
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      if (!data.result) throw new Error("No result returned");
      setState((s) => ({
        ...s,
        submitting: false,
        step: 6,
        leadId: data.leadId,
        diagnosticId: data.diagnosticId,
        result: data.result,
        narrative: data.narrative,
      }));
      track("diagnostic_completed", {}, data.leadId);
      track("result_viewed", {}, data.leadId);
    } catch (err) {
      console.error(err);
      setState((s) => ({
        ...s,
        submitting: false,
        submitError: "Something went wrong saving your diagnostic. Please try again.",
      }));
    }
  }

  if (state.step === 0) return <Intro onStart={start} />;
  if (state.step === 6) return <ResultShell state={state} />;

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      <TopBar step={state.step} />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-12 lg:py-20">
          <div className="w-full max-w-md">
            <StepBody state={state} set={set} onSubmit={submit} />
          </div>
        </div>
        <div className="hidden lg:flex items-center justify-center bg-surface-1 px-10 py-20">
          <div className="w-full max-w-sm h-80">
            <LivePreview state={state} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-crost-black text-white flex items-center justify-center px-6">
      <div className="max-w-xl text-center flex flex-col items-center gap-6">
        <div className="font-text font-semibold text-[12px] tracking-[0.22em] text-crost-pink">
          CROST DIAGNOSTIC
        </div>
        <h1 className="font-display font-semibold text-[52px] leading-[1.05] tracking-[-0.02em]">
          What&rsquo;s the number?
        </h1>
        <p className="font-text font-light text-[18px] leading-[1.5] text-text-inv-mid max-w-md">
          Let&rsquo;s see what your current economics can support.
        </p>
        <div className="font-mono text-[12px] text-text-inv-low tracking-[0.04em]">
          5–7 minutes · Free · No commitment
        </div>
        <Button variant="primary" size="lg" onClick={onStart} className="mt-2">
          Start diagnostic →
        </Button>
      </div>
    </div>
  );
}

function TopBar({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E7EC]">
      <Link href="/">
        <Logo fill="#0A0A0A" width={120} />
      </Link>
      <ProgressSteps step={step} total={5} />
    </div>
  );
}

function ResultShell({ state }: { state: WizardState }) {
  return (
    <div className="min-h-screen bg-surface-0">
      <TopBar step={5} />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <ResultView state={state} />
      </div>
    </div>
  );
}

function StepBody({
  state,
  set,
  onSubmit,
}: {
  state: WizardState;
  set: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  onSubmit: () => void;
}) {
  const goNext = () => set("step", (Math.min(state.step + 1, 5)) as WizardState["step"]);
  const goBack = () => set("step", (Math.max(state.step - 1, 1)) as WizardState["step"]);

  if (state.step === 1) {
    return (
      <StepShell
        title="Tell us what you're building."
        onNext={goNext}
        nextDisabled={!state.businessName.trim() || !state.email.trim()}
      >
        <Input
          name="businessName"
          label="Business name"
          value={state.businessName}
          onChange={(e) => set("businessName", e.target.value)}
        />
        <Input
          name="email"
          label="Work email"
          type="email"
          placeholder="you@company.com"
          value={state.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <Input
          name="industry"
          label="Industry"
          placeholder="Fintech, D2C, SaaS…"
          value={state.industry}
          onChange={(e) => set("industry", e.target.value)}
        />
        <Input
          name="website"
          label="Website (optional)"
          value={state.website}
          onChange={(e) => set("website", e.target.value)}
          help="Useful for human review later."
        />
      </StepShell>
    );
  }

  if (state.step === 2) {
    return (
      <StepShell title="Show us where you are." onNext={goNext} onBack={goBack}>
        <Input
          name="monthlyAdSpend"
          label="Monthly ad spend"
          prefix="$"
          type="number"
          inputMode="decimal"
          value={state.monthlyAdSpend}
          onChange={(e) => set("monthlyAdSpend", e.target.value)}
        />
        <Input
          name="cac"
          label="CAC"
          prefix="$"
          type="number"
          inputMode="decimal"
          value={state.cac}
          onChange={(e) => set("cac", e.target.value)}
          help="Don't know it? Leave it blank — we'll try to derive it below."
        />
        <Input
          name="aovLtv"
          label="Average order value / customer LTV"
          prefix="$"
          type="number"
          inputMode="decimal"
          value={state.aovLtv}
          onChange={(e) => set("aovLtv", e.target.value)}
        />
        <Input
          name="grossMarginPct"
          label="Gross margin"
          suffix="%"
          type="number"
          inputMode="decimal"
          value={state.grossMarginPct}
          onChange={(e) => set("grossMarginPct", e.target.value)}
        />
        <Input
          name="monthlyCustomersAcquired"
          label="Monthly customers acquired"
          type="number"
          inputMode="decimal"
          value={state.monthlyCustomersAcquired}
          onChange={(e) => set("monthlyCustomersAcquired", e.target.value)}
          help="If CAC is blank, we derive it from spend ÷ this number."
        />
      </StepShell>
    );
  }

  if (state.step === 3) {
    return (
      <StepShell
        title="How does the funnel behave?"
        onNext={goNext}
        onBack={goBack}
        footNote="Don't know it? Fine. We'll work with what we have."
      >
        <Input
          name="monthlyVisitors"
          label="Monthly visitors"
          type="number"
          inputMode="decimal"
          value={state.monthlyVisitors}
          onChange={(e) => set("monthlyVisitors", e.target.value)}
        />
        <Input
          name="conversionRatePct"
          label="Conversion rate"
          suffix="%"
          type="number"
          inputMode="decimal"
          value={state.conversionRatePct}
          onChange={(e) => set("conversionRatePct", e.target.value)}
        />
      </StepShell>
    );
  }

  if (state.step === 4) {
    return (
      <StepShell
        title="Where do you want to go?"
        onNext={goNext}
        onBack={goBack}
        nextDisabled={!state.targetValue.trim()}
      >
        <div className="flex flex-col gap-2">
          <span className="font-text font-semibold text-[12.5px] text-text-hi">
            I want to grow…
          </span>
          <SegmentedControl
            name="goalType"
            options={GOAL_OPTIONS}
            value={state.goalType}
            onChange={(v) => set("goalType", v)}
          />
        </div>
        <Input
          name="targetValue"
          label={
            state.goalType === "customers"
              ? "Target (new customers)"
              : state.goalType === "revenue"
                ? "Target (revenue)"
                : "Target ROAS"
          }
          prefix={state.goalType === "revenue" ? "$" : undefined}
          suffix={state.goalType === "roas" ? "×" : undefined}
          type="number"
          inputMode="decimal"
          value={state.targetValue}
          onChange={(e) => set("targetValue", e.target.value)}
        />
        <div className="flex flex-col gap-2">
          <span className="font-text font-semibold text-[12.5px] text-text-hi">
            Timeframe
          </span>
          <div className="flex flex-wrap gap-2">
            {TIMEFRAMES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set("timeframeDays", t.value)}
                className={`h-9 px-3.5 rounded-full font-text text-[13px] font-semibold transition-colors duration-[var(--dur-quick)] ${
                  state.timeframeDays === t.value
                    ? "bg-crost-black text-white"
                    : "border-[1.5px] border-crost-black text-crost-black"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </StepShell>
    );
  }

  // step 5 — email gate
  return (
    <StepShell
      title="Where should we send the model?"
      onBack={goBack}
      onNext={onSubmit}
      nextLabel={state.submitting ? "Calculating…" : "See my numbers →"}
      nextDisabled={!state.email.trim() || state.submitting}
    >
      <Input
        name="email"
        label="Email"
        type="email"
        value={state.email}
        onChange={(e) => set("email", e.target.value)}
      />
      <Honeypot value={state.honeypot} onChange={(v) => set("honeypot", v)} />
      {state.submitError && (
        <p className="text-[13px] text-danger">{state.submitError}</p>
      )}
    </StepShell>
  );
}

function StepShell({
  title,
  children,
  onNext,
  onBack,
  nextLabel = "Continue →",
  nextDisabled,
  footNote,
}: {
  title: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  footNote?: string;
}) {
  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!nextDisabled) onNext?.();
      }}
    >
      <h2 className="font-display font-semibold text-[28px] leading-[1.15] text-crost-black">
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
      {footNote && <p className="font-text text-[13px] text-text-low">{footNote}</p>}
      <div className="flex items-center gap-3 pt-2">
        {onBack && (
          <Button type="button" variant="secondary" onClick={onBack}>
            Back
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={nextDisabled}>
          {nextLabel}
        </Button>
      </div>
    </form>
  );
}
