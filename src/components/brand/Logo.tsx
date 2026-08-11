/**
 * The actual primary lockup file (crost-logo.svg) — wordmark, orbit ring
 * and sparkle baked into one artwork, per Brand System page 03 "PRIMARY
 * LOCKUP" and used exactly this way (masked fill) in the Applications
 * section (page 17: white-on-black social post, pink-on-black deck cover).
 * Never rebuild this from the mark + separately-typeset text — that's a
 * different, secondary lockup for tight spaces only.
 *
 * 130x83 matches the Applications section's own deck-cover sizing, which
 * sits safely above the documented 120px minimum lockup width (below that,
 * the sparkle closes up and the orbit stroke breaks).
 */
/**
 * `tone` rather than a raw colour: the lockup is a masked shape, so its colour
 * is a CSS background rather than a class, and every call site was passing a
 * hand-written hex. Mapping the two legitimate treatments to tokens keeps the
 * "no colour outside the system" rule true here too.
 */
const TONE_FILL = {
  dark: "var(--crost-black)", // on light surfaces
  light: "var(--text-inv-hi)", // on the near-black surfaces
  pink: "var(--crost-pink)",
} as const;

export function Logo({
  tone = "dark",
  width = 130,
}: {
  tone?: keyof typeof TONE_FILL;
  width?: number;
}) {
  const fill = TONE_FILL[tone];
  const height = Math.round(width * (746 / 1163));
  return (
    <span
      role="img"
      aria-label="Crost Agency"
      style={{
        display: "inline-block",
        width,
        height,
        background: fill,
        WebkitMaskImage: "url(/brand/crost-logo.svg)",
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskImage: "url(/brand/crost-logo.svg)",
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
}
