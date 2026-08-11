export function AiSection() {
  return (
    <section className="bg-surface-1 py-20 sm:py-24 px-6 lg:px-10">
      <div className="max-w-[900px] mx-auto text-center">
        <h2 className="font-display font-semibold text-[26px] sm:text-[38px] leading-[1.2] tracking-[-0.01em] text-crost-black">
          AI CAN EXPLAIN THE MATH.
          <br />
          <span className="text-crost-pink-700">IT DOESN&rsquo;T MAKE THE MATH UP.</span>
        </h2>
        <p className="mt-6 font-text text-[16px] leading-[1.6] text-text-mid max-w-xl mx-auto">
          Your model is calculated from your inputs by a fixed, versioned
          formula. The AI is handed the finished numbers and asked to put them in
          plain English — it never sees your raw inputs, and it can&rsquo;t
          change a figure.
        </p>
        <p className="mt-4 font-mono text-[12px] tracking-[0.04em] text-text-low">
          Every result shows its own working.
        </p>
      </div>
    </section>
  );
}
