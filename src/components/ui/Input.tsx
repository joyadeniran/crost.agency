import { type InputHTMLAttributes, forwardRef, useId } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  help?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  dark?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, help, error, prefix, suffix, dark = false, className = "", id, ...props },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? props.name ?? generatedId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={`font-text font-semibold text-[12.5px] whitespace-nowrap ${
              dark ? "text-white" : "text-text-hi"
            }`}
          >
            {label}
          </label>
        )}
        <div
          className={[
            "h-12 rounded-md flex items-center px-3.5 gap-1 border-[1.5px] transition-shadow",
            `duration-[var(--dur-quick)]`,
            dark
              ? "bg-surface-inv-1 border-[#3A3A42] text-white focus-within:border-crost-pink"
              : "bg-surface-0 border-[#D6DAE1] focus-within:border-crost-pink",
            error ? "!border-danger" : "",
            "focus-within:shadow-[0_0_0_3px_rgba(255,64,216,0.18)]",
          ].join(" ")}
        >
          {prefix && (
            <span className={dark ? "text-text-inv-low" : "text-text-low"}>
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "flex-1 min-w-0 bg-transparent outline-none font-text text-[15px]",
              dark
                ? "text-white placeholder:text-[#6A6A73]"
                : "text-text-hi placeholder:text-[#9AA0A8]",
              className,
            ].join(" ")}
            {...props}
          />
          {suffix && (
            <span className={dark ? "text-text-inv-low" : "text-text-low"}>
              {suffix}
            </span>
          )}
        </div>
        {error ? (
          <span className="text-[11.5px] text-danger">{error}</span>
        ) : help ? (
          <span
            className={`text-[11.5px] ${dark ? "text-text-inv-low" : "text-text-low"}`}
          >
            {help}
          </span>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
