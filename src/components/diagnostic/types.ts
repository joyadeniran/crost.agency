import type { GoalType, DiagnosticResult } from "@/lib/calc/types";

export type WizardStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** The last question step. Step 6 is the result, step 0 the intro. */
export const LAST_STEP: WizardStep = 5;
export const TOTAL_STEPS = 5;

export interface WizardAnswers {
  businessName: string;
  industry: string;
  website: string;

  monthlyAdSpend: string;
  cac: string;
  monthlyCustomersAcquired: string;
  aovLtv: string;
  grossMarginPct: string;

  monthlyVisitors: string;
  conversionRatePct: string;

  goalType: GoalType;
  targetValue: string;
  timeframeDays: number;

  email: string;
}

export interface WizardState extends WizardAnswers {
  step: WizardStep;

  honeypot: string;

  submitting: boolean;
  submitError: string | null;
  leadId: string | null;
  diagnosticId: string | null;
  result: DiagnosticResult | null;
  narrative: string | null;
  emailed: boolean;
}

export const initialAnswers: WizardAnswers = {
  businessName: "",
  industry: "",
  website: "",
  monthlyAdSpend: "",
  cac: "",
  monthlyCustomersAcquired: "",
  aovLtv: "",
  grossMarginPct: "",
  monthlyVisitors: "",
  conversionRatePct: "",
  goalType: "customers",
  targetValue: "",
  timeframeDays: 90,
  email: "",
};

export const initialWizardState: WizardState = {
  ...initialAnswers,
  step: 0,
  honeypot: "",
  submitting: false,
  submitError: null,
  leadId: null,
  diagnosticId: null,
  result: null,
  narrative: null,
  emailed: false,
};

const STORAGE_KEY = "crost.diagnostic.v1";

/**
 * The diagnostic asks for figures people have to look up, so a refresh or an
 * accidental back-navigation mid-form used to cost them the whole session.
 * Answers are kept in sessionStorage (cleared when the tab closes) — results
 * and submission state are deliberately not persisted, since they belong to one
 * submission rather than to the draft.
 */
export function saveAnswers(answers: WizardAnswers): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  } catch {
    // Private-mode quota errors are not worth interrupting the form for.
  }
}

export function clearAnswers(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
  notify();
}

/*
 * sessionStorage is an external store, so it is read through
 * useSyncExternalStore rather than copied into state from an effect. Reading it
 * during render would break SSR (there is no sessionStorage on the server, and
 * a differing client read is a hydration mismatch), and mirroring it into state
 * from an effect causes exactly the cascading render React warns about.
 *
 * getSnapshot returns the raw JSON string: identical contents compare equal
 * under Object.is, so a re-read that finds nothing changed does not re-render.
 */
let listeners: Array<() => void> = [];

function notify() {
  for (const l of listeners) l();
}

export function subscribeDraft(onChange: () => void): () => void {
  listeners = [...listeners, onChange];
  return () => {
    listeners = listeners.filter((l) => l !== onChange);
  };
}

export function getDraftSnapshot(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** No storage during SSR, so the server always renders the no-draft branch. */
export function getDraftServerSnapshot(): string | null {
  return null;
}

export function parseDraft(raw: string | null): Partial<WizardAnswers> | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Partial<WizardAnswers>;
  } catch {
    return null;
  }
}

/** Whether a restored draft has enough in it to be worth resuming. */
export function hasDraftContent(a: Partial<WizardAnswers>): boolean {
  return Boolean(
    a.businessName?.trim() ||
      a.monthlyAdSpend?.trim() ||
      a.cac?.trim() ||
      a.aovLtv?.trim() ||
      a.targetValue?.trim()
  );
}
