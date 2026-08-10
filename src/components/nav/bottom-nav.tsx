"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Heart, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", icon: Zap },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/favourites", label: "Favourites", icon: Heart },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className={cn(
        "sticky bottom-0 z-30 border-t-2 border-line bg-paper/95 backdrop-blur",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <ul className="mx-auto flex max-w-2xl">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-bold",
                  active ? "text-primary" : "text-ink-faint hover:text-ink",
                )}
              >
                <Icon
                  aria-hidden
                  className="size-6"
                  strokeWidth={active ? 2.75 : 2}
                  {...(active ? { fill: "currentColor", fillOpacity: 0.16 } : {})}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
