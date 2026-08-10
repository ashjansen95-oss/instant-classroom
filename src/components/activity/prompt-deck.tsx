"use client";

import { useState } from "react";
import { RotateCcw, ArrowRight } from "lucide-react";
import { usePreferences } from "@/hooks/use-preferences";
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
  const [order, setOrder] = useState(() => shuffle(bank.items));
  const [index, setIndex] = useState(0);

  const atEnd = index >= order.length - 1;

  const next = () => {
    vibrate("tap", preferences.haptics);
    if (atEnd) {
      // Reshuffle rather than dead-ending — the teacher is mid-activity.
      setOrder(shuffle(bank.items));
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
