import { Eyebrow } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

export function DiagnosticPreview() {
  return (
    <section className="bg-surface-0 py-20 sm:py-24 px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-14 items-center">
        <div>
          <Eyebrow tone="pink-dark" className="mb-4">
            THE CROST DIAGNOSTIC
          </Eyebrow>
          <h2 className="font-display font-semibold text-[30px] sm:text-[34px] leading-[1.1] tracking-[-0.01em] text-crost-black">
            Not generic screenshots. The actual product.
          </h2>
          <div className="mt-5 flex flex-col gap-3 font-text text-[16px] leading-[1.6] text-text-mid max-w-md">
            <p>
              You put in what you know. It shows you the target, the media it
              would take, and the arithmetic in between.
            </p>
            <p>
              Where your inputs don&rsquo;t support an answer, it says so — it
              never fills the gap with a number.
            </p>
          </div>
          <div className="mt-7">
            <ButtonLink href="/diagnostic" variant="secondary">
              Try it on your numbers →
            </ButtonLink>
          </div>
        </div>

        {/* A worked example, labelled as one — never presented as live data. */}
        <figure className="rounded-lg border border-border-subtle shadow-[0_20px_60px_rgba(10,10,10,0.08)] p-7 bg-surface-0 m-0">
          <figcaption className="flex items-center justify-between gap-3">
            <Eyebrow tone="muted" className="text-[10.5px]">
              YOUR INDICATIVE MODEL
            </Eyebrow>
            <span className="font-mono text-[10px] tracking-[0.1em] text-text-low">
              EXAMPLE
            </span>
          </figcaption>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="font-display font-semibold text-[34px] sm:text-[38px] leading-none text-crost-black tabular-nums">
                1,000
              </div>
              <div className="mt-1.5 font-text text-[11px] tracking-[0.1em] text-text-low">
                NEW CUSTOMERS
              </div>
            </div>
            <div>
              <div className="font-display font-semibold text-[34px] sm:text-[38px] leading-none text-crost-black tabular-nums">
                $4,000
              </div>
              <div className="mt-1.5 font-text text-[11px] tracking-[0.1em] text-text-low">
                EST. MONTHLY MEDIA
              </div>
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center rounded-full bg-success-tint text-success-ink px-3 py-1 font-text font-semibold text-[11px] tracking-[0.02em]">
              High confidence
            </span>
          </div>
          <div className="mt-6 pt-6 border-t border-border-subtle">
            <Eyebrow tone="muted" className="text-[10.5px] mb-2">
              HOW WE GOT HERE
            </Eyebrow>
            {/* These figures are internally consistent: 1,000 × $12 = $12,000
                over 90 days = $4,000/mo. The panel previously showed a $12,000
                total beside a $4,200 monthly figure, which doesn't divide. */}
            <div className="font-mono text-[13px] text-crost-black leading-[1.9]">
              1,000 customers <span className="text-text-low">×</span> $12 CAC{" "}
              <span className="text-text-low">=</span> $12,000
              <br />
              <span className="text-text-low">÷ 90 days =</span> $4,000 / month
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}
