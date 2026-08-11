import type { Confidence, MissingInput } from "./types";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Per-unit figures — a derived CAC, gross profit per customer — carry real
 * meaning in their cents: $4.20 rounding to "$4" changes the model, and $28.80
 * shown as "$29" quietly overstates the margin. Below $1,000 a non-integer
 * therefore keeps two decimals; above it, cents are noise against the
 * uncertainty already in the inputs.
 */
export function formatUsd(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  if (!Number.isInteger(value) && Math.abs(value) < 1000) {
    return usdPrecise.format(value);
  }
  return usd.format(value);
}

export function formatRatio(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(1)}×`;
}

export function formatCount(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return Math.round(value).toLocaleString("en-US");
}

export function formatPct(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value}%`;
}

/** "90 days" / "6 months" — matches the wizard's own timeframe wording. */
export function formatTimeframe(days: number): string {
  if (days % 365 === 0 && days >= 365) {
    const years = days / 365;
    return years === 1 ? "12 months" : `${years} years`;
  }
  if (days % 30 === 0 && days >= 180) return `${days / 30} months`;
  return `${days} days`;
}

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  HIGH: "High confidence",
  MEDIUM: "Medium confidence",
  NEEDS_MORE_DATA: "Needs more data",
};

/**
 * Why the result carries the confidence it does, in the prospect's terms.
 * Shown next to the badge so the label is never an unexplained verdict.
 */
export const CONFIDENCE_EXPLANATION: Record<Confidence, string> = {
  HIGH: "You gave us a real CAC, order value and margin, so this model is built entirely on your numbers.",
  MEDIUM:
    "The core numbers are yours, but something was estimated rather than known — treat this as directional.",
  NEEDS_MORE_DATA:
    "We can't put a media figure against this target yet. Rather than guess, here's exactly what's missing.",
};

/** Human labels for the inputs the engine reports as missing. */
export const MISSING_INPUT_LABEL: Record<MissingInput, string> = {
  cac: "Your customer acquisition cost (CAC)",
  monthlyAdSpend: "Your monthly ad spend",
  monthlyCustomersAcquired: "Customers acquired last month",
  aovLtv: "Average order value or customer LTV",
  grossMarginPct: "Your gross margin",
};

/** What each missing input would unlock, so the ask is worth answering. */
export const MISSING_INPUT_UNLOCKS: Record<MissingInput, string> = {
  cac: "prices the whole target",
  monthlyAdSpend: "lets us derive CAC and size the media",
  monthlyCustomersAcquired: "lets us derive your CAC",
  aovLtv: "turns customers into revenue",
  grossMarginPct: "shows the profit behind the revenue",
};
