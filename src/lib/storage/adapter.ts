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
  onboarded: "onboarded",
  motionPermission: "motion-permission",
} as const;

export type StorageKey = (typeof KEYS)[keyof typeof KEYS];
