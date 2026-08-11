"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Honeypot } from "@/components/ui/Honeypot";
import { ConfidenceBadge, Eyebrow } from "@/components/ui/Badge";
import { Logo } from "@/components/brand/Logo";
import { track } from "@/lib/analytics/track";
import {
  formatCount,
  formatRatio,
  formatUsd,
  formatTimeframe,
} from "@/lib/calc/format";
import { validateEmail, validateRequiredText, isClean } from "@/lib/forms";
import type { DiagnosticContext } from "@/lib/leads";

const COMPANY_STAGE = [
  { value: "pre-launch", label: "Pre-launch" },
  { value: "early-revenue", label: "Early revenue" },
  { value: "growing", label: "Growing" },
  { value: "established", label: "Established" },
];
const CURRENT_AGENCY = [
  { value: "none", label: "None" },
  { value: "freelancer", label: "Freelancer" },
  { value: "agency", label: "Agency" },
  { value: "in-house", label: "In-house" },
  { value: "other", label: "Other" },
];
const DECISION_TIMELINE = [
  { value: "immediately", label: "Immediately" },
  { value: "within-30-days", label: "Within 30 days" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "just-exploring", label: "Just exploring" },
];
const HEARD_ABOUT = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "search", label: "Search" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
];

type Errors = { businessName?: string | null; email?: string | null };

