import Link from "next/link";

export function DiagnosticCta() {
  return (
    <section className="relative bg-crost-black text-white py-28 px-6 lg:px-10 overflow-hidden">
      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
        style={{
          background:
            "radial-gradient(circle, rgba(166,76,255,0.22) 0%, rgba(255,64,216,0.10) 45%, rgba(10,10,10,0) 70%)",
        }}
      />
      <div className="relative max-w-[900px] mx-auto text-center flex flex-col items-center">
        <h2 className="font-display font-semibold text-[44px] sm:text-[64px] leading-[1.02] tracking-[-0.02em]">
          PUT YOUR NUMBERS IN.
        </h2>
        <p className="mt-6 font-text font-light text-[18px] leading-[1.6] text-text-inv-mid max-w-lg">
          See what your current economics can support before you talk to us.
        </p>
        <Link
          href="/diagnostic"
          className="mt-9 inline-flex items-center justify-center h-[56px] px-8 rounded-md font-text font-semibold text-[17px] text-white bg-[linear-gradient(115deg,#FF40D8,#A64CFF)] hover:brightness-110 transition-[filter] duration-[var(--dur-quick)]"
        >
          Run the Crost Diagnostic →
        </Link>
        <span className="mt-4 font-mono text-[12px] tracking-[0.06em] text-text-inv-low">
          Free. Indicative. No commitment.
        </span>
      </div>
    </section>
  );
}
