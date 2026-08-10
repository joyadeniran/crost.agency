import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gradient";
type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[15px]",
  lg: "h-[52px] px-7 text-[16px]",
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-crost-pink text-crost-black hover:bg-[#D920AF] disabled:bg-[#FFD6F4] disabled:text-[#B58FA9]",
  secondary:
    "border-[1.5px] border-crost-black text-crost-black hover:bg-crost-black hover:text-white disabled:border-[#E4E7EC] disabled:text-[#B0B5BD]",
  ghost:
    "text-crost-pink-700 hover:bg-[#FFE6F7] disabled:text-[#B0B5BD] h-9 rounded-[10px]",
  gradient:
    "text-white bg-[linear-gradient(115deg,#FF40D8,#A64CFF)] hover:brightness-110",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-md font-text font-semibold whitespace-nowrap transition-colors",
          `duration-[var(--dur-quick)] [transition-timing-function:var(--ease-out)]`,
          variant === "ghost" ? "" : sizeClasses[size],
          variantClasses[variant],
          "disabled:cursor-not-allowed",
          className,
        ].join(" ")}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
