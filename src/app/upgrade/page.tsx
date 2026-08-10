import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Page, PageHeader } from "@/components/ui/page";
import { PRICING } from "@/lib/entitlements";

export const metadata: Metadata = {
  title: "Pro",
  description: "What's coming to Instant Classroom Pro.",
};

const FREE_FEATURES = [
  "Every activity in the library",
  "All filters",
  "Timer, favourites and offline use",
  "No account, no ads",
];

const PRO_FEATURES = [
  "Student mode — activities on their devices",
  "AI-generated activities for your exact lesson",
  "Curriculum-linked activity packs",
  "Recommendations that learn what your classes like",
  "Save activities across all your devices",
];

export default function UpgradePage() {
  return (
    <Page>
      <PageHeader
        title="Instant Classroom Pro"
        subtitle="Not built yet. Here's what we're thinking."
      />

      <section
        aria-labelledby="free-heading"
        className="rounded-2xl border-2 border-line-strong bg-surface p-5 shadow-[var(--shadow-rest)]"
      >
        <h2 id="free-heading" className="font-display text-xl font-extrabold tracking-tight">
          What you have now
        </h2>
        <p className="mt-1 text-sm font-bold text-positive">Free, and staying free</p>

        <ul className="mt-4 space-y-2.5">
          {FREE_FEATURES.map((feature) => (
            <li key={feature} className="flex gap-2.5 text-[0.9375rem]">
              <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-positive" strokeWidth={3} />
              {feature}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pro-heading" className="mt-5 rounded-2xl border-2 border-line bg-primary-soft p-5">
        <h2 id="pro-heading" className="font-display text-xl font-extrabold tracking-tight">
          What Pro would add
        </h2>

        <ul className="mt-4 space-y-2.5">
          {PRO_FEATURES.map((feature) => (
            <li key={feature} className="flex gap-2.5 text-[0.9375rem]">
              <span aria-hidden className="mt-0.5 shrink-0 text-primary">
                ✦
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border-2 border-line bg-surface p-4 text-center">
            <p className="font-display text-2xl font-extrabold">{PRICING.monthly.label}</p>
            <p className="text-xs text-ink-muted">{PRICING.monthly.period}</p>
          </div>
          <div className="rounded-xl border-2 border-line-strong bg-surface p-4 text-center">
            <p className="font-display text-2xl font-extrabold">{PRICING.annual.label}</p>
            <p className="text-xs text-ink-muted">{PRICING.annual.period}</p>
            <p className="mt-1 text-xs font-bold text-primary">{PRICING.annual.note}</p>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-ink-muted text-pretty">
          Nothing to buy yet — we&rsquo;re working out whether this is worth building. Every
          activity stays free while we do.
        </p>
      </section>

      <ButtonLink href="/" size="lg" fullWidth className="mt-7">
        Back to the activities
      </ButtonLink>

      <p className="mt-6 text-center text-sm text-ink-faint">
        Got an opinion on this?{" "}
        <Link href="/settings" className="underline underline-offset-4">
          Use the thumbs on each activity
        </Link>{" "}
        — that&rsquo;s what we&rsquo;re listening to.
      </p>
    </Page>
  );
}
