import { type InputHTMLAttributes, forwardRef, useId } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  help?: string;
  error?: string | null;
  prefix?: string;
  suffix?: string;
  dark?: boolean;
  /** Renders "optional" beside the label. Clearer than marking the majority. */
  optional?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      help,
      error,
      prefix,
      suffix,
      dark = false,
      optional = false,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? props.name ?? generatedId;
    const messageId = `${inputId}-message`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={`font-text font-semibold text-[12.5px] flex items-baseline gap-2 ${
              dark ? "text-white" : "text-text-hi"
            }`}
          >
            <span>{label}</span>
            {optional && (
              <span
                className={`font-normal text-[11px] ${
                  dark ? "text-text-inv-low" : "text-text-low"
                }`}
              >
                optional
              </span>
            )}
          </label>
        )}
        <div
          className={[
            "h-12 rounded-md flex items-center px-3.5 gap-1 border-[1.5px]",
            "transition-[border-color,box-shadow] duration-[var(--dur-quick)]",
            dark
              ? "bg-surface-inv-1 border-border-inv-field text-white"
              : "bg-surface-0 border-border-field",
            error
              ? "border-danger focus-within:border-danger focus-within:shadow-[0_0_0_3px_rgba(224,36,94,0.18)]"
              : "focus-within:border-crost-pink focus-within:shadow-[var(--ring-pink)]",
          ].join(" ")}
        >
          {prefix && (
            <span
              aria-hidden="true"
              className={dark ? "text-text-inv-low" : "text-text-low"}
            >
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || help ? messageId : undefined}
            className={[
              // The wrapper carries the focus treatment (pink border + ring).
              // Without suppressing it here the global :focus-visible outline
              // draws a second ring tight around the text, inside the first.
              "flex-1 min-w-0 bg-transparent outline-none focus-visible:outline-none font-text text-[15px]",
              // The spinner arrows on number inputs invite click-to-increment
              // on figures that are typed, not nudged, and they clip the suffix.
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              dark
                ? "text-white placeholder:text-text-placeholder-inv"
                : "text-text-hi placeholder:text-text-placeholder",
              className,
            ].join(" ")}
            {...props}
          />
          {suffix && (
            <span
              aria-hidden="true"
              className={dark ? "text-text-inv-low" : "text-text-low"}
            >
              {suffix}
            </span>
          )}
        </div>
        {error ? (
          <span
            id={messageId}
            role="alert"
            className="text-[11.5px] text-danger font-text"
          >
            {error}
          </span>
        ) : help ? (
          <span
            id={messageId}
            className={`text-[11.5px] font-text ${
              dark ? "text-text-inv-low" : "text-text-low"
            }`}
          >
            {help}
          </span>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  help?: string;
  error?: string | null;
  optional?: boolean;
}

/** Same shell as Input, so the two never drift apart visually. */
export function Textarea({
  label,
  help,
  error,
  optional = false,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const fieldId = id ?? props.name ?? generatedId;
  const messageId = `${fieldId}-message`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={fieldId}
          className="font-text font-semibold text-[12.5px] text-text-hi flex items-baseline gap-2"
        >
          <span>{label}</span>
          {optional && (
            <span className="font-normal text-[11px] text-text-low">optional</span>
          )}
        </label>
      )}
      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || help ? messageId : undefined}
        className={[
          "rounded-md border-[1.5px] px-3.5 py-3 font-text text-[15px] text-text-hi",
          "bg-surface-0 outline-none transition-[border-color,box-shadow] duration-[var(--dur-quick)]",
          "placeholder:text-text-placeholder resize-y",
          error
            ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(224,36,94,0.18)]"
            : "border-border-field focus:border-crost-pink focus:shadow-[var(--ring-pink)]",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? (
        <span id={messageId} role="alert" className="text-[11.5px] text-danger font-text">
          {error}
        </span>
      ) : help ? (
        <span id={messageId} className="text-[11.5px] text-text-low font-text">
          {help}
        </span>
      ) : null}
    </div>
  );
}
