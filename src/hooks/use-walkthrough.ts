"use client";

import { useCallback } from "react";
import { KEYS } from "@/lib/storage";
import { useStoredState } from "./use-stored-state";

/**
 * The guided tour that replaces onboarding's old "fire an activity and hope
 * that was self-explanatory" finish. Two screens, seven stops:
 *
 *   Home:      tile → more → surprise  (narrated, then "now you try")
 *   Activity:  card → another → feedback → save
 *
 * Persisted (not session-scoped) so a teacher who gets interrupted mid-tour
 * and reopens the app later resumes exactly where they left off, rather than
 * silently losing the rest of it — the same durability `onboarded` itself
 * gets. `null` covers both "never started" and "finished/skipped"; nothing
 * downstream needs to tell those apart; both just mean "show nothing".
 */
export type WalkthroughStep = "tile" | "more" | "surprise" | "card" | "another" | "feedback" | "save" | null;

const ORDER: Exclude<WalkthroughStep, null>[] = ["tile", "more", "surprise", "card", "another", "feedback", "save"];

/** True for the three home-screen stops — the ones where real taps advance the tour. */
export function isHomeStep(step: WalkthroughStep): boolean {
  return step === "tile" || step === "more" || step === "surprise";
}

export function useWalkthrough() {
  const [step, setStep, hydrated] = useStoredState<WalkthroughStep>(KEYS.walkthroughStep, null);

  const start = useCallback(() => setStep("tile"), [setStep]);

  const next = useCallback(() => {
    setStep((current) => {
      if (current === null) return current;
      const after = ORDER[ORDER.indexOf(current) + 1];
      return after ?? null;
    });
  }, [setStep]);

  const finish = useCallback(() => setStep(null), [setStep]);

  return { step, hydrated, start, next, finish };
}
