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
    <html lang="en-AU" className={`${inter.variable} ${display.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-focusable bg-primary px-4 py-2 text-primary-ink">
          Skip to content
        </a>
        {children}
        <BottomNav />
        <ServiceWorker />
        <ThemeSync />
      </body>
    </html>
  );
}
