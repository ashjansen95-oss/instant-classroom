"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Layout {
  hole: { top: number; left: number; width: number; height: number };
  placeBelow: boolean;
}

const HOLE_PADDING = 8;
const CALLOUT_GAP = 12;
/** Below the fold's a fair bet once there's less than this much room left. */
const MIN_ROOM = 180;

/**
 * A single stop on the guided tour: dims everything except one real element
 * (found by `selector`, not a ref — the target lives in whichever screen
 * mounts this, sometimes nested a couple of components deep) and floats a
 * callout near it. The element itself stays fully interactive throughout —
 * the dimmed backdrop is decorative box-shadow, not a click-blocking layer —
 * so a teacher who acts on it before reading a word never hits a dead click.
 *
 * Measured in an effect and stored in state rather than read during render:
 * `window`/`document` don't exist during the server pass this page also
 * gets, and this component is only ever mounted once a stored walkthrough
 * step confirms the client is live, but keeping every browser read inside
 * the effect means that stays true even if a future caller doesn't.
 */
export function Spotlight({
  selector,
  title,
  description,
  onNext,
  nextLabel = "Next →",
  onSkip,
}: {
  selector: string;
  title: string;
  description: string;
  /** Omitted for the "now you try" stop — no button, just narration, until
   *  the real element gets used for real. */
  onNext?: () => void;
  nextLabel?: string;
  /** Omitted on the final stop, where "Next" already ends the tour — a
   *  second, identically-acting "Skip tour" link next to it is just noise. */
  onSkip?: () => void;
}) {
  const [layout, setLayout] = useState<Layout | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector(selector);
      if (!el) {
        setLayout(null);
        return;
      }
      const box = el.getBoundingClientRect();
      const hole = {
        top: box.top - HOLE_PADDING,
        left: box.left - HOLE_PADDING,
        width: box.width + HOLE_PADDING * 2,
        height: box.height + HOLE_PADDING * 2,
      };
      const spaceBelow = window.innerHeight - (hole.top + hole.height);
      // Prefer below; flip above only when below is tight AND above has more
      // room, so a target hard against the bottom of a tall page still gets
      // a sensibly placed callout instead of being pinned off-screen.
      setLayout({ hole, placeBelow: spaceBelow >= MIN_ROOM || hole.top < spaceBelow });
    };

    measure();
    // Fonts/images can still be settling a frame after mount.
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [selector]);

  if (!layout) return null;
  const { hole, placeBelow } = layout;

  return (
    // pointer-events-none on the wrapper itself, not just the ring below —
    // a plain div with no pointer-events set still captures every click
    // across its whole box regardless of what's transparent or dimmed, so
    // without this the "hole" was a visual fiction: the real target one
    // pixel underneath it never actually received the tap. The callout
    // opts back into pointer-events-auto since it's the one part of this
    // that genuinely needs to be clickable.
    <div className="pointer-events-none fixed inset-0 z-40">
      {/* The dimmed backdrop with a cutout — a single element whose oversized
          box-shadow darkens everything outside its own bounds. */}
      <div
        aria-hidden
        className="animate-pop-in absolute rounded-2xl ring-2 ring-primary transition-[top,left,width,height] duration-200"
        style={{
          top: hole.top,
          left: hole.left,
          width: hole.width,
          height: hole.height,
          boxShadow: "0 0 0 9999px rgba(15, 13, 20, 0.6)",
        }}
      />

      <div
        role="status"
        aria-live="polite"
        className="animate-rise-in pointer-events-auto absolute w-[calc(100%-2.5rem)] max-w-sm rounded-2xl border-2 border-line-strong bg-surface p-4 shadow-[var(--shadow-rest)]"
        style={{
          left: "50%",
          ...(placeBelow
            ? { top: hole.top + hole.height + CALLOUT_GAP, transform: "translateX(-50%)" }
            : {
                top: Math.max(12, hole.top - CALLOUT_GAP),
                transform: "translate(-50%, -100%)",
              }),
        }}
      >
        <p className="font-display text-lg font-extrabold tracking-tight text-balance">{title}</p>
        <p className="mt-1.5 text-sm text-ink-muted text-pretty">{description}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          {onSkip ? (
            <button
              type="button"
              onClick={onSkip}
              className="min-h-9 rounded-full px-1 text-sm font-semibold text-ink-faint hover:text-ink"
            >
              Skip tour
            </button>
          ) : (
            <span />
          )}
          {onNext && (
            <Button size="sm" onClick={onNext} autoFocus>
              {nextLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
