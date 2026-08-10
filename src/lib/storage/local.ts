import { STORAGE_PREFIX, type StorageAdapter } from "./adapter";

/**
 * localStorage, defensively. Every path can fail for real reasons — Safari
 * private mode throws on write, quota can be exceeded, and a half-written value
 * from a previous version will not parse. None of that should ever surface to a
 * teacher, so failures degrade to the fallback silently.
 */

function pick(kind: "local" | "session"): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function createAdapter(kind: "local" | "session"): StorageAdapter {
  return {
    get<T>(key: string, fallback: T): T {
      const storage = pick(kind);
      if (!storage) return fallback;
      try {
        const raw = storage.getItem(STORAGE_PREFIX + key);
        if (raw === null) return fallback;
        const parsed = JSON.parse(raw) as T;
        return parsed === null || parsed === undefined ? fallback : parsed;
      } catch {
        return fallback;
      }
    },

    set<T>(key: string, value: T): void {
      const storage = pick(kind);
      if (!storage) return;
      try {
        storage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      } catch {
        // Quota or private mode. The app keeps working, it just won't remember.
      }
    },

    remove(key: string): void {
      const storage = pick(kind);
      if (!storage) return;
      try {
        storage.removeItem(STORAGE_PREFIX + key);
      } catch {
        // Ignore.
      }
    },

    clear(): void {
      const storage = pick(kind);
      if (!storage) return;
      try {
        const ours = Object.keys(storage).filter((key) => key.startsWith(STORAGE_PREFIX));
        for (const key of ours) storage.removeItem(key);
      } catch {
        // Ignore.
      }
    },
  };
}

export const localStorageAdapter: StorageAdapter = createAdapter("local");

/** Same contract, but cleared when the tab closes. */
export const sessionStorageAdapter: StorageAdapter = createAdapter("session");
