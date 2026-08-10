import type { Activity, HistoryEntry } from "@/lib/types";

/** The recently-seen ring buffer, newest first. */

export const HISTORY_LIMIT = 20;

export function toHistoryEntry(activity: Activity, at = Date.now()): HistoryEntry {
  return {
    id: activity.id,
    categories: activity.categories,
    energy: activity.energy,
    duration: activity.duration,
    at,
  };
}

export function pushHistory(
  history: HistoryEntry[],
  activity: Activity,
  at = Date.now(),
): HistoryEntry[] {
  return [toHistoryEntry(activity, at), ...history].slice(0, HISTORY_LIMIT);
}
