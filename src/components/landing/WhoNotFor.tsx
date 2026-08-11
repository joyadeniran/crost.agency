const REASONS = [
  'You want "brand awareness" with no measurable definition.',
  "You want 10,000 followers.",
  "You want someone to boost your posts.",
  "You're looking for the cheapest agency in the room.",
  "You don't know what success means yet.",
];

export function WhoNotFor() {
  return (
    <section className="bg-crost-black text-white py-20 sm:py-24 px-6 lg:px-10">
      <div className="max-w-[900px] mx-auto">
        <h2 className="font-display font-semibold text-[26px] sm:text-[40px] leading-[1.15] tracking-[-0.01em]">
          WE&rsquo;RE PROBABLY NOT FOR YOU IF&hellip;
        </h2>
        <ul className="mt-10 flex flex-col gap-4">
          {REASONS.map((r) => (
            <li
              key={r}
              className="font-text text-[16px] sm:text-[17px] leading-relaxed text-text-inv-mid border-b border-border-inv pb-4"
            >
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-10 font-text text-[16px] leading-relaxed text-text-inv-low max-w-lg">
          None of those are bad things to want. They&rsquo;re just not things we
          can put our fee behind — so we&rsquo;d be the wrong agency to sell them
          to you.
        </p>
      </div>
    </section>
  );
}
