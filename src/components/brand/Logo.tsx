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
export function Logo({
  fill = "#0A0A0A",
  width = 130,
}: {
  fill?: string;
  width?: number;
}) {
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
