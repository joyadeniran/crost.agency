const THEM = ["Impressions", "Posts", "Clicks", "Meetings", "Reports"];
const CROST = ["Customers", "Revenue", "CAC", "ROAS", "The number"];

export function Difference() {
  return (
    <section className="bg-surface-1 py-24 px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="font-display font-semibold text-[36px] sm:text-[48px] leading-[1.1] tracking-[-0.01em] text-crost-black max-w-2xl">
          MOST AGENCIES SELL THE WORK.
        </h2>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
          <div className="rounded-lg bg-surface-0 p-8">
            <div className="font-text font-semibold text-[11px] tracking-[0.18em] text-text-low mb-5">
              THEM
            </div>
            <ul className="flex flex-col gap-3">
              {THEM.map((item) => (
                <li
                  key={item}
                  className="font-display font-medium text-[22px] text-[#B0B5BD] line-through decoration-1"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-crost-black p-8">
            <div className="font-text font-semibold text-[11px] tracking-[0.18em] text-crost-pink mb-5">
              CROST
            </div>
            <ul className="flex flex-col gap-3">
              {CROST.map((item) => (
                <li key={item} className="font-display font-semibold text-[22px] text-white">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
