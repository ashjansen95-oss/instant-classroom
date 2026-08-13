import type { AgeRange, Activity, Category, Energy, HistoryEntry, Movement, Need, Noise } from "@/lib/types";
import { ENERGY_LEVELS } from "@/lib/types";
import { durationBucketOf } from "./filter";

/**
 * Relevance scoring. This is what makes "calm" actually return calm instead of
 * a lucky dip, so the profiles below are the product, not configuration.
 */

interface NeedProfile {
  energy: Energy[];
  categories: Category[];
  noise?: Noise[];
  movement?: Movement[];
  /** Preferred window in seconds. */
  duration?: [number, number];
}

const NEED_PROFILES: Record<Exclude<Need, "surprise">, NeedProfile> = {
  // A reset: bring the temperature down a bit and give their brain something else.
  reset: {
    energy: ["low", "medium"],
    categories: ["brain-break"],
    duration: [45, 180],
  },
  // They've gone flat. Loud, physical, short.
  wake: {
    energy: ["high"],
    categories: ["wake-them-up", "get-moving"],
    noise: ["moderate", "loud"],
    movement: ["standing", "movement"],
    duration: [30, 180],
  },
  // Too much energy in the room. Quiet, seated, low demand.
  calm: {
    energy: ["calm", "low"],
    categories: ["calm-down"],
    noise: ["quiet"],
    movement: ["seated"],
    duration: [45, 180],
  },
  // Get them out of their seats and moving.
  move: {
    energy: ["medium", "high"],
    categories: ["get-moving", "wake-them-up"],
    movement: ["standing", "movement"],
    duration: [30, 180],
  },
  // Still learning, but make it enjoyable — the game/performance/art side,
  // not the puzzle side. Overlapped with "think" before this need existed,
  // which meant the two intent tiles could return the same activity.
  fun: {
    energy: ["medium", "high"],
    categories: ["creative", "competitive"],
    duration: [60, 330],
  },
  // A puzzle, a debate, a "why" — cognitive rather than physical or social.
  think: {
    energy: ["low", "medium"],
    categories: ["think-fast", "curriculum", "pair-activities"],
    duration: [90, 330],
  },
};

const WEIGHTS = {
  energy: 0.3,
  categories: 0.3,
  noise: 0.12,
  movement: 0.12,
  duration: 0.16,
} as const;

function energyDistance(a: Energy, b: Energy): number {
  return Math.abs(ENERGY_LEVELS.indexOf(a) - ENERGY_LEVELS.indexOf(b));
}

/** 1 for an exact match, decaying with distance — "low" is a near miss for "calm", "high" is not. */
function energyFit(activity: Energy, preferred: Energy[]): number {
  const closest = Math.min(...preferred.map((level) => energyDistance(activity, level)));
  return Math.max(0, 1 - closest / 2);
}

function categoryFit(activity: Category[], preferred: Category[]): number {
  const hits = preferred.filter((category) => activity.includes(category)).length;
  if (hits === 0) return 0;
  // One match is most of the value; a second is a bonus, not a doubling.
  return hits === 1 ? 0.85 : 1;
}

function durationFit(seconds: number, [min, max]: [number, number]): number {
  if (seconds >= min && seconds <= max) return 1;
  const overshoot = seconds < min ? min - seconds : seconds - max;
  // Fully outside by three minutes or more is worthless for this need.
  return Math.max(0, 1 - overshoot / 180);
}

/** Relevance of an activity to a need, from 0 to 1. Surprise Me is deliberately flat. */
export function scoreForNeed(activity: Activity, need: Need): number {
  if (need === "surprise") return 0.6;

  const profile = NEED_PROFILES[need];
  let score = 0;
  let total = 0;

  score += WEIGHTS.energy * energyFit(activity.energy, profile.energy);
  total += WEIGHTS.energy;

  score += WEIGHTS.categories * categoryFit(activity.categories, profile.categories);
  total += WEIGHTS.categories;

  if (profile.noise) {
    score += WEIGHTS.noise * (profile.noise.includes(activity.noise) ? 1 : 0);
    total += WEIGHTS.noise;
  }

  if (profile.movement) {
    score += WEIGHTS.movement * (profile.movement.includes(activity.movement) ? 1 : 0);
    total += WEIGHTS.movement;
  }

  if (profile.duration) {
    score += WEIGHTS.duration * durationFit(activity.duration, profile.duration);
    total += WEIGHTS.duration;
  }

  return score / total;
}

