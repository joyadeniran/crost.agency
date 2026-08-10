export type GoalType = "customers" | "revenue" | "roas";

export type CacSource = "provided" | "derived" | "unavailable";

export type Confidence = "HIGH" | "MEDIUM" | "NEEDS_MORE_DATA";

/** Everything the diagnostic form can collect. All money fields are USD. */
export interface DiagnosticInputs {
  monthlyAdSpend: number | null;
  cac: number | null;
  monthlyCustomersAcquired: number | null;
  aovLtv: number | null;
  grossMarginPct: number | null;
  /** Context only — never feeds the acquisition-cost formula. */
  monthlyVisitors: number | null;
  conversionRatePct: number | null;
  goalType: GoalType;
  targetValue: number;
  timeframeDays: number;
}

export interface DerivedMetrics {
  cacSource: CacSource;
  resolvedCac: number | null;
  derivationNote: string | null;
}

export interface DiagnosticOutputs {
  months: number;
  targetCustomers: number | null;
  revenueTarget: number | null;
  totalAcquisitionSpend: number | null;
  estimatedMonthlyMediaRequired: number | null;
  estimatedCac: number | null;
  grossProfitPerCustomer: number | null;
  grossProfitTotal: number | null;
  ltvToCac: number | null;
  /** At the stated monthly ad spend and resolved CAC — independent of the goal. */
  expectedCustomersFromCurrentSpend: number | null;
}

export interface DiagnosticResult {
  formulaVersion: string;
  derivedMetrics: DerivedMetrics;
  outputs: DiagnosticOutputs;
  confidence: Confidence;
}
