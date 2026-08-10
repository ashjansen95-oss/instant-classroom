"use client";

import { useCallback } from "react";
import { KEYS } from "@/lib/storage";
import { useStoredState } from "./use-stored-state";

export type ShakeSensitivity = "low" | "medium" | "high";

export interface Preferences {
  sound: boolean;
  haptics: boolean;
  shakeEnabled: boolean;
  shakeSensitivity: ShakeSensitivity;
}

export const DEFAULT_PREFERENCES: Preferences = {
  sound: true,
  haptics: true,
  shakeEnabled: true,
  shakeSensitivity: "medium",
};

export function usePreferences() {
  const [stored, setStored, loaded] = useStoredState<Partial<Preferences>>(KEYS.preferences, {});

  // Merged with defaults so a preference added in a later version doesn't come
  // back undefined for existing users.
  const preferences: Preferences = { ...DEFAULT_PREFERENCES, ...stored };

  const setPreference = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      setStored((current) => ({ ...current, [key]: value }));
    },
    [setStored],
  );

  return { preferences, setPreference, loaded };
}
