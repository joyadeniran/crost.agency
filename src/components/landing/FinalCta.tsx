import Link from "next/link";

export function FinalCta() {
  return (
    <section className="bg-surface-0 py-28 px-6 lg:px-10 text-center">
      <div className="max-w-[700px] mx-auto flex flex-col items-center">
        <h2 className="font-display font-semibold text-[40px] sm:text-[56px] leading-[1.05] tracking-[-0.02em] text-crost-black">
          WHAT&rsquo;S THE NUMBER?
        </h2>
        <p className="mt-6 font-text text-[17px] leading-[1.6] text-text-mid max-w-md">
          Give us the target. We&rsquo;ll tell you whether we&rsquo;re willing to bet on it.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/diagnostic"
            className="inline-flex items-center justify-center h-[52px] px-7 rounded-md font-text font-semibold text-[16px] text-white bg-[linear-gradient(115deg,#FF40D8,#A64CFF)] hover:brightness-110 transition-[filter] duration-[var(--dur-quick)]"
          >
            Run the diagnostic →
          </Link>
          <Link
            href="/apply"
            className="inline-flex items-center justify-center h-[52px] px-7 rounded-md font-text font-semibold text-[16px] border-[1.5px] border-crost-black text-crost-black hover:bg-crost-black hover:text-white transition-colors duration-[var(--dur-quick)]"
          >
            Apply to Crost →
          </Link>
        </div>
      </div>
    </section>
  );
}
