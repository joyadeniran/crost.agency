const STEPS = [
  { n: "01", title: "Set the number", body: "We agree on a measurable outcome." },
  { n: "02", title: "Model the economics", body: "We establish what the funnel needs to do." },
  {
    n: "03",
    title: "Build the machine",
    body: "Creative, media, landing pages, testing and optimisation.",
  },
  { n: "04", title: "Measure the outcome", body: "We know whether we're winning." },
];

export function Process() {
  return (
    <section className="bg-surface-1 py-24 px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="font-display font-semibold text-[36px] sm:text-[48px] leading-[1.1] tracking-[-0.01em] text-crost-black">
          NO MYSTERY. JUST THE MATH.
        </h2>

        <div className="mt-16 relative grid grid-cols-1 sm:grid-cols-4 gap-10 sm:gap-6">
          <div className="hidden sm:block absolute top-[11px] left-[6%] right-[6%] h-[1.5px] bg-[#E4E7EC]" />
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="flex items-center gap-3 sm:block">
                <div
                  className={`relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center font-mono text-[10px] ${
                    i === STEPS.length - 1
                      ? "bg-crost-pink text-crost-black"
                      : "bg-surface-1 border-[1.5px] border-crost-black text-crost-black"
                  }`}
                >
                  {i === STEPS.length - 1 ? "✦" : ""}
                </div>
                <div className="font-mono text-[11px] text-text-low sm:mt-4">{s.n}</div>
              </div>
              <div className="font-display font-semibold text-[19px] text-crost-black mt-2">
                {s.title}
              </div>
              <p className="mt-2 font-text text-[14px] leading-relaxed text-text-mid">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
