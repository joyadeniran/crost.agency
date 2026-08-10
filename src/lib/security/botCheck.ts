/**
 * Two cheap, dependency-free bot signals: a honeypot field real users never
 * see or fill, and a minimum time-on-form (scripts submit in milliseconds;
 * humans don't). Neither requires a third-party CAPTCHA service.
 */
const MIN_FILL_TIME_MS = 2500;

export function isLikelyBot(params: {
  honeypot: unknown;
  formRenderedAt: unknown;
}): boolean {
  if (typeof params.honeypot === "string" && params.honeypot.trim() !== "") {
    return true;
  }
  const renderedAt = Number(params.formRenderedAt);
  if (!Number.isFinite(renderedAt)) return true;
  const elapsed = Date.now() - renderedAt;
  return elapsed < MIN_FILL_TIME_MS;
}
