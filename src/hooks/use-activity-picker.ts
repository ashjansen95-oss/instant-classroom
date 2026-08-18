"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { track } from "@/lib/analytics";
import { candidateBand, pickActivity } from "@/lib/selection";
import { KEYS, storage } from "@/lib/storage";
import type { Activity, FilterState, Need } from "@/lib/types";
import { useActivityHistory } from "./use-activity-history";
import { useActiveLevel } from "./use-teaching";
import { useCountry } from "./use-country";
import { useReducedMotion } from "./use-reduced-motion";

/** Enough to cover a typical candidate band without hammering the network. */
const PREFETCH_LIMIT = 12;

export interface PendingPick {
  activity: Activity;
  need: Need;
  /** Replace the current history entry instead of pushing a new one. */
  replace?: boolean;
}

/**
 * Resolves an activity and takes the teacher to it.
 *
 * The activity is chosen synchronously, before any animation starts. The reel
 * is theatre over a decision that has already been made — it can never be
 * waiting on anything, and it can never fail to land.
 */
export function useActivityPicker() {
  const router = useRouter();
  const { history, record } = useActivityHistory();
  const { country } = useCountry();
  const { activeLevel } = useActiveLevel();
  const reducedMotion = useReducedMotion();

  const [pending, setPending] = useState<PendingPick | null>(null);
  const [noMatch, setNoMatch] = useState(false);

  const go = useCallback(
    ({ activity, need, replace }: PendingPick) => {
      // Navigate first, then clear pending after the router has committed.
      // Clearing before the push exposed the home screen for a frame while
      // the new page was still mounting.
      const url = `/activity/${activity.id}?need=${need}`;
      if (replace) router.replace(url);
      else router.push(url);
      requestAnimationFrame(() => setPending(null));
    },
    [router],
  );

  const pick = useCallback(
    (
      need: Need,
      source: "shake" | "button" | "swap",
      filters?: FilterState,
      /** Passed by "give me another like this" — steers towards its shape. */
      like?: Activity | null,
    ) => {
      if (pending) return;

      // The active teaching level is what makes Surprise Me feel like it knows
      // the class — it's a hard constraint inside pickActivity, not a garnish.
      const activity = pickActivity({
        need,
        filters,
        history,
        country,
        level: activeLevel,
        like,
      });
      if (!activity) {
        setNoMatch(true);
        return;
      }

      setNoMatch(false);
      if (source === "shake") track("shake_triggered", { need });
      else if (need === "surprise") track("surprise_me_clicked");
      // Other button presses are already captured by activity_viewed, which
      // records the need on the destination page.

      if (!storage.get(KEYS.stats, false)) {
        storage.set(KEYS.stats, true);
        track("first_activity", { need });
      }

      record(activity);

      // "Give me another" is a rejection, not a destination — replace the
      // current history entry so Back goes straight out to Home/Explore
      // instead of replaying every rejected activity. The flag rides on the
      // PendingPick so it's available when go() fires after the reel lands,
      // avoiding stale-closure issues with React state.
      const pendingPick: PendingPick = {
        activity,
        need,
        replace: source === "swap",
      };

      // No spinning reel for anyone who has asked for less motion.
      if (reducedMotion) go(pendingPick);
      else setPending(pendingPick);
    },
    [activeLevel, country, go, history, pending, record, reducedMotion],
  );

  /** Called by the reel once it lands. */
  const complete = useCallback(() => {
    if (pending) go(pending);
  }, [go, pending]);

  /**
   * Warms the routes a pick could land on. Two reasons this matters: the reveal
   * lands on a page that is already on the device, and the core loop keeps
   * working when the wifi drops mid-lesson.
   */
  const prefetch = useCallback(
    (need: Need, filters?: FilterState) => {
      const band = candidateBand({ need, filters, history, country, level: activeLevel });
      for (const activity of band.slice(0, PREFETCH_LIMIT)) {
        router.prefetch(`/activity/${activity.id}?need=${need}`);
      }
    },
    [activeLevel, country, history, router],
  );

  return { pick, prefetch, complete, pending, busy: pending !== null, noMatch };
}
