import Link from "next/link";

export function Bet() {
  return (
    <section className="bg-surface-0 py-24 px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-14 items-center">
        <div>
          <h2 className="font-display font-semibold text-[36px] sm:text-[48px] leading-[1.1] tracking-[-0.01em] text-crost-black">
            WE PUT OUR FEE AT RISK.
          </h2>
          <p className="mt-6 font-text text-[17px] leading-[1.6] text-text-mid max-w-md">
            Before we start, we agree on what success looks like.
          </p>
          <p className="mt-4 font-text text-[17px] leading-[1.6] text-text-mid max-w-md">
            If the campaign misses the agreed performance target under the agreed
            conditions, our performance fee is at risk.
          </p>
          <Link
            href="/diagnostic"
            className="mt-8 inline-flex font-text font-semibold text-[15px] text-crost-pink-700"
          >
            See how the diagnostic works →
          </Link>
        </div>

        <div className="rounded-lg border border-[#E4E7EC] p-8 font-mono">
          <Row label="TARGET" value="1,000" sub="CUSTOMERS" />
          <Row label="TIMEFRAME" value="90 DAYS" />
          <div className="flex items-center justify-between pt-5">
            <span className="text-[11px] tracking-[0.14em] text-text-low">STATUS</span>
            <span className="text-[13px] font-medium text-[#0A7A50] bg-[#E7F7F0] rounded-full px-3 py-1">
              CROST ACCEPTED
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-5 border-b border-[#E4E7EC]">
      <span className="text-[11px] tracking-[0.14em] text-text-low">{label}</span>
      <span className="text-right">
        <span className="block text-[22px] text-crost-black">{value}</span>
        {sub && <span className="block text-[11px] text-text-low mt-0.5">{sub}</span>}
      </span>
    </div>
  );
}
