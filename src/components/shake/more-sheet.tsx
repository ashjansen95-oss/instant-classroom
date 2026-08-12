"use client";

import { Sheet } from "@/components/ui/sheet";
import { MORE_OPTIONS } from "@/lib/labels";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Secondary to the intent tiles, on purpose — a small, well-backed set of
 * categories for when a teacher wants something more specific than the six
 * main needs cover. Picking one behaves exactly like an intent tile: tap,
 * reel, activity. No "apply filter, then press Generate" here either.
 */
export function MoreSheet({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (category: Category) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="More specific?">
      <div className="grid grid-cols-2 gap-3">
        {MORE_OPTIONS.map(({ category, emoji, label }) => (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={cn(
              "flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-line bg-surface",
              "transition-transform duration-100 active:scale-[0.97] active:border-line-strong active:-translate-y-0.5",
            )}
          >
            <span aria-hidden className="text-2xl leading-none">
              {emoji}
            </span>
            <span className="font-display text-[0.9375rem] font-bold">{label}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}
