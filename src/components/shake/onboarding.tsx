"use client";

import { Button } from "@/components/ui/button";
import { useStoredState } from "@/hooks/use-stored-state";
import { KEYS } from "@/lib/storage";

/**
 * The entire onboarding. Shown once, dismissible, and never blocks use — a
 * teacher who ignores it still lands on a working generator.
 */
export function Onboarding() {
  const [onboarded, setOnboarded, hydrated] = useStoredState<boolean>(KEYS.onboarded, false);

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
      </div>
    </div>
  );
}
