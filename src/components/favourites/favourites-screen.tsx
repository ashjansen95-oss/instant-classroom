"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Heart, X } from "lucide-react";
import { getActivities } from "@/data/activities";
import { ButtonLink } from "@/components/ui/button";
import { Page, PageHeader } from "@/components/ui/page";
import { useFavourites } from "@/hooks/use-favourites";
import { track } from "@/lib/analytics";
import { ENERGY_LABELS, formatDuration } from "@/lib/labels";

export function FavouritesScreen() {
  const { ids, remove, loaded } = useFavourites();
  const activities = getActivities(ids);

  useEffect(() => {
    track("page_view", { path: "/favourites" });
  }, []);

  // Nothing renders until storage has been read, so the empty state never
  // flashes up in front of someone who has favourites.
  if (!loaded) return <Page />;

  return (
    <Page>
      <PageHeader
        title="Favourites"
        subtitle={
          activities.length > 0
            ? `${activities.length} saved on this device`
            : undefined
        }
      />

      {activities.length === 0 ? (
        <div className="mt-12 text-center">
          <Heart aria-hidden className="mx-auto size-12 text-ink-faint" strokeWidth={2} />
          <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-balance">
            No favourites yet
          </h2>
          <p className="mt-2 text-ink-muted text-pretty">
            When you find an activity you love, tap ❤️ and it&rsquo;ll live here.
          </p>
          <ButtonLink href="/" size="lg" className="mt-6">
            Find one now
          </ButtonLink>
        </div>
      ) : (
        <ul className="space-y-3">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex items-center gap-2 rounded-2xl border-2 border-line bg-surface pr-2"
            >
              <Link href={`/activity/${activity.id}`} className="min-w-0 flex-1 py-4 pl-4">
                <h3 className="font-display text-lg leading-tight font-extrabold tracking-tight text-balance">
                  {activity.title}
                </h3>
                <p className="mt-1 text-xs font-semibold text-ink-faint">
                  ⏱ {formatDuration(activity.duration)} · ⚡ {ENERGY_LABELS[activity.energy]}
                </p>
              </Link>

              <button
                type="button"
                onClick={() => remove(activity.id)}
                className="grid size-11 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-surface-sunk hover:text-ink"
              >
                <X aria-hidden className="size-5" />
                <span className="sr-only">Remove {activity.title} from favourites</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
