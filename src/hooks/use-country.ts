"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_COUNTRY,
  detectCountry,
  isCountryCode,
  levelLabel,
  levelRangeLabel,
  levelShortLabel,
  levelsIn,
  terminologyFor,
  type CountryCode,
  type EducationLevel,
  type LevelRange,
} from "@/lib/i18n";
import { KEYS } from "@/lib/storage";
import { useStoredState } from "./use-stored-state";

const noopSubscribe = () => () => {};

/**
 * The browser's guess. Read through useSyncExternalStore because `navigator`
 * doesn't exist on the server, and a plain effect would cause a cascading
 * render. Only ever a starting point — a stored choice always wins.
 */
function useDetectedCountry(): CountryCode {
  return useSyncExternalStore(
    noopSubscribe,
    () => detectCountry(navigator.languages ?? [navigator.language]),
    () => DEFAULT_COUNTRY,
  );
}

/**
 * The single place the rest of the app asks "what do we call this here?".
 *
 * Components never spell out an education level; they hand a canonical level or
 * range to one of the helpers below. That's what makes adding an eighth market
 * a one-file change.
 */
export function useCountry() {
  const [stored, setStored] = useStoredState<string | null>(KEYS.country, null);
  const detected = useDetectedCountry();

  const country: CountryCode = isCountryCode(stored) ? stored : detected;

  const setCountry = useCallback(
    (code: CountryCode) => setStored(code),
    [setStored],
  );

  return {
    country,
    setCountry,
    /** False while we're still going on the browser's locale alone. */
    chosenByUser: isCountryCode(stored),
    terminology: terminologyFor(country),

    /** e.g. level 8 → "Year 8" in AU, "Grade 8" in the US, "2nd Year" in Ireland. */
    label: useCallback((level: EducationLevel) => levelLabel(country, level), [country]),
    shortLabel: useCallback((level: EducationLevel) => levelShortLabel(country, level), [country]),
    rangeLabel: useCallback((range: LevelRange) => levelRangeLabel(country, range), [country]),
    /** The levels this country actually has, for building selectors. */
    levels: useCallback((range?: LevelRange) => levelsIn(country, range), [country]),
  };
}
