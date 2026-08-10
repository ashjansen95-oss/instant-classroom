import { localStorageAdapter as storage } from "./local";

/**
 * A tiny reactive layer over the storage adapter.
 *
 * Two things make this worth having over `useState` + an effect. First, every
 * component reading a key sees the same value, so favouriting on the activity
 * screen updates the Favourites tab without a reload. Second, snapshots are
 * cached by reference, which is what `useSyncExternalStore` requires — and that
 * hook is the correct way to read browser-only state without cascading renders
 * or hydration mismatches.
 */

const cache = new Map<string, unknown>();
const defaults = new Map<string, unknown>();
const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

export function readKey<T>(key: string, fallback: T): T {
  // The first fallback seen for a key wins, so the server snapshot stays
  // referentially stable across renders even when callers pass a fresh literal.
  if (!defaults.has(key)) defaults.set(key, fallback);

  if (!cache.has(key)) cache.set(key, storage.get<T>(key, defaults.get(key) as T));
  return cache.get(key) as T;
}

export function serverSnapshot<T>(key: string, fallback: T): T {
  if (!defaults.has(key)) defaults.set(key, fallback);
  return defaults.get(key) as T;
}

export function writeKey<T>(key: string, value: T): void {
  cache.set(key, value);
  storage.set(key, value);
  emit();
}

/** Called after Settings wipes everything, so open screens reflect it immediately. */
export function resetStore(): void {
  cache.clear();
  emit();
}
