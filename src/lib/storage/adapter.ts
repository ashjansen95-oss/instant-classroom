/**
 * The persistence seam. Everything the app stores goes through this interface,
 * so swapping localStorage for Supabase later means writing one new
 * implementation and changing nothing else. See FUTURE.md.
 */
export interface StorageAdapter {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  /** Clears only this app's keys, never the rest of the origin. */
  clear(): void;
}

export const STORAGE_PREFIX = "instant-classroom:";

export const KEYS = {
  favourites: "favourites",
  history: "history",
  feedback: "feedback",
  preferences: "preferences",
  stats: "stats",
  events: "events",
  /** The teacher's first name, collected during onboarding. */
  name: "name",
  onboarded: "onboarded",
  motionPermission: "motion-permission",
  country: "country",
  teaching: "teaching",
  /** Session-scoped: which class they're teaching right now. */
  activeLevel: "active-level",
  /** Session-scoped: Explore's filters, so they survive a look at an activity. */
  exploreFilters: "explore-filters",
  /** Session-scoped: Explore's scroll offset, for the same round trip. */
  exploreScroll: "explore-scroll",
  /** Session-scoped: the random greeting index shown on this visit's home screen. */
  homeGreeting: "home-greeting",
  /** Closed the "add to home screen" banner — Settings keeps a permanent way in. */
  installPromptDismissed: "install-prompt-dismissed",
  /** Where a new teacher is in the guided tour, or absent once it's done. */
  walkthroughStep: "walkthrough-step",
} as const;

export type StorageKey = (typeof KEYS)[keyof typeof KEYS];
