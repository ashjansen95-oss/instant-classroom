"use client";

import { useLayoutEffect } from "react";
import { KEYS } from "@/lib/storage";
import { sessionStore } from "@/lib/storage/store";

/**
 * Restores Explore's scroll position after a "tap an activity, then Back"
 * round trip. The app's only scrolling element lives in the root layout
 * (`[data-scroll-container]` in layout.tsx) — <html>/<body> are pinned to
 * the viewport so the bottom nav doesn't get dragged along by an iOS
 * rubber-band bounce — which means neither the browser's native
 * back/forward scroll restoration nor Next's own "maintain scroll
 * position" (both keyed off window/document, which never move here) have
 * anything to act on. This restores it by hand instead, the same
 * session-scoped pattern `useExploreFilters` already uses for filters
 * surviving the same trip: written on the way out, read on the way back.
 *
 * `useLayoutEffect`, not `useEffect` — the restore has to land before the
 * browser paints, or the list flashes at the top for a frame first.
 */
export function useExploreScroll() {
  useLayoutEffect(() => {
    const container = document.querySelector<HTMLElement>("[data-scroll-container]");
    if (!container) return;

    const saved = sessionStore.readKey<number | null>(KEYS.exploreScroll, null);
    if (saved !== null) container.scrollTop = saved;

    return () => {
      sessionStore.writeKey(KEYS.exploreScroll, container.scrollTop);
    };
  }, []);
}
