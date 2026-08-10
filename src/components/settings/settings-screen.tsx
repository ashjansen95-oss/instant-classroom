"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Page, PageHeader } from "@/components/ui/page";
import { CountryPicker } from "@/components/settings/country-picker";
import { usePreferences, type ShakeSensitivity } from "@/hooks/use-preferences";
import { useShake } from "@/hooks/use-shake";
import { track } from "@/lib/analytics";
import { storage } from "@/lib/storage";
import { resetStore } from "@/lib/storage/store";
import { cn } from "@/lib/utils";

const SENSITIVITIES: { value: ShakeSensitivity; label: string }[] = [
  { value: "low", label: "Firm shake" },
  { value: "medium", label: "Normal" },
  { value: "high", label: "Light shake" },
];

export function SettingsScreen() {
  const { preferences, setPreference } = usePreferences();
  const { status, requestPermission } = useShake({ onShake: () => {}, enabled: false });
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    track("page_view", { path: "/settings" });
  }, []);

  return (
    <Page>
      <PageHeader title="Settings" />

      <section className="mb-8" aria-labelledby="country-heading">
        <h2
          id="country-heading"
          className="font-display text-sm font-bold tracking-wide text-ink-muted uppercase"
        >
          Country / region
        </h2>
        <p className="mt-1 mb-3 text-sm text-ink-muted text-pretty">
          Sets what we call school years across the whole app.
        </p>
        <CountryPicker />
      </section>

      <section className="space-y-3">
        <Toggle
          label="Sound"
          description="A chime when the timer finishes."
          checked={preferences.sound}
          onChange={(value) => setPreference("sound", value)}
        />
        <Toggle
          label="Vibration"
          description="Buzzes on shake and when time's up. Not supported on iPhone."
          checked={preferences.haptics}
          onChange={(value) => setPreference("haptics", value)}
        />
        <Toggle
          label="Shake to generate"
          description="Turn this off if it keeps firing in your pocket."
          checked={preferences.shakeEnabled}
          onChange={(value) => setPreference("shakeEnabled", value)}
        />
      </section>

      {preferences.shakeEnabled && status !== "unsupported" && (
        <section className="mt-6" aria-labelledby="sensitivity-heading">
          <h2
            id="sensitivity-heading"
            className="font-display text-sm font-bold tracking-wide text-ink-muted uppercase"
          >
            How hard is a shake?
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {SENSITIVITIES.map((option) => (
              <Chip
                key={option.value}
                selected={preferences.shakeSensitivity === option.value}
                onClick={() => setPreference("shakeSensitivity", option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </div>

          {status === "needs-permission" && (
            <Button variant="secondary" size="md" className="mt-4" onClick={requestPermission}>
              Give this site motion access
            </Button>
          )}
          {status === "denied" && (
            <p className="mt-3 text-sm text-ink-muted text-pretty">
              Motion access is blocked in your browser settings. The button works exactly the same.
            </p>
          )}
        </section>
      )}

      <section className="mt-8">
        <Link
          href="/upgrade"
          className="flex items-center gap-3 rounded-2xl border-2 border-line-strong bg-primary-soft p-4"
        >
          <Sparkles aria-hidden className="size-6 shrink-0 text-primary" />
          <span className="min-w-0 flex-1">
            <span className="block font-display font-extrabold">Instant Classroom Pro</span>
            <span className="block text-sm text-ink-muted">Coming soon. Have a look.</span>
          </span>
          <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-faint" />
        </Link>
      </section>

      <section className="mt-8" aria-labelledby="data-heading">
        <h2
          id="data-heading"
          className="font-display text-sm font-bold tracking-wide text-ink-muted uppercase"
        >
          Your data
        </h2>
        <p className="mt-3 text-[0.9375rem] text-ink-muted text-pretty">
          Everything stays on this device — your favourites, the activities you&rsquo;ve seen, your
          thumbs up and down, and these settings. Nothing is sent anywhere, there&rsquo;s no
          account, and we never collect anything about students.
        </p>

        <Button
          variant="danger"
          size="md"
          className="mt-4"
          onClick={() => {
            storage.clear();
            // Drops the cached snapshots too, so every open screen updates now.
            resetStore();
            setCleared(true);
          }}
        >
          Clear everything on this device
        </Button>
        <p aria-live="polite" className="mt-2 min-h-5 text-sm text-ink-muted">
          {cleared ? "Cleared. Favourites, history and settings are all gone." : ""}
        </p>
      </section>

      <nav aria-label="Legal" className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
        <Link href="/privacy" className="underline underline-offset-4">
          Privacy
        </Link>
        <Link href="/terms" className="underline underline-offset-4">
          Terms
        </Link>
      </nav>
    </Page>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-4 rounded-2xl border-2 border-line bg-surface p-4 text-left hover:border-line-strong"
    >
      <span className="min-w-0 flex-1">
        <span className="block font-display font-bold">{label}</span>
        <span className="block text-sm text-ink-muted text-pretty">{description}</span>
      </span>

      {/* On/off is carried by the knob position and the aria-checked state, not
          by colour alone. */}
      <span
        aria-hidden
        className={cn(
          "relative h-8 w-14 shrink-0 rounded-full border-2 transition-colors",
          checked ? "border-line-strong bg-primary" : "border-line bg-surface-sunk",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-6 rounded-full transition-[left]",
            checked ? "left-[1.625rem] bg-primary-ink" : "left-0.5 bg-ink-faint",
          )}
        />
      </span>
    </button>
  );
}
