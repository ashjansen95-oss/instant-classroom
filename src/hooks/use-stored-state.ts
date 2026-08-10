"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readKey, serverSnapshot, subscribe, writeKey } from "@/lib/storage/store";

/**
 * State backed by localStorage and shared across every component reading the
 * same key. Server and hydration renders see the fallback; the real value
 * arrives on the first client render.
 */
export function useStoredState<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => readKey<T>(key, fallback),
    () => serverSnapshot<T>(key, fallback),
  );

  const update = useCallback(
    (next: T | ((current: T) => T)) => {
      const current = readKey<T>(key, fallback);
      writeKey(key, typeof next === "function" ? (next as (c: T) => T)(current) : next);
    },
    // `fallback` is only ever the initial value for a key; the store keeps the
    // first one it sees, so a fresh literal each render is harmless.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  const hydrated = useHydrated();

  return [value, update, hydrated] as const;
}

const alwaysTrue = () => true;
const alwaysFalse = () => false;
const noopSubscribe = () => () => {};

/** False on the server and during hydration, true once the client is live. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, alwaysTrue, alwaysFalse);
}
