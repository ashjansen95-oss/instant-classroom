import { ACTIVITIES } from "@/data/activities";
import { DEFAULT_COUNTRY, studentAgeForLevel, type CountryCode } from "@/lib/i18n";
import type { Activity, EducationLevel, FilterState, HistoryEntry, Need } from "@/lib/types";
import { EMPTY_FILTERS } from "@/lib/types";
import { applyFilters } from "./filter";
import { ageFit, scoreForNeed, similarityTo, varietyPenalty } from "./score";

/**
 * The pipeline: age suitability → hard filters → need scoring → variety
 * penalties → weighted random within the top band. Pure, synchronous, and
 * `rng` is injectable so the behaviour is actually testable.
 *
 * Age comes first and is a hard constraint, not a ranking nudge. A Prep
 * teacher pressing Surprise Me should never be handed a written debate, and a
 * Year 11 teacher should never be handed "move like a kangaroo" — no matter
 * how well those score on everything else.
 */

/** How many recently-seen activities we try to exclude outright. */
const RECENT_EXCLUSION = 12;
/** Never shrink the candidate pool below this by excluding recents. */
const MIN_POOL = 4;
/** Candidates within this fraction of the best score are all fair game. */
export const BAND = 0.85;
/**
 * How much a poor age fit can cut a score, as a multiplier floor.
 *
 * Applied multiplicatively rather than as a blended average: age suitability is
 * already guaranteed by the hard filter above, so this only needs to break ties
 * towards activities squarely aimed at the class. Averaging it in instead would
 * flatten the differences between activities and let, say, a moderate-noise
 * activity into a "calm the room down" result.
 */
const AGE_FIT_FLOOR = 0.7;

export interface PickOptions {
  need: Need;
  filters?: FilterState;
  history?: HistoryEntry[];
  activities?: Activity[];
  /** The teacher's market, needed to turn a level into an age. */
  country?: CountryCode;
  /** The level they're teaching right now. Undefined means "no preference yet". */
  level?: EducationLevel | null;
  /**
   * Set by "give me another like this". When present, resemblance to this
   * activity replaces the need profile as the main relevance signal — the
   * teacher has told us the shape was right.
   */
  like?: Activity | null;
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
  country = DEFAULT_COUNTRY,
  level = null,
  like = null,
}: PickOptions): ScoredActivity[] {
  const studentAge = level === null ? null : studentAgeForLevel(country, level);

  // 1. Age suitability, as a hard constraint.
  const ageAppropriate =
    studentAge === null
      ? activities
      : activities.filter(
          (activity) =>
            studentAge >= activity.ageRange.min && studentAge <= activity.ageRange.max,
        );

  // 2. The teacher's explicit filters, also hard.
  const filtered = applyFilters(ageAppropriate, filters, country);
  if (filtered.length === 0) return [];

  // 3. Drop what they've just seen — but only while enough choice remains.
  const recentIds = history.slice(0, RECENT_EXCLUSION).map((entry) => entry.id);
  let pool = filtered;
  for (let excluded = recentIds.length; excluded > 0; excluded--) {
    const candidate = filtered.filter((a) => !recentIds.slice(0, excluded).includes(a.id));
    if (candidate.length >= Math.min(MIN_POOL, filtered.length)) {
      pool = candidate;
      break;
    }
  }

  // 4. Score: how squarely it fits the age, then how well it meets the need,
  //    then penalise anything too similar to what they just saw.
  return pool
    .filter((activity) => activity.id !== like?.id)
    .map((activity) => {
      // "Like this" is a stronger steer than the need they picked minutes ago,
      // so when it's set it takes over as the relevance signal.
      const relevance = like
        ? 0.75 * similarityTo(activity, like) + 0.25 * scoreForNeed(activity, need)
        : scoreForNeed(activity, need);
      const fit = studentAge === null ? 1 : ageFit(activity.ageRange, studentAge);
      const aged = relevance * (AGE_FIT_FLOOR + (1 - AGE_FIT_FLOOR) * fit);

      return {
        activity,
        // Floored just above zero so a heavily penalised activity is still
        // reachable rather than mathematically impossible.
        score: Math.max(0.01, aged - varietyPenalty(activity, history)),
      };
    })
    .sort((a, b) => b.score - a.score);
}

/** The set a pick will be drawn from. Exposed so those routes can be prefetched. */
export function candidateBand(options: PickOptions): Activity[] {
  const scored = scoreCandidates(options);
  if (scored.length === 0) return [];

  const best = scored[0].score;
  return scored.filter((entry) => entry.score >= best * BAND).map((entry) => entry.activity);
}

/** Weighted pick across the top-scoring band. Returns null when nothing matches. */
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

      // Overlapping age bands matter as much as category — "more like this"
      // must not suggest a senior debate off the back of a Prep brain break.
      const overlap =
        Math.min(other.ageRange.max, activity.ageRange.max) -
        Math.max(other.ageRange.min, activity.ageRange.min);
      const ageOverlap = Math.max(0, overlap) / 4;

      return {
        other,
        score: sharedCategories * 2 + sharedTags + sameEnergy + similarLength + ageOverlap,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.other);
}
