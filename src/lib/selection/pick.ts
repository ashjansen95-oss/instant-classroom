import { ACTIVITIES } from "@/data/activities";
import type { Activity, FilterState, HistoryEntry, Need } from "@/lib/types";
import { EMPTY_FILTERS } from "@/lib/types";
import { applyFilters } from "./filter";
import { scoreForNeed, varietyPenalty } from "./score";

/**
 * The four-stage pick: hard filter → score → penalise → weighted random within
 * the top band. Pure, synchronous, and `rng` is injectable so the behaviour is
 * actually testable rather than hoped for.
 */

/** How many recently-seen activities we try to exclude outright. */
const RECENT_EXCLUSION = 12;
/** Never shrink the candidate pool below this by excluding recents. */
const MIN_POOL = 4;
/** Candidates within this fraction of the best score are all fair game. */
export const BAND = 0.85;

export interface PickOptions {
  need: Need;
  filters?: FilterState;
  history?: HistoryEntry[];
  activities?: Activity[];
  rng?: () => number;
}

export interface ScoredActivity {
  activity: Activity;
  score: number;
}

export function scoreCandidates({
  need,
  filters = EMPTY_FILTERS,
  history = [],
  activities = ACTIVITIES,
}: PickOptions): ScoredActivity[] {
  const filtered = applyFilters(activities, filters);
  if (filtered.length === 0) return [];

  // Drop what they've just seen — but only while enough choice remains. A very
  // tight filter set should still return something rather than nothing.
  const recentIds = history.slice(0, RECENT_EXCLUSION).map((entry) => entry.id);
  let pool = filtered;
  for (let excluded = recentIds.length; excluded > 0; excluded--) {
    const candidate = filtered.filter((a) => !recentIds.slice(0, excluded).includes(a.id));
    if (candidate.length >= Math.min(MIN_POOL, filtered.length)) {
      pool = candidate;
      break;
    }
  }

  return pool
    .map((activity) => ({
      activity,
      // Floored just above zero so a heavily penalised activity is still
      // reachable rather than mathematically impossible.
      score: Math.max(0.01, scoreForNeed(activity, need) - varietyPenalty(activity, history)),
    }))
    .sort((a, b) => b.score - a.score);
}

/** The set a pick will be drawn from. Exposed so those routes can be prefetched. */
export function candidateBand(options: PickOptions): Activity[] {
  const scored = scoreCandidates(options);
  if (scored.length === 0) return [];

  const best = scored[0].score;
  return scored.filter((entry) => entry.score >= best * BAND).map((entry) => entry.activity);
}

/** Weighted pick across the top-scoring band. Returns null when nothing matches the filters. */
export function pickActivity(options: PickOptions): Activity | null {
  const rng = options.rng ?? Math.random;
  const scored = scoreCandidates(options);
  if (scored.length === 0) return null;

  const best = scored[0].score;
  const band = scored.filter((entry) => entry.score >= best * BAND);

  const totalWeight = band.reduce((sum, entry) => sum + entry.score, 0);
  let threshold = rng() * totalWeight;

  for (const entry of band) {
    threshold -= entry.score;
    if (threshold <= 0) return entry.activity;
  }

  return band[band.length - 1].activity;
}

/** Activities similar to this one, for the "more like this" strip. */
export function similarActivities(
  activity: Activity,
  limit = 3,
  activities: Activity[] = ACTIVITIES,
): Activity[] {
  return activities
    .filter((other) => other.id !== activity.id)
    .map((other) => {
      const sharedCategories = other.categories.filter((c) =>
        activity.categories.includes(c),
      ).length;
      const sharedTags = other.tags.filter((t) => activity.tags.includes(t)).length;
      const sameEnergy = other.energy === activity.energy ? 1 : 0;
      const similarLength = Math.abs(other.duration - activity.duration) <= 60 ? 1 : 0;

      return {
        other,
        score: sharedCategories * 2 + sharedTags + sameEnergy + similarLength,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.other);
}
