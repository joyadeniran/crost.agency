import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Badge";
import { RotatingStat } from "./RotatingStat";

export function Hero() {
  return (
    <section className="relative bg-crost-black text-white overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 w-[760px] h-[760px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,64,216,0.28) 0%, rgba(166,76,255,0.10) 45%, rgba(10,10,10,0) 70%)",
        }}
      />
      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10 pt-14 pb-20 lg:pt-20 lg:pb-32">
        <Eyebrow className="mb-6 tracking-[0.22em] text-[12px]">
          PERFORMANCE MARKETING
        </Eyebrow>
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-14 items-center">
          <div>
            <h1 className="font-display font-semibold text-[52px] sm:text-[72px] lg:text-[88px] leading-[0.95] tracking-[-0.02em]">
              WHAT&rsquo;S THE
              <br />
              <span className="text-crost-pink">NUMBER?</span>
            </h1>
            <p className="mt-7 font-text font-light text-[18px] sm:text-[19px] leading-[1.5] text-text-inv-mid max-w-md">
              Tell us the outcome you&rsquo;re chasing. We&rsquo;ll tell you what
              the maths says — before you spend anything.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <ButtonLink href="/diagnostic" variant="gradient" size="lg">
                Run the diagnostic →
              </ButtonLink>
              <ButtonLink href="/apply" variant="inverse" size="lg">
                Apply to Crost
              </ButtonLink>
            </div>
            <p className="mt-5 font-mono text-[12px] tracking-[0.06em] text-text-inv-low">
              Free · About 3 minutes · No commitment
            </p>
          </div>

          <div className="flex flex-col items-center gap-10">
            <RotatingStat />
            <TrajectoryPanel />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrajectoryPanel() {
  return (
    <div
      className="w-full max-w-[280px] rounded-lg border border-border-inv bg-surface-inv-3 p-5"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between font-mono text-[12px]">
        <div>
          <div className="text-text-inv-low tracking-[0.1em]">CURRENT</div>
          <div className="text-white text-[18px] mt-1">$12 CAC</div>
        </div>
        <div className="text-crost-pink text-[20px] leading-none">↗↗↗</div>
        <div className="text-right">
          <div className="text-text-inv-low tracking-[0.1em]">TARGET</div>
          <div className="text-crost-pink text-[18px] mt-1">$8 CAC</div>
        </div>
      </div>
      <div
        // Decorative: stopped outright under prefers-reduced-motion rather than
        // collapsed into one fast spin. See globals.css.
        data-motion="decorative"
        className="mt-4"
        style={{
          width: "94px",
          height: "68px",
          margin: "16px auto 0",
          background: "var(--crost-pink)",
          WebkitMaskImage: "url(/brand/crost-mark.svg)",
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskImage: "url(/brand/crost-mark.svg)",
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          filter: "drop-shadow(0 0 20px rgba(255,64,216,0.5))",
          animation: "crostOrbit 9s linear infinite",
        }}
      />
    </div>
  );
}
