"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, RefreshCw, Timer } from "lucide-react";
import { ActivityMeta } from "@/components/activity/activity-meta";
import { MoreLikeThis } from "@/components/activity/more-like-this";
import { PromptDeck } from "@/components/activity/prompt-deck";
import { ActivityReel } from "@/components/shake/activity-reel";
import { getPrompts } from "@/data/prompts";
import { TimerButton } from "@/components/timer/timer-button";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/ui/page";
import { useActivityPicker } from "@/hooks/use-activity-picker";
import { useFavourites } from "@/hooks/use-favourites";
import { useFeedback } from "@/hooks/use-activity-history";
import { usePreferences } from "@/hooks/use-preferences";
import { track } from "@/lib/analytics";
import { vibrate } from "@/lib/haptics";
import {
  FEEDBACK_OPTIONS,
  NEEDS,
  type Activity,
  type Feedback,
  type Need,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function needFrom(value: string | null): Need {
  return NEEDS.includes(value as Need) ? (value as Need) : "surprise";
}

export function ActivityScreen({ activity }: { activity: Activity }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const need = needFrom(searchParams.get("need"));

  const [timerOpen, setTimerOpen] = useState(false);
  const { isFavourite, toggle } = useFavourites();
  const { feedback, submit } = useFeedback();
  const { preferences } = usePreferences();
  const { pick, prefetch, complete, pending, busy } = useActivityPicker();

  const favourited = isFavourite(activity.id);
  const currentFeedback = feedback[activity.id];
  const prompts = getPrompts(activity.id);

  useEffect(() => {
    track("activity_viewed", { id: activity.id, need });
  }, [activity.id, need]);

  // "Give me another" is the most-pressed button here, so warm its targets.
  useEffect(() => {
    prefetch(need);
  }, [need, prefetch]);

  // A fresh activity is a fresh decision. Adjusted during render rather than in
  // an effect — React's documented way to reset state on a prop change — since
  // this component isn't guaranteed to remount between routes.
  const [lastActivityId, setLastActivityId] = useState(activity.id);
  if (lastActivityId !== activity.id) {
    setLastActivityId(activity.id);
    setTimerOpen(false);
  }

  const goBack = () => {
    // A real back navigation (not a fixed href to "/") is what lets the
    // browser restore Explore's scroll position and land on Favourites,
    // another activity via "More like this", or wherever they actually came
    // from — a Link to "/" always went Home regardless. `history.length <= 1`
    // means this tab has no prior page at all (a direct or shared link), the
    // one case where there's genuinely nothing to go back to.
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };

  const another = () => {
    setTimerOpen(false);
    track("activity_skipped", { id: activity.id });
    // A plain fresh pick — no similarity bias. That's what "More like this"
    // below is for; this button means "not this one", nothing more specific.
    pick(need, "button");
  };

  // Self-ending activities (a champion, a correct guess, five points) finish
  // on their own — a countdown fights that, so the timer steps back to a
  // secondary, optional cap rather than leading.
  const timerSlot = timerOpen ? (
    <TimerButton key="timer" activity={activity} size={activity.selfEnding ? "lg" : "xl"} />
  ) : (
    <Button
      key="timer"
      size={activity.selfEnding ? "lg" : "xl"}
      variant={activity.selfEnding ? "secondary" : "primary"}
      fullWidth
      onClick={() => setTimerOpen(true)}
    >
      <Timer aria-hidden className="size-6" />
      Start timer
    </Button>
  );

  const anotherButton = (
    <Button
      key="another"
      variant={activity.selfEnding ? "primary" : "secondary"}
      size={activity.selfEnding ? "xl" : "lg"}
      fullWidth
      onClick={another}
      disabled={busy}
    >
      <RefreshCw aria-hidden className={cn("size-5", busy && "animate-spin")} />
      {busy ? "Finding…" : "Give me another"}
    </Button>
  );

  const onFeedback = (rating: Feedback) => {
    submit(activity.id, rating);
    vibrate("tap", preferences.haptics);

    const tone = FEEDBACK_OPTIONS.find((option) => option.rating === rating)!.tone;
    track(
      tone === "positive"
        ? "activity_feedback_positive"
        : tone === "negative"
          ? "activity_feedback_negative"
          : "activity_feedback_neutral",
      // The exact rating rides along, so "worked" and "they loved it" stay
      // distinguishable once this data leaves the device.
      { id: activity.id, rating },
    );
  };

  return (
    <>
      {pending && <ActivityReel activity={pending.activity} onLand={complete} />}

      <Page>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-bold text-ink-muted hover:text-ink"
          >
            <ArrowLeft aria-hidden className="size-5" />
            Back
          </button>

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

        {/* Only the activities that would otherwise leave a teacher improvising. */}
        {prompts && <PromptDeck bank={prompts} />}

        <div className="mt-8 space-y-3">
          {activity.selfEnding ? [anotherButton, timerSlot] : [timerSlot, anotherButton]}
        </div>

        <section aria-labelledby="feedback-heading" className="mt-9">
          {currentFeedback ? (
            // Once a rating's in, the chips have done their job — showing them
            // alongside the confirmation just invites a second, redundant tap.
            // The message itself is the way back, for the inevitable misfire.
            <button
              type="button"
              onClick={() => onFeedback(currentFeedback)}
              className="mx-auto block text-center text-sm text-ink-muted underline decoration-line underline-offset-4 hover:text-ink"
            >
              {FEEDBACK_REPLIES[currentFeedback]}
            </button>
          ) : (
            <>
              <h2 id="feedback-heading" className="text-center text-sm font-bold text-ink-muted">
                How did it go?
              </h2>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {FEEDBACK_OPTIONS.map((option) => (
                  <FeedbackButton key={option.rating} onClick={() => onFeedback(option.rating)}>
                    <span aria-hidden>{option.emoji}</span>
                    {option.label}
                  </FeedbackButton>
                ))}
              </div>
            </>
          )}
        </section>

        <MoreLikeThis activity={activity} />
      </Page>
    </>
  );
}

/** What we say back. Short, and never scolding for a bad result. */
const FEEDBACK_REPLIES: Record<string, string> = {
  loved: "Noted — we'll send you more like this.",
  worked: "Good. Noted.",
  fine: "Fair enough. Noted.",
  flopped: "Noted. We'll go lighter on these.",
  "never-again": "Understood. We'll stop suggesting it.",
};

// No selected/active state to style — the moment one is chosen, the whole
// row is replaced by the confirmation message, so these only ever render
// unselected.
function FeedbackButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-12 items-center gap-1.5 rounded-full border-2 border-line bg-surface px-4 text-sm font-bold text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
    >
      {children}
    </button>
  );
}
