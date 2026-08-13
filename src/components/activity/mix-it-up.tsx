"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";

interface Modification {
  label: string;
  description: string;
}

export function MixItUp({ modifications }: { modifications: Modification[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-sm font-bold text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
      >
        <span aria-hidden>🔀</span>
        Mix it up?
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Mix it up">
        <ul className="space-y-3">
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
      </Sheet>
    </div>
  );
}
