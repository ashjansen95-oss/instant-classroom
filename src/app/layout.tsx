import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { BottomNav } from "@/components/nav/bottom-nav";
import { ServiceWorker } from "@/components/pwa/service-worker";
import { ThemeSync } from "@/components/theme/theme-sync";
import { STORAGE_PREFIX } from "@/lib/storage";
import "./globals.css";

// Runs before React loads, so an explicit light/dark choice never flashes the
// wrong theme first. Reads the same storage key and JSON shape the
// StorageAdapter itself uses (see lib/storage/local.ts) — kept in one literal
// string rather than importing anything, since this has to stay inlineable
// as plain, dependency-free JS the browser runs pre-hydration.
const THEME_INIT_SCRIPT = `(function () {
  try {
    var raw = localStorage.getItem(${JSON.stringify(`${STORAGE_PREFIX}preferences`)});
    var theme = raw && JSON.parse(raw).theme;
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch (e) {}
})();`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Instant Classroom — got 3 minutes to kill?",
    template: "%s · Instant Classroom",
  },
  description:
    "Shake your phone. Get a classroom activity. Run it. Zero prep, no account, works offline.",
  applicationName: "Instant Classroom",
  appleWebApp: {
    capable: true,
    title: "Instant Classroom",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Zooming stays enabled — pinch-to-zoom is an accessibility feature, not a bug.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffbf4" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0d14" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className={`${inter.variable} ${display.variable} h-dvh overflow-hidden`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex h-full flex-col overflow-hidden">
        <a href="#main" className="sr-focusable bg-primary px-4 py-2 text-primary-ink">
          Skip to content
        </a>
        {/* The only scrolling element on the page — <html>/<body> are pinned
            to the viewport instead. Without this, they're the ones that
            scroll, which drags the bottom nav (a flow sibling, not a
            separate layer) along for the ride during an iOS rubber-band
            bounce. `overscroll-contain` keeps the bounce here rather than
            chaining into the browser's own gestures, the same trick the
            filter sheet already uses for its own scroll area. */}
        <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain">{children}</div>
        <BottomNav />
        <ServiceWorker />
        <ThemeSync />
      </body>
    </html>
  );
}
