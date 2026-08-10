import { Resend } from "resend";
import type { DiagnosticInputs, DiagnosticResult } from "@/lib/calc/types";
import { formatUsd, formatRatio, formatCount } from "@/lib/calc/format";

const FROM = "Crost Agency <hello@crost.agency>";
const INTERNAL_TO = "brand@crost.agency";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

/**
 * Returns { sent: false, reason } instead of throwing when there's no API
 * key configured, so the diagnostic/application flow still completes and
 * gets stored even if email delivery isn't wired up in this environment yet.
 */
async function send(payload: Parameters<Resend["emails"]["send"]>[0]) {
  const resend = client();
  if (!resend) {
    console.warn(
      "RESEND_API_KEY not set — skipping email send. Payload:",
      JSON.stringify(payload).slice(0, 500)
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
  inputs: DiagnosticInputs;
  result: DiagnosticResult;
  diagnosticId: string;
}) {
  const { businessName, email, inputs, result } = args;
  const { outputs, confidence } = result;

  const prospectHtml = `
    <p>Hi there,</p>
    <p>Your Crost diagnostic is ready.</p>
    <p><strong>Indicative target:</strong> ${formatCount(outputs.targetCustomers)} customers,
       ${formatUsd(outputs.estimatedMonthlyMediaRequired)}/mo estimated media, LTV:CAC ${formatRatio(outputs.ltvToCac)}.</p>
    <p><strong>Confidence:</strong> ${confidence.replace(/_/g, " ")}</p>
    <p>This is an indicative planning model, not a guarantee. A Crost strategist reviews every target before anything is signed.</p>
    <p><a href="https://app.crost.agency/apply?diagnostic=${args.diagnosticId}">Apply with these numbers →</a></p>
  `;

  const internalHtml = `
    <p><strong>New Crost diagnostic:</strong> ${businessName}</p>
    <ul>
      <li>Email: ${email}</li>
      <li>Industry: ${args.industry ?? "—"}</li>
      <li>Ad spend: ${formatUsd(inputs.monthlyAdSpend)}</li>
      <li>CAC: ${formatUsd(inputs.cac)} (${result.derivedMetrics.cacSource})</li>
      <li>AOV/LTV: ${formatUsd(inputs.aovLtv)}</li>
      <li>Gross margin: ${inputs.grossMarginPct ?? "—"}%</li>
      <li>Goal: ${inputs.goalType} — target ${inputs.targetValue} over ${inputs.timeframeDays} days</li>
      <li>Estimated monthly media required: ${formatUsd(outputs.estimatedMonthlyMediaRequired)}</li>
      <li>Confidence: ${confidence}</li>
      <li>Timestamp: ${new Date().toISOString()}</li>
    </ul>
  `;

  const [prospect, internal] = await Promise.all([
    send({ from: FROM, to: email, subject: "Your Crost diagnostic", html: prospectHtml }),
    send({
      from: FROM,
      to: INTERNAL_TO,
      subject: `New Crost diagnostic: ${businessName}`,
      html: internalHtml,
    }),
  ]);

  return { prospect, internal };
}

export async function sendApplicationEmails(args: {
  businessName: string;
  email: string;
  summaryHtml: string;
}) {
  const prospectHtml = `
    <p>We've got your application.</p>
    <p>We'll review the numbers and reply within three working days.</p>
  `;
  const internalHtml = `
    <p><strong>New Crost application:</strong> ${args.businessName}</p>
    ${args.summaryHtml}
  `;

  const [prospect, internal] = await Promise.all([
    send({
      from: FROM,
      to: args.email,
      subject: "Application received",
      html: prospectHtml,
    }),
    send({
      from: FROM,
      to: INTERNAL_TO,
      subject: `New Crost application: ${args.businessName}`,
      html: internalHtml,
    }),
  ]);

  return { prospect, internal };
}
