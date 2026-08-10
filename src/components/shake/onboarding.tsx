"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CountryPicker } from "@/components/settings/country-picker";
import { useCountry } from "@/hooks/use-country";
import { useStoredState } from "@/hooks/use-stored-state";
import { KEYS } from "@/lib/storage";

/**
 * The entire onboarding. Shown once, dismissible, and never blocks use — a
 * teacher who ignores it still lands on a working generator.
 */
export function Onboarding() {
  const [onboarded, setOnboarded, hydrated] = useStoredState<boolean>(KEYS.onboarded, false);
  const { terminology, label } = useCountry();
  const [pickingCountry, setPickingCountry] = useState(false);

  // Held back until hydration so returning teachers never see it flash past.
  if (!hydrated || onboarded) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex flex-col justify-end bg-paper p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:justify-center"
    >
      <div className="animate-rise-in mx-auto w-full max-w-md">
        <p className="font-display text-sm font-bold tracking-[0.2em] text-primary uppercase">
          Instant Classroom
        </p>

        <h1
          id="onboarding-title"
          className="mt-3 font-display text-[2.75rem] leading-[0.95] font-extrabold tracking-tight text-balance"
        >
          Got 3 minutes to kill?
        </h1>

        <p className="mt-5 text-xl text-ink-muted text-pretty">
          Instant activities for teachers. No prep. No planning. Just shake.
        </p>

        <ul className="mt-7 space-y-3 text-[0.9375rem] text-ink-muted">
          <li className="flex gap-3">
            <span aria-hidden>📱</span>
            Shake your phone or tap the button.
          </li>
          <li className="flex gap-3">
            <span aria-hidden>⏱</span>
            Get something you can run right now.
          </li>
          <li className="flex gap-3">
            <span aria-hidden>🔒</span>
            No account. No student data. Works offline.
          </li>
        </ul>

        <Button size="xl" fullWidth onClick={() => setOnboarded(true)} className="mt-8" autoFocus>
          Shake for your first activity
        </Button>

        {/* One line, one tap, no extra step. Confirms we're using the right
            words for their country before they see their first activity. */}
        {pickingCountry ? (
          <div className="mt-5 max-h-[38dvh] overflow-y-auto rounded-2xl border-2 border-line p-3">
            <CountryPicker compact />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPickingCountry(true)}
            className="mt-5 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full text-sm text-ink-muted hover:text-ink"
          >
            <span aria-hidden>{terminology.flag}</span>
            {terminology.name} — we&rsquo;ll say &ldquo;{label(8)}&rdquo;.
            <span className="font-bold underline underline-offset-4">Change</span>
          </button>
        )}
      </div>
    </div>
  );
}
