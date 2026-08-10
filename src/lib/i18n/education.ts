/**
 * The canonical education scale.
 *
 * Activities store a level *range* on this scale and never a country's words
 * for it. "Year 8", "Grade 8" and "2nd Year" are three labels for one thing,
 * and that thing is level 8.
 *
 * The scale is anchored so that a level matches the same cohort of students
 * everywhere: level 8 is the year in which students turn about 14, in every
 * market. Level 0 is the first year of formal school (Prep, Reception,
 * Kindergarten, Grade R). Level -1 exists only for Ireland's Junior Infants,
 * which sits a year below that anchor.
 *
 * Not every country uses every level — Australia stops at 12, New Zealand has
 * no level 0 — so each country declares only the levels it actually has.
 */

export const MIN_LEVEL = -1;
export const MAX_LEVEL = 13;

export type EducationLevel = number;

/** Inclusive range of levels an activity suits, on the canonical scale. */
export type LevelRange = [from: EducationLevel, to: EducationLevel];

/* -------------------------------------------------------------------------- */
/* Age                                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Age is what activities are actually classified by, because a level number
 * does *not* mean the same age everywhere: a British Year 8 class is 12–13,
 * an Australian Year 8 class is 13–14. Classifying by age and converting per
 * country is the only way one library can serve seven markets honestly.
 */
export const MIN_AGE = 4;
export const MAX_AGE = 18;

/** The ages an activity suits. `max - min` is roughly how many school years it spans. */
export interface AgeRange {
  min: number;
  max: number;
}

/**
 * A level is suitable when students are that age for most of the school year,
 * so we compare against the mid-year age rather than the age they start on.
 */
const MID_YEAR = 0.5;

export interface LevelName {
  /** Full name, e.g. "Year 8", "Junior Infants". */
  label: string;
  /** Compact form for chips and dense metadata, e.g. "Y8", "JI". */
  short: string;
}

export const COUNTRY_CODES = ["AU", "GB", "US", "CA", "NZ", "IE", "ZA"] as const;
export type CountryCode = (typeof COUNTRY_CODES)[number];

export interface CountryTerminology {
  code: CountryCode;
  name: string;
  flag: string;
  /**
   * What this market calls the concept itself — "year level" in Australia,
   * "year group" in the UK, "grade" in the US. Used for headings and labels,
   * so even the category name isn't hard-coded to one market.
   */
  levelNoun: string;
  /**
   * The age students turn during their first year at canonical level 0 — or
   * what level 0 *would* be, for New Zealand, which starts at level 1.
   *
   * This is the whole reason the same year number differs by country:
   * England and New Zealand start school a year earlier than Australia and
   * the US relative to the shared level numbering.
   */
  startAge: number;
  /** Every level this country has, ascending. */
  levels: EducationLevel[];
  names: Record<EducationLevel, LevelName>;
}

/* -------------------------------------------------------------------------- */
/* Builders — these exist so each country below reads as a short declaration.  */
/* -------------------------------------------------------------------------- */

type Entry = [EducationLevel, LevelName];

function single(level: EducationLevel, label: string, short: string): Entry[] {
  return [[level, { label, short }]];
}

/** e.g. numbered(1, 12, "Year", "Y") → level 1 = "Year 1"/"Y1" … level 12. */
function numbered(
  from: EducationLevel,
  to: EducationLevel,
  word: string,
  shortPrefix: string,
): Entry[] {
  const entries: Entry[] = [];
  for (let level = from; level <= to; level++) {
    entries.push([level, { label: `${word} ${level}`, short: `${shortPrefix}${level}` }]);
  }
  return entries;
}

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th"];

/**
 * e.g. ordinal(1, 6, 0, "Class", "C") → level 1 = "1st Class"/"1C".
 * `offset` is subtracted from the level before picking the ordinal, which is
 * how Ireland's 1st Year lands on level 7.
 */
