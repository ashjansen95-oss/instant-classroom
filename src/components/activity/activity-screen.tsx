"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, RefreshCw, ThumbsDown, ThumbsUp, Timer } from "lucide-react";
import { ActivityMeta } from "@/components/activity/activity-meta";
import { ActivityReel } from "@/components/shake/activity-reel";
import { TimerOverlay } from "@/components/timer/timer-overlay";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/ui/page";
import { useActivityPicker } from "@/hooks/use-activity-picker";
import { useFavourites } from "@/hooks/use-favourites";
import { useFeedback } from "@/hooks/use-activity-history";
import { usePreferences } from "@/hooks/use-preferences";
import { track } from "@/lib/analytics";
import { vibrate } from "@/lib/haptics";
import { CATEGORY_LABELS } from "@/lib/labels";
import { NEEDS, type Activity, type Need } from "@/lib/types";
import { cn } from "@/lib/utils";

function needFrom(value: string | null): Need {
  return NEEDS.includes(value as Need) ? (value as Need) : "surprise";
}

export function ActivityScreen({ activity }: { activity: Activity }) {
  const searchParams = useSearchParams();
  const need = needFrom(searchParams.get("need"));

  const [timerOpen, setTimerOpen] = useState(false);
  const { isFavourite, toggle } = useFavourites();
  const { feedback, submit } = useFeedback();
  const { preferences } = usePreferences();
  const { pick, prefetch, complete, pending, busy } = useActivityPicker();

  const favourited = isFavourite(activity.id);
  const currentFeedback = feedback[activity.id];

  useEffect(() => {
    track("activity_viewed", { id: activity.id, need });
  }, [activity.id, need]);

  // "Give me another" is the most-pressed button here, so warm its targets.
  useEffect(() => {
    prefetch(need);
  }, [need, prefetch]);

  const another = () => {
    setTimerOpen(false);
    track("activity_skipped", { id: activity.id });
    pick(need, "button");
  };

  const onFeedback = (value: "worked" | "flopped") => {
    submit(activity.id, value);
    vibrate("tap", preferences.haptics);
    track(value === "worked" ? "activity_feedback_positive" : "activity_feedback_negative", {
      id: activity.id,
    });
  };

  return (
    <>
      {pending && <ActivityReel activity={pending.activity} onLand={complete} />}

      <Page>
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-bold text-ink-muted hover:text-ink"
          >
            <ArrowLeft aria-hidden className="size-5" />
            Back
          </Link>

          <button
            type="button"
            onClick={() => {
              toggle(activity.id);
              vibrate("tap", preferences.haptics);
            }}
            aria-pressed={favourited}
            className={cn(
              "-mr-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold",
              favourited ? "text-accent" : "text-ink-muted hover:text-ink",
            )}
          >
            <Heart
              aria-hidden
              className="size-5"
              fill={favourited ? "currentColor" : "none"}
              strokeWidth={2.5}
            />
            {favourited ? "Saved" : "Save"}
          </button>
        </div>

        <h1 className="mt-3 font-display text-[2.25rem] leading-[1.05] font-extrabold tracking-tight text-balance uppercase">
          {activity.title}
        </h1>

        <p className="mt-3 text-xl text-ink-muted text-pretty">{activity.description}</p>

        <ActivityMeta activity={activity} className="mt-5" />

        <section aria-labelledby="how-heading" className="mt-7">
          <h2
            id="how-heading"
            className="font-display text-sm font-bold tracking-wide text-ink-muted uppercase"
          >
            How to run it
          </h2>
          <ol className="mt-3 space-y-3">
            {activity.instructions.map((step, index) => (
              <li key={step} className="flex gap-3.5">
                <span
                  aria-hidden
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-sm font-extrabold text-primary"
                >
                  {index + 1}
                </span>
                <span className="pt-1 text-[1.0625rem] leading-snug text-pretty">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-8 space-y-3">
          <Button size="xl" fullWidth onClick={() => setTimerOpen(true)}>
            <Timer aria-hidden className="size-6" />
            Start timer
          </Button>

          <Button variant="secondary" size="lg" fullWidth onClick={another} disabled={busy}>
            <RefreshCw aria-hidden className={cn("size-5", busy && "animate-spin")} />
            {busy ? "Finding…" : "Give me another"}
          </Button>
        </div>

        <section aria-labelledby="feedback-heading" className="mt-9">
          <h2 id="feedback-heading" className="text-center text-sm font-bold text-ink-muted">
            Did it work?
          </h2>

          <div className="mt-3 flex justify-center gap-3">
            <FeedbackButton
              active={currentFeedback === "worked"}
              onClick={() => onFeedback("worked")}
              tone="positive"
            >
              <ThumbsUp aria-hidden className="size-5" />
              Worked
            </FeedbackButton>

            <FeedbackButton
              active={currentFeedback === "flopped"}
              onClick={() => onFeedback("flopped")}
              tone="negative"
            >
              <ThumbsDown aria-hidden className="size-5" />
              Didn&rsquo;t work
            </FeedbackButton>
          </div>

          <p aria-live="polite" className="mt-3 min-h-5 text-center text-xs text-ink-faint">
            {currentFeedback === "worked" && "Noted — we'll show you more like this."}
            {currentFeedback === "flopped" && "Fair enough. Noted."}
          </p>
        </section>

        <ul className="mt-8 flex flex-wrap justify-center gap-2">
          {activity.categories.map((category) => (
            <li key={category}>
              <Link
                href={`/explore?category=${category}`}
                className="inline-flex min-h-11 items-center rounded-full border-2 border-line px-4 text-xs font-semibold text-ink-muted hover:border-line-strong hover:text-ink"
              >
                {CATEGORY_LABELS[category]}
              </Link>
            </li>
          ))}
        </ul>
      </Page>

      {timerOpen && (
        <TimerOverlay
          activity={activity}
          onClose={() => setTimerOpen(false)}
          onAnother={another}
        />
      )}
    </>
  );
}

function FeedbackButton({
  active,
  onClick,
  tone,
  children,
}: {
  active: boolean;
  onClick: () => void;
  tone: "positive" | "negative";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-5 text-[0.9375rem] font-bold transition-colors",
        active
          ? tone === "positive"
            ? "border-line-strong bg-positive text-white"
            : "border-line-strong bg-negative text-white"
          : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
