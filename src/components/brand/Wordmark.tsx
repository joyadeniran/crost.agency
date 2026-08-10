/**
 * Horizontal lockup per Crost Brand System v2.0 page 03: mark in a pink
 * rounded square, divider, CROST/AGENCY stacked text. Used wherever a
 * compact header/footer lockup is needed instead of the full logo file.
 */
export function Wordmark({ dark = true }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-[9px] bg-crost-pink flex items-center justify-center flex-none">
        <div
          className="w-[19px] h-[14px]"
          style={{
            background: "#0A0A0A",
            WebkitMaskImage: "url(/brand/crost-mark.svg)",
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskImage: "url(/brand/crost-mark.svg)",
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        />
      </div>
      <div className="leading-none">
        <div
          className={`font-display font-semibold text-[16px] tracking-[0.01em] ${
            dark ? "text-white" : "text-crost-black"
          }`}
        >
          CROST
        </div>
        <div className="font-text font-medium text-[7.5px] tracking-[0.32em] text-crost-pink mt-0.5">
          AGENCY
        </div>
      </div>
    </div>
  );
}
