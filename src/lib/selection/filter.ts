import { ageRangeIncludes, studentAgeForLevel, type CountryCode } from "@/lib/i18n";
import type { Activity, DurationBucket, FilterState, Subject } from "@/lib/types";
import { DURATION_BUCKETS } from "@/lib/types";

/** Hard filtering. Nothing here is a preference — if a filter is set, it's absolute. */

export function durationBucketOf(seconds: number): DurationBucket | null {
  for (const [key, bucket] of Object.entries(DURATION_BUCKETS)) {
    if (seconds >= bucket.min && seconds <= bucket.max) return key as DurationBucket;
  }
  return null;
}

/** An empty selection means "no opinion", not "match nothing". */
function allows<T>(selected: T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
}

function allowsAny<T>(selected: T[], values: T[]): boolean {
  return selected.length === 0 || values.some((value) => selected.includes(value));
}

/** Activities with no subject (subject-agnostic frames) only match an empty filter. */
function allowsSubject(selected: Subject[], values: Subject[] | undefined): boolean {
  if (selected.length === 0) return true;
  return (values ?? []).some((value) => selected.includes(value));
}

/**
 * Whether an activity suits a class at this level. Needs the country, because
 * the level only tells you how old the students are once you know where they
 * are: Year 8 is 12–13 in Britain and 13–14 in Australia.
 */
export function suitsTeachingLevel(
  activity: Activity,
  country: CountryCode,
  level: number,
): boolean {
  return ageRangeIncludes(activity.ageRange, studentAgeForLevel(country, level));
}

export function matchesFilters(
  activity: Activity,
  filters: FilterState,
  country: CountryCode,
): boolean {
  const bucket = durationBucketOf(activity.duration);

  return (
    (filters.durations.length === 0 || (bucket !== null && filters.durations.includes(bucket))) &&
    allows(filters.energy, activity.energy) &&
    allows(filters.noise, activity.noise) &&
    allows(filters.formats, activity.format) &&
    allows(filters.movement, activity.movement) &&
    allowsAny(filters.equipment, activity.equipment) &&
    // Matches if the activity suits any of the levels the teacher picked.
    (filters.levels.length === 0 ||
      filters.levels.some((level) => suitsTeachingLevel(activity, country, level))) &&
    allowsAny(filters.categories, activity.categories) &&
    allowsSubject(filters.subjects, activity.subjects)
  );
}

export function applyFilters(
  activities: Activity[],
  filters: FilterState,
  country: CountryCode,
): Activity[] {
  return activities.filter((activity) => matchesFilters(activity, filters, country));
}

export function countActiveFilters(filters: FilterState): number {
  return Object.values(filters).reduce((total, group) => total + group.length, 0);
}