function ordinal(
  from: EducationLevel,
  to: EducationLevel,
  offset: number,
  word: string,
  shortSuffix: string,
): Entry[] {
  const entries: Entry[] = [];
  for (let level = from; level <= to; level++) {
    const position = level - offset;
    entries.push([
      level,
      { label: `${ORDINALS[position - 1]} ${word}`, short: `${position}${shortSuffix}` },
    ]);
  }
  return entries;
}

function country(
  code: CountryCode,
  name: string,
  flag: string,
  levelNoun: string,
  startAge: number,
  entries: Entry[][],
): CountryTerminology {
  const flat = entries.flat().sort((a, b) => a[0] - b[0]);
  return {
    code,
    name,
    flag,
    levelNoun,
    startAge,
    levels: flat.map(([level]) => level),
    names: Object.fromEntries(flat) as Record<EducationLevel, LevelName>,
  };
}

/* -------------------------------------------------------------------------- */
/* The seven markets. Adding an eighth means adding one entry here and nothing */
/* else — no component knows any of these words.                               */
/* -------------------------------------------------------------------------- */

export const COUNTRIES: Record<CountryCode, CountryTerminology> = {
  // Prep is 5–6, Year 12 is 17–18.
  AU: country("AU", "Australia", "🇦🇺", "year level", 5, [
    single(0, "Prep", "Prep"),
    numbered(1, 12, "Year", "Y"),
  ]),

  // Reception is 4–5, so every UK year group is a year younger than the
  // same-numbered Australian one. Year 13 is 17–18.
  GB: country("GB", "United Kingdom", "🇬🇧", "year group", 4, [
    single(0, "Reception", "Rec"),
    numbered(1, 13, "Year", "Y"),
  ]),

  US: country("US", "United States", "🇺🇸", "grade", 5, [
    single(0, "Kindergarten", "K"),
    numbered(1, 12, "Grade", "G"),
  ]),

  CA: country("CA", "Canada", "🇨🇦", "grade", 5, [
    single(0, "Kindergarten", "K"),
    numbered(1, 12, "Grade", "G"),
  ]),

  // New Zealand starts at Year 1 (age 5), so it shares the UK's offset:
  // NZ Year 8 is 12–13, the same age as UK Year 8 and a year below AU Year 8.
  NZ: country("NZ", "New Zealand", "🇳🇿", "year level", 4, [numbered(1, 13, "Year", "Y")]),

  // Ireland is the only market with a level below the shared anchor, and the
  // only one where primary and secondary restart their numbering.
  // Junior Infants is 4–5, 6th Year is 17–18.
  IE: country("IE", "Ireland", "🇮🇪", "year group", 5, [
    single(-1, "Junior Infants", "JI"),
    single(0, "Senior Infants", "SI"),
    ordinal(1, 6, 0, "Class", "C"),
    ordinal(7, 12, 6, "Year", "Yr"),
  ]),

  ZA: country("ZA", "South Africa", "🇿🇦", "grade", 5, [
    single(0, "Grade R", "GR"),
    numbered(1, 12, "Grade", "G"),
  ]),
};

export const COUNTRY_LIST: CountryTerminology[] = COUNTRY_CODES.map((code) => COUNTRIES[code]);

/** Australia first: it's the market the activity library was written for. */
export const DEFAULT_COUNTRY: CountryCode = "AU";

export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === "string" && (COUNTRY_CODES as readonly string[]).includes(value);
}

export function terminologyFor(code: CountryCode): CountryTerminology {
  return COUNTRIES[code] ?? COUNTRIES[DEFAULT_COUNTRY];
}

/* -------------------------------------------------------------------------- */
/* Display                                                                     */
/* -------------------------------------------------------------------------- */

/** The levels a country actually has, narrowed to a range. */
export function levelsIn(code: CountryCode, range?: LevelRange): EducationLevel[] {
  const levels = terminologyFor(code).levels;
  if (!range) return levels;

  const [from, to] = range;
  return levels.filter((level) => level >= from && level <= to);
}

