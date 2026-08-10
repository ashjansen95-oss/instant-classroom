/**
 * Vibration is a nice-to-have: iOS Safari doesn't support it at all, and every
 * caller must work identically without it.
 */

export type HapticPattern = "tap" | "shake" | "reveal" | "done";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  shake: [18, 40, 18],
  reveal: [12, 30, 26],
  done: [60, 90, 60, 90, 140],
};

export function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

export function vibrate(pattern: HapticPattern, enabled = true): void {
  if (!enabled || !canVibrate()) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    // Some browsers throw when vibration is blocked by user settings. Ignore.
  }
}
