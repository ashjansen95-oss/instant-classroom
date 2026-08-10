"use client";

import { NEED_OPTIONS } from "@/lib/labels";
import type { Need } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NeedGrid({
  value,
  onChange,
}: {
  value: Need;
  onChange: (need: Need) => void;
}) {
  return (
    <div role="radiogroup" aria-label="What do you need?" className="grid grid-cols-2 gap-3">
      {NEED_OPTIONS.map(({ need, emoji, label, hue }) => {
        const selected = value === need;

        return (
          <button
            key={need}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            onClick={() => onChange(need)}
            style={{ "--tile": hue } as React.CSSProperties}
            className={cn(
              "tile-surface flex min-h-[5.25rem] flex-col items-start justify-center gap-1 rounded-2xl px-4 py-3",
              "border-2 text-left transition-transform duration-100 active:scale-[0.97]",
              selected
                ? "border-line-strong shadow-[var(--shadow-rest)] -translate-y-0.5"
                : "border-line",
            )}
          >
            <span aria-hidden className="text-2xl leading-none">
              {emoji}
            </span>
            <span
              className="font-display text-[0.9375rem] leading-tight font-bold text-balance"
              style={{ color: "var(--tile)" }}
            >
              {label}
            </span>
            {/* Selection is announced by aria-checked, and shown by the border
                and lift as well as the colour. */}
          </button>
        );
      })}
    </div>
  );
}
