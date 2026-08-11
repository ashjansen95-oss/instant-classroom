"use client";

import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IosInstallSteps } from "@/components/pwa/ios-install-steps";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { useStoredState } from "@/hooks/use-stored-state";
import { KEYS } from "@/lib/storage";

/**
 * A one-time nudge to add the app to the home screen. Gated on having gotten
 * at least one activity already (`KEYS.stats`, the same flag "first_activity"
 * uses) — asking before a teacher has seen any value is a much harder sell,
 * and the whole point of this app is not being pushy.
 */
export function InstallPrompt() {
  const {
    installable,
    installed,
    canPromptNatively,
    needsManualIosSteps,
    iosBrowser,
    promptInstall,
    dismissed,
    dismiss,
  } = usePwaInstall();
  const [hasFirstActivity] = useStoredState<boolean>(KEYS.stats, false);

  if (installed || dismissed || !installable || !hasFirstActivity) return null;

  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border-2 border-line bg-surface p-4">
      <span aria-hidden className="text-2xl leading-none">
        📲
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-display font-bold">Put this on your home screen</p>

        {needsManualIosSteps && iosBrowser ? (
          <p className="mt-1 text-sm text-ink-muted text-pretty">
            <IosInstallSteps browser={iosBrowser} />
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink-muted text-pretty">
              One tap, and it opens like any other app — no browser bar, no typing a URL.
            </p>
            {canPromptNatively && (
              <Button variant="secondary" size="md" className="mt-3" onClick={promptInstall}>
                <Download aria-hidden className="size-4" />
                Add to Home Screen
              </Button>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="-m-1 shrink-0 rounded-full p-1.5 text-ink-faint hover:text-ink"
      >
        <X aria-hidden className="size-5" />
      </button>
    </div>
  );
}