/**
 * How well an activity fits a class of this age, from 0 to 1.
 *
 * Suitability is already a hard filter, so this is about *comfort*: an
 * activity aimed at 9–18 technically suits a 9-year-old, but one aimed at
 * 8–11 suits them squarely. Squarely wins.
 */
export function ageFit(range: AgeRange, studentAge: number): number {
  const span = range.max - range.min;
  if (span <= 0) return studentAge === range.min ? 1 : 0;
  if (studentAge < range.min || studentAge > range.max) return 0;

  // Distance from the middle of the band, normalised to 0 at the centre and 1
  // at either edge.
  const middle = (range.min + range.max) / 2;
  const offCentre = Math.abs(studentAge - middle) / (span / 2);

  // Edges still score 0.6 — being at the top of a range is fine, just not ideal.
  return 1 - 0.4 * offCentre;
}

/**
 * How much an activity resembles the one the teacher is looking at, 0 to 1.
 *
 * Used by "give me another like this": the teacher has told us the *shape* was
 * right and only the specifics were wrong, which is a much stronger signal than
 * the need they originally picked.
 */
export function similarityTo(candidate: Activity, seed: Activity): number {
  const sharedCategories = candidate.categories.filter((c) =>
    seed.categories.includes(c),
  ).length;
  // Measured against how many categories the seed actually has, capped at two —
  // otherwise a single-category activity could never fully resemble itself.
  const categoryFit = sharedCategories / Math.min(2, seed.categories.length);

  const energyCloseness =
    1 -
    Math.abs(ENERGY_LEVELS.indexOf(candidate.energy) - ENERGY_LEVELS.indexOf(seed.energy)) / 3;

  const sameFormat = candidate.format === seed.format ? 1 : 0;
  const sameNoise = candidate.noise === seed.noise ? 1 : 0;

  // Within a minute of each other counts as the same sort of gap to fill.
  const durationCloseness = Math.max(
    0,
    1 - Math.abs(candidate.duration - seed.duration) / 240,
  );

  return Math.min(
    1,
    0.4 * categoryFit +
      0.2 * energyCloseness +
      0.15 * sameFormat +
      0.1 * sameNoise +
      0.15 * durationCloseness,
  );
}

const RECENT_CATEGORIES = 2;
const RECENT_ENERGY = 3;
const RECENT_DURATION = 2;

/**
 * Variety guard. Without this, Surprise Me happily serves five high-energy
 * activities in a row and stops feeling random.
 */
export function varietyPenalty(activity: Activity, history: HistoryEntry[]): number {
  if (history.length === 0) return 0;

  let penalty = 0;

  const recentCategories = new Set(
    history.slice(0, RECENT_CATEGORIES).flatMap((entry) => entry.categories),
  );
  const sharedCategories = activity.categories.filter((c) => recentCategories.has(c)).length;
  penalty += Math.min(sharedCategories, 2) * 0.12;

  const recentEnergy = history.slice(0, RECENT_ENERGY).map((entry) => entry.energy);
  if (recentEnergy.length > 0 && recentEnergy.every((energy) => energy === activity.energy)) {
    penalty += 0.2;
  }

  const bucket = durationBucketOf(activity.duration);
  const recentBuckets = history.slice(0, RECENT_DURATION).map((e) => durationBucketOf(e.duration));
  if (bucket !== null && recentBuckets.length > 0 && recentBuckets.every((b) => b === bucket)) {
    penalty += 0.12;
  }

  return penalty;
}
