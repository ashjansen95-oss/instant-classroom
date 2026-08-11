"use client";

import { useCallback, useSyncExternalStore } from "react";
import { KEYS } from "@/lib/storage";
import { sessionStore } from "@/lib/storage/store";
import type { FilterState } from "@/lib/types";

/**
 * Explore's filters, kept alive across a "tap an activity, then Back" round
 * trip — the screen unmounts when a teacher opens an activity, and a plain
 * `useState` would come back empty. Session-scoped rather than permanent
 * (like `useActiveLevel`): a filter set for one lesson shouldn't still be
 * there next week, but it must survive moving between screens.
 *
 * `null` specifically means "nothing chosen yet this session" — distinct
 * from an explicit empty `FilterState` from hitting Clear — so the one-time
 * default to the teacher's own levels knows whether it's still allowed to run.
 */
export function useExploreFilters() {
  const stored = useSyncExternalStore(
    sessionStore.subscribe,
    () => sessionStore.readKey<FilterState | null>(KEYS.exploreFilters, null),
    () => null,
  );

  const setFilters = useCallback(
    (next: FilterState) => sessionStore.writeKey(KEYS.exploreFilters, next),
    [],
  );

  return { storedFilters: stored, setFilters };
}
