"use client";

import { useEffect } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { usePreferences } from "@/hooks/use-preferences";
import { useTimer, useWakeLock } from "@/hooks/use-timer";
import { track } from "@/lib/analytics";
import { playChime } from "@/lib/chime";
import { vibrate } from "@/lib/haptics";
import type { Activity } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The timer IS the button — no separate card, no page takeover. Its own fill
 * drains left to right as the remaining time, in place of the "Start timer"
 * label it replaced. Tap to pause or resume; when it finishes, it shakes.
 */

function clock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function TimerButton({
  activity,
  size,
}: {
  activity: Activity;
  /** Matches the sizing the idle "Start timer" button used, so nothing jumps. */
  size: "xl" | "lg";
}) {
  const { preferences } = usePreferences();

  const timer = useTimer(activity.duration, () => {
    vibrate("done", preferences.haptics);
    playChime(preferences.sound);
    track("activity_completed", { id: activity.id });
  });

  useWakeLock(timer.state === "running");

  // Autostart: the teacher pressed "start timer", not "open a timer".
  useEffect(() => {
    timer.start();
    track("timer_started", { id: activity.id, duration: activity.duration });
    // Only ever on mount — restarting on every render would be a stopwatch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finished = timer.state === "finished";
  const paused = timer.state === "paused";

  // progress is 0 at the start and 1 once time is up — this is the inverse,
  // the share of the button that should still read as "remaining". No rounding
  // so the fill drains smoothly between ticks instead of jumping in steps.
  const remainingPercent = (1 - timer.progress) * 100;

  const handleClick = () => {
    if (finished) timer.start(); // tapping a finished timer runs it again
    else timer.toggle();
  };

  const label = finished
    ? `Time's up for ${activity.title}. Tap to run it again.`
    : paused
      ? `Timer paused at ${clock(timer.remainingSeconds)}. Tap to resume.`
      : `${clock(timer.remainingSeconds)} remaining on the timer. Tap to pause.`;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className={cn(
        "relative isolate w-full overflow-hidden rounded-2xl border-2 border-line-strong",
        "font-display font-bold tracking-tight text-primary-ink select-none",
        "shadow-[var(--shadow-rest)] -translate-y-0.5 transition-transform duration-100",
        "active:shadow-[var(--shadow-press)] active:translate-y-0",
        size === "xl" ? "min-h-16 text-xl" : "min-h-14 text-lg",
        finished && "animate-wiggle",
      )}
    >
      {/* The drained base sits under everything; the remaining-time fill sits
          on top, anchored to the right so it's the *left* edge that recedes
          as time passes — draining left to right. */}
      <span aria-hidden className="absolute inset-0 bg-primary-hover" />
      <span
        aria-hidden
        className="absolute inset-y-0 right-0 bg-primary transition-[width] duration-[250ms] ease-linear"
        style={{ width: `${finished ? 0 : remainingPercent}%` }}
      />

      <span className="relative z-10 flex items-center justify-center gap-2 tabular-nums">
        {finished ? (
          <>
            <RotateCcw aria-hidden className="size-5" />
            TIME! — run it again
          </>
        ) : (
          <>
            {paused ? (
              <Play aria-hidden className="size-5" />
            ) : (
              <Pause aria-hidden className="size-5" />
            )}
            {clock(timer.remainingSeconds)}
          </>
        )}
      </span>

      {/* Announced rather than only shown, and only at the points that matter. */}
      <span aria-live="assertive" className="sr-only">
        {finished ? "Time's up" : paused ? "Timer paused" : ""}
      </span>
    </button>
  );
}
