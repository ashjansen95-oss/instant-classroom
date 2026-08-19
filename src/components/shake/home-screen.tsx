"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Spotlight } from "@/components/walkthrough/spotlight";
import { useActivityPicker } from "@/hooks/use-activity-picker";
import { useFavourites } from "@/hooks/use-favourites";
import { useHomeGreeting } from "@/hooks/use-home-greeting";
import { usePreferences } from "@/hooks/use-preferences";
import { useShake } from "@/hooks/use-shake";
import { isHomeStep, useWalkthrough } from "@/hooks/use-walkthrough";
import { track } from "@/lib/analytics";
import { Page } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { EMPTY_FILTERS, NEEDS, type Category, type Need, type Subject } from "@/lib/types";
import { ActivityReel } from "./activity-reel";
import { InstallPrompt } from "./install-prompt";
import { IntentGrid } from "./intent-grid";
import { LevelSwitcher } from "./level-switcher";
import { MoreSheet } from "./more-sheet";
import { Onboarding } from "./onboarding";
import { Recommendations } from "./recommendations";
import { ShakePad } from "./shake-pad";

/**
 * The whole home screen, and the one interaction that matters:
 * tap what you need → the existing reel plays → an activity lands. There is
 * no intermediate "selected" state and no separate generate step — the six
 * intent tiles, "More", and the Surprise Me pad all funnel through this one
 * `pick()` call, exactly like the shake gesture always has.
 */
