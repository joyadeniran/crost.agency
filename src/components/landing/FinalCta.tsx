import { ButtonLink } from "@/components/ui/Button";

export function FinalCta() {
  return (
    <section className="bg-surface-0 py-24 sm:py-28 px-6 lg:px-10 text-center">
      <div className="max-w-[700px] mx-auto flex flex-col items-center">
        <h2 className="font-display font-semibold text-[36px] sm:text-[56px] leading-[1.05] tracking-[-0.02em] text-crost-black">
          WHAT&rsquo;S THE NUMBER?
        </h2>
        <p className="mt-6 font-text text-[16px] sm:text-[17px] leading-[1.6] text-text-mid max-w-md">
          Give us the target. We&rsquo;ll tell you whether we&rsquo;re willing to
          bet on it — and show you the maths behind the answer.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <ButtonLink href="/diagnostic" variant="gradient" size="lg">
            Run the diagnostic →
          </ButtonLink>
          <ButtonLink href="/apply" variant="secondary" size="lg">
            Apply to Crost →
          </ButtonLink>
        </div>
        <p className="mt-5 font-text text-[13px] text-text-low">
          The diagnostic takes about three minutes. Applying takes one.
        </p>
      </div>
    </section>
  );
}
