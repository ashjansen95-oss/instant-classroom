"use client";

import { useCallback, useSyncExternalStore } from "react";
import { KEYS } from "@/lib/storage";
import { sessionStore } from "@/lib/storage/store";
import { EMPTY_FILTERS, type FilterState } from "@/lib/types";

// `sessionStore.readKey` caches by reference and only produces a new object
// when the stored value actually changes — `useSyncExternalStore` requires
// that same stability from its snapshot, or React sees "changed" on every
// render and loops. Backfilling missing fields with a plain object spread
// would create a fresh object each call and break that contract, so the
// merged result is cached here too, keyed off the same stable `raw`
// reference, and only recomputed when `raw` itself changes.
let lastRaw: FilterState | null | undefined;
let lastMerged: FilterState | null = null;

function withDefaults(raw: FilterState | null): FilterState | null {
  if (raw === lastRaw) return lastMerged;
  lastRaw = raw;
  // A session that started before a new FilterState field existed (e.g.
  // `subjects`) has a stored object missing it — merging over EMPTY_FILTERS
  // backfills anything absent instead of leaving it `undefined`, which
  // would crash the first toggle that reads it as an array.
  lastMerged = raw ? { ...EMPTY_FILTERS, ...raw } : null;
  return lastMerged;
}

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
    () => withDefaults(sessionStore.readKey<FilterState | null>(KEYS.exploreFilters, null)),
    () => null,
  );

  const setFilters = useCallback(
    (next: FilterState) => sessionStore.writeKey(KEYS.exploreFilters, next),
    [],
  );

  return { storedFilters: stored, setFilters };
}
