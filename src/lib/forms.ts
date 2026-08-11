export function numOrNull(s: string): number | null {
  if (s.trim() === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Client-side field validation. The server re-validates everything with Zod —
 * this exists so a mistyped figure is caught while the user is still looking
 * at the field, instead of becoming a 400 five steps later.
 *
 * Each function returns an error string, or null when the value is acceptable.
 * Blank is acceptable everywhere except where `required` is passed: the
 * diagnostic is explicitly designed to work with partial information.
 */

// Deliberately permissive: it rejects the common typos (missing @, missing
// dot, stray spaces) without trying to out-guess RFC 5322.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string, required = true): string | null {
  const v = value.trim();
  if (!v) return required ? "We need an email to send your model to." : null;
  if (!EMAIL_RE.test(v)) return "That doesn't look like a valid email address.";
  if (v.length > 320) return "That email address is too long.";
  return null;
}

export function validateRequiredText(value: string, label: string): string | null {
  const v = value.trim();
  if (!v) return `${label} is required.`;
  if (v.length > 200) return `${label} is too long.`;
  return null;
}

/** Money and count fields: optional, but must be a non-negative real number. */
export function validateAmount(value: string, label: string): string | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return `${label} must be a number.`;
  if (n < 0) return `${label} can't be negative.`;
  if (n > 1_000_000_000) return `That ${label.toLowerCase()} looks too large — check the figure.`;
  return null;
}

export function validatePercent(value: string, label: string): string | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return `${label} must be a number.`;
  if (n < 0) return `${label} can't be negative.`;
  if (n > 100) return `${label} can't be more than 100%.`;
  return null;
}

/**
 * The target is the one figure the model genuinely cannot run without, so
 * unlike the economics fields it is required and must be strictly positive.
 */
export function validateTarget(value: string, goalType: string): string | null {
  const v = value.trim();
  if (!v) return "Tell us the number you're aiming at.";
  const n = Number(v);
  if (!Number.isFinite(n)) return "The target must be a number.";
  if (n <= 0) return "The target must be greater than zero.";
  if (goalType === "roas" && n > 100) {
    return "That's an unusually high ROAS — check the figure.";
  }
  if (goalType !== "roas" && n > 1_000_000_000) {
    return "That target looks too large — check the figure.";
  }
  return null;
}

/** Optional URL field: accepts bare domains, normalises on the server side. */
export function validateWebsite(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (v.length > 300) return "That URL is too long.";
  if (/\s/.test(v)) return "A website address can't contain spaces.";
  if (!v.includes(".")) return "That doesn't look like a website address.";
  return null;
}

/** True when every entry in a validation map is null. */
export function isClean(errors: Record<string, string | null>): boolean {
  return Object.values(errors).every((e) => e === null);
}
