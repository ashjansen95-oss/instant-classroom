"use client";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Sheet } from "@/components/ui/sheet";
import { useCountry } from "@/hooks/use-country";
import {
  CATEGORY_LABELS,
  DURATION_LABELS,
  ENERGY_LABELS,
  EQUIPMENT_LABELS,
  FORMAT_LABELS,
  MOVEMENT_LABELS,
  NOISE_LABELS,
  SUBJECT_LABELS,
} from "@/lib/labels";
import {
  CATEGORIES,
  DURATION_BUCKETS,
  EMPTY_FILTERS,
  ENERGY_LEVELS,
  EQUIPMENT,
  FORMATS,
  MOVEMENTS,
  NOISE_LEVELS,
  SUBJECTS,
  type FilterState,
} from "@/lib/types";

type Group = Exclude<keyof FilterState, "levels">;

/**
 * Per-option emoji, scoped to this sheet only — the shared label maps in
 * @/lib/labels feed several other components (activity meta, favourites,
 * recommendations) that already have their own icon treatment, so the emoji
 * live here rather than on the labels themselves. Duration and year level
 * are deliberately left plain.
 */
const GROUP_EMOJI: Partial<Record<Group, Record<string, string>>> = {
  energy: { calm: "😌", low: "🐢", medium: "🙂", high: "🔥" },
  noise: { quiet: "🤫", moderate: "🔉", loud: "📢" },
  formats: {
    individual: "🙋",
    pairs: "🧑‍🤝‍🧑",
    "small-groups": "👥",
    "whole-class": "🏫",
  },
  movement: { seated: "🪑", standing: "🧍", movement: "🏃" },
  equipment: { none: "🚫", paper: "📄", whiteboard: "🖍️", timer: "⏱️", other: "🧰" },
  categories: {
    "brain-break": "🧠",
    "wake-them-up": "⚡",
    "calm-down": "🧘",
    "kill-time": "⏳",
    "get-moving": "🏃",
    "think-fast": "🤔",
    "pair-activities": "🤝",
    competitive: "🏆",
    creative: "🎨",
    curriculum: "📚",
    recap: "🔁",
    writing: "✍️",
    drama: "🎭",
    riddles: "🧩",
    storytelling: "📖",
    challenges: "💪",
    memory: "🧠",
    silly: "🤪",
    "team-building": "🫱🏼‍🫲🏽",
    icebreakers: "👋",
    mindfulness: "🧘",
  },
  subjects: {
    English: "📖",
    Mathematics: "🔢",
    Science: "🔬",
    History: "🏛️",
    Geography: "🌍",
  },
};

/** Every filter group, as data, so the sheet is one loop rather than eight blocks. */
const GROUPS: {
  key: Group;
  label: string;
  options: readonly string[];
  labels: Record<string, string>;
}[] = [
  {
    key: "durations",
    label: "How long?",
    options: Object.keys(DURATION_BUCKETS),
    labels: DURATION_LABELS,
  },
  { key: "energy", label: "Energy", options: ENERGY_LEVELS, labels: ENERGY_LABELS },
  { key: "noise", label: "Noise", options: NOISE_LEVELS, labels: NOISE_LABELS },
  { key: "formats", label: "Format", options: FORMATS, labels: FORMAT_LABELS },
  { key: "movement", label: "Movement", options: MOVEMENTS, labels: MOVEMENT_LABELS },
  { key: "equipment", label: "Equipment", options: EQUIPMENT, labels: EQUIPMENT_LABELS },
  { key: "categories", label: "Type", options: CATEGORIES, labels: CATEGORY_LABELS },
  { key: "subjects", label: "Subject", options: SUBJECTS, labels: SUBJECT_LABELS },
];

export function FilterSheet({
  open,
  onClose,
  filters,
  onChange,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
}) {
  const { levels, shortLabel, label, terminology } = useCountry();

  const toggle = (group: Group, value: string) => {
    const current = filters[group] as string[];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ ...filters, [group]: next } as FilterState);
  };

  const toggleLevel = (level: number) => {
    const next = filters.levels.includes(level)
      ? filters.levels.filter((item) => item !== level)
      : [...filters.levels, level];
    onChange({ ...filters, levels: next });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Filters"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" size="lg" onClick={() => onChange(EMPTY_FILTERS)}>
            Clear
          </Button>
          <Button size="lg" fullWidth onClick={onClose}>
            Show {resultCount} {resultCount === 1 ? "activity" : "activities"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Level chips are built from the teacher's country, so this same list
            reads "Prep, Y1…" in Australia and "K, G1…" in the US. */}
        <fieldset>
          <legend className="mb-2.5 font-display text-sm font-bold tracking-wide text-ink-muted uppercase">
            {terminology.levelNoun}
            <span className="ml-2 normal-case opacity-70">{terminology.flag}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {levels().map((level) => (
              <Chip
                key={level}
                selected={filters.levels.includes(level)}
                onClick={() => toggleLevel(level)}
                aria-label={label(level)}
              >
                {shortLabel(level)}
              </Chip>
            ))}
          </div>
        </fieldset>

        {GROUPS.map((group) => (
          <fieldset key={group.key}>
            <legend className="mb-2.5 font-display text-sm font-bold tracking-wide text-ink-muted uppercase">
              {group.label}
            </legend>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => {
                const emoji = GROUP_EMOJI[group.key]?.[option];
                return (
                  <Chip
                    key={option}
                    selected={(filters[group.key] as string[]).includes(option)}
                    onClick={() => toggle(group.key, option)}
                  >
                    {emoji ? (
                      <>
                        <span aria-hidden>{emoji}</span> {group.labels[option]}
                      </>
                    ) : (
                      group.labels[option]
                    )}
                  </Chip>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </Sheet>
  );
}
