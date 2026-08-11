import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import type { ComponentProps } from "react";

export type Variant = "primary" | "secondary" | "ghost" | "gradient" | "inverse";
export type Size = "sm" | "nav" | "md" | "lg" | "xl";

/*
 * Sizes live here rather than being patched in via className at the call site:
 * two competing Tailwind utilities (h-9 and h-10) resolve by their order in the
 * generated stylesheet, not by their order in the class attribute, so an
 * override passed through className is a coin toss.
 */
const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  nav: "h-10 px-4 text-[13px]",
  md: "h-11 px-5 text-[15px]",
  lg: "h-[52px] px-7 text-[16px]",
  xl: "h-[56px] px-8 text-[17px]",
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-crost-pink text-crost-black hover:bg-pink-hover disabled:bg-pink-disabled disabled:text-pink-disabled-ink",
  secondary:
    "border-[1.5px] border-crost-black text-crost-black hover:bg-crost-black hover:text-white disabled:border-border-subtle disabled:text-text-disabled disabled:hover:bg-transparent disabled:hover:text-text-disabled",
  ghost:
    "text-crost-pink-700 hover:bg-surface-2 disabled:text-text-disabled h-9 rounded-[10px] px-3",
  // The one brand gradient, from the --grad-brand token. Text is explicitly
  // white because the unlayered `a { color: pink }` base rule used to win here.
  gradient:
    "text-white bg-grad-brand hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100",
  // For dark surfaces, where a black outline would be invisible.
  inverse:
    "border-[1.5px] border-white/30 text-white hover:bg-white hover:text-crost-black disabled:border-white/10 disabled:text-white/30 disabled:hover:bg-transparent disabled:hover:text-white/30",
};

const base = [
  "inline-flex items-center justify-center gap-2 rounded-md font-text font-semibold",
  "whitespace-nowrap transition-[color,background-color,border-color,filter,opacity]",
  "duration-[var(--dur-quick)] [transition-timing-function:var(--ease-out)]",
].join(" ");

function classesFor(variant: Variant, size: Size, className: string) {
  return [
    base,
    variant === "ghost" ? "" : sizeClasses[size],
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${classesFor(variant, size, className)} disabled:cursor-not-allowed`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

/**
 * The link counterpart to Button. Every CTA on the site routes through this or
 * Button, so a variant only has to be corrected in one place — previously the
 * gradient CTA was hand-written as an arbitrary Tailwind value at five
 * different call sites, which is how its colours drifted from the token.
 */
export interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  size?: Size;
  className?: string;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonLinkProps) {
  return <Link className={classesFor(variant, size, className)} {...props} />;
}
