"use client";

import { Check } from "lucide-react";
import { useCountry } from "@/hooks/use-country";
import { COUNTRY_LIST } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Country/region. This is the only control in the app that changes education
 * terminology, and it changes it everywhere at once.
 */
export function CountryPicker({ compact }: { compact?: boolean }) {
  const { country, setCountry, chosenByUser, label } = useCountry();

  return (
    <div>
      <ul className={cn("space-y-2", compact && "space-y-1.5")}>
        {COUNTRY_LIST.map((option) => {
          const selected = option.code === country;

          return (
            <li key={option.code}>
              <button
                type="button"
                onClick={() => setCountry(option.code)}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border-2 px-4 text-left",
                  compact ? "min-h-12" : "min-h-14",
                  selected
                    ? "border-line-strong bg-primary-soft"
                    : "border-line bg-surface hover:border-line-strong",
                )}
              >
                <span aria-hidden className="text-xl">
                  {option.flag}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display font-bold">{option.name}</span>
                  {!compact && (
                    <span className="block text-xs text-ink-muted">
                      {/* Shows the teacher exactly what will change. */}
                      {option.names[8]?.label ?? ""} ·{" "}
                      {option.names[option.levels[0]]?.label ?? ""}
                    </span>
                  )}
                </span>
                {/* A tick, not just a colour, so the choice is never colour-only. */}
                {selected && <Check aria-hidden className="size-5 shrink-0 text-primary" strokeWidth={3} />}
              </button>
            </li>
          );
        })}
      </ul>

      {!compact && (
        <p className="mt-3 text-sm text-ink-muted text-pretty">
          {chosenByUser
            ? `Activities will say ${label(8)} rather than anything else.`
            : `Guessed from your device. Activities currently say ${label(8)}.`}
        </p>
      )}
    </div>
  );
}
