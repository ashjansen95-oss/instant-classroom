import type { ReactNode } from "react";

/** Shared shell for the legal pages, so they read consistently. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-5 text-[0.9375rem] leading-relaxed text-ink-muted [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_p]:text-pretty [&_strong]:text-ink [&_ul]:space-y-2">
      {children}
    </div>
  );
}

export function LegalNotice() {
  return (
    <p className="mt-10 rounded-2xl border-2 border-line bg-surface-sunk p-4 text-sm text-ink-muted text-pretty">
      <strong className="text-ink">Placeholder pending legal review.</strong> This page describes
      how the app actually behaves today, but it has not been reviewed by a lawyer and is not a
      substitute for advice. If you&rsquo;re deploying this for a school or system, get it reviewed
      first.
    </p>
  );
}
