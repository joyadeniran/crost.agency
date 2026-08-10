import type { GoalType, DiagnosticResult } from "@/lib/calc/types";

export type WizardStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface WizardState {
  step: WizardStep;

  businessName: string;
  email: string;
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

  honeypot: string;
  formRenderedAt: number;

  submitting: boolean;
  submitError: string | null;
  leadId: string | null;
  diagnosticId: string | null;
  result: DiagnosticResult | null;
  narrative: string | null;
}

export const initialWizardState: WizardState = {
  step: 0,
  businessName: "",
  email: "",
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
  honeypot: "",
  formRenderedAt: 0,
  submitting: false,
  submitError: null,
  leadId: null,
  diagnosticId: null,
  result: null,
  narrative: null,
};
