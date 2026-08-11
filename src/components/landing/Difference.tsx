import { Eyebrow } from "@/components/ui/Badge";

const THEM = ["Impressions", "Posts", "Clicks", "Meetings", "Reports"];
const CROST = ["Customers", "Revenue", "CAC", "ROAS", "The number"];

export function Difference() {
  return (
    <section className="bg-surface-1 py-20 sm:py-24 px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="font-display font-semibold text-[32px] sm:text-[48px] leading-[1.1] tracking-[-0.01em] text-crost-black max-w-2xl">
          MOST AGENCIES SELL THE WORK.
          <br />
          <span className="text-crost-pink-700">WE SELL THE RESULT.</span>
        </h2>
        <p className="mt-5 font-text text-[16px] leading-relaxed text-text-mid max-w-lg">
          Same disciplines. Completely different thing being promised.
        </p>

        <div className="mt-12 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
          <div className="rounded-lg bg-surface-0 p-8">
            <Eyebrow tone="muted" className="mb-5">
              WHAT THEY REPORT
            </Eyebrow>
            <ul className="flex flex-col gap-3">
              {THEM.map((item) => (
                <li
                  key={item}
                  className="font-display font-medium text-[22px] text-text-disabled line-through decoration-1"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-crost-black p-8">
            <Eyebrow className="mb-5">WHAT WE COMMIT TO</Eyebrow>
            <ul className="flex flex-col gap-3">
              {CROST.map((item) => (
                <li
                  key={item}
                  className="font-display font-semibold text-[22px] text-white"
                >
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
