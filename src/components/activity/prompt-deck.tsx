"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { usePreferences } from "@/hooks/use-preferences";
import { useHydrated } from "@/hooks/use-stored-state";
import { vibrate } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { PromptBank } from "@/data/prompts";

/**
 * Ready-to-read content, one at a time.
 *
 * Swipe right-to-left to advance, left-to-right to go back. The prompt
 * slides in the swipe direction so the interaction feels physical.
 * Chevron buttons inside the card are the mouse/keyboard fallback.
 */

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Minimum horizontal px to count as a swipe. */
const SWIPE_THRESHOLD = 40;

export function PromptDeck({ bank }: { bank: PromptBank }) {
  const { preferences } = usePreferences();
  const [index, setIndex] = useState(0);
  const [manualOrder, setManualOrder] = useState<string[] | null>(null);

  // "entering-left" = new content sliding in from the right (after a forward swipe).
  // "entering-right" = new content sliding in from the left (after a backward swipe).
  const [animation, setAnimation] = useState<"entering-left" | "entering-right" | null>(null);

  // Swipe tracking.
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const swiping = useRef(false);
  const busy = useRef(false);

  const hydrated = useHydrated();
  const initialOrder = useMemo(
    () => (hydrated ? shuffle(bank.items) : bank.items),
    [hydrated, bank],
  );
  const order = manualOrder ?? initialOrder;

  const atEnd = index >= order.length - 1;
  const atStart = index === 0;

  const advance = useCallback(
    (direction: "forward" | "back") => {
      if (busy.current) return;
      if (direction === "back" && atStart) return;

      busy.current = true;
      vibrate("tap", preferences.haptics);

      // Update the index immediately so the new text renders.
      if (direction === "forward") {
        if (atEnd) {
          setManualOrder(shuffle(bank.items));
          setIndex(0);
        } else {
          setIndex((i) => i + 1);
        }
        setAnimation("entering-left");
      } else {
        setIndex((i) => i - 1);
        setAnimation("entering-right");
      }

      // Clear animation class after it plays.
      setTimeout(() => {
        setAnimation(null);
        busy.current = false;
      }, 150);
    },
    [atEnd, atStart, bank.items, preferences.haptics],
  );

  const next = useCallback(() => advance("forward"), [advance]);
  const prev = useCallback(() => advance("back"), [advance]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    swiping.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(touchDeltaX.current) > 10) {
      swiping.current = true;
    }
  };

  const onTouchEnd = () => {
    if (!swiping.current) return;
    // Right-to-left (negative delta) = next, left-to-right (positive) = prev.
    if (touchDeltaX.current < -SWIPE_THRESHOLD) next();
    else if (touchDeltaX.current > SWIPE_THRESHOLD) prev();
    swiping.current = false;
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

      <div
        className="mt-3 select-none overflow-hidden rounded-2xl border-2 border-line-strong bg-primary-soft p-5 shadow-[var(--shadow-rest)]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <p className="text-sm font-bold text-primary">{bank.label}</p>

        {/* Announced on change so a screen reader hears each new prompt. */}
        <p
          aria-live="polite"
          className={cn(
            "mt-2 font-display text-2xl leading-tight font-extrabold tracking-tight text-balance",
            animation === "entering-left" && "animate-slide-in-left",
            animation === "entering-right" && "animate-slide-in-right",
          )}
        >
          {order[index]}
        </p>

        {/* Swipe hint and inline navigation */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={atStart}
            aria-label="Previous prompt"
            className="grid size-9 place-items-center rounded-full text-primary transition-opacity disabled:opacity-20"
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>

          <p className="text-xs font-semibold text-primary/60">
            Swipe to browse
          </p>

          <button
            type="button"
            onClick={next}
            aria-label={atEnd ? "Shuffle and restart" : "Next prompt"}
            className="grid size-9 place-items-center rounded-full text-primary"
          >
            {atEnd ? (
              <RotateCcw aria-hidden className="size-4" />
            ) : (
              <ChevronRight aria-hidden className="size-5" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
