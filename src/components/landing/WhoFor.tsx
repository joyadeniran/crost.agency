const FITS = [
  {
    tag: "D2C",
    body: "You know your product economics and need profitable acquisition.",
  },
  { tag: "SaaS", body: "You have a measurable funnel and a clear growth target." },
  { tag: "FINTECH", body: "You need acquisition that survives beyond the first click." },
  { tag: "OTHER", body: "If the outcome can be measured, we can probably model it." },
];

export function WhoFor() {
  return (
    <section className="bg-surface-0 py-24 px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="font-display font-semibold text-[36px] sm:text-[48px] leading-[1.1] tracking-[-0.01em] text-crost-black">
          GOOD FIT?
        </h2>
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FITS.map((f) => (
            <div key={f.tag} className="rounded-lg bg-surface-1 p-6">
              <div className="font-text font-semibold text-[12px] tracking-[0.14em] text-crost-pink-700">
                {f.tag}
              </div>
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
