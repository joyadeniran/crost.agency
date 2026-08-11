"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ProgressSteps, Eyebrow } from "@/components/ui/Badge";
import { Honeypot } from "@/components/ui/Honeypot";
import { Logo } from "@/components/brand/Logo";
import { LivePreview, PreviewSummaryBar } from "./LivePreview";
import { ResultView } from "./ResultView";
import {
  initialWizardState,
  initialAnswers,
  saveAnswers,
  clearAnswers,
  hasDraftContent,
  subscribeDraft,
  getDraftSnapshot,
  getDraftServerSnapshot,
  parseDraft,
  LAST_STEP,
  TOTAL_STEPS,
  type WizardAnswers,
  type WizardState,
  type WizardStep,
} from "./types";
import {
  numOrNull,
  validateAmount,
  validateEmail,
  validatePercent,
  validateRequiredText,
  validateTarget,
  validateWebsite,
  isClean,
} from "@/lib/forms";
import { track } from "@/lib/analytics/track";
import type { GoalType } from "@/lib/calc/types";

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

type Errors = Partial<Record<keyof WizardAnswers, string | null>>;

/** Per-step validation. The server re-checks all of it. */
function validateStep(step: WizardStep, s: WizardState): Errors {
  switch (step) {
    case 1:
      return {
        businessName: validateRequiredText(s.businessName, "Business name"),
        website: validateWebsite(s.website),
      };
    case 2:
      return {
        monthlyAdSpend: validateAmount(s.monthlyAdSpend, "Monthly ad spend"),
        cac: validateAmount(s.cac, "CAC"),
        aovLtv: validateAmount(s.aovLtv, "Average order value"),
        grossMarginPct: validatePercent(s.grossMarginPct, "Gross margin"),
        monthlyCustomersAcquired: validateAmount(
          s.monthlyCustomersAcquired,
          "Monthly customers acquired"
        ),
      };
    case 3:
      return {
        monthlyVisitors: validateAmount(s.monthlyVisitors, "Monthly visitors"),
        conversionRatePct: validatePercent(s.conversionRatePct, "Conversion rate"),
      };
    case 4:
      return { targetValue: validateTarget(s.targetValue, s.goalType) };
    case 5:
      return { email: validateEmail(s.email) };
    default:
      return {};
  }
}

