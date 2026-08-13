import type {
  Category,
  DurationBucket,
  Energy,
  Equipment,
  Format,
  Movement,
  Need,
  Noise,
} from "@/lib/types";
import { DURATION_BUCKETS } from "@/lib/types";

/** Human-facing strings and icons. Kept in one place so the voice stays consistent. */

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;
  const minutes = seconds / 60;
  return Number.isInteger(minutes) ? `${minutes} min` : `${minutes.toFixed(1)} min`;
}

export const ENERGY_LABELS: Record<Energy, string> = {
  calm: "Calm",
  low: "Low energy",
  medium: "Medium energy",
  high: "High energy",
};

export const NOISE_LABELS: Record<Noise, string> = {
  quiet: "Quiet",
  moderate: "Moderate noise",
  loud: "Loud",
};

export const FORMAT_LABELS: Record<Format, string> = {
  individual: "Individual",
  pairs: "Pairs",
  "small-groups": "Small groups",
  "whole-class": "Whole class",
};

export const MOVEMENT_LABELS: Record<Movement, string> = {
  seated: "Seated",
  standing: "Standing",
  movement: "Moving around",
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  none: "No equipment",
  paper: "Paper",
  whiteboard: "Whiteboard",
  timer: "Timer",
  other: "Other",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  "brain-break": "Brain break",
  "wake-them-up": "Wake them up",
  "calm-down": "Calm down",
  "kill-time": "Kill time",
  "get-moving": "Get moving",
  "think-fast": "Think fast",
  "pair-activities": "Pair activities",
  competitive: "Competitive",
  creative: "Creative",
  curriculum: "Curriculum",
  recap: "Recap",
  writing: "Writing",
  drama: "Drama",
  riddles: "Riddles",
  storytelling: "Storytelling",
  challenges: "Challenges",
  memory: "Memory",
  silly: "Silly",
  "team-building": "Team building",
  icebreakers: "Icebreakers",
  mindfulness: "Mindfulness",
};

export const DURATION_LABELS = Object.fromEntries(
  Object.entries(DURATION_BUCKETS).map(([key, value]) => [key, value.label]),
) as Record<DurationBucket, string>;

/**
 * The home screen's intent tiles, in display order. Tapping one *is* the
 * request — there's no separate "now press generate" step — so these read as
 * actions ("Wake them up"), not filter labels. "surprise" isn't here: it has
 * no tile, it *is* the big shake pad below the grid.
 */
export const INTENT_OPTIONS: {
  need: Exclude<Need, "surprise">;
  emoji: string;
  label: string;
  hue: string;
}[] = [
  { need: "reset", emoji: "🧠", label: "Reset the room", hue: "var(--hue-reset)" },
  { need: "wake", emoji: "⚡", label: "Wake them up", hue: "var(--hue-wake)" },
  { need: "calm", emoji: "🤫", label: "Calm them down", hue: "var(--hue-calm)" },
  { need: "move", emoji: "🏃", label: "Get them moving", hue: "var(--hue-move)" },
  { need: "fun", emoji: "🎯", label: "Have some fun", hue: "var(--hue-fun)" },
  { need: "think", emoji: "💭", label: "Make them think", hue: "var(--hue-think)" },
];

export const NEED_LABELS = Object.fromEntries(
  [...INTENT_OPTIONS.map(({ need, label }) => [need, label] as const), ["surprise", "Surprise me"]],
) as Record<Need, string>;

/**
 * "More" — additional specificity, secondary to the intent tiles above.
 * Deliberately a handful of real, well-backed `Category` values rather than
 * invented moods: a category with only a few activities behind it would make
 * "More" a trap, returning the same one or two things on every tap.
 */
export const MORE_OPTIONS: { category: Category; emoji: string; label: string }[] = [
  { category: "creative", emoji: "🎨", label: "Art" },
  { category: "competitive", emoji: "🏆", label: "Games" },
  { category: "pair-activities", emoji: "🤝", label: "Partner up" },
  { category: "recap", emoji: "🔁", label: "Recap" },
  { category: "writing", emoji: "✍️", label: "Writing" },
  { category: "drama", emoji: "🎭", label: "Drama" },
  { category: "riddles", emoji: "🧩", label: "Riddles" },
  { category: "storytelling", emoji: "📖", label: "Storytelling" },
  { category: "challenges", emoji: "💪", label: "Challenges" },
  { category: "memory", emoji: "🧠", label: "Memory" },
  { category: "silly", emoji: "🤪", label: "Silly" },
  { category: "team-building", emoji: "🫱🏼‍🫲🏽", label: "Team building" },
  { category: "icebreakers", emoji: "👋", label: "Icebreakers" },
  { category: "mindfulness", emoji: "🧘", label: "Mindfulness" },
];

export function equipmentSummary(equipment: Equipment[]): string {
  if (equipment.length === 0 || (equipment.length === 1 && equipment[0] === "none")) {
    return "No equipment";
  }
  return equipment.filter((item) => item !== "none").map((item) => EQUIPMENT_LABELS[item]).join(" + ");
}

// Education-level wording is not here on purpose: it depends on the teacher's
// country, so it lives in @/lib/i18n and is resolved at render time.
