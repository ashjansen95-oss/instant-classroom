"use client";

import { useState } from "react";
import { INTENT_OPTIONS } from "@/lib/labels";
import type { Need } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The home screen's primary interaction: "what do you need?" answered by a
 * tap. These are actions, not filter chips — tapping "Wake them up" *is* the
 * request, so there's no separate selected state to hold and no second step
 * to explain. `busy` disables the grid while a pick is already in flight
 * (the reel is on screen), the same guard the shake pad uses.
 */
export function IntentGrid({
  onSelect,
  busy,
}: {
  onSelect: (need: Exclude<Need, "surprise">) => void;
  busy: boolean;
}) {
  // Purely visual — a brief press-state on the exact tile tapped, so a slow
  // network or a slow phone never leaves a teacher wondering if it registered.
  // Cleared on unmount by the reel taking over; never left stuck on a revisit
  // because it's local state, not persisted.
  const [pressed, setPressed] = useState<Need | null>(null);

  return (
    <div aria-label="What do you need?" className="grid grid-cols-2 gap-3">
      {INTENT_OPTIONS.map(({ need, emoji, label, hue }) => (
        <button
          key={need}
          type="button"
          disabled={busy}
          onClick={() => {
            setPressed(need);
            onSelect(need);
          }}
          style={{ "--tile": hue } as React.CSSProperties}
          className={cn(
            "tile-surface flex min-h-[5.25rem] flex-col items-start justify-center gap-1 rounded-2xl px-4 py-3",
            "border-2 border-line text-left transition-transform duration-100",
            "active:scale-[0.97] active:border-line-strong active:shadow-[var(--shadow-rest)] active:-translate-y-0.5",
            "disabled:opacity-60",
            pressed === need && busy && "scale-[0.97] border-line-strong shadow-[var(--shadow-rest)] -translate-y-0.5",
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
        </button>
      ))}
    </div>
  );
}
