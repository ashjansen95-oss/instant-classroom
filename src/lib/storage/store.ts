import { localStorageAdapter, sessionStorageAdapter } from "./local";
import type { StorageAdapter } from "./adapter";

/**
 * A tiny reactive layer over a storage adapter.
 *
 * Two things make this worth having over `useState` + an effect. First, every
 * component reading a key sees the same value, so favouriting on the activity
 * screen updates the Favourites tab without a reload. Second, snapshots are
 * cached by reference, which is what `useSyncExternalStore` requires — and that
 * hook is the correct way to read browser-only state without cascading renders
 * or hydration mismatches.
 */

export interface ReactiveStore {
  subscribe(listener: () => void): () => void;
  readKey<T>(key: string, fallback: T): T;
  serverSnapshot<T>(key: string, fallback: T): T;
  writeKey<T>(key: string, value: T): void;
  reset(): void;
}

function createStore(adapter: StorageAdapter): ReactiveStore {
  const cache = new Map<string, unknown>();
  const defaults = new Map<string, unknown>();
  const listeners = new Set<() => void>();

  const emit = () => {
    for (const listener of listeners) listener();
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    readKey<T>(key: string, fallback: T): T {
      // The first fallback seen for a key wins, so the server snapshot stays
      // referentially stable across renders even when callers pass a fresh
      // literal.
      if (!defaults.has(key)) defaults.set(key, fallback);
      if (!cache.has(key)) cache.set(key, adapter.get<T>(key, defaults.get(key) as T));
      return cache.get(key) as T;
    },

    serverSnapshot<T>(key: string, fallback: T): T {
      if (!defaults.has(key)) defaults.set(key, fallback);
      return defaults.get(key) as T;
    },

    writeKey<T>(key: string, value: T) {
      cache.set(key, value);
      adapter.set(key, value);
      emit();
    },

    reset() {
      cache.clear();
      emit();
    },
  };
}

/** Survives closing the app. Favourites, preferences, history. */
export const store = createStore(localStorageAdapter);

/**
 * Cleared when the tab closes. Used for the active teaching level: a teacher
 * switching to their Year 10 class for one lesson shouldn't have that stick
 * forever, but it must survive navigating between screens.
 */
export const sessionStore = createStore(sessionStorageAdapter);

// Kept as named exports so existing call sites read the same as before.
export const subscribe = store.subscribe;
export const readKey = store.readKey;
export const serverSnapshot = store.serverSnapshot;
export const writeKey = store.writeKey;

export function resetStore(): void {
  store.reset();
  sessionStore.reset();
}
