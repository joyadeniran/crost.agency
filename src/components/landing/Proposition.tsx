export function Proposition() {
  return (
    <section className="bg-surface-0 py-24 px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        {/* "ACTIVITY" gets its own wider tracking: Fredoka's I-V-I fuses
            into what reads as an M at the tight tracking used everywhere
            else in the headline — even +1% wasn't enough to separate it. */}
        <h2 className="font-display font-semibold text-[40px] sm:text-[56px] leading-[1.05] tracking-[-0.01em] text-crost-black max-w-3xl">
          WE DON&rsquo;T SELL <span className="tracking-[0.05em]">ACTIVITY.</span>
        </h2>
        <p className="mt-6 font-text font-light text-[19px] leading-[1.6] text-text-mid max-w-2xl">
          Ads running isn&rsquo;t the goal. Content published isn&rsquo;t the goal. Reports
          delivered aren&rsquo;t the goal.
          <br />
          <strong className="font-semibold text-crost-black">
            The number is the goal.
          </strong>
        </p>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <Point title="STRATEGY" body="Know what we're trying to achieve." />
          <Point title="PERFORMANCE" body="Measure what actually moves the number." />
          <Point title="ACCOUNTABILITY" body="Put our fee behind the agreed outcome." />
        </div>
      </div>
    </section>
  );
}

function Point({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-t-[1.5px] border-crost-pink pt-5">
      <div className="font-text font-semibold text-[12px] tracking-[0.18em] text-crost-pink">
        {title}
      </div>
      <p className="mt-3 font-text text-[15px] leading-relaxed text-text-mid">{body}</p>
    </div>
  );
}