export function HomeScreen() {
  const { preferences } = usePreferences();
  const { pick, prefetch, complete, pending, busy } = useActivityPicker();
  const { ids: favouriteIds } = useFavourites();
  const [moreOpen, setMoreOpen] = useState(false);
  const walkthrough = useWalkthrough();
  const greeting = useHomeGreeting();

  // During the guided tour, tapping a real element on the home screen
  // advances to the next tour stop rather than firing the app's actual
  // functionality — with one exception: the "surprise" stop is the "now
  // you try" moment, so the real pick fires there and navigates to the
  // activity screen where the remaining tour stops (card, another,
  // feedback, save) are waiting. Returns true when the tap was consumed
  // by the tour and callers should bail out, false otherwise.
  const advanceIfTouring = (): boolean => {
    const current = walkthrough.step;
    if (!isHomeStep(current)) return false;
    walkthrough.next();
    // On the surprise stop the teacher *should* fire a real pick —
    // that's how they get to the activity screen for the remaining
    // tour stops. On tile/more, block real functionality.
    return current !== "surprise";
  };

  const { status, shaking, requestPermission } = useShake({
    onShake: () => {
      if (advanceIfTouring()) return;
      pick("surprise", "shake");
    },
    enabled: preferences.shakeEnabled && !busy,
    sensitivity: preferences.shakeSensitivity,
  });

  useEffect(() => {
    track("page_view", { path: "/" });
  }, []);

  // Every candidate a tap could land on is worth warming — there's no single
  // "current" need to prefetch around any more, and the routes are static, so
  // this is cheap. Keeps the core promise ("works when the wifi doesn't")
  // even now that the first tap fires generation immediately.
  useEffect(() => {
    for (const need of NEEDS) prefetch(need);
  }, [prefetch]);

  // Home-screen shortcuts on an installed PWA (see manifest.ts — "Surprise
  // me", "Calm them down", "Wake them up") land here with `?need=` set. With
  // the old filter-then-press model that just preselected a tile; now that a
  // tap *is* the request, the equivalent is firing the pick immediately. The
  // ref guards against StrictMode's double-invoke firing this twice, and the
  // URL is cleaned up straight after so Back or a refresh can't replay it.
  const router = useRouter();
  const requested = useSearchParams().get("need");
  const firedShortcut = useRef(false);
  useEffect(() => {
    if (firedShortcut.current || !requested || !NEEDS.includes(requested as Need)) return;
    firedShortcut.current = true;
    pick(requested as Need, "button");
    router.replace("/");
    // Deliberately once, off the URL param present at mount — not every
    // render, and not re-armed by anything pick/router themselves do.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested]);

  const onMoreSelect = (category: Category) => {
    setMoreOpen(false);
    if (advanceIfTouring()) return;
    pick("surprise", "button", { ...EMPTY_FILTERS, categories: [category] });
  };

  const onMoreSelectSubject = (subject: Subject) => {
    setMoreOpen(false);
    if (advanceIfTouring()) return;
    pick("surprise", "button", { ...EMPTY_FILTERS, subjects: [subject] });
  };

  return (
    <>
      <Onboarding onComplete={walkthrough.start} />
      {pending && <ActivityReel activity={pending.activity} onLand={complete} />}

      <Page className="flex flex-col">
        <header className="pt-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-xs font-bold tracking-[0.2em] text-primary uppercase">
              Instant Classroom
            </p>
            <LevelSwitcher />
          </div>
          <h1 className="mt-2 font-display text-[2rem] leading-[1.05] font-extrabold tracking-tight text-balance">
            {greeting}
          </h1>
        </header>

        <div className="mt-5">
          <IntentGrid
            onSelect={(need) => {
              if (advanceIfTouring()) return;
              pick(need, "button");
            }}
            busy={busy}
          />
        </div>

        <p className="mt-3 text-center">
          <button
            type="button"
            data-walkthrough="more"
            onClick={() => {
              if (advanceIfTouring()) return;
              setMoreOpen(true);
            }}
            disabled={busy}
            className="min-h-11 px-2 text-sm font-semibold text-ink-muted underline underline-offset-4 hover:text-ink disabled:opacity-60"
          >
            More…
          </button>
        </p>

        <div className="mt-6">
          <ShakePad
            onTrigger={() => {
              if (advanceIfTouring()) return;
              pick("surprise", "button");
            }}
            status={status}
            shaking={shaking}
            busy={busy}
          />
        </div>

        <div className="mt-4" />

        {status === "needs-permission" && preferences.shakeEnabled && (
          <div className="mt-1 rounded-2xl border-2 border-line bg-surface p-4 text-center">
            <p className="text-[0.9375rem] text-ink-muted text-pretty">
              Want to shake instead of tapping? Your phone needs to ask you first.
            </p>
            <Button variant="secondary" size="md" onClick={requestPermission} className="mt-3">
              Turn on shake
            </Button>
          </div>
        )}

        {status === "denied" && (
          <p className="mt-1 rounded-2xl border-2 border-line bg-surface p-4 text-center text-[0.9375rem] text-ink-muted text-pretty">
            Shake is switched off for this site. No worries — the button does exactly the same thing.
          </p>
        )}

        {status === "unsupported" && (
          <p className="mt-1 text-center text-[0.9375rem] text-ink-faint text-pretty">
            Shaking needs a phone. On a laptop, the button is your friend.
          </p>
        )}

        <InstallPrompt />

        <Recommendations favouriteIds={favouriteIds} />

        <p className="mt-auto pt-8 text-center text-sm text-ink-faint">
          <Link
            href="/explore"
            className="inline-block py-2 font-semibold underline underline-offset-4"
          >
            Browse all activities
          </Link>{" "}
          if you&rsquo;d rather choose yourself.
        </p>
      </Page>

      <MoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        onSelect={onMoreSelect}
        onSelectSubject={onMoreSelectSubject}
      />

      {/* Suppressed while the More sheet itself is open — a highlighted
          "More" button behind an already-open sheet just reads as confused,
          not helpful. */}
      {!moreOpen && walkthrough.step === "tile" && (
        <Spotlight
          key="tile"
          selector="[data-walkthrough='tile']"
          title="Tap what you need"
          description="Each tile is a shortcut — tap one and you'll get a matching activity straight away, no extra step."
          onNext={walkthrough.next}
          onSkip={walkthrough.finish}
        />
      )}
      {!moreOpen && walkthrough.step === "more" && (
        <Spotlight
          key="more"
          selector="[data-walkthrough='more']"
          title="Want something specific?"
          description="More has extra categories — writing, drama, riddles, team building, and more."
          onNext={walkthrough.next}
          onSkip={walkthrough.finish}
        />
      )}
      {!moreOpen && walkthrough.step === "surprise" && (
        <Spotlight
          key="surprise"
          selector="[data-walkthrough='surprise']"
          title="Or just say surprise me"
          description="Tap Surprise Me for something good, automatically matched to your class. Go on — give it a try!"
          onNext={() => {
            pick("surprise", "button");
            walkthrough.next();
          }}
          nextLabel="Let's go"
          onSkip={walkthrough.finish}
        />
      )}
    </>
  );
}
