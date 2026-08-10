"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useActivityPicker } from "@/hooks/use-activity-picker";
import { useFavourites } from "@/hooks/use-favourites";
import { usePreferences } from "@/hooks/use-preferences";
import { useShake } from "@/hooks/use-shake";
import { track } from "@/lib/analytics";
import { Page } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { NEEDS, type Need } from "@/lib/types";
import { ActivityReel } from "./activity-reel";
import { NeedGrid } from "./need-grid";
import { Onboarding } from "./onboarding";
import { Recommendations } from "./recommendations";
import { ShakePad } from "./shake-pad";

export function HomeScreen() {
  // Home-screen shortcuts on an installed PWA land here with a need preselected.
  const requested = useSearchParams().get("need");
  const [need, setNeed] = useState<Need>(
    NEEDS.includes(requested as Need) ? (requested as Need) : "surprise",
  );
  const { preferences } = usePreferences();
  const { pick, prefetch, complete, pending, busy } = useActivityPicker();
  const { ids: favouriteIds } = useFavourites();

  const { status, shaking, requestPermission } = useShake({
    onShake: () => pick(need, "shake"),
    enabled: preferences.shakeEnabled && !busy,
    sensitivity: preferences.shakeSensitivity,
  });

  useEffect(() => {
    track("page_view", { path: "/" });
  }, []);

  // Warm the routes this need could land on, so the reel lands on a page that
  // is already here — including when the wifi isn't.
  useEffect(() => {
    prefetch(need);
  }, [need, prefetch]);

  return (
    <>
      <Onboarding />
      {pending && <ActivityReel activity={pending.activity} onLand={complete} />}

      <Page className="flex flex-col">
        <header className="pt-2">
          <p className="font-display text-xs font-bold tracking-[0.2em] text-primary uppercase">
            Instant Classroom
          </p>
          <h1 className="mt-2 font-display text-[2rem] leading-[1.05] font-extrabold tracking-tight text-balance">
            What do you need?
          </h1>
        </header>

        <div className="mt-5">
          <NeedGrid value={need} onChange={setNeed} />
        </div>

        <div className="mt-7">
          <ShakePad
            onTrigger={() => pick(need, "button")}
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
    </>
  );
}
