export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={[
              "h-11 px-5 rounded-md font-text font-semibold text-[15px] whitespace-nowrap transition-colors",
              "duration-[var(--dur-quick)]",
              active
                ? "bg-crost-pink text-crost-black"
                : "border-[1.5px] border-crost-black text-crost-black hover:bg-crost-black hover:text-white",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
