import { Eyebrow } from "@/components/ui/Badge";

const POINTS = [
  {
    title: "STRATEGY",
    body: "We start from the outcome you need, and work backwards to what the funnel has to do.",
  },
  {
    title: "PERFORMANCE",
    body: "We measure the things that move that outcome, and ignore the things that don't.",
  },
  {
    title: "ACCOUNTABILITY",
    body: "Our performance fee sits behind the agreed target. Miss it, and we refund it.",
  },
];

export function Proposition() {
  return (
    <section className="bg-surface-0 py-20 sm:py-24 px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        {/* "ACTIVITY" gets its own wider tracking: Fredoka's I-V-I fuses
            into what reads as an M at the tight tracking used everywhere
            else in the headline — even +1% wasn't enough to separate it. */}
        <h2 className="font-display font-semibold text-[36px] sm:text-[56px] leading-[1.05] tracking-[-0.01em] text-crost-black max-w-3xl">
          WE DON&rsquo;T SELL <span className="tracking-[0.05em]">ACTIVITY.</span>
        </h2>
        <p className="mt-6 font-text font-light text-[18px] sm:text-[19px] leading-[1.6] text-text-mid max-w-2xl">
          Ads running isn&rsquo;t the goal. Content published isn&rsquo;t the goal.
          Reports delivered aren&rsquo;t the goal.
          <br />
          <strong className="font-semibold text-crost-black">
            The number is the goal.
          </strong>
        </p>

        <div className="mt-14 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {POINTS.map((p) => (
            <div key={p.title} className="border-t-[1.5px] border-crost-pink pt-5">
              <Eyebrow className="tracking-[0.18em] text-[12px]">{p.title}</Eyebrow>
              <p className="mt-3 font-text text-[15px] leading-relaxed text-text-mid">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
