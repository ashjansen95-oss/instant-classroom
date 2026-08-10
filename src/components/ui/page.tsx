import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <main
      id="main"
      className={cn("mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-8 sm:px-6", className)}
    >
      {children}
    </main>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-balance">{title}</h1>
        {subtitle && <p className="mt-1 text-[0.9375rem] text-ink-muted text-pretty">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
