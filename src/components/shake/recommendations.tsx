"use client";

import Link from "next/link";
import { getActivity } from "@/data/activities";
import { similarActivities } from "@/lib/selection";
import { formatDuration, ENERGY_LABELS } from "@/lib/labels";

/**
 * The whole of "personalisation" for the MVP: if you've favourited things, show
 * a couple of activities like them. Deliberately not machine learning.
 */
export function Recommendations({ favouriteIds }: { favouriteIds: string[] }) {
  if (favouriteIds.length === 0) return null;

  const seed = getActivity(favouriteIds[0]);
  if (!seed) return null;

  const suggestions = similarActivities(seed, 2).filter(
    (activity) => !favouriteIds.includes(activity.id),
  );
  if (suggestions.length === 0) return null;

  return (
    <section className="mt-8" aria-labelledby="recommendations-heading">
      <h2
        id="recommendations-heading"
        className="font-display text-sm font-bold tracking-wide text-ink-muted uppercase"
      >
        Based on what you&rsquo;ve liked
      </h2>

      <ul className="mt-3 space-y-2">
        {suggestions.map((activity) => (
          <li key={activity.id}>
            <Link
              href={`/activity/${activity.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border-2 border-line bg-surface px-4 py-3 hover:border-line-strong"
            >
              <span className="font-display font-bold">{activity.title}</span>
              <span className="shrink-0 text-xs font-semibold text-ink-faint">
                {formatDuration(activity.duration)} · {ENERGY_LABELS[activity.energy]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
