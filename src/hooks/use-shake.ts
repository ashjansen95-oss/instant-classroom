"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ShakeSensitivity } from "./use-preferences";

/**
 * Shake detection via DeviceMotion.
 *
 * Deliberately conservative: a shake needs several sharp direction changes in
 * quick succession, so walking down a corridor with the phone in hand never
 * triggers one. Motion is always optional — every caller must work through a
 * button as well, and on desktop this hook simply reports "unsupported".
 */

export type MotionStatus =
  | "unsupported" // No DeviceMotion at all — desktop, mostly.
  | "needs-permission" // iOS 13+, waiting for a user gesture to ask.
  | "denied"
  | "listening";

/** Threshold in m/s² of change between samples. Lower is easier to trigger. */
const THRESHOLDS: Record<ShakeSensitivity, number> = {
  high: 12,
  medium: 18,
  low: 26,
};

/** Sharp movements needed inside the window before it counts as a deliberate shake. */
const REQUIRED_HITS = 3;
const WINDOW_MS = 800;
const COOLDOWN_MS = 1200;

interface DeviceMotionEventWithPermission {
  requestPermission?: () => Promise<PermissionState>;
}

function motionSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.DeviceMotionEvent === "undefined") return false;
  // Desktop Chrome exposes DeviceMotionEvent but will never fire one. Telling a
  // teacher on a laptop to "shake me" is just confusing, so require a touch
  // device before we offer it.
  return navigator.maxTouchPoints > 0;
}

function needsPermission(): boolean {
  const ctor = window.DeviceMotionEvent as unknown as DeviceMotionEventWithPermission;
  return typeof ctor?.requestPermission === "function";
}

/** What the user has said, as opposed to what the device can do. */
type PermissionChoice = "unasked" | "granted" | "denied";

const noopSubscribe = () => () => {};

/**
 * Capability is read through useSyncExternalStore rather than an effect: it's
 * browser-only state, and this avoids both a hydration mismatch and the
 * cascading render that setting it from an effect would cause.
 */
function useMotionCapability() {
  return useSyncExternalStore(
    noopSubscribe,
    () => (!motionSupported() ? "none" : needsPermission() ? "gated" : "open"),
    () => "none" as const,
  );
}

export function useShake({
  onShake,
  enabled = true,
  sensitivity = "medium",
}: {
  onShake: () => void;
  enabled?: boolean;
  sensitivity?: ShakeSensitivity;
}) {
  const capability = useMotionCapability();
  const [choice, setChoice] = useState<PermissionChoice>("unasked");
  const [shaking, setShaking] = useState(false);

  // Derived, never assigned from an effect.
  const status: MotionStatus =
    capability === "none"
      ? "unsupported"
      : choice === "denied"
        ? "denied"
        : capability === "gated" && choice === "unasked"
          ? "needs-permission"
          : "listening";

  // Refs so the listener never has to be torn down and rebuilt mid-shake.
  const onShakeRef = useRef(onShake);
  const thresholdRef = useRef(THRESHOLDS[sensitivity]);
  useEffect(() => {
    onShakeRef.current = onShake;
  }, [onShake]);
  useEffect(() => {
    thresholdRef.current = THRESHOLDS[sensitivity];
  }, [sensitivity]);

  useEffect(() => {
    if (status !== "listening" || !enabled) return;

    let last = { x: 0, y: 0, z: 0, at: 0 };
    let hits: number[] = [];
    let lastFired = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;

    const handle = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const { x = 0, y = 0, z = 0 } = acceleration as {
        x: number | null;
        y: number | null;
        z: number | null;
      };
      const now = Date.now();

      // Ignore the first sample; there's nothing to compare it against.
      if (last.at !== 0) {
        const elapsed = now - last.at;
        if (elapsed > 0) {
          const delta =
            Math.abs((x ?? 0) - last.x) +
            Math.abs((y ?? 0) - last.y) +
            Math.abs((z ?? 0) - last.z);

          if (delta > thresholdRef.current) {
            hits = [...hits.filter((at) => now - at < WINDOW_MS), now];

            setShaking(true);
            clearTimeout(settle);
            settle = setTimeout(() => setShaking(false), 400);

            if (hits.length >= REQUIRED_HITS && now - lastFired > COOLDOWN_MS) {
              lastFired = now;
              hits = [];
              onShakeRef.current();
            }
          }
        }
      }

      last = { x: x ?? 0, y: y ?? 0, z: z ?? 0, at: now };
    };

    window.addEventListener("devicemotion", handle);
    return () => {
      window.removeEventListener("devicemotion", handle);
      clearTimeout(settle);
    };
  }, [status, enabled]);

  /** Must be called from a user gesture — iOS rejects it otherwise. */
  const requestPermission = useCallback(async () => {
    if (!motionSupported()) return false;

    if (!needsPermission()) {
      setChoice("granted");
      return true;
    }

    try {
      const ctor = window.DeviceMotionEvent as unknown as DeviceMotionEventWithPermission;
      const result = await ctor.requestPermission!();
      const granted = result === "granted";
      setChoice(granted ? "granted" : "denied");
      return granted;
    } catch {
      setChoice("denied");
      return false;
    }
  }, []);

  return { status, shaking, requestPermission };
}
