import { Eyebrow } from "@/components/ui/Badge";

const FITS = [
  {
    tag: "D2C",
    body: "You know your product economics and need acquisition that stays profitable at volume.",
  },
  {
    tag: "SaaS",
    body: "You have a measurable funnel, a real LTV, and a growth target with a date on it.",
  },
  {
    tag: "FINTECH",
    body: "You need acquisition that survives past the first click — funded accounts, not signups.",
  },
  {
    tag: "OTHER",
    body: "If the outcome can be counted, we can probably model it. The diagnostic will tell you.",
  },
];

export function WhoFor() {
  return (
    <section className="bg-surface-0 py-20 sm:py-24 px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="font-display font-semibold text-[32px] sm:text-[48px] leading-[1.1] tracking-[-0.01em] text-crost-black">
          GOOD FIT?
        </h2>
        <p className="mt-5 font-text text-[16px] leading-relaxed text-text-mid max-w-lg">
          The common thread isn&rsquo;t the industry — it&rsquo;s that you can
          already measure what a customer is worth.
        </p>
        <div className="mt-12 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FITS.map((f) => (
            <div key={f.tag} className="rounded-lg bg-surface-1 p-6">
              <Eyebrow tone="pink-dark" className="tracking-[0.14em] text-[12px]">
                {f.tag}
              </Eyebrow>
              <p className="mt-3 font-text text-[14.5px] leading-relaxed text-text-mid">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
