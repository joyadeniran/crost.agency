import type { Confidence } from "@/lib/calc/types";
import { CONFIDENCE_LABEL } from "@/lib/calc/format";

export function ProgressSteps({
  step,
  total,
  className = "",
}: {
  step: number;
  total: number;
  className?: string;
}) {
  const pct = Math.min(Math.max(step / total, 0), 1) * 100;
  const complete = step >= total;

  return (
    <div
      className={`flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-text-low ${className}`}
      role="group"
      aria-label={complete ? "Diagnostic complete" : `Step ${step} of ${total}`}
    >
      <span aria-hidden="true" className="text-crost-pink font-medium">
        {String(Math.min(step, total)).padStart(2, "0")}
      </span>
      <span aria-hidden="true">/</span>
      <span aria-hidden="true">{String(total).padStart(2, "0")}</span>
      <div
        className="ml-2 h-[3px] w-16 sm:w-24 rounded-full bg-border-subtle overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.min(step, total)}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full bg-grad-brand transition-[width] duration-[var(--dur-base)] [transition-timing-function:var(--ease-out)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  HIGH: "bg-success-tint text-success-ink",
  MEDIUM: "bg-warning-tint text-warning-ink",
  NEEDS_MORE_DATA: "bg-danger-tint text-danger-ink",
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-text font-semibold text-[12px] tracking-[0.02em] ${CONFIDENCE_STYLES[confidence]}`}
    >
      {CONFIDENCE_LABEL[confidence]}
    </span>
  );
}

/** Small uppercase section marker used across both surfaces. */
export function Eyebrow({
  children,
  tone = "pink",
  className = "",
  id,
}: {
  children: React.ReactNode;
  tone?: "pink" | "pink-dark" | "muted";
  className?: string;
  id?: string;
}) {
  const tones = {
    pink: "text-crost-pink",
    "pink-dark": "text-crost-pink-700",
    muted: "text-text-low",
  } as const;
  return (
    <div
      id={id}
      className={`font-text font-semibold text-[11px] tracking-[0.18em] ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
