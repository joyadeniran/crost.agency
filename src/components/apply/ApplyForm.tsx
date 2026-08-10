"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Honeypot } from "@/components/ui/Honeypot";
import { track } from "@/lib/analytics/track";

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

export function ApplyForm({
  leadId,
  diagnosticId,
}: {
  leadId: string | null;
  diagnosticId: string | null;
}) {
  const [companyStage, setCompanyStage] = useState("");
  const [currentAgency, setCurrentAgency] = useState("");
  const [decisionTimeline, setDecisionTimeline] = useState("");
  const [heardAbout, setHeardAbout] = useState("");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [formRenderedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (leadId) track("application_started", {}, leadId);
  }, [leadId]);

  if (!leadId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-0 px-6">
        <div className="max-w-md text-center flex flex-col items-center gap-5">
          <h1 className="font-display font-semibold text-[28px] text-crost-black">
            Let&rsquo;s get your numbers first.
          </h1>
          <p className="font-text text-[15px] text-text-mid leading-relaxed">
            The application starts from your Crost diagnostic — run that first and
            we&rsquo;ll bring your numbers straight into the application.
          </p>
          <Link
            href="/diagnostic"
            className="inline-flex items-center justify-center h-11 px-5 rounded-md bg-crost-pink text-crost-black font-text font-semibold text-[15px]"
          >
            Run the diagnostic →
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-crost-black text-white px-6">
        <div className="max-w-md text-center flex flex-col items-center gap-5">
          <div className="font-text font-semibold text-[12px] tracking-[0.22em] text-crost-pink">
            NUMBERS RECEIVED
          </div>
          <h1 className="font-display font-semibold text-[32px]">
            We&rsquo;ve got your application.
          </h1>
          <p className="font-text text-[15px] text-text-inv-mid leading-relaxed">
            We&rsquo;ll review the numbers and reply within three working days.
          </p>
          <Link href="/" className="font-text text-[14px] text-crost-pink mt-2">
            Back to Crost
          </Link>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          diagnosticId,
          companyStage: companyStage || null,
          currentAgency: currentAgency || null,
          decisionTimeline: decisionTimeline || null,
          heardAbout: heardAbout || null,
          notes: notes || null,
          honeypot,
          formRenderedAt,
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setSubmitted(true);
      track("application_completed", {}, leadId);
    } catch (err) {
      console.error(err);
      setError("Something went wrong submitting your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center px-6 py-16">
      <form onSubmit={submit} className="w-full max-w-lg flex flex-col gap-8">
        <div>
          <h1 className="font-display font-semibold text-[32px] leading-[1.1] text-crost-black">
            Let&rsquo;s see if we can make the number real.
          </h1>
          <p className="mt-3 font-text text-[15px] text-text-mid leading-relaxed">
            We&rsquo;ve already got your numbers. We just need a little more context.
          </p>
        </div>

        <Field label="Company stage">
          <SegmentedControl
            name="companyStage"
            options={COMPANY_STAGE}
            value={companyStage}
            onChange={setCompanyStage}
          />
        </Field>

        <Field label="Current agency">
          <SegmentedControl
            name="currentAgency"
            options={CURRENT_AGENCY}
            value={currentAgency}
            onChange={setCurrentAgency}
          />
        </Field>

        <Field label="Decision timeline">
          <SegmentedControl
            name="decisionTimeline"
            options={DECISION_TIMELINE}
            value={decisionTimeline}
            onChange={setDecisionTimeline}
          />
        </Field>

        <Field label="How did you hear about Crost?">
          <SegmentedControl
            name="heardAbout"
            options={HEARD_ABOUT}
            value={heardAbout}
            onChange={setHeardAbout}
          />
        </Field>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="font-text font-semibold text-[12.5px] text-text-hi">
            Anything else?
          </label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded-md border-[1.5px] border-[#D6DAE1] px-3.5 py-3 font-text text-[15px] text-text-hi outline-none focus:border-crost-pink focus:shadow-[0_0_0_3px_rgba(255,64,216,0.18)] transition-shadow duration-[var(--dur-quick)]"
          />
        </div>

        <Honeypot value={honeypot} onChange={setHoneypot} />

        {error && <p className="text-[13px] text-danger">{error}</p>}

        <Button type="submit" variant="primary" size="lg" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit application →"}
        </Button>
      </form>
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
