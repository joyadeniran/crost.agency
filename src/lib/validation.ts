import { z } from "zod";

const nullableNumber = z.number().finite().nullable();

export const diagnosticRequestSchema = z.object({
  businessName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  industry: z.string().trim().max(100).nullable().optional(),
  website: z.string().trim().max(300).nullable().optional(),

  monthlyAdSpend: nullableNumber,
  cac: nullableNumber,
  monthlyCustomersAcquired: nullableNumber,
  aovLtv: nullableNumber,
  grossMarginPct: nullableNumber,
  monthlyVisitors: nullableNumber,
  conversionRatePct: nullableNumber,

  goalType: z.enum(["customers", "revenue", "roas"]),
  targetValue: z.number().finite().positive(),
  timeframeDays: z.number().int().positive().max(3650),

  honeypot: z.string().optional(),
  formRenderedAt: z.number(),
});

export type DiagnosticRequest = z.infer<typeof diagnosticRequestSchema>;

export const applicationRequestSchema = z.object({
  leadId: z.string().uuid(),
  diagnosticId: z.string().uuid().nullable().optional(),
  companyStage: z.string().trim().max(100).nullable().optional(),
  currentAgency: z.string().trim().max(100).nullable().optional(),
  decisionTimeline: z.string().trim().max(100).nullable().optional(),
  heardAbout: z.string().trim().max(100).nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),

  honeypot: z.string().optional(),
  formRenderedAt: z.number(),
});

export type ApplicationRequest = z.infer<typeof applicationRequestSchema>;

export const analyticsEventSchema = z.object({
  eventName: z.string().trim().min(1).max(100),
  leadId: z.string().uuid().nullable().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
});
