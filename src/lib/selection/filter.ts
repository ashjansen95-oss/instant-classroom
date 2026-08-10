import { rangeIncludes } from "@/lib/i18n";
import type { Activity, DurationBucket, FilterState } from "@/lib/types";
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

export function matchesFilters(activity: Activity, filters: FilterState): boolean {
  const bucket = durationBucketOf(activity.duration);

  return (
    (filters.durations.length === 0 || (bucket !== null && filters.durations.includes(bucket))) &&
    allows(filters.energy, activity.energy) &&
    allows(filters.noise, activity.noise) &&
    allows(filters.formats, activity.format) &&
    allows(filters.movement, activity.movement) &&
    allowsAny(filters.equipment, activity.equipment) &&
    // An activity matches if its range covers any level the teacher picked.
    (filters.levels.length === 0 ||
      filters.levels.some((level) => rangeIncludes(activity.levels, level))) &&
    allowsAny(filters.categories, activity.categories)
  );
}

export function applyFilters(activities: Activity[], filters: FilterState): Activity[] {
  return activities.filter((activity) => matchesFilters(activity, filters));
}

export function countActiveFilters(filters: FilterState): number {
  return Object.values(filters).reduce((total, group) => total + group.length, 0);
}
