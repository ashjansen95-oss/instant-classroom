"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TimerState = "idle" | "running" | "paused" | "finished";

/** Fast enough to look smooth, slow enough not to matter for battery. */
const TICK_MS = 200;

/**
 * A countdown driven by wall-clock time rather than by counting ticks. Phones
 * throttle or suspend timers the moment the screen locks or the tab hides, so
 * anything that accumulates elapsed intervals drifts badly. Storing the end
 * timestamp and subtracting means the timer is always correct on return.
 */
export function useTimer(durationSeconds: number, onComplete?: () => void) {
  const [state, setState] = useState<TimerState>("idle");
  const [remainingMs, setRemainingMs] = useState(durationSeconds * 1000);

  const endsAt = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // A new activity means a new timer. Adjusted during render rather than in an
  // effect — this is React's documented way to reset state on a prop change,
  // and it avoids a wasted render showing the previous activity's countdown.
  const [previousDuration, setPreviousDuration] = useState(durationSeconds);
  if (previousDuration !== durationSeconds) {
    setPreviousDuration(durationSeconds);
    setState("idle");
    setRemainingMs(durationSeconds * 1000);
    // `endsAt` is deliberately left alone — refs must not be touched during
    // render, and a stale value is harmless: it is only read while running, and
    // start/resume both overwrite it before that can happen.
  }

  useEffect(() => {
    if (state !== "running") return;

    const tick = () => {
      if (endsAt.current === null) return;
      const left = Math.max(0, endsAt.current - Date.now());
      setRemainingMs(left);

      if (left === 0) {
        setState("finished");
        endsAt.current = null;
        onCompleteRef.current?.();
      }
    };

    const interval = setInterval(tick, TICK_MS);
    // Catch up immediately when returning to a backgrounded tab.
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [state]);

  const start = useCallback(() => {
    endsAt.current = Date.now() + durationSeconds * 1000;
    setRemainingMs(durationSeconds * 1000);
    setState("running");
  }, [durationSeconds]);

  const pause = useCallback(() => {
    if (endsAt.current === null) return;
    setRemainingMs(Math.max(0, endsAt.current - Date.now()));
    endsAt.current = null;
    setState("paused");
  }, []);

  const resume = useCallback(() => {
    endsAt.current = Date.now() + remainingMs;
    setState("running");
  }, [remainingMs]);

  const reset = useCallback(() => {
    endsAt.current = null;
    setRemainingMs(durationSeconds * 1000);
    setState("idle");
  }, [durationSeconds]);

  const toggle = useCallback(() => {
    if (state === "running") pause();
    else if (state === "paused") resume();
    else start();
  }, [pause, resume, start, state]);

  const totalMs = durationSeconds * 1000;

  return {
    state,
    remainingSeconds: Math.ceil(remainingMs / 1000),
    /** 0 at the start, 1 when the time is up. */
    progress: totalMs === 0 ? 1 : 1 - remainingMs / totalMs,
    start,
    pause,
    resume,
    reset,
    toggle,
  };
}

/** Keeps the screen awake while a timer runs. Unsupported everywhere it isn't; that's fine. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) void lock.release();
        else sentinel = lock;
      } catch {
        // Denied or unavailable. The timer still works.
      }
    };

    void request();
    // The lock is dropped when the tab is hidden, so re-take it on return.
    const onVisible = () => {
      if (document.visibilityState === "visible") void request();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void sentinel?.release().catch(() => {});
    };
  }, [active]);
}
