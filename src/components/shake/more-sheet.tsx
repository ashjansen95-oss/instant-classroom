"use client";

import { Sheet } from "@/components/ui/sheet";
import { MORE_OPTIONS, SUBJECT_OPTIONS } from "@/lib/labels";
import type { Category, Subject } from "@/lib/types";
import { cn } from "@/lib/utils";

const tileClass = cn(
  "flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-line bg-surface",
  "transition-transform duration-100 active:scale-[0.97] active:border-line-strong active:-translate-y-0.5",
);

const sectionLabelClass =
  "font-display text-sm font-bold tracking-wide text-ink-muted uppercase";

/**
 * Secondary to the intent tiles, on purpose — a small, well-backed set of
 * categories for when a teacher wants something more specific than the six
 * main needs cover. Picking one behaves exactly like an intent tile: tap,
 * reel, activity. No "apply filter, then press Generate" here either.
 *
 * Two rows: "Classroom" (the original mood/format categories) and
 * "Subjects" (curriculum content) — kept visually separate since they're a
 * different kind of choice, not a bigger version of the same list.
 */
export function MoreSheet({
  open,
  onClose,
  onSelect,
  onSelectSubject,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (category: Category) => void;
  onSelectSubject: (subject: Subject) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="More specific?">
      <div className="space-y-6">
        <fieldset>
          <legend className={cn(sectionLabelClass, "mb-2.5")}>Classroom</legend>
          <div className="grid grid-cols-2 gap-2.5">
            {MORE_OPTIONS.map(({ category, emoji, label }) => (
              <button key={category} type="button" onClick={() => onSelect(category)} className={tileClass}>
                <span aria-hidden className="text-2xl leading-none">
                  {emoji}
                </span>
                <span className="font-display text-[0.9375rem] font-bold">{label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={cn(sectionLabelClass, "mb-2.5")}>Subjects</legend>
          <div className="grid grid-cols-2 gap-2.5">
            {SUBJECT_OPTIONS.map(({ subject, emoji, label }) => (
              <button
                key={subject}
                type="button"
                onClick={() => onSelectSubject(subject)}
                className={tileClass}
              >
                <span aria-hidden className="text-2xl leading-none">
                  {emoji}
                </span>
                <span className="font-display text-[0.9375rem] font-bold">{label}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </Sheet>
  );
}
