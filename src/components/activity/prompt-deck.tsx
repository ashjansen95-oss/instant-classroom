"use client";

import { useMemo, useState } from "react";
import { RotateCcw, ArrowRight } from "lucide-react";
import { usePreferences } from "@/hooks/use-preferences";
import { useHydrated } from "@/hooks/use-stored-state";
import { vibrate } from "@/lib/haptics";
import type { PromptBank } from "@/data/prompts";

/**
 * Ready-to-read content, one at a time.
 *
 * This is what turns "run Would You Rather" into something a teacher can
 * actually do with no notice: they read what's on screen, tap, read the next
 * one. Shuffled per visit so the same class doesn't get the same order twice.
 */

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function PromptDeck({ bank }: { bank: PromptBank }) {
  const { preferences } = usePreferences();
  const [index, setIndex] = useState(0);
  // Set directly by "Shuffle and go again" — a real click, not an effect —
  // and takes over from the hydration-gated order below once it exists.
  const [manualOrder, setManualOrder] = useState<string[] | null>(null);

  // Every activity page is statically pre-rendered, so a shuffle picked
  // during the very first render would bake one order into the static HTML
  // and draw a different one on the client's hydration pass — a near-certain
  // hydration mismatch (1-in-n! odds of matching), which is exactly what was
  // sending teachers back to Home: React discards the mismatched tree, and
  // whatever recovers from that is indistinguishable from just landing on
  // the wrong page. Order stays deterministic — the bank's own order,
  // identical on server and client — until hydration is confirmed live.
  const hydrated = useHydrated();
  const initialOrder = useMemo(
    () => (hydrated ? shuffle(bank.items) : bank.items),
    [hydrated, bank],
  );
  const order = manualOrder ?? initialOrder;

  const atEnd = index >= order.length - 1;

  const next = () => {
    vibrate("tap", preferences.haptics);
    if (atEnd) {
      // Reshuffle rather than dead-ending — the teacher is mid-activity.
      setManualOrder(shuffle(bank.items));
      setIndex(0);
    } else {
      setIndex((current) => current + 1);
    }
  };

  return (
    <section aria-labelledby="prompts-heading" className="mt-7">
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="prompts-heading"
          className="font-display text-sm font-bold tracking-wide text-ink-muted uppercase"
        >
          Read these out
        </h2>
        <p className="text-xs font-semibold tabular-nums text-ink-faint">
          {index + 1} / {order.length}
        </p>
      </div>

      <div className="mt-3 rounded-2xl border-2 border-line-strong bg-primary-soft p-5 shadow-[var(--shadow-rest)]">
        <p className="text-sm font-bold text-primary">{bank.label}</p>

        {/* Announced on change so a screen reader hears each new prompt. */}
        <p
          aria-live="polite"
          className="mt-2 font-display text-2xl leading-tight font-extrabold tracking-tight text-balance"
        >
          {order[index]}
        </p>
      </div>

      <button
        type="button"
        onClick={next}
        className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-line-strong bg-surface font-display text-lg font-bold shadow-[var(--shadow-rest)] -translate-y-0.5 transition-transform duration-100 active:translate-y-0 active:shadow-[var(--shadow-press)]"
      >
        {atEnd ? (
          <>
            <RotateCcw aria-hidden className="size-5" />
            Shuffle and go again
          </>
        ) : (
          <>
            Next
            <ArrowRight aria-hidden className="size-5" />
          </>
        )}
      </button>
    </section>
  );
}
