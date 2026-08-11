"use client";

import { useRef } from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T | "";
  onChange: (v: T) => void;
  /** Accessible group name. Falls back to `name` when not given. */
  label?: string;
  name: string;
  /** Lets an optional field be cleared after answering. */
  allowDeselect?: boolean;
  size?: "md" | "sm";
}

/**
 * A radio group rendered as pills. Implemented with buttons rather than real
 * radios so the pill styling stays in the design system, which means the
 * keyboard behaviour radios give for free has to be supplied by hand: roving
 * tabindex (one stop for the whole group) plus arrow-key navigation.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  name,
  allowDeselect = false,
  size = "md",
}: SegmentedControlProps<T>) {
  const groupRef = useRef<HTMLDivElement>(null);

  const selectedIndex = options.findIndex((o) => o.value === value);
  // With nothing selected the group still needs exactly one tab stop.
  const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;

  function move(delta: number, from: number) {
    const next = (from + delta + options.length) % options.length;
    onChange(options[next].value);
    const buttons = groupRef.current?.querySelectorAll("button");
    buttons?.[next]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        move(1, index);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        move(-1, index);
        break;
      case "Home":
        e.preventDefault();
        move(-index, index);
        break;
      case "End":
        e.preventDefault();
        move(options.length - 1 - index, index);
        break;
    }
  }

  const sizing =
    size === "sm" ? "h-9 px-3.5 text-[13px]" : "h-11 px-5 text-[15px]";

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={label ?? name}
      className="flex flex-wrap gap-2"
    >
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={i === focusIndex ? 0 : -1}
            onKeyDown={(e) => onKeyDown(e, i)}
            onClick={() => {
              if (active && allowDeselect) onChange("" as T);
              else onChange(opt.value);
            }}
            className={[
              "rounded-md font-text font-semibold whitespace-nowrap",
              "transition-colors duration-[var(--dur-quick)] [transition-timing-function:var(--ease-out)]",
              sizing,
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
