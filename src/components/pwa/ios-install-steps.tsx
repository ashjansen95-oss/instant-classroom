import { Ellipsis, Share } from "lucide-react";
import type { IosBrowser } from "@/hooks/use-pwa-install";

/**
 * The exact steps to reach "Add to Home Screen" on iOS, which genuinely
 * differ by browser — confirmed against real devices, not assumed. Shared
 * between the Home banner and the Settings entry so the two can never drift
 * apart.
 */
export function IosInstallSteps({ browser }: { browser: IosBrowser }) {
  if (browser === "safari") {
    return (
      <>
        Tap <Ellipsis aria-hidden className="inline size-4 -translate-y-0.5" strokeWidth={2.5} />,
        then <Share aria-hidden className="inline size-4 -translate-y-0.5" strokeWidth={2.5} />,
        then &ldquo;View More,&rdquo; then &ldquo;Add to Home Screen.&rdquo;
      </>
    );
  }

  if (browser === "chrome") {
    return (
      <>
        Tap <Share aria-hidden className="inline size-4 -translate-y-0.5" strokeWidth={2.5} />,
        then &ldquo;View More,&rdquo; then &ldquo;Add to Home Screen.&rdquo;
      </>
    );
  }

  // Firefox, Edge and anything else on iOS: every browser there is under the
  // same Apple restriction, but the exact menu location isn't confirmed for
  // these specifically — safer to point at the general shape than guess.
  return <>Look for &ldquo;Add to Home Screen&rdquo; in your browser&rsquo;s share or menu options.</>;
}