export function DiagnosticWizard() {
  const [state, setState] = useState<WizardState>(initialWizardState);
  const [errors, setErrors] = useState<Errors>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lastAnnouncedStep = useRef<number>(0);

  /*
   * Time-on-form is measured from when the page opened, not from the "Start"
   * click. Someone resuming a saved draft can legitimately click through all
   * five prefilled steps in a couple of seconds, which the minimum-fill-time
   * check would read as a script. Counting the time spent on the intro screen
   * removes that false positive without making the signal any easier to forge —
   * a real script never loads the page at all.
   */
  const [openedAt] = useState(() => Date.now());

  // Read straight from sessionStorage rather than mirroring it into state.
  const draftRaw = useSyncExternalStore(
    subscribeDraft,
    getDraftSnapshot,
    getDraftServerSnapshot
  );
  const draft = useMemo(() => {
    const parsed = parseDraft(draftRaw);
    return parsed && hasDraftContent(parsed) ? parsed : null;
  }, [draftRaw]);

  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
    // Clearing the error as soon as the field changes avoids the pattern where
    // a corrected value still shows red until the next submit attempt.
    setErrors((e) => (e[key as keyof WizardAnswers] ? { ...e, [key]: null } : e));
  };

  // Persist answers as they change, but only once past the intro.
  useEffect(() => {
    if (state.step === 0 || state.step > LAST_STEP) return;
    const { businessName, industry, website } = state;
    saveAnswers({
      businessName,
      industry,
      website,
      monthlyAdSpend: state.monthlyAdSpend,
      cac: state.cac,
      monthlyCustomersAcquired: state.monthlyCustomersAcquired,
      aovLtv: state.aovLtv,
      grossMarginPct: state.grossMarginPct,
      monthlyVisitors: state.monthlyVisitors,
      conversionRatePct: state.conversionRatePct,
      goalType: state.goalType,
      targetValue: state.targetValue,
      timeframeDays: state.timeframeDays,
      email: state.email,
    });
  }, [state]);

  // Move focus to the new step heading so keyboard and screen-reader users
  // aren't left at the bottom of the previous step after "Continue".
  useEffect(() => {
    if (state.step === 0 || state.step === lastAnnouncedStep.current) return;
    lastAnnouncedStep.current = state.step;
    headingRef.current?.focus();
    if (state.step <= LAST_STEP) {
      track("diagnostic_step_completed", { step: state.step });
    }
  }, [state.step]);

  function start(resume: boolean) {
    const base = resume && draft ? { ...initialAnswers, ...draft } : initialAnswers;
    if (!resume) clearAnswers();
    setErrors({});
    setState({
      ...initialWizardState,
      ...base,
      step: 1,
    });
    track(resume ? "diagnostic_resumed" : "diagnostic_started");
  }

  function goToStep(step: WizardStep) {
    setErrors({});
    setState((s) => ({ ...s, step, submitError: null }));
  }

  /** Validates the current step, advancing only when it is clean. */
  function advance(from: WizardStep, to: WizardStep) {
    const found = validateStep(from, state);
    setErrors(found);
    if (!isClean(found)) return false;
    setState((s) => ({ ...s, step: to, submitError: null }));
    return true;
  }

  async function submit() {
    const found = validateStep(LAST_STEP, state);
    setErrors(found);
    if (!isClean(found)) return;

    setState((s) => ({ ...s, submitting: true, submitError: null }));
    try {
      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: state.businessName.trim(),
          email: state.email.trim(),
          industry: state.industry.trim() || null,
          website: state.website.trim() || null,
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
          // A duration measured against our own clock — immune to device skew.
          formElapsedMs: Math.max(0, Date.now() - openedAt),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.result) {
        const message =
          data?.message ??
          (res.status === 202
            ? "We couldn't verify that submission. Please try again."
            : "Something went wrong saving your diagnostic. Please try again.");
        setState((s) => ({ ...s, submitting: false, submitError: message }));
        return;
      }

      clearAnswers();
      setState((s) => ({
        ...s,
        submitting: false,
        step: 6,
        leadId: data.leadId,
        diagnosticId: data.diagnosticId,
        result: data.result,
        narrative: data.narrative,
        emailed: Boolean(data.emailed),
      }));
      track("diagnostic_completed", { confidence: data.result.confidence }, data.leadId);
      track("result_viewed", {}, data.leadId);
    } catch (err) {
      console.error(err);
      setState((s) => ({
        ...s,
        submitting: false,
        submitError:
          "We couldn't reach the server. Check your connection and try again.",
      }));
    }
  }

  if (state.step === 0) {
    return <Intro onStart={start} draft={draft} />;
  }

  if (state.step === 6) {
    return (
      <ResultShell
        state={state}
        onEdit={() => {
          track("diagnostic_abandoned_edit", {}, state.leadId);
          goToStep(2);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      <TopBar step={state.step} />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="flex items-start lg:items-center justify-center px-6 py-10 lg:py-20">
          <div className="w-full max-w-md">
            <StepBody
              state={state}
              errors={errors}
              set={set}
              headingRef={headingRef}
              onAdvance={advance}
              onSubmit={submit}
            />
            {/* Mobile only: the model still "feels alive" without the panel. */}
            <div className="lg:hidden mt-8">
              <PreviewSummaryBar state={state} />
            </div>
          </div>
        </div>
        <div className="hidden lg:flex items-center justify-center bg-surface-1 px-10 py-20">
          <div className="w-full max-w-sm">
            <LivePreview state={state} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Intro({
  onStart,
  draft,
}: {
  onStart: (resume: boolean) => void;
  draft: Partial<WizardAnswers> | null;
}) {
  return (
    <div className="min-h-screen bg-crost-black text-white flex flex-col">
      <div className="px-6 py-5">
        <Link href="/" aria-label="Crost Agency home">
          <Logo tone="light" width={120} />
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="max-w-xl text-center flex flex-col items-center gap-6">
          <Eyebrow>CROST DIAGNOSTIC</Eyebrow>
          <h1 className="font-display font-semibold text-[40px] sm:text-[52px] leading-[1.05] tracking-[-0.02em]">
            What&rsquo;s the number?
          </h1>
          <p className="font-text font-light text-[18px] leading-[1.5] text-text-inv-mid max-w-md">
            Five short steps. We&rsquo;ll model what your current economics can
            support, and show you the working.
          </p>
          <div className="font-mono text-[12px] text-text-inv-low tracking-[0.04em]">
            About 3 minutes · Free · No commitment
          </div>

          {draft ? (
            <div className="mt-2 w-full max-w-sm flex flex-col gap-3">
              <Button variant="primary" size="lg" onClick={() => onStart(true)}>
                Pick up where you left off →
              </Button>
              <Button variant="inverse" onClick={() => onStart(false)}>
                Start fresh
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={() => onStart(false)}
              className="mt-2"
            >
              Start diagnostic →
            </Button>
          )}

          <p className="font-text text-[12.5px] text-text-inv-low max-w-sm">
            Don&rsquo;t know a figure? Leave it blank. The diagnostic works with
            what you have, and tells you what it can&rsquo;t answer.
          </p>
        </div>
      </div>
    </div>
  );
}

function TopBar({ step }: { step: number }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
      <Link href="/" aria-label="Crost Agency home">
        <Logo tone="dark" width={110} />
      </Link>
      <ProgressSteps step={step} total={TOTAL_STEPS} />
    </header>
  );
}

function ResultShell({ state, onEdit }: { state: WizardState; onEdit: () => void }) {
  return (
    <div className="min-h-screen bg-surface-0">
      <TopBar step={TOTAL_STEPS} />
      <main id="main" className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <ResultView state={state} onEdit={onEdit} />
      </main>
    </div>
  );
}

function StepBody({
  state,
  errors,
  set,
  headingRef,
  onAdvance,
  onSubmit,
}: {
  state: WizardState;
  errors: Errors;
  set: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onAdvance: (from: WizardStep, to: WizardStep) => boolean;
  onSubmit: () => void;
}) {
  const next = (n: WizardStep) => () => onAdvance(state.step, n);
  const back = (n: WizardStep) => () => set("step", n);

  if (state.step === 1) {
    return (
      <StepShell
        headingRef={headingRef}
        title="Tell us what you're building."
        intro="Just enough to know who we're modelling for."
        onNext={next(2)}
      >
        <Input
          name="businessName"
          label="Business name"
          autoComplete="organization"
          autoFocus
          value={state.businessName}
          error={errors.businessName}
          onChange={(e) => set("businessName", e.target.value)}
        />
        <Input
          name="industry"
          label="Industry"
          optional
          placeholder="Fintech, D2C, SaaS…"
          value={state.industry}
          onChange={(e) => set("industry", e.target.value)}
        />
        <Input
          name="website"
          label="Website"
          optional
          inputMode="url"
          autoComplete="url"
          placeholder="crost.agency"
          value={state.website}
          error={errors.website}
          onChange={(e) => set("website", e.target.value)}
          help="Helps the strategist reviewing your numbers."
        />
      </StepShell>
    );
  }

  if (state.step === 2) {
    return (
      <StepShell
        headingRef={headingRef}
        title="Show us where you are."
        intro="All in USD. Leave anything you don't know blank — we'll work with what we have."
        onNext={next(3)}
        onBack={back(1)}
      >
        <Input
          name="monthlyAdSpend"
          label="Monthly ad spend"
          optional
          prefix="$"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          value={state.monthlyAdSpend}
          error={errors.monthlyAdSpend}
          onChange={(e) => set("monthlyAdSpend", e.target.value)}
        />
        <Input
          name="cac"
          label="Customer acquisition cost"
          optional
          prefix="$"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          value={state.cac}
          error={errors.cac}
          onChange={(e) => set("cac", e.target.value)}
          help="Don't know it? Leave it blank — we'll derive it from the two fields below."
        />
        <Input
          name="monthlyCustomersAcquired"
          label="Customers acquired last month"
          optional
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          value={state.monthlyCustomersAcquired}
          error={errors.monthlyCustomersAcquired}
          onChange={(e) => set("monthlyCustomersAcquired", e.target.value)}
          help="With ad spend above, this gives us your CAC."
        />
        <Input
          name="aovLtv"
          label="Average order value / customer LTV"
          optional
          prefix="$"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          value={state.aovLtv}
          error={errors.aovLtv}
          onChange={(e) => set("aovLtv", e.target.value)}
        />
        <Input
          name="grossMarginPct"
          label="Gross margin"
          optional
          suffix="%"
          type="number"
          min={0}
          max={100}
          step="any"
          inputMode="decimal"
          value={state.grossMarginPct}
          error={errors.grossMarginPct}
          onChange={(e) => set("grossMarginPct", e.target.value)}
        />
      </StepShell>
    );
  }

  if (state.step === 3) {
    return (
      <StepShell
        headingRef={headingRef}
        title="How does the funnel behave?"
        intro="Context for the strategist. These don't feed the acquisition maths — knowing a funnel converts at 3% doesn't tell us what the traffic cost."
        onNext={next(4)}
        onBack={back(2)}
        footNote="Both optional. Skip straight through if you'd rather."
      >
        <Input
          name="monthlyVisitors"
          label="Monthly visitors"
          optional
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          value={state.monthlyVisitors}
          error={errors.monthlyVisitors}
          onChange={(e) => set("monthlyVisitors", e.target.value)}
        />
        <Input
          name="conversionRatePct"
          label="Conversion rate"
          optional
          suffix="%"
          type="number"
          min={0}
          max={100}
          step="any"
          inputMode="decimal"
          value={state.conversionRatePct}
          error={errors.conversionRatePct}
          onChange={(e) => set("conversionRatePct", e.target.value)}
        />
      </StepShell>
    );
  }

  if (state.step === 4) {
    const targetLabel =
      state.goalType === "customers"
        ? "How many new customers?"
        : state.goalType === "revenue"
          ? "How much revenue?"
          : "What return on ad spend?";

    return (
      <StepShell
        headingRef={headingRef}
        title="Where do you want to go?"
        intro="The number we'd be agreeing on."
        onNext={next(5)}
        onBack={back(3)}
      >
        <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
          <legend className="font-text font-semibold text-[12.5px] text-text-hi mb-2 p-0">
            I want to grow…
          </legend>
          <SegmentedControl
            name="goalType"
            label="What you want to grow"
            options={GOAL_OPTIONS}
            value={state.goalType}
            onChange={(v) => set("goalType", v as GoalType)}
          />
        </fieldset>

        <Input
          name="targetValue"
          label={targetLabel}
          prefix={state.goalType === "revenue" ? "$" : undefined}
          suffix={state.goalType === "roas" ? "×" : undefined}
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          placeholder={
            state.goalType === "customers"
              ? "1000"
              : state.goalType === "revenue"
                ? "100000"
                : "3.5"
          }
          value={state.targetValue}
          error={errors.targetValue}
          onChange={(e) => set("targetValue", e.target.value)}
          help={
            state.goalType === "roas"
              ? "A multiple of your ad spend — so this needs the ad spend figure from step 2."
              : undefined
          }
        />

        <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
          <legend className="font-text font-semibold text-[12.5px] text-text-hi mb-2 p-0">
            By when?
          </legend>
          <SegmentedControl
            name="timeframeDays"
            label="Timeframe"
            size="sm"
            options={TIMEFRAMES.map((t) => ({
              value: String(t.value),
              label: t.label,
            }))}
            value={String(state.timeframeDays)}
            onChange={(v) => set("timeframeDays", Number(v))}
          />
        </fieldset>
      </StepShell>
    );
  }

  // Step 5 — the email gate. This is the only place email is asked for; it used
  // to be collected on step 1 as well, so people were typing it twice.
  return (
    <StepShell
      headingRef={headingRef}
      title="Where should we send the model?"
      intro="Your results appear on the next screen either way. We'll email a copy so you can share it internally."
      onBack={back(4)}
      onNext={onSubmit}
      nextLabel={state.submitting ? "Calculating…" : "See my numbers →"}
      nextDisabled={state.submitting}
      busy={state.submitting}
    >
      <Input
        name="email"
        label="Work email"
        type="email"
        autoComplete="email"
        autoFocus
        placeholder="you@company.com"
        value={state.email}
        error={errors.email}
        onChange={(e) => set("email", e.target.value)}
      />
      <Honeypot value={state.honeypot} onChange={(v) => set("honeypot", v)} />
      <p className="font-text text-[12px] leading-relaxed text-text-low">
        One email with your results, and a follow-up only if you apply. No list,
        no sequence.
      </p>
      {state.submitError && (
        <div
          role="alert"
          className="rounded-md bg-danger-tint text-danger-ink px-4 py-3 font-text text-[13px] leading-relaxed"
        >
          {state.submitError}
        </div>
      )}
    </StepShell>
  );
}

function StepShell({
  title,
  intro,
  children,
  onNext,
  onBack,
  nextLabel = "Continue →",
  nextDisabled,
  busy,
  footNote,
  headingRef,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  busy?: boolean;
  footNote?: string;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <form
      className="flex flex-col gap-6"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!nextDisabled) onNext?.();
      }}
    >
      <div className="flex flex-col gap-2">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display font-semibold text-[26px] sm:text-[28px] leading-[1.15] text-crost-black outline-none"
        >
          {title}
        </h1>
        {intro && (
          <p className="font-text text-[14px] leading-relaxed text-text-mid">{intro}</p>
        )}
      </div>

      <div className="flex flex-col gap-4">{children}</div>

      {footNote && <p className="font-text text-[13px] text-text-low">{footNote}</p>}

      <div className="flex items-center gap-3 pt-2">
        {onBack && (
          <Button type="button" variant="secondary" onClick={onBack}>
            Back
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={nextDisabled}
          aria-busy={busy || undefined}
        >
          {nextLabel}
        </Button>
      </div>
    </form>
  );
}
