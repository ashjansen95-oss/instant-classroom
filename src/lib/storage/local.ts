import { STORAGE_PREFIX, type StorageAdapter } from "./adapter";

/**
 * localStorage, defensively. Every path can fail for real reasons — Safari
 * private mode throws on write, quota can be exceeded, and a half-written value
 * from a previous version will not parse. None of that should ever surface to a
 * teacher, so failures degrade to the fallback silently.
 */

function available(): boolean {
  try {
    return typeof window !== "undefined" && window.localStorage !== null;
  } catch {
    return false;
  }
}

export const localStorageAdapter: StorageAdapter = {
  get<T>(key: string, fallback: T): T {
    if (!available()) return fallback;
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw) as T;
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    if (!available()) return;
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      // Quota or private mode. The app keeps working, it just won't remember.
    }
  },

  remove(key: string): void {
    if (!available()) return;
    try {
      window.localStorage.removeItem(STORAGE_PREFIX + key);
    } catch {
      // Ignore.
    }
  },

  clear(): void {
    if (!available()) return;
    try {
      const ours = Object.keys(window.localStorage).filter((key) =>
        key.startsWith(STORAGE_PREFIX),
      );
      for (const key of ours) window.localStorage.removeItem(key);
    } catch {
      // Ignore.
    }
  },
};
