"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { useCountry } from "@/hooks/use-country";
import { useActiveLevel } from "@/hooks/use-teaching";
import { cn } from "@/lib/utils";

/**
 * "Year 8 ▾" — the class the next activity will be pitched at.
 *
 * Deliberately small: teachers shouldn't have to think about this before every
 * activity, only when they walk into a different room.
 */
export function LevelSwitcher() {
  const { label } = useCountry();
  const { activeLevel, setActiveLevel, teachingLevels } = useActiveLevel();
  const [open, setOpen] = useState(false);

  if (activeLevel === null) return null;

  // Nothing to switch between.
  if (teachingLevels.length < 2) {
    return (
      <p className="text-sm font-bold text-ink-muted">
        Teaching <span className="text-ink">{label(activeLevel)}</span>
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="-mx-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-bold text-ink-muted hover:text-ink"
      >
        Teaching <span className="text-ink">{label(activeLevel)}</span>
        <ChevronDown aria-hidden className="size-4" strokeWidth={3} />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Which class?">
        <ul className="space-y-2">
          {teachingLevels.map((level) => {
            const selected = level === activeLevel;

            return (
              <li key={level}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveLevel(level);
                    setOpen(false);
                  }}
                  aria-pressed={selected}
                  className={cn(
                    "flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 text-left font-display font-bold",
                    selected
                      ? "border-line-strong bg-primary-soft"
                      : "border-line bg-surface hover:border-line-strong",
                  )}
                >
                  <span className="flex-1">{label(level)}</span>
                  {selected && <Check aria-hidden className="size-5 text-primary" strokeWidth={3} />}
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-sm text-ink-muted text-pretty">
          Activities are picked to suit this class. Back to your usual one next time you open the
          app.
        </p>
      </Sheet>
    </>
  );
}
