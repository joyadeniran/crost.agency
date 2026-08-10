export function ProgressSteps({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-text-low">
      <span className="text-crost-pink font-medium">
        {String(step).padStart(2, "0")}
      </span>
      <span>/</span>
      <span>{String(total).padStart(2, "0")}</span>
      <div className="ml-2 h-[3px] w-24 rounded-full bg-[#E4E7EC] overflow-hidden">
        <div
          className="h-full bg-[linear-gradient(90deg,#FF40D8,#A64CFF)] transition-[width] duration-[var(--dur-base)] [transition-timing-function:var(--ease-out)]"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function ConfidenceBadge({
  confidence,
}: {
  confidence: "HIGH" | "MEDIUM" | "NEEDS_MORE_DATA";
}) {
  const styles = {
    HIGH: "bg-[#E7F7F0] text-[#0A7A50]",
    MEDIUM: "bg-[#FEF4E1] text-[#9A6400]",
    NEEDS_MORE_DATA: "bg-[#FDE8EE] text-[#B01643]",
  } as const;
  const labels = {
    HIGH: "HIGH",
    MEDIUM: "MEDIUM",
    NEEDS_MORE_DATA: "NEEDS MORE DATA",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-text font-semibold text-[12px] tracking-[0.04em] ${styles[confidence]}`}
    >
      {labels[confidence]}
    </span>
  );
}
