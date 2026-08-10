"use client";

import { useEffect } from "react";
import { Pause, Play, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/hooks/use-preferences";
import { useTimer, useWakeLock } from "@/hooks/use-timer";
import { track } from "@/lib/analytics";
import { playChime } from "@/lib/chime";
import { vibrate } from "@/lib/haptics";
import type { Activity } from "@/lib/types";

function clock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const RING_RADIUS = 46;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function TimerOverlay({
  activity,
  onClose,
  onAnother,
}: {
  activity: Activity;
  onClose: () => void;
  onAnother: () => void;
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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === " ") {
        event.preventDefault();
        timer.toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, timer]);

  const finished = timer.state === "finished";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Timer for ${activity.title}`}
      className="fixed inset-0 z-50 flex flex-col bg-paper px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="grid size-12 place-items-center rounded-full text-ink-muted hover:bg-surface-sunk hover:text-ink"
        >
          <X aria-hidden className="size-6" />
          <span className="sr-only">Close timer</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <p className="text-center font-display text-lg font-bold text-ink-muted text-balance">
          {activity.title}
        </p>

        <div className="relative grid place-items-center">
          <svg viewBox="0 0 100 100" className="size-64 -rotate-90 sm:size-72" aria-hidden>
            <circle
              cx="50"
              cy="50"
              r={RING_RADIUS}
              fill="none"
              stroke="var(--surface-sunk)"
              strokeWidth="7"
            />
            <circle
              cx="50"
              cy="50"
              r={RING_RADIUS}
              fill="none"
              stroke={finished ? "var(--accent)" : "var(--primary)"}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * timer.progress}
              className="transition-[stroke-dashoffset] duration-200 ease-linear"
            />
          </svg>

          <div className="absolute inset-0 grid place-items-center">
            {finished ? (
              <p className="animate-pop-in font-display text-6xl font-extrabold tracking-tight text-accent">
                TIME!
              </p>
            ) : (
              <p className="font-display text-6xl font-extrabold tabular-nums tracking-tight">
                {clock(timer.remainingSeconds)}
              </p>
            )}
          </div>
        </div>

        {/* Announced rather than only shown, and only at the points that matter. */}
        <p aria-live="assertive" className="sr-only">
          {finished ? "Time's up" : timer.state === "paused" ? "Timer paused" : ""}
        </p>

        <p className="min-h-6 text-sm font-semibold text-ink-muted">
          {timer.state === "paused" ? "Paused" : finished ? "" : "Counting down"}
        </p>
      </div>

      <div className="mx-auto w-full max-w-sm space-y-3">
        {finished ? (
          <>
            <Button size="xl" fullWidth onClick={onAnother}>
              🔄 Another activity
            </Button>
            <Button variant="secondary" size="lg" fullWidth onClick={timer.start}>
              Run it again
            </Button>
          </>
        ) : (
          <div className="flex gap-3">
            <Button size="xl" fullWidth onClick={timer.toggle}>
              {timer.state === "running" ? (
                <>
                  <Pause aria-hidden className="size-6" /> Pause
                </>
              ) : (
                <>
                  <Play aria-hidden className="size-6" /> Resume
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              size="xl"
              onClick={timer.reset}
              aria-label="Reset timer"
              className="shrink-0"
            >
              <RotateCcw aria-hidden className="size-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
