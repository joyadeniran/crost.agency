export function DiagnosticPreview() {
  return (
    <section className="bg-surface-0 py-24 px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-14 items-center">
        <div>
          <div className="font-text font-semibold text-[11px] tracking-[0.18em] text-crost-pink-700 mb-4">
            THE CROST DIAGNOSTIC
          </div>
          <h2 className="font-display font-semibold text-[34px] leading-[1.1] tracking-[-0.01em] text-crost-black">
            Not generic screenshots. The actual product.
          </h2>
          <p className="mt-5 font-text text-[16px] leading-[1.6] text-text-mid max-w-md">
            The maths comes from your inputs. Not an AI guess.
          </p>
        </div>

        <div className="rounded-lg border border-[#E4E7EC] shadow-[0_20px_60px_rgba(10,10,10,0.08)] p-7 bg-surface-0">
          <div className="font-text font-semibold text-[10.5px] tracking-[0.18em] text-text-low">
            YOUR INDICATIVE MODEL
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="font-display font-semibold text-[38px] leading-none text-crost-black">
                1,000
              </div>
              <div className="mt-1.5 font-text text-[11px] tracking-[0.1em] text-text-low">
                NEW CUSTOMERS
              </div>
            </div>
            <div>
              <div className="font-display font-semibold text-[38px] leading-none text-crost-black">
                $4,200
              </div>
              <div className="mt-1.5 font-text text-[11px] tracking-[0.1em] text-text-low">
                EST. MONTHLY MEDIA
              </div>
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center rounded-full bg-[#E7F7F0] text-[#0A7A50] px-3 py-1 font-text font-semibold text-[11px] tracking-[0.04em]">
              HIGH CONFIDENCE
            </span>
          </div>
          <div className="mt-6 pt-6 border-t border-[#E4E7EC]">
            <div className="font-text font-semibold text-[10.5px] tracking-[0.18em] text-text-low mb-2">
              HOW WE GOT HERE
            </div>
            <div className="font-mono text-[13px] text-crost-black">
              1,000 customers <span className="text-text-low">×</span> $12 CAC{" "}
              <span className="text-text-low">=</span> $12,000 acquisition spend
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
