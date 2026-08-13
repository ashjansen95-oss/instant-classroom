"use client";

import { useCallback } from "react";
import { KEYS } from "@/lib/storage";
import { useStoredState } from "./use-stored-state";

/**
 * The teacher's first name, collected during onboarding and persisted across
 * sessions. Available to any component that needs it — the home screen uses
 * it to personalise the greeting.
 */
export function useName() {
  const [name, setNameRaw, hydrated] = useStoredState<string>(KEYS.name, "");

  const setName = useCallback(
    (value: string) => setNameRaw(value.trim()),
    [setNameRaw],
  );

  return { name, setName, hydrated } as const;
}
