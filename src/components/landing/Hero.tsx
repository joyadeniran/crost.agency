import Link from "next/link";
import { RotatingStat } from "./RotatingStat";

export function Hero() {
  return (
    <section className="relative bg-crost-black text-white overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 -right-40 w-[760px] h-[760px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,64,216,0.28) 0%, rgba(166,76,255,0.10) 45%, rgba(10,10,10,0) 70%)",
        }}
      />
      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10 pt-16 pb-24 lg:pt-20 lg:pb-32">
        <div className="font-text font-semibold text-[12px] tracking-[0.22em] text-crost-pink mb-6">
          PERFORMANCE MARKETING
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-14 items-center">
          <div>
            <h1 className="font-display font-semibold text-[64px] sm:text-[88px] leading-[0.95] tracking-[-0.02em]">
              WHAT&rsquo;S THE
              <br />
              <span className="text-crost-pink">NUMBER?</span>
            </h1>
            <p className="mt-7 font-text font-light text-[19px] leading-[1.5] text-text-inv-mid max-w-md">
              Tell us the outcome you&rsquo;re chasing. We&rsquo;ll tell you what the maths says.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/diagnostic"
                className="inline-flex items-center justify-center h-[52px] px-7 rounded-md font-text font-semibold text-[16px] text-white bg-[linear-gradient(115deg,#FF40D8,#A64CFF)] hover:brightness-110 transition-[filter] duration-[var(--dur-quick)]"
              >
                Run the diagnostic →
              </Link>
              <Link
                href="/apply"
                className="inline-flex items-center justify-center h-[52px] px-7 rounded-md font-text font-semibold text-[16px] border-[1.5px] border-white/30 text-white hover:bg-white hover:text-crost-black transition-colors duration-[var(--dur-quick)]"
              >
                Apply to Crost
              </Link>
            </div>
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
    <div className="w-full max-w-[280px] rounded-lg border border-[#24242B] bg-[#0F0F14] p-5">
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
        className="mt-4 h-16 rounded-md"
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
