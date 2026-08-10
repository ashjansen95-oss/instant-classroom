"use client";

import { Smartphone } from "lucide-react";
import type { MotionStatus } from "@/hooks/use-shake";
import { cn } from "@/lib/utils";

/**
 * The dominant element on the home screen. It is a plain button first and a
 * shake target second — motion is a bonus, never a requirement.
 */
export function ShakePad({
  onTrigger,
  status,
  shaking,
  busy,
}: {
  onTrigger: () => void;
  status: MotionStatus;
  shaking: boolean;
  busy: boolean;
}) {
  const canShake = status === "listening";

  return (
    <div className="relative">
      {canShake && !busy && (
        <span
          aria-hidden
          className="animate-pulse-ring absolute inset-0 rounded-3xl border-2 border-primary"
        />
      )}

      <button
        type="button"
        onClick={onTrigger}
        aria-label={canShake ? "Shake your phone or tap for an activity" : "Get an activity"}
        className={cn(
          "relative flex w-full flex-col items-center justify-center gap-2 rounded-3xl",
          "min-h-44 border-2 border-line-strong bg-primary px-6 py-8 text-primary-ink",
          "shadow-[0_6px_0_0_var(--line-strong)] -translate-y-1",
          "transition-transform duration-100",
          "active:translate-y-0 active:shadow-[0_2px_0_0_var(--line-strong)]",
          (shaking || busy) && "animate-wiggle",
        )}
      >
        <Smartphone aria-hidden className="size-9" strokeWidth={2.5} />
        <span className="font-display text-3xl leading-none font-extrabold tracking-tight">
          {busy ? "Finding…" : canShake ? "SHAKE ME" : "GIVE ME ONE"}
        </span>
        <span className="text-sm font-semibold opacity-90">
          {canShake ? "or just tap" : "tap for an activity"}
        </span>
      </button>
    </div>
  );
}
