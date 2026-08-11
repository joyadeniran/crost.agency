import { Resend } from "resend";
import type { DiagnosticInputs, DiagnosticResult } from "@/lib/calc/types";
import {
  formatUsd,
  formatRatio,
  formatCount,
  formatPct,
  formatTimeframe,
  CONFIDENCE_LABEL,
  MISSING_INPUT_LABEL,
} from "@/lib/calc/format";
import { applyUrl, absoluteUrl, SITE_URL } from "@/lib/site";

const FROM = process.env.EMAIL_FROM || "Crost Agency <hello@crost.agency>";
const INTERNAL_TO = process.env.EMAIL_INTERNAL_TO || "brand@crost.agency";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

/**
 * Everything a prospect types reaches these templates, so every interpolated
 * value is escaped. The internal notification previously dropped the free-text
 * "Anything else?" field straight into an HTML string, which meant a prospect
 * could inject markup — including a link — into an email that arrives looking
 * like it came from us.
 */
function esc(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Brand-consistent shell so both emails look like they came from the site. */
function layout(opts: { preheader: string; body: string }): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f2f4f7;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f7;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#0a0a0a;padding:24px 32px;">
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.22em;color:#ff40d8;font-weight:700;">CROST AGENCY</div>
        </td></tr>
        <tr><td style="padding:32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#0a0a0a;">
          ${opts.body}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #e4e7ec;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#8a8f98;">
          Crost Agency · <a href="${SITE_URL}" style="color:#a6008c;text-decoration:none;">${esc(SITE_URL.replace(/^https?:\/\//, ""))}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function statRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #e4e7ec;font-size:13px;color:#5a5f68;">${esc(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid #e4e7ec;font-size:14px;color:#0a0a0a;font-weight:600;text-align:right;">${esc(value)}</td>
  </tr>`;
}

function cta(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
    <tr><td style="background:#ff40d8;border-radius:12px;">
      <a href="${esc(href)}" style="display:inline-block;padding:14px 26px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#0a0a0a;text-decoration:none;">${esc(label)}</a>
    </td></tr>
  </table>`;
}

/**
 * Returns { sent: false, reason } instead of throwing when there's no API
 * key configured, so the diagnostic/application flow still completes and
 * gets stored even if email delivery isn't wired up in this environment yet.
 */
async function send(payload: Parameters<Resend["emails"]["send"]>[0]) {
  const resend = client();
  if (!resend) {
    const to = "to" in payload ? payload.to : "(unknown)";
    const subject = "subject" in payload ? payload.subject : "(none)";
    console.warn(
      `RESEND_API_KEY not set — skipping email. Would have sent "${subject}" to ${to}.`
    );
    return { sent: false as const, reason: "no_api_key" as const };
  }
  const { error } = await resend.emails.send(payload);
  if (error) {
    console.error("Resend send failed", error);
    return { sent: false as const, reason: "send_error" as const };
  }
  return { sent: true as const };
}

export async function sendDiagnosticEmails(args: {
  businessName: string;
  email: string;
  industry: string | null;
  website: string | null;
  inputs: DiagnosticInputs;
  result: DiagnosticResult;
  leadId: string;
  diagnosticId: string;
}) {
  const { businessName, email, inputs, result, leadId, diagnosticId } = args;
  const { outputs, confidence, priceable, missing } = result;

  const targetLine =
    inputs.goalType === "customers"
      ? `${formatCount(outputs.targetCustomers)} new customers`
      : inputs.goalType === "revenue"
        ? `${formatUsd(outputs.revenueTarget)} in revenue`
        : `${formatUsd(outputs.revenueTarget)} in revenue at ${inputs.targetValue}× ROAS`;

  // The apply link must carry BOTH ids — the application form is keyed on the
  // lead, so the old diagnostic-only link landed on a form that could not be
  // submitted. It also pointed at a hardcoded host that isn't where this ships.
  const applyHref = applyUrl(leadId, diagnosticId);

  const modelBlock = priceable
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
         ${statRow("Indicative target", targetLine)}
         ${statRow("Est. monthly media", formatUsd(outputs.estimatedMonthlyMediaRequired))}
         ${statRow("Timeframe", formatTimeframe(inputs.timeframeDays))}
         ${statRow("LTV:CAC", formatRatio(outputs.ltvToCac))}
         ${statRow("Confidence", CONFIDENCE_LABEL[confidence])}
       </table>`
    : `<div style="margin:24px 0;padding:16px 18px;background:#fde8ee;border-radius:12px;color:#b01643;font-size:14px;line-height:1.6;">
         <strong>We couldn't price this target yet.</strong><br>
         There wasn't enough acquisition data to model what it would take. We'd need:
         <ul style="margin:10px 0 0;padding-left:18px;">
           ${missing.map((m) => `<li>${esc(MISSING_INPUT_LABEL[m])}</li>`).join("")}
         </ul>
       </div>`;

  const prospectHtml = layout({
    preheader: priceable
      ? `Your indicative model: ${formatUsd(outputs.estimatedMonthlyMediaRequired)}/mo.`
      : "We need a couple more numbers to price your target.",
    body: `
      <p style="margin:0 0 16px;">Hi${businessName ? ` — ${esc(businessName)}` : ""},</p>
      <p style="margin:0 0 4px;">Here's what the maths says about the target you gave us.</p>
      ${modelBlock}
      <p style="margin:0;font-size:13px;color:#5a5f68;">This is an indicative planning model, not a guarantee. A Crost strategist reviews every target before anything is signed.</p>
      ${cta(applyHref, priceable ? "Apply with these numbers →" : "Finish your diagnostic →")}
      <p style="margin:8px 0 0;font-size:12px;color:#8a8f98;">A human reviews every application.</p>
    `,
  });

  const internalHtml = layout({
    preheader: `New diagnostic: ${businessName}`,
    body: `
      <p style="margin:0 0 16px;font-size:17px;font-weight:700;">New diagnostic — ${esc(businessName)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${statRow("Email", email)}
        ${statRow("Industry", args.industry ?? "—")}
        ${statRow("Website", args.website ?? "—")}
        ${statRow("Goal", `${inputs.goalType} — ${inputs.targetValue} over ${formatTimeframe(inputs.timeframeDays)}`)}
        ${statRow("Monthly ad spend", formatUsd(inputs.monthlyAdSpend))}
        ${statRow("CAC", `${formatUsd(result.derivedMetrics.resolvedCac)} (${result.derivedMetrics.cacSource})`)}
        ${statRow("AOV / LTV", formatUsd(inputs.aovLtv))}
        ${statRow("Gross margin", formatPct(inputs.grossMarginPct))}
        ${statRow("Monthly visitors", formatCount(inputs.monthlyVisitors))}
        ${statRow("Conversion rate", formatPct(inputs.conversionRatePct))}
        ${statRow("Est. monthly media", formatUsd(outputs.estimatedMonthlyMediaRequired))}
        ${statRow("Confidence", CONFIDENCE_LABEL[confidence])}
        ${statRow("Missing", missing.length ? missing.join(", ") : "nothing")}
        ${statRow("Formula", result.formulaVersion)}
        ${statRow("Submitted", new Date().toISOString())}
      </table>
      <p style="margin:20px 0 0;font-size:12px;color:#8a8f98;">Lead ${esc(leadId)} · Diagnostic ${esc(diagnosticId)}</p>
    `,
  });

  const [prospect, internal] = await Promise.all([
    send({
      from: FROM,
      to: email,
      replyTo: INTERNAL_TO,
      subject: priceable
        ? "Your Crost diagnostic"
        : "Your Crost diagnostic — a couple of numbers missing",
      html: prospectHtml,
    }),
    send({
      from: FROM,
      to: INTERNAL_TO,
      replyTo: email,
      subject: `New Crost diagnostic: ${businessName}`,
      html: internalHtml,
    }),
  ]);

  return { prospect, internal };
}

export async function sendApplicationEmails(args: {
  businessName: string;
  email: string;
  website: string | null;
  applicationId: string;
  hasDiagnostic: boolean;
  answers: { label: string; value: string | null }[];
}) {
  const prospectHtml = layout({
    preheader: "We've got your application.",
    body: `
      <p style="margin:0 0 16px;">Hi${args.businessName ? ` — ${esc(args.businessName)}` : ""},</p>
      <p style="margin:0 0 12px;">We've got your application. Here's what happens next:</p>
      <ol style="margin:0 0 20px;padding-left:20px;color:#5a5f68;">
        <li style="margin-bottom:6px;">A Crost strategist reviews your numbers — a human, every time.</li>
        <li style="margin-bottom:6px;">If the target looks like something we can commit to, we'll reply within three working days.</li>
        <li>If it doesn't, we'll tell you that plainly, and why.</li>
      </ol>
      <p style="margin:0;font-size:13px;color:#5a5f68;">Reply to this email if anything changes in the meantime.</p>
      ${args.hasDiagnostic ? "" : cta(absoluteUrl("/diagnostic"), "Run the diagnostic →")}
    `,
  });

  const internalHtml = layout({
    preheader: `New application: ${args.businessName}`,
    body: `
      <p style="margin:0 0 16px;font-size:17px;font-weight:700;">New application — ${esc(args.businessName)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${statRow("Email", args.email)}
        ${statRow("Website", args.website ?? "—")}
        ${statRow("Diagnostic on file", args.hasDiagnostic ? "yes" : "no")}
        ${args.answers.map((a) => statRow(a.label, a.value ?? "—")).join("")}
      </table>
      <p style="margin:20px 0 0;font-size:12px;color:#8a8f98;">Application ${esc(args.applicationId)}</p>
    `,
  });

  const [prospect, internal] = await Promise.all([
    send({
      from: FROM,
      to: args.email,
      replyTo: INTERNAL_TO,
      subject: "We've got your Crost application",
      html: prospectHtml,
    }),
    send({
      from: FROM,
      to: INTERNAL_TO,
      replyTo: args.email,
      subject: `New Crost application: ${args.businessName}`,
      html: internalHtml,
    }),
  ]);

  return { prospect, internal };
}
