"use client";

import { useEffect, useSyncExternalStore } from "react";
import { KEYS } from "@/lib/storage";
import { sessionStore } from "@/lib/storage/store";
import { useHydrated } from "./use-stored-state";
import { useName } from "./use-name";

/**
 * Prompt pool for the home-screen heading. Entries with `{{name}}` are
 * personalised; the rest are generic. Roughly 30 % of prompts contain the
 * name (6 out of 20), so a uniform random pick gives the right distribution
 * without any weighted-bucket logic.
 */
const PROMPTS: string[] = [
  "What do you need, {{name}}?",
  "What are you looking for?",
  "What can I help with?",
  "What do you feel like doing?",
  "What are we doing today, {{name}}?",
  "What's the plan, {{name}}?",
  "What's on the agenda?",
  "What should we do, {{name}}?",
  "What are we getting into?",
  "What's the vibe?",
  "What'll it be?",
  "What are you after?",
  "Need a quick activity?",
  "Ready for something fun, {{name}}?",
  "What can I sort for you, {{name}}?",
  "What do you need right now?",
  "Need a classroom idea?",
  "What does your class need?",
  "What can we get your class doing?",
  "Let's find something for your class.",
];

/** Fall back to the original static heading before a prompt is picked. */
const FALLBACK = "What do you need?";

function resolveGreeting(index: number | null, name: string): string {
  if (index === null || index < 0 || index >= PROMPTS.length) return FALLBACK;

  const template = PROMPTS[index];

  // If the prompt needs a name but we don't have one (e.g. a migrated user
  // who onboarded before this feature), fall back to a safe generic prompt.
  if (template.includes("{{name}}")) {
    if (!name) return FALLBACK;
    return template.replace(/\{\{name\}\}/g, name);
  }

  return template;
}

/**
 * Returns a random greeting for the home screen that stays stable for the
 * entire session (tab lifetime). A new greeting is picked only when the
 * teacher opens the app fresh.
 *
 * The random pick lives in a `useEffect` — never during render — so the
 * React-compiler purity rule and SSR hydration are both happy. Before the
 * effect fires the fallback heading shows; afterwards the chosen prompt
 * replaces it via the reactive session store.
 */
export function useHomeGreeting(): string {
  const hydrated = useHydrated();
  const { name } = useName();

  // Read the session-stored index reactively so it survives re-renders.
  const storedIndex = useSyncExternalStore(
    sessionStore.subscribe,
    () => sessionStore.readKey<number | null>(KEYS.homeGreeting, null),
    () => null,
  );

  // Seed the session store once per tab lifetime. The effect only fires when
  // no index exists yet, so subsequent renders and re-mounts are no-ops.
  useEffect(() => {
    const existing = sessionStore.readKey<number | null>(KEYS.homeGreeting, null);
    if (existing !== null && existing >= 0 && existing < PROMPTS.length) return;
    sessionStore.writeKey(KEYS.homeGreeting, Math.floor(Math.random() * PROMPTS.length));
  }, []);

  if (!hydrated) return FALLBACK;

  return resolveGreeting(storedIndex, name);
}
