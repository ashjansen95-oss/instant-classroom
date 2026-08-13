"use client";

import { useState } from "react";
import { Shuffle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Modification {
  label: string;
  description: string;
}

export function MixItUp({ modifications }: { modifications: Modification[] }) {
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="mix-heading" className="mt-7">
      <h2
        id="mix-heading"
        className="font-display text-sm font-bold tracking-wide text-ink-muted uppercase"
      >
        Mix it up
      </h2>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-line-strong bg-surface font-display text-lg font-bold shadow-[var(--shadow-rest)] -translate-y-0.5 transition-transform duration-100 active:translate-y-0 active:shadow-[var(--shadow-press)]"
      >
        <Shuffle aria-hidden className="size-5" />
        Mix it up?
        <ChevronDown
          aria-hidden
          className={cn("size-5 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul className="mt-3 space-y-3">
          {modifications.map((mod) => (
            <li
              key={mod.label}
              className="rounded-2xl border-2 border-line bg-surface p-4"
            >
              <p className="font-display text-base font-bold">{mod.label}</p>
              <p className="mt-1 text-[0.9375rem] leading-snug text-ink-muted">
                {mod.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