export function levelName(code: CountryCode, level: EducationLevel): LevelName | undefined {
  return terminologyFor(code).names[level];
}

export function levelLabel(code: CountryCode, level: EducationLevel): string {
  return levelName(code, level)?.label ?? "";
}

export function levelShortLabel(code: CountryCode, level: EducationLevel): string {
  return levelName(code, level)?.short ?? "";
}

/**
 * Renders a range in the country's own words, clamped to the levels it has.
 * An activity spanning everything reads as "Any year level" rather than
 * "Prep–Year 12", because that's what a teacher actually wants to know.
 */
export function levelRangeLabel(code: CountryCode, range: LevelRange): string {
  const anyLevel = `Any ${terminologyFor(code).levelNoun}`;

  const available = levelsIn(code, range);
  if (available.length === 0) return anyLevel;

  const all = terminologyFor(code).levels;
  if (available.length === all.length) return anyLevel;

  const first = levelLabel(code, available[0]);
  const last = levelLabel(code, available[available.length - 1]);
  return first === last ? first : `${first}–${last}`;
}

/** Whether an activity's range covers a given level. */
export function rangeIncludes(range: LevelRange, level: EducationLevel): boolean {
  return level >= range[0] && level <= range[1];
}

/* -------------------------------------------------------------------------- */
/* Age ↔ level                                                                 */
/* -------------------------------------------------------------------------- */

/** The age students turn at the start of this school year. */
export function startAgeForLevel(code: CountryCode, level: EducationLevel): number {
  return terminologyFor(code).startAge + level;
}

/**
 * The age to judge an activity against — mid-year, since that's how old the
 * class is for most of the time you'd be running it.
 */
export function studentAgeForLevel(code: CountryCode, level: EducationLevel): number {
  return startAgeForLevel(code, level) + MID_YEAR;
}

export function ageRangeIncludes(range: AgeRange, age: number): boolean {
  return age >= range.min && age <= range.max;
}

/** Whether a class at this level is the right age for this activity. */
export function suitsLevel(range: AgeRange, code: CountryCode, level: EducationLevel): boolean {
  return ageRangeIncludes(range, studentAgeForLevel(code, level));
}

/** The country's levels that an age range covers — the inverse of the above. */
export function levelsForAges(code: CountryCode, range: AgeRange): EducationLevel[] {
  return terminologyFor(code).levels.filter((level) => suitsLevel(range, code, level));
}

/**
 * An age range in the teacher's own words: "Year 7–Year 9" in Australia,
 * "Grade 7–Grade 9" in the US, "Year 8–Year 10" in New Zealand — all from the
 * same underlying ages 12–15.
 */
export function ageRangeLabel(code: CountryCode, range: AgeRange): string {
  const levels = levelsForAges(code, range);
  if (levels.length === 0) return `Ages ${range.min}–${range.max}`;

  return levelRangeLabel(code, [levels[0], levels[levels.length - 1]]);
}

/* -------------------------------------------------------------------------- */
/* Locale detection                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Best guess from the browser's locale. Only ever a starting point — the
 * teacher can always change it in Settings, and their choice wins.
 */
export function countryFromLocale(locale: string | undefined): CountryCode | null {
  if (!locale) return null;

  // "en-AU" → "AU". Intl.Locale handles the odd shapes ("en-Latn-ZA").
  let region: string | undefined;
  try {
    region = new Intl.Locale(locale).region ?? undefined;
  } catch {
    region = locale.split("-")[1];
  }

  const code = region?.toUpperCase();
  return isCountryCode(code) ? code : null;
}

export function detectCountry(locales: readonly string[] = []): CountryCode {
  for (const locale of locales) {
    const code = countryFromLocale(locale);
    if (code) return code;
  }
  return DEFAULT_COUNTRY;
}
