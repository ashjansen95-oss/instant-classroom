"use client";

import { Chip } from "@/components/ui/chip";
import { CountryPicker } from "@/components/settings/country-picker";
import { useCountry } from "@/hooks/use-country";
import { useTeaching } from "@/hooks/use-teaching";

/**
 * Everything the teacher told us at first launch, editable.
 *
 * Changing country re-labels these levels without changing which classes they
 * teach — the underlying canonical levels don't move.
 */
export function TeachingSettings() {
  const { label, shortLabel, levels, terminology } = useCountry();
  const {
    teachingLevels,
    defaultTeachingLevel,
    toggleTeachingLevel,
    setDefaultTeachingLevel,
  } = useTeaching();

  return (
    <section aria-labelledby="teaching-heading">
      <h2
        id="teaching-heading"
        className="font-display text-sm font-bold tracking-wide text-ink-muted uppercase"
      >
        Teaching preferences
      </h2>

      <h3 className="mt-4 mb-1 font-display font-bold">Country / region</h3>
      <p className="mb-3 text-sm text-ink-muted text-pretty">
        Sets what we call school years across the whole app.
      </p>
      <CountryPicker />

      <h3 className="mt-7 mb-1 font-display font-bold">
        Your {terminology.levelNoun}s
      </h3>
      <p className="mb-3 text-sm text-ink-muted text-pretty">
        Activities are picked to suit these students. This is the setting that does the most work.
      </p>
      <div className="flex flex-wrap gap-2">
        {levels().map((level) => (
          <Chip
            key={level}
            selected={teachingLevels.includes(level)}
            onClick={() => toggleTeachingLevel(level)}
            aria-label={label(level)}
          >
            {shortLabel(level)}
          </Chip>
        ))}
      </div>
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-ink-muted">
        {teachingLevels.length > 0
          ? teachingLevels.map((level) => label(level)).join(", ")
          : "Pick at least one, or we can't tailor anything."}
      </p>

      {teachingLevels.length > 1 && (
        <>
          <h3 className="mt-7 mb-1 font-display font-bold">Default level</h3>
          <p className="mb-3 text-sm text-ink-muted text-pretty">
            Where we start each time you open the app.
          </p>
          <div className="flex flex-wrap gap-2">
            {teachingLevels.map((level) => (
              <Chip
                key={level}
                selected={defaultTeachingLevel === level}
                onClick={() => setDefaultTeachingLevel(level)}
              >
                {label(level)}
              </Chip>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