export function ApplyForm({ context }: { context: DiagnosticContext | null }) {
  const hasLead = context !== null;

  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [companyStage, setCompanyStage] = useState("");
  const [currentAgency, setCurrentAgency] = useState("");
  const [decisionTimeline, setDecisionTimeline] = useState("");
  const [heardAbout, setHeardAbout] = useState("");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    track("application_started", { fromDiagnostic: hasLead }, context?.leadId ?? null);
  }, [hasLead, context?.leadId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Identity is only asked for when we don't already have it on file.
    const found: Errors = hasLead
      ? {}
      : {
          businessName: validateRequiredText(businessName, "Business name"),
          email: validateEmail(email),
        };
    setErrors(found);
    if (!isClean(found as Record<string, string | null>)) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: context?.leadId ?? null,
          diagnosticId: context?.diagnosticId ?? null,
          businessName: hasLead ? null : businessName.trim(),
          email: hasLead ? null : email.trim(),
          companyStage: companyStage || null,
          currentAgency: currentAgency || null,
          decisionTimeline: decisionTimeline || null,
          heardAbout: heardAbout || null,
          notes: notes.trim() || null,
          honeypot,
          formElapsedMs: Math.max(0, Date.now() - startedAt),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.applicationId) {
        setError(
          data?.message ??
            (res.status === 202
              ? "We couldn't verify that submission. Please try again."
              : "Something went wrong submitting your application. Please try again.")
        );
        return;
      }

      setSubmitted(true);
      track("application_completed", { fromDiagnostic: hasLead }, data.leadId);
    } catch (err) {
      console.error(err);
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-crost-black text-white px-6 py-16">
        <div className="max-w-md text-center flex flex-col items-center gap-5">
          <Eyebrow>APPLICATION RECEIVED</Eyebrow>
          <h1 className="font-display font-semibold text-[30px] sm:text-[32px] leading-[1.1]">
            We&rsquo;ve got your application.
          </h1>
          <ol className="text-left font-text text-[14.5px] leading-relaxed text-text-inv-mid flex flex-col gap-2.5">
            <li>1. A Crost strategist reviews your numbers — a human, every time.</li>
            <li>
              2. If it&rsquo;s a target we can commit to, we reply within three
              working days.
            </li>
            <li>3. If it isn&rsquo;t, we tell you that plainly, and why.</li>
          </ol>
          <p className="font-text text-[13px] text-text-inv-low">
            A confirmation is on its way to your inbox.
          </p>
          <Link
            href="/"
            className="font-text font-semibold text-[14px] text-crost-pink mt-2"
          >
            Back to Crost
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
        <Link href="/" aria-label="Crost Agency home">
          <Logo tone="dark" width={110} />
        </Link>
        {!hasLead && (
          <Link
            href="/diagnostic"
            className="font-text font-semibold text-[13px] text-crost-pink-700"
          >
            Run the diagnostic first
          </Link>
        )}
      </header>

      <main
        id="main"
        className="flex-1 flex items-start justify-center px-6 py-12 sm:py-16"
      >
        <form onSubmit={submit} noValidate className="w-full max-w-lg flex flex-col gap-8">
          <div>
            <h1 className="font-display font-semibold text-[30px] sm:text-[32px] leading-[1.1] text-crost-black">
              Let&rsquo;s see if we can make the number real.
            </h1>
            <p className="mt-3 font-text text-[15px] text-text-mid leading-relaxed">
              {hasLead
                ? "We've already got your numbers. We just need a little more context."
                : "A few quick questions. A Crost strategist reads every one."}
            </p>
          </div>

          {/* Proof that "we've already got your numbers" is true, rather than
              asking the applicant to take our word for it. */}
          {context?.summary && <DiagnosticRecap context={context} />}

          {!hasLead && (
            <>
              <NoDiagnosticNudge />
              <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
                <legend className="sr-only">Your details</legend>
                <Input
                  name="businessName"
                  label="Business name"
                  autoComplete="organization"
                  value={businessName}
                  error={errors.businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    setErrors((x) => ({ ...x, businessName: null }));
                  }}
                />
                <Input
                  name="email"
                  label="Work email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  error={errors.email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((x) => ({ ...x, email: null }));
                  }}
                />
              </fieldset>
            </>
          )}

          <Field label="Company stage">
            <SegmentedControl
              name="companyStage"
              label="Company stage"
              options={COMPANY_STAGE}
              value={companyStage}
              onChange={setCompanyStage}
              allowDeselect
              size="sm"
            />
          </Field>

          <Field label="Current marketing setup">
            <SegmentedControl
              name="currentAgency"
              label="Current marketing setup"
              options={CURRENT_AGENCY}
              value={currentAgency}
              onChange={setCurrentAgency}
              allowDeselect
              size="sm"
            />
          </Field>

          <Field label="Decision timeline">
            <SegmentedControl
              name="decisionTimeline"
              label="Decision timeline"
              options={DECISION_TIMELINE}
              value={decisionTimeline}
              onChange={setDecisionTimeline}
              allowDeselect
              size="sm"
            />
          </Field>

          <Field label="How did you hear about Crost?">
            <SegmentedControl
              name="heardAbout"
              label="How did you hear about Crost"
              options={HEARD_ABOUT}
              value={heardAbout}
              onChange={setHeardAbout}
              allowDeselect
              size="sm"
            />
          </Field>

          <Textarea
            name="notes"
            label="Anything else?"
            optional
            rows={4}
            value={notes}
            maxLength={4000}
            onChange={(e) => setNotes(e.target.value)}
            help="Context that would change how we read your numbers."
          />

          <Honeypot value={honeypot} onChange={setHoneypot} />

          {error && (
            <div
              role="alert"
              className="rounded-md bg-danger-tint text-danger-ink px-4 py-3 font-text text-[13px] leading-relaxed"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              aria-busy={submitting || undefined}
            >
              {submitting ? "Submitting…" : "Submit application →"}
            </Button>
            <p className="font-text text-[12px] text-text-low">
              No obligation. If we don&rsquo;t think we can hit your number,
              we&rsquo;ll say so.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}

function DiagnosticRecap({ context }: { context: DiagnosticContext }) {
  const s = context.summary!;
  const target =
    s.goalType === "customers"
      ? `${formatCount(s.targetCustomers ?? s.targetValue)} new customers`
      : s.goalType === "revenue"
        ? `${formatUsd(s.revenueTarget)} revenue`
        : `${s.targetValue}× ROAS`;

  return (
    <section className="rounded-lg bg-crost-black text-white p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Eyebrow>YOUR DIAGNOSTIC</Eyebrow>
        <ConfidenceBadge confidence={s.confidence} />
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
        <Recap label={`Target · ${formatTimeframe(s.timeframeDays)}`} value={target} />
        <Recap
          label="Est. monthly media"
          value={formatUsd(s.estimatedMonthlyMediaRequired)}
        />
        <Recap label="LTV:CAC" value={formatRatio(s.ltvToCac)} />
        <Recap label="For" value={context.businessName} />
      </dl>
      <p className="font-text text-[12px] text-text-inv-low border-t border-border-inv pt-4">
        {s.priceable
          ? "These numbers come with your application — no need to repeat them."
          : "We couldn't price this target yet. Apply anyway and a strategist will work through it with you."}
      </p>
    </section>
  );
}

function Recap({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="font-display font-semibold text-[20px] leading-tight text-white tabular-nums">
        {value}
      </dd>
      <dt className="font-text text-[11px] text-text-inv-low mt-1">{label}</dt>
    </div>
  );
}

/**
 * Applying cold is allowed, but the diagnostic is genuinely the better path —
 * so this recommends it rather than blocking on it. The previous build made
 * this a hard wall, which meant every "Apply to Crost" button on the site led
 * to a dead end.
 */
function NoDiagnosticNudge() {
  return (
    <div className="rounded-lg bg-surface-1 p-5 flex flex-col gap-3">
      <p className="font-text text-[14px] leading-relaxed text-text-mid">
        <span className="font-semibold text-text-hi">
          Applied without running the diagnostic?
        </span>{" "}
        That&rsquo;s fine — but three minutes with it gives us your economics up
        front, and gives you the model before you ever talk to us.
      </p>
      <div>
        <ButtonLink
          href="/diagnostic"
          variant="secondary"
          size="sm"
          onClick={() => track("cta_clicked", { cta: "apply_page_diagnostic" })}
        >
          Run the diagnostic →
        </ButtonLink>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="font-text font-semibold text-[12.5px] text-text-hi">{label}</span>
      {children}
    </div>
  );
}
