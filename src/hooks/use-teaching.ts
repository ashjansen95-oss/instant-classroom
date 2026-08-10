"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  isCountryCode,
  levelsIn,
  type CountryCode,
  type EducationLevel,
} from "@/lib/i18n";
import { KEYS } from "@/lib/storage";
import { sessionStore } from "@/lib/storage/store";
import { useCountry } from "./use-country";
import { useStoredState } from "./use-stored-state";

/**
 * What the teacher told us on first launch.
 *
 * Stored as canonical level *numbers* rather than the display strings in the
 * spec, so the same saved profile keeps working if they change country —
 * a teacher moving from Sydney to London keeps the same classes, and the app
 * just calls them something different.
 *
 * Persisted through the storage adapter, so an authenticated backend can take
 * over later without any component changing. See FUTURE.md.
 */
export interface TeachingPreferences {
  country: CountryCode;
  teachingLevels: EducationLevel[];
  defaultTeachingLevel: EducationLevel | null;
}

interface StoredTeaching {
  teachingLevels?: EducationLevel[];
  defaultTeachingLevel?: EducationLevel | null;
}

const EMPTY: StoredTeaching = {};

export function useTeaching() {
  const { country, setCountry } = useCountry();
  const [stored, setStored] = useStoredState<StoredTeaching>(KEYS.teaching, EMPTY);

  // Drop anything the current country doesn't have — a teacher switching from
  // the UK to Australia can't keep Year 13.
  const available = levelsIn(country);
  const teachingLevels = (stored.teachingLevels ?? [])
    .filter((level) => available.includes(level))
    .sort((a, b) => a - b);

  const storedDefault = stored.defaultTeachingLevel;
  const defaultTeachingLevel =
    storedDefault !== null && storedDefault !== undefined && teachingLevels.includes(storedDefault)
      ? storedDefault
      : (teachingLevels[0] ?? null);

  const setTeachingLevels = useCallback(
    (levels: EducationLevel[]) => {
      const sorted = [...new Set(levels)].sort((a, b) => a - b);
      setStored((current) => ({
        ...current,
        teachingLevels: sorted,
        // Keep the default valid rather than silently pointing at nothing.
        defaultTeachingLevel:
          current.defaultTeachingLevel != null && sorted.includes(current.defaultTeachingLevel)
            ? current.defaultTeachingLevel
            : (sorted[0] ?? null),
      }));
    },
    [setStored],
  );

  const toggleTeachingLevel = useCallback(
    (level: EducationLevel) => {
      const next = teachingLevels.includes(level)
        ? teachingLevels.filter((item) => item !== level)
        : [...teachingLevels, level];
      setTeachingLevels(next);
    },
    [setTeachingLevels, teachingLevels],
  );

  const setDefaultTeachingLevel = useCallback(
    (level: EducationLevel) => setStored((current) => ({ ...current, defaultTeachingLevel: level })),
    [setStored],
  );

  const preferences: TeachingPreferences = { country, teachingLevels, defaultTeachingLevel };

  return {
    ...preferences,
    preferences,
    setCountry,
    setTeachingLevels,
    toggleTeachingLevel,
    setDefaultTeachingLevel,
    /** Whether first-launch setup has been completed. */
    isConfigured: isCountryCode(country) && teachingLevels.length > 0,
  };
}

/**
 * The class they're teaching *right now*. Session-scoped: it survives moving
 * between screens but resets to their default next time they open the app, so
 * nobody has to re-pick a level before every activity.
 */
export function useActiveLevel() {
  const { teachingLevels, defaultTeachingLevel } = useTeaching();

  const session = useSyncExternalStore(
    sessionStore.subscribe,
    () => sessionStore.readKey<EducationLevel | null>(KEYS.activeLevel, null),
    () => null,
  );

  const activeLevel =
    session !== null && teachingLevels.includes(session) ? session : defaultTeachingLevel;

  const setActiveLevel = useCallback(
    (level: EducationLevel) => sessionStore.writeKey(KEYS.activeLevel, level),
    [],
  );

  return { activeLevel, setActiveLevel, teachingLevels };
}
