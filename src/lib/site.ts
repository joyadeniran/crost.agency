/**
 * Canonical origin for absolute links (emails, OG tags, sitemap, robots).
 *
 * Emails in particular *must* use an absolute URL, and getting this wrong is
 * silent: the mail sends, the link 404s, and nobody finds out until a lead
 * complains. Resolution order is explicit config → Vercel's deployment URL →
 * localhost, so a preview deployment links to itself rather than to prod.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Crost Agency";

/** Build an absolute URL from an app-relative path. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The apply link for a completed diagnostic. Both ids are required — the
 * application form is keyed on the lead, so a link carrying only the
 * diagnostic id lands on a form that cannot be submitted.
 */
export function applyUrl(leadId: string, diagnosticId: string): string {
  const params = new URLSearchParams({ lead: leadId, diagnostic: diagnosticId });
  return absoluteUrl(`/apply?${params.toString()}`);
}
