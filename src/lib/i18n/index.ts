/**
 * Localisation.
 *
 * Two separate axes, deliberately not tangled together:
 *
 *   1. **Country** — which words a market uses for education levels. This is
 *      what `education.ts` handles, and it is the only axis the MVP varies.
 *   2. **Language** — the words the interface itself is written in. English in
 *      all seven markets for now.
 *
 * They are separate because they change independently: a school in Ireland and
 * a school in Australia both read English but call the same cohort different
 * things, and a future Welsh or Māori translation would need new interface
 * strings without touching a single level name.
 *
 * Adding a language later means adding a message catalogue alongside this file
 * and a `useLanguage()` binding. It does not mean rewriting any of the country
 * terminology below, and no UI component needs to change for either axis —
 * components ask for a label, they never spell one out.
 */

export {
  COUNTRIES,
  COUNTRY_CODES,
  COUNTRY_LIST,
  DEFAULT_COUNTRY,
  MAX_LEVEL,
  MIN_LEVEL,
  countryFromLocale,
  detectCountry,
  isCountryCode,
  levelLabel,
  levelName,
  levelRangeLabel,
  levelShortLabel,
  levelsIn,
  rangeIncludes,
  terminologyFor,
  type CountryCode,
  type CountryTerminology,
  type EducationLevel,
  type LevelName,
  type LevelRange,
} from "./education";

/** The interface language. One entry today; the seam exists for more. */
export const LANGUAGES = ["en"] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";
