"use client";

import { useCallback, useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { KEYS } from "@/lib/storage";
import { useStoredState } from "./use-stored-state";

/** The event Chrome/Edge/Android fire — not yet in lib.dom.d.ts. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's own flag — `display-mode: standalone` doesn't cover it there.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  // iPadOS 13+ reports as "Macintosh" but, unlike a real Mac, has touch points.
  const isIos = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIos && isSafari;
}

/**
 * "Add to home screen" support, which splits into two genuinely different
 * paths rather than one feature with two skins:
 *
 * Android, Chrome, Edge fire `beforeinstallprompt` and can be triggered from
 * our own button with a real accept/dismiss outcome. iOS Safari never fires
 * it — Apple's deliberate choice, not a gap — so that path can only ever be
 * "here's how", read off the screen, with no way to know if it was followed.
 *
 * Held back behind `hydrated` throughout: `matchMedia` and `navigator` are
 * browser-only and must never run during the render that has to match the
 * server, the exact bug already found once in this codebase (see
 * prompt-deck.tsx).
 */
export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed, hydrated] = useStoredState<boolean>(
    KEYS.installPromptDismissed,
    false,
  );

  useEffect(() => {
    const onPrompt = (event: Event) => {
      // Stops Chrome's own mini-infobar so our banner is the only one shown.
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    track("install_prompted", { outcome });
    // Spent either way — Chrome only ever lets a given prompt fire once.
    setDeferred(null);
  }, [deferred]);

  const dismiss = useCallback(() => {
    track("install_prompt_dismissed");
    setDismissed(true);
  }, [setDismissed]);

  const installed = hydrated && isStandalone();
  const canPromptNatively = deferred !== null;
  const needsManualIosSteps = hydrated && !installed && !canPromptNatively && isIosSafari();

  return {
    hydrated,
    installed,
    canPromptNatively,
    needsManualIosSteps,
    /** Whether there's anything at all worth showing a teacher. */
    installable: hydrated && !installed && (canPromptNatively || needsManualIosSteps),
    promptInstall,
    dismissed,
    dismiss,
  };
}
