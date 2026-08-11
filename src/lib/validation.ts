import { z } from "zod";

/**
 * Money and count inputs. Nullable because the diagnostic is designed to run on
 * partial information, but bounded because a negative CAC or a billion-dollar
 * AOV is a typo, not a business — and letting one through produces a
 * confident-looking model built on nonsense.
 */
const nullableAmount = z
  .number()
  .finite()
  .min(0, "must not be negative")
  .max(1_000_000_000)
  .nullable();

const nullablePercent = z.number().finite().min(0).max(100).nullable();

export const diagnosticRequestSchema = z.object({
  businessName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  industry: z.string().trim().max(100).nullable().optional(),
  website: z.string().trim().max(300).nullable().optional(),

  monthlyAdSpend: nullableAmount,
  cac: nullableAmount,
  monthlyCustomersAcquired: nullableAmount,
  aovLtv: nullableAmount,
  grossMarginPct: nullablePercent,
  monthlyVisitors: nullableAmount,
  conversionRatePct: nullablePercent,

  goalType: z.enum(["customers", "revenue", "roas"]),
  targetValue: z.number().finite().positive().max(1_000_000_000),
  timeframeDays: z.number().int().positive().max(3650),

  honeypot: z.string().optional(),
  /** How long the form was open, measured client-side. See botCheck.ts. */
  formElapsedMs: z.number().finite().nonnegative(),
});

export type DiagnosticRequest = z.infer<typeof diagnosticRequestSchema>;

export const applicationRequestSchema = z
  .object({
    /**
     * Present when the application follows a diagnostic. Absent when someone
     * applies directly from the site — in that case we need enough to create
     * the lead ourselves, which the refinement below enforces.
     */
    leadId: z.string().uuid().nullable().optional(),
    diagnosticId: z.string().uuid().nullable().optional(),

    businessName: z.string().trim().min(1).max(200).nullable().optional(),
    email: z.string().trim().email().max(320).nullable().optional(),

    companyStage: z.string().trim().max(100).nullable().optional(),
    currentAgency: z.string().trim().max(100).nullable().optional(),
    decisionTimeline: z.string().trim().max(100).nullable().optional(),
    heardAbout: z.string().trim().max(100).nullable().optional(),
    notes: z.string().trim().max(4000).nullable().optional(),

    honeypot: z.string().optional(),
    formElapsedMs: z.number().finite().nonnegative(),
  })
  .refine((v) => Boolean(v.leadId) || Boolean(v.businessName && v.email), {
    message:
      "Either an existing lead, or a business name and email to create one.",
    path: ["businessName"],
  })
  .refine((v) => !v.diagnosticId || Boolean(v.leadId), {
    message: "A diagnostic reference requires the lead it belongs to.",
    path: ["diagnosticId"],
  });

export type ApplicationRequest = z.infer<typeof applicationRequestSchema>;

export const analyticsEventSchema = z.object({
  eventName: z.string().trim().min(1).max(100),
  leadId: z.string().uuid().nullable().optional(),
  properties: z.record(z.string(), z.unknown()).nullable().optional(),
});
