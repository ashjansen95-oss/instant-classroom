"use client";

import { ChevronDown } from "lucide-react";
import { useCountry } from "@/hooks/use-country";
import { COUNTRY_LIST, type CountryCode } from "@/lib/i18n";

/**
 * Country/region as a dropdown. Shows the currently selected country with its
 * flag; tapping opens a native select. This is the only control in the app that
 * changes education terminology, and it changes it everywhere at once.
 */
export function CountryPicker({ compact }: { compact?: boolean }) {
  const { country, setCountry, chosenByUser, label } = useCountry();

  return (
    <div>
      <div className="relative">
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value as CountryCode)}
          aria-label="Country"
          className="w-full cursor-pointer appearance-none rounded-2xl border-2 border-line-strong bg-surface py-3.5 pr-10 pl-4 font-display font-bold text-ink transition-colors hover:border-primary focus:border-primary focus:outline-none"
        >
          {COUNTRY_LIST.map((option) => (
            <option key={option.code} value={option.code}>
              {option.flag} {option.name}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink-muted"
        />
      </div>

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
