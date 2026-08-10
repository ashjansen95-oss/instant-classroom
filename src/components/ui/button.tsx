import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "xl";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-ink border-line-strong hover:bg-primary-hover",
  secondary:
    "bg-surface text-ink border-line-strong hover:bg-surface-sunk",
  ghost:
    "bg-transparent text-ink-muted border-transparent shadow-none hover:bg-surface-sunk hover:text-ink translate-y-0",
  danger:
    "bg-surface text-negative border-line-strong hover:bg-surface-sunk",
};

const SIZES: Record<Size, string> = {
  sm: "min-h-9 px-3 text-sm gap-1.5 rounded-xl",
  md: "min-h-12 px-4 text-base gap-2 rounded-xl",
  lg: "min-h-14 px-5 text-lg gap-2.5 rounded-2xl",
  xl: "min-h-16 px-6 text-xl gap-3 rounded-2xl",
};

/**
 * Chunky, tactile, and never smaller than a thumb. `xl` exists because the
 * primary actions get pressed while standing in front of a class.
 */
const base = cn(
  "inline-flex items-center justify-center text-center",
  "font-display font-bold tracking-tight",
  "border-2 select-none",
  "transition-[transform,background-color,box-shadow] duration-100",
  "disabled:opacity-50 disabled:pointer-events-none",
  // The "press" effect: a hard offset shadow that collapses on active.
  "shadow-[var(--shadow-rest)] -translate-y-0.5",
  "active:shadow-[var(--shadow-press)] active:translate-y-0",
);

type ButtonOwnProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & ButtonOwnProps) {
  return (
    <button
      type={type}
      className={cn(base, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  ...props
}: ComponentProps<typeof Link> & ButtonOwnProps) {
  return (
    <Link
      className={cn(base, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...props}
    />
  );
}
