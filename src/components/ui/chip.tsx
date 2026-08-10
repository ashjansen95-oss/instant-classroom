"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Toggleable filter chip. `aria-pressed` plus a tick glyph carry the selected
 * state, so it never depends on colour alone.
 */
export function Chip({
  selected,
  className,
  children,
  ...props
}: ComponentProps<"button"> & { selected?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 px-4 text-[0.9375rem] font-semibold",
        "transition-colors duration-100 active:scale-[0.97]",
        selected
          ? "border-line-strong bg-primary text-primary-ink"
          : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
        className,
      )}
      {...props}
    >
      {selected && (
        <span aria-hidden className="text-xs leading-none">
          ✓
        </span>
      )}
      {children}
    </button>
  );
}

export function Badge({
  className,
  children,
  ...props
}: ComponentProps<"span"> & { children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-surface-sunk px-2.5 py-1 text-xs font-semibold text-ink-muted",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
