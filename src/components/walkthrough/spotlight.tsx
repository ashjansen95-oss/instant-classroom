"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface Layout {
  hole: { top: number; left: number; width: number; height: number };
  placeBelow: boolean;
  viewportWidth: number;
  viewportHeight: number;
}

interface CalloutRect {
  top: number;
  left: number;
}

const HOLE_PADDING = 8;
const CALLOUT_GAP = 12;
const VIEWPORT_MARGIN = 12;
/** Below the fold's a fair bet once there's less than this much room left. */
const MIN_ROOM = 180;

/**
 * A single stop on the guided tour: dims everything except one real element
 * (found by `selector`, not a ref — the target lives in whichever screen
 * mounts this, sometimes nested a couple of components deep) and floats a
 * callout near it. The element itself stays fully interactive throughout —
 * the dimmed backdrop is decorative box-shadow, not a click-blocking layer —
 * so a teacher who acts on it before reading a word never hits a dead click.
 * Tapping anywhere else on the dimmed area advances the tour too, same as
 * pressing Next, for a teacher who doesn't notice the button.
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
  const [calloutRect, setCalloutRect] = useState<CalloutRect | null>(null);
  const calloutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only worth attempting once per mount — after that, the scroll
    // listener below is what keeps the hole in sync as the page moves.
    let hasScrolledIntoView = false;

    const measure = () => {
      const el = document.querySelector(selector);
      if (!el) {
        setLayout(null);
        return;
      }
      if (!hasScrolledIntoView) {
        hasScrolledIntoView = true;
        // A target scrolled out of view would otherwise anchor the callout
        // to a hole that isn't actually on screen — bring it fully into
        // view first; the scroll listener below keeps measuring as it does.
        const startRect = el.getBoundingClientRect();
        if (startRect.top < 0 || startRect.bottom > window.innerHeight) {
          el.scrollIntoView({ block: "center", behavior: "smooth" });
        }
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
      setLayout({
        hole,
        placeBelow: spaceBelow >= MIN_ROOM || hole.top < spaceBelow,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });
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

  // `placeBelow` above is only a guess at which side has more room, based on
  // an assumed callout size. This corrects both axes against the callout's
  // *actual* rendered box once it exists, clamped to stay fully on screen —
  // so a long description, or a narrow phone, can never push the card itself
  // past an edge. Runs before paint, so the one-frame estimate below is never
  // actually visible.
  useLayoutEffect(() => {
    if (!layout || !calloutRef.current) return;
    const { offsetWidth: width, offsetHeight: height } = calloutRef.current;

    const rawTop = layout.placeBelow
      ? layout.hole.top + layout.hole.height + CALLOUT_GAP
      : layout.hole.top - CALLOUT_GAP - height;
    const maxTop = Math.max(VIEWPORT_MARGIN, layout.viewportHeight - height - VIEWPORT_MARGIN);
    const top = Math.min(Math.max(rawTop, VIEWPORT_MARGIN), maxTop);

    const rawLeft = (layout.viewportWidth - width) / 2;
    const maxLeft = Math.max(VIEWPORT_MARGIN, layout.viewportWidth - width - VIEWPORT_MARGIN);
    const left = Math.min(Math.max(rawLeft, VIEWPORT_MARGIN), maxLeft);

    setCalloutRect({ top, left });
  }, [layout]);

  if (!layout) return null;
  const { hole, viewportWidth, viewportHeight } = layout;
  // Falls back to a rough guess for the one frame before the layout effect
  // above has measured the callout's real size — see its comment.
  const rect = calloutRect ?? { top: hole.top + hole.height + CALLOUT_GAP, left: VIEWPORT_MARGIN };

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {/* Tapping anywhere outside the card also advances the tour — four
          strips that tile the screen around the hole, rather than one
          element over the whole viewport, so the real target underneath
          the hole keeps receiving its own taps exactly as before. */}
      {onNext && (
        <>
          <div
            aria-hidden
            data-testid="spotlight-scrim"
            onClick={onNext}
            className="pointer-events-auto absolute"
            style={{ top: 0, left: 0, width: viewportWidth, height: Math.max(0, hole.top) }}
          />
          <div
            aria-hidden
            data-testid="spotlight-scrim"
            onClick={onNext}
            className="pointer-events-auto absolute"
            style={{
              top: hole.top + hole.height,
              left: 0,
              width: viewportWidth,
              height: Math.max(0, viewportHeight - (hole.top + hole.height)),
            }}
          />
          <div
            aria-hidden
            data-testid="spotlight-scrim"
            onClick={onNext}
            className="pointer-events-auto absolute"
            style={{ top: hole.top, left: 0, width: Math.max(0, hole.left), height: hole.height }}
          />
          <div
            aria-hidden
            data-testid="spotlight-scrim"
            onClick={onNext}
            className="pointer-events-auto absolute"
            style={{
              top: hole.top,
              left: hole.left + hole.width,
              width: Math.max(0, viewportWidth - (hole.left + hole.width)),
              height: hole.height,
            }}
          />
        </>
      )}

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
          boxShadow: "0 0 0 9999px var(--spotlight-overlay)",
        }}
      />

      <div
        ref={calloutRef}
        role="status"
        aria-live="polite"
        // Positioned in plain top/left pixels rather than left:50% + a
        // centering transform: `animate-rise-in` below is a CSS keyframe
        // animation that also sets `transform`, and a running (or
        // fill:both-held) animation's transform value overrides an inline
        // one on the same property outright — the centering silently never
        // applied, and the card sat pinned to the left edge of its 50%
        // offset instead, hanging off the right of the screen on anything
        // narrower than its max width.
        className="animate-rise-in pointer-events-auto absolute w-[calc(100%-2.5rem)] max-w-sm rounded-2xl border-2 border-line-strong bg-surface p-4 shadow-[var(--shadow-rest)]"
        style={{ top: rect.top, left: rect.left }}
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
