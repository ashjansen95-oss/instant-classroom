"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { useCountry } from "@/hooks/use-country";
import { useStoredState } from "@/hooks/use-stored-state";
import { useTeaching } from "@/hooks/use-teaching";
import { COUNTRY_LIST, type EducationLevel } from "@/lib/i18n";
import { KEYS } from "@/lib/storage";
import { cn } from "@/lib/utils";

/**
 * First-launch setup: where do you teach, and who do you teach.
 *
 * Two questions, then straight into the app. No account, no email, no school,
 * no subject — the only things asked are the two that change what activities
 * a teacher is shown. The close of step 3 *is* the demo: it hands off to
 * `onComplete`, which the home screen wires to one real tap of its own intent
 * grid — so the very first thing a new teacher sees, the instant this dialog
 * clears, is the actual interaction working (a tile → the real reel → an
 * activity), not a description of one.
 */
export function Onboarding({ onComplete }: { onComplete?: () => void }) {
  const [onboarded, setOnboarded, hydrated] = useStoredState<boolean>(KEYS.onboarded, false);
  const { country, setCountry, terminology, label, shortLabel, levels } = useCountry();
  const {
    teachingLevels,
    defaultTeachingLevel,
    toggleTeachingLevel,
    setDefaultTeachingLevel,
  } = useTeaching();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Held back until hydration so returning teachers never see it flash past.
  if (!hydrated || onboarded) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-paper px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <p className="font-display text-xs font-bold tracking-[0.2em] text-primary uppercase">
          Instant Classroom
        </p>

        {step === 1 && (
          <Step
            title="Where do you teach?"
            intro="Let's make sure we give you activities that fit your students."
          >
            <ul className="mt-6 space-y-2">
              {COUNTRY_LIST.map((option) => (
                <li key={option.code}>
                  <button
                    type="button"
                    onClick={() => {
                      setCountry(option.code);
                      setStep(2);
                    }}
                    aria-pressed={option.code === country}
                    className={cn(
                      "flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 text-left",
                      option.code === country
                        ? "border-line-strong bg-primary-soft"
                        : "border-line bg-surface hover:border-line-strong",
                    )}
                  >
                    <span aria-hidden className="text-xl">
                      {option.flag}
                    </span>
                    <span className="flex-1 font-display font-bold">{option.name}</span>
                    {option.code === country && (
                      <Check aria-hidden className="size-5 text-primary" strokeWidth={3} />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </Step>
        )}

        {step === 2 && (
          <Step
            title={`Which ${terminology.levelNoun}s do you teach?`}
            intro="Pick as many as you like — most teachers have more than one."
          >
            <div className="mt-6 flex flex-wrap gap-2">
              {levels().map((level) => (
                <Chip
                  key={level}
                  selected={teachingLevels.includes(level)}
                  onClick={() => toggleTeachingLevel(level)}
                  aria-label={label(level)}
                >
                  {shortLabel(level)}
                </Chip>
              ))}
            </div>

            <p aria-live="polite" className="mt-4 min-h-6 text-sm text-ink-muted">
              {teachingLevels.length > 0
                ? teachingLevels.map((level) => label(level)).join(", ")
                : "Nothing selected yet."}
            </p>

            <div className="mt-auto space-y-3 pt-8">
              <Button
                size="xl"
                fullWidth
                disabled={teachingLevels.length === 0}
                onClick={() => setStep(3)}
              >
                Continue →
              </Button>
              <Button variant="ghost" size="md" fullWidth onClick={() => setStep(1)}>
                Back
              </Button>
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step
            title="You're all set."
            intro="Tap what your class needs and you'll get an activity instantly — no extra step. Or shake your phone, or tap Surprise me, for something unexpected."
          >
            {/* Only worth asking when there's an actual choice to make. */}
            {teachingLevels.length > 1 && (
              <div className="mt-6">
                <p className="font-display text-sm font-bold tracking-wide text-ink-muted uppercase">
                  Which one first?
                </p>
                <p className="mt-1 mb-3 text-sm text-ink-muted text-pretty">
                  We&rsquo;ll start here each time. You can switch any time.
                </p>
                <div className="flex flex-wrap gap-2">
                  {teachingLevels.map((level: EducationLevel) => (
                    <Chip
                      key={level}
                      selected={defaultTeachingLevel === level}
                      onClick={() => setDefaultTeachingLevel(level)}
                    >
                      {label(level)}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto space-y-3 pt-8">
              <Button
                size="xl"
                fullWidth
                autoFocus
                onClick={() => {
                  // Order matters: this dialog needs to be gone from the tree
                  // before the reel it's handing off to renders, or the two
                  // full-screen overlays stack for a frame.
                  setOnboarded(true);
                  onComplete?.();
                }}
              >
                🎲 Give me my first activity
              </Button>
              <Button variant="ghost" size="md" fullWidth onClick={() => setStep(2)}>
                Back
              </Button>
            </div>
          </Step>
        )}
      </div>
    </div>
  );
}

function Step({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-rise-in flex flex-1 flex-col">
      <h1
        id="onboarding-title"
        className="mt-3 font-display text-[2rem] leading-[1.05] font-extrabold tracking-tight text-balance"
      >
        {title}
      </h1>
      <p className="mt-3 text-lg text-ink-muted text-pretty">{intro}</p>
      {children}
    </div>
  );
}
