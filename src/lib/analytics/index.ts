import { KEYS, storage } from "@/lib/storage";
import type { AnalyticsEvent, AnalyticsSink, EventName, EventProps } from "./events";

export { EVENT_NAMES, type AnalyticsEvent, type AnalyticsSink, type EventName } from "./events";

/**
 * A one-file swap away from a real provider. For the MVP the sink is a local
 * ring buffer: the events are all wired up and countable, but nothing leaves
 * the device and there are no cookies or third-party scripts. See FUTURE.md.
 */

const BUFFER_LIMIT = 200;

export const localSink: AnalyticsSink = {
  track(event) {
    const buffer = storage.get<AnalyticsEvent[]>(KEYS.events, []);
    storage.set(KEYS.events, [event, ...buffer].slice(0, BUFFER_LIMIT));
  },
};

let sink: AnalyticsSink = localSink;

export function setSink(next: AnalyticsSink): void {
  sink = next;
}

export function track(name: EventName, props: EventProps = {}): void {
  // Server rendering has no user to attribute anything to.
  if (typeof window === "undefined") return;

  try {
    sink.track({ name, props, at: Date.now() });
  } catch {
    // Analytics must never break the app.
  }
}

export function readEvents(): AnalyticsEvent[] {
  return storage.get<AnalyticsEvent[]>(KEYS.events, []);
}

export function clearEvents(): void {
  storage.remove(KEYS.events);
}

/** Rolls up the local buffer for the "what we've recorded" panel in Settings. */
export function summariseEvents(): { name: EventName; count: number }[] {
  const counts = new Map<EventName, number>();
  for (const event of readEvents()) {
    counts.set(event.name, (counts.get(event.name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
