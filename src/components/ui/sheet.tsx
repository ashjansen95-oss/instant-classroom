"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet on mobile, centred panel from `sm` up. Built on <dialog> so we
 * inherit focus trapping and Escape-to-close instead of reimplementing them.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Stop the page behind the sheet from scrolling on iOS.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        // Clicks land on the dialog element itself only when they hit the backdrop.
        if (event.target === ref.current) onClose();
      }}
      aria-label={title}
      className={cn(
        "m-0 w-full max-w-none bg-transparent p-0 backdrop:bg-black/50",
        "mt-auto max-h-[88dvh]",
        "sm:m-auto sm:max-w-lg",
        "open:animate-rise-in",
        className,
      )}
    >
      <div className="flex max-h-[88dvh] flex-col rounded-t-3xl border-2 border-line-strong bg-surface sm:rounded-3xl">
        <div className="flex items-center justify-between gap-4 border-b-2 border-line px-5 py-4">
          <h2 className="font-display text-xl font-extrabold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 grid size-11 place-items-center rounded-full text-ink-muted hover:bg-surface-sunk hover:text-ink"
          >
            <X aria-hidden className="size-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>

        {footer && (
          <div className="border-t-2 border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
