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
    ({ activity, need }: PendingPick) => {
      setPending(null);
      router.push(`/activity/${activity.id}?need=${need}`);
    },
    [router],
  );

  const pick = useCallback(
    (need: Need, source: "shake" | "button", filters?: FilterState) => {
      if (pending) return;

      // The active teaching level is what makes Surprise Me feel like it knows
      // the class — it's a hard constraint inside pickActivity, not a garnish.
      const activity = pickActivity({ need, filters, history, country, level: activeLevel });
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

      // No spinning reel for anyone who has asked for less motion.
      if (reducedMotion) go({ activity, need });
      else setPending({ activity, need });
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
