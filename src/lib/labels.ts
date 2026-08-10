import type {
  Category,
  DurationBucket,
  Energy,
  Equipment,
  Format,
  Movement,
  Need,
  Noise,
  YearLevel,
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

export const YEAR_LEVEL_LABELS: Record<YearLevel, string> = {
  "early-primary": "Early primary",
  "upper-primary": "Upper primary",
  "years-7-9": "Years 7–9",
  "years-10-12": "Years 10–12",
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
};

export const DURATION_LABELS = Object.fromEntries(
  Object.entries(DURATION_BUCKETS).map(([key, value]) => [key, value.label]),
) as Record<DurationBucket, string>;

/** The six home-screen options, in display order. */
export const NEED_OPTIONS: {
  need: Need;
  emoji: string;
  label: string;
  hue: string;
}[] = [
  { need: "reset", emoji: "🧠", label: "Reset the room", hue: "var(--hue-reset)" },
  { need: "wake", emoji: "⚡", label: "Wake them up", hue: "var(--hue-wake)" },
  { need: "calm", emoji: "🤫", label: "Calm them down", hue: "var(--hue-calm)" },
  { need: "kill-time", emoji: "⏰", label: "Kill 2 minutes", hue: "var(--hue-time)" },
  { need: "fun", emoji: "🎯", label: "Make learning fun", hue: "var(--hue-fun)" },
  { need: "surprise", emoji: "🎲", label: "Surprise me", hue: "var(--hue-surprise)" },
];

export const NEED_LABELS = Object.fromEntries(
  NEED_OPTIONS.map(({ need, label }) => [need, label]),
) as Record<Need, string>;

export function equipmentSummary(equipment: Equipment[]): string {
  if (equipment.length === 0 || (equipment.length === 1 && equipment[0] === "none")) {
    return "No equipment";
  }
  return equipment.filter((item) => item !== "none").map((item) => EQUIPMENT_LABELS[item]).join(" + ");
}

export function yearLevelSummary(levels: YearLevel[]): string {
  if (levels.length === 4) return "Any year level";
  return levels.map((level) => YEAR_LEVEL_LABELS[level]).join(", ");
}
