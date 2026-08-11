/**
 * Two cheap, dependency-free bot signals: a honeypot field real users never
 * see or fill, and a minimum time-on-form (scripts submit in milliseconds;
 * humans don't). Neither requires a third-party CAPTCHA service.
 *
 * The form reports how long it has been open as a *duration* it measured
 * itself, not as a timestamp we diff against the server clock. Diffing clocks
 * meant a user whose device clock ran a few minutes fast produced a negative
 * elapsed time and was silently classified as a bot — their submission was
 * dropped and they saw a generic failure. A duration is immune to skew, and is
 * no easier for a bot to forge than a timestamp was.
 */
const MIN_FILL_TIME_MS = 2500;

export function isLikelyBot(params: {
  honeypot: unknown;
  formElapsedMs: unknown;
}): boolean {
  if (typeof params.honeypot === "string" && params.honeypot.trim() !== "") {
    return true;
  }

  const elapsed = Number(params.formElapsedMs);
  if (!Number.isFinite(elapsed) || elapsed < 0) return true;
  return elapsed < MIN_FILL_TIME_MS;
}
