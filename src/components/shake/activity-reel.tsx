"use client";

import { useEffect, useRef, useState } from "react";
import { ACTIVITIES } from "@/data/activities";
import { usePreferences } from "@/hooks/use-preferences";
import { vibrate } from "@/lib/haptics";
import { ENERGY_LABELS, formatDuration } from "@/lib/labels";
import type { Activity } from "@/lib/types";

/**
 * The slot-machine reveal. The winner is already decided before this mounts —
 * the reel is showmanship, not a search — so it can never be slower than the
 * animation and never fails to land.
 */

const ROW_HEIGHT = 92;
const DECOYS = 18;
const SPIN_MS = 1150;

function buildReel(winner: Activity): Activity[] {
  const pool = ACTIVITIES.filter((activity) => activity.id !== winner.id);
  const decoys: Activity[] = [];

  for (let i = 0; i < DECOYS; i++) {
    decoys.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  return [...decoys, winner];
}

export function ActivityReel({
  activity,
  onLand,
}: {
  activity: Activity;
  onLand: () => void;
}) {
  const { preferences } = usePreferences();
  const [rows] = useState(() => buildReel(activity));
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState(false);
  const landedRef = useRef(false);
  const landRef = useRef<() => void>(undefined);

  useEffect(() => {
    // Kick the transition off on the frame after mount, so the browser has a
    // starting transform to animate away from.
    const frame = requestAnimationFrame(() => setSpinning(true));

    const land = () => {
      if (landedRef.current) return;
      landedRef.current = true;
      setLanded(true);
      vibrate("reveal", preferences.haptics);
      // A short beat on the winner before the activity screen takes over.
      setTimeout(onLand, 260);
    };

    // transitionend is the signal; the timer is the safety net for the cases
    // where it never fires (backgrounded tab, interrupted animation).
    const timer = setTimeout(land, SPIN_MS + 60);
    landRef.current = land;

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [onLand, preferences.haptics]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={landed ? `Your activity: ${activity.title}` : "Finding something good"}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper/95 px-5 backdrop-blur-sm"
    >
      <p className="font-display text-sm font-bold tracking-[0.2em] text-primary uppercase">
        {landed ? "Here you go" : "Finding something good…"}
      </p>

      <div
        className="relative mt-6 w-full max-w-sm overflow-hidden rounded-3xl border-2 border-line-strong bg-surface shadow-[var(--shadow-rest)]"
        style={{ height: ROW_HEIGHT }}
      >
        <div
          onTransitionEnd={() => landRef.current?.()}
          style={{
            transform: `translate3d(0, ${spinning ? -(rows.length - 1) * ROW_HEIGHT : 0}px, 0)`,
            transition: spinning
              ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.72, 0.16, 1)`
              : undefined,
          }}
        >
          {rows.map((row, index) => (
            <div
              key={`${row.id}-${index}`}
              className="flex flex-col items-center justify-center gap-1 px-4 text-center"
              style={{ height: ROW_HEIGHT }}
            >
              <span className="font-display text-xl leading-tight font-extrabold tracking-tight text-balance">
                {row.title}
              </span>
              <span className="text-xs font-semibold text-ink-faint">
                ⏱ {formatDuration(row.duration)} · ⚡ {ENERGY_LABELS[row.energy]}
              </span>
            </div>
          ))}
        </div>

        {/* Fades the rows in and out at the window edges, which is what sells
            it as a physical reel rather than a scrolling list. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, var(--surface) 0%, transparent 22%, transparent 78%, var(--surface) 100%)",
          }}
        />
      </div>

      <div
        aria-hidden
        className={`mt-6 h-1.5 w-16 rounded-full transition-colors duration-200 ${
          landed ? "bg-primary" : "bg-line"
        }`}
      />
    </div>
  );
}
