"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCountry } from "@/hooks/use-country";
import { useHydrated } from "@/hooks/use-stored-state";
import { useActiveLevel } from "@/hooks/use-teaching";
import { ENERGY_LABELS, formatDuration } from "@/lib/labels";
import { pickSimilarActivities } from "@/lib/selection";
import type { Activity } from "@/lib/types";

/**
 * Three concrete alternatives, not another spin of the wheel. Sits next to
 * "Give me another" rather than replacing it: that button is for "I don't want
 * this one", this section is for "I want something in this vein" — different
 * intents, so they stay as separate, visible options rather than one
 * overloaded control.
 */
export function MoreLikeThis({ activity }: { activity: Activity }) {
  const { country } = useCountry();
  const { activeLevel } = useActiveLevel();
  // pickSimilarActivities draws randomly, so it must never run during SSR —
  // the server and the client's hydration pass would draw different
  // activities and React would flag it as a hydration mismatch. Held back
  // until hydration is confirmed, matching how the rest of the app gates
  // client-only randomness (see Onboarding, ActivityReel).
  const hydrated = useHydrated();

  // Recomputed only when the activity or class changes — not on every render,
  // and not a live "random on refresh" list, which would make the three
  // options feel like they're moving under the teacher's thumb.
  const suggestions = useMemo(
    () => (hydrated ? pickSimilarActivities(activity, 3, { country, level: activeLevel }) : []),
    [hydrated, activity, country, activeLevel],
  );

  if (suggestions.length === 0) return null;

  return (
    <section aria-labelledby="more-like-this-heading" className="mt-8">
      <h2
        id="more-like-this-heading"
        className="font-display text-sm font-bold tracking-wide text-ink-muted uppercase"
      >
        More like this
      </h2>

      <ul className="mt-3 space-y-2">
        {suggestions.map((suggestion) => (
          <li key={suggestion.id}>
            <Link
              href={`/activity/${suggestion.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border-2 border-line bg-surface px-4 py-3 hover:border-line-strong"
            >
              <span className="min-w-0 font-display font-bold text-balance">
                {suggestion.title}
              </span>
              <span className="shrink-0 text-xs font-semibold text-ink-faint">
                {formatDuration(suggestion.duration)} · {ENERGY_LABELS[suggestion.energy]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
