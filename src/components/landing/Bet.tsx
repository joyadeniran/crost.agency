import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Badge";

export function Bet() {
  return (
    <section className="bg-surface-0 py-20 sm:py-24 px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-14 items-center">
        <div>
          <h2 className="font-display font-semibold text-[32px] sm:text-[48px] leading-[1.1] tracking-[-0.01em] text-crost-black">
            WE PUT OUR FEE AT RISK.
          </h2>
          <div className="mt-6 flex flex-col gap-4 max-w-md font-text text-[16px] sm:text-[17px] leading-[1.6] text-text-mid">
            <p>
              Before anything starts, we agree in writing what success is: the
              number, the timeframe, and the conditions it depends on.
            </p>
            {/* Precise on purpose. We put our performance fee at risk — we do
                not claim to cover a client's media spend, which is a much
                larger commitment we haven't defined. See SPEC section 4. */}
            <p>
              If the campaign misses that target under those conditions,{" "}
              <strong className="font-semibold text-crost-black">
                our performance fee is refunded.
              </strong>{" "}
              Your media spend is your own — we&rsquo;re putting our pay behind
              the result, not underwriting your budget.
            </p>
          </div>
          <div className="mt-8">
            <ButtonLink href="/diagnostic" variant="secondary">
              See how we set the number →
            </ButtonLink>
          </div>
        </div>

        <figure className="rounded-lg border border-border-subtle p-8 font-mono m-0">
          <figcaption className="mb-2">
            <Eyebrow tone="muted">ILLUSTRATIVE AGREEMENT</Eyebrow>
          </figcaption>
          <Row label="TARGET" value="1,000" sub="NEW CUSTOMERS" />
          <Row label="TIMEFRAME" value="90 DAYS" />
          <Row label="FEE AT RISK" value="100%" sub="PERFORMANCE FEE" />
          <div className="flex items-center justify-between pt-5">
            <span className="text-[11px] tracking-[0.14em] text-text-low">STATUS</span>
            <span className="text-[13px] font-medium text-success-ink bg-success-tint rounded-full px-3 py-1">
              CROST ACCEPTED
            </span>
          </div>
        </figure>
      </div>
    </section>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-5 border-b border-border-subtle gap-4">
      <span className="text-[11px] tracking-[0.14em] text-text-low">{label}</span>
      <span className="text-right">
        <span className="block text-[22px] text-crost-black tabular-nums">{value}</span>
        {sub && <span className="block text-[11px] text-text-low mt-0.5">{sub}</span>}
      </span>
    </div>
  );
}
