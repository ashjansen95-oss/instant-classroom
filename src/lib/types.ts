/** Core domain types. Everything else in the app is built on these. */

// Education levels live in @/lib/i18n — canonical numbers here, and they only
// get their country's words at display time.
import type { AgeRange, EducationLevel, LevelRange } from "@/lib/i18n";

export type { AgeRange, EducationLevel, LevelRange };

export const ENERGY_LEVELS = ["calm", "low", "medium", "high"] as const;
export type Energy = (typeof ENERGY_LEVELS)[number];

export const NOISE_LEVELS = ["quiet", "moderate", "loud"] as const;
export type Noise = (typeof NOISE_LEVELS)[number];

export const FORMATS = ["individual", "pairs", "small-groups", "whole-class"] as const;
export type Format = (typeof FORMATS)[number];

export const MOVEMENTS = ["seated", "standing", "movement"] as const;
export type Movement = (typeof MOVEMENTS)[number];

export const CATEGORIES = [
  "brain-break",
  "wake-them-up",
  "calm-down",
  "kill-time",
  "get-moving",
  "think-fast",
  "pair-activities",
  "competitive",
  "creative",
  "curriculum",
] as const;
export type Category = (typeof CATEGORIES)[number];

/** Equipment a teacher would actually have to hand. "none" is by far the best answer. */
export const EQUIPMENT = ["none", "paper", "whiteboard", "timer", "other"] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export interface Activity {
  id: string;
  title: string;
  /** One sentence. If it needs two, the activity is too complicated. */
  description: string;
  /** Numbered steps, six at most — a teacher reads these while the class watches. */
  instructions: string[];
  /**
   * NOTE: seconds, not minutes. The 30-second filter bucket needs the precision
   * and the timer consumes it directly. Use `formatDuration()` for display.
   */
  duration: number;
  energy: Energy;
  noise: Noise;
  format: Format;
  movement: Movement;
  equipment: Equipment[];
  /**
   * The ages this activity is genuinely *appropriate* for — not merely
   * possible with. Ages rather than year numbers, because a British Year 8
   * class is a year younger than an Australian one; @/lib/i18n converts.
   *
   * Classified on cognitive load, reading and vocabulary demands, attention
   * span, social maturity, abstraction and how babyish it would feel to a
   * teenager. Deliberately narrow where that's the honest answer.
   */
  ageRange: AgeRange;
  categories: Category[];
  tags: string[];
  /**
   * True when the activity ends on its own condition — a champion, a correct
   * guess, five points — rather than a clock. A countdown that hits zero
   * mid-elimination fights the mechanic instead of supporting it, so these
   * demote the timer to a secondary action rather than removing it outright —
   * a teacher may still want a rough cap on how long it runs.
   */
  selfEnding?: boolean;
}

/**
 * What a teacher tells us they need.
 *
 * The first six are the home screen's intent tiles — tapping one *is* the
 * request, not a filter to configure before pressing something else. "surprise"
 * is the odd one out: it has no profile in `scoreForNeed` (it scores flat, so
 * variety alone decides) and no tile, because it belongs to the big
 * shake pad — the universal "just give me something good".
 */
export const NEEDS = ["reset", "wake", "calm", "kill-time", "fun", "think", "surprise"] as const;
export type Need = (typeof NEEDS)[number];

/** Duration buckets, in seconds, matching the Explore filter labels. */
export const DURATION_BUCKETS = {
  "30-sec": { label: "30 sec", min: 0, max: 45 },
  "1-min": { label: "1 min", min: 46, max: 90 },
  "2-min": { label: "2 min", min: 91, max: 150 },
  "3-5-min": { label: "3–5 min", min: 151, max: 330 },
  "5-10-min": { label: "5–10 min", min: 331, max: 900 },
} as const satisfies Record<string, { label: string; min: number; max: number }>;

export type DurationBucket = keyof typeof DURATION_BUCKETS;

export interface FilterState {
  durations: DurationBucket[];
  energy: Energy[];
  noise: Noise[];
  formats: Format[];
  movement: Movement[];
  equipment: Equipment[];
  /** Canonical levels the teacher selected, not bands. */
  levels: EducationLevel[];
  categories: Category[];
}

export const EMPTY_FILTERS: FilterState = {
  durations: [],
  energy: [],
  noise: [],
  formats: [],
  movement: [],
  equipment: [],
  levels: [],
  categories: [],
};

/** Monetisation seam. Nothing is gated in the MVP — see FUTURE.md. */
export type Plan = "free" | "pro";

/**
 * How it actually went, in the order a teacher would rank them.
 *
 * Five options rather than a thumb because "worked" and "they loved it" are
 * genuinely different signals — the second is what tells us an activity is
 * worth keeping, and the first only tells us it isn't broken.
 */
export const FEEDBACK_RATINGS = ["never-again", "flopped", "fine", "worked", "loved"] as const;
export type Feedback = (typeof FEEDBACK_RATINGS)[number];

export const FEEDBACK_OPTIONS: {
  rating: Feedback;
  emoji: string;
  label: string;
  /** Which way this counts when we roll the numbers up. */
  tone: "positive" | "neutral" | "negative";
}[] = [
  { rating: "fine", emoji: "😐", label: "Fine", tone: "neutral" },
  { rating: "worked", emoji: "👍", label: "Worked", tone: "positive" },
  { rating: "flopped", emoji: "👎", label: "Didn't work", tone: "negative" },
  { rating: "loved", emoji: "🔥", label: "They loved it", tone: "positive" },
  { rating: "never-again", emoji: "💀", label: "Never again", tone: "negative" },
];

/** One entry in the recently-seen ring buffer that stops repeats. */
export interface HistoryEntry {
  id: string;
  categories: Category[];
  energy: Energy;
  duration: number;
  at: number;
}
