"use client";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Sheet } from "@/components/ui/sheet";
import {
  CATEGORY_LABELS,
  DURATION_LABELS,
  ENERGY_LABELS,
  EQUIPMENT_LABELS,
  FORMAT_LABELS,
  MOVEMENT_LABELS,
  NOISE_LABELS,
  YEAR_LEVEL_LABELS,
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
  YEAR_LEVELS,
  type FilterState,
} from "@/lib/types";

type Group = keyof FilterState;

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
  { key: "yearLevels", label: "Year level", options: YEAR_LEVELS, labels: YEAR_LEVEL_LABELS },
  { key: "categories", label: "Type", options: CATEGORIES, labels: CATEGORY_LABELS },
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
  const toggle = (group: Group, value: string) => {
    const current = filters[group] as string[];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ ...filters, [group]: next } as FilterState);
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
        {GROUPS.map((group) => (
          <fieldset key={group.key}>
            <legend className="mb-2.5 font-display text-sm font-bold tracking-wide text-ink-muted uppercase">
              {group.label}
            </legend>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => (
                <Chip
                  key={option}
                  selected={(filters[group.key] as string[]).includes(option)}
                  onClick={() => toggle(group.key, option)}
                >
                  {group.labels[option]}
                </Chip>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </Sheet>
  );
}
