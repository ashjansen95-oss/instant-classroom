import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { BottomNav } from "@/components/nav/bottom-nav";
import { ServiceWorker } from "@/components/pwa/service-worker";
import "./globals.css";

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
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-focusable bg-primary px-4 py-2 text-primary-ink">
          Skip to content
        </a>
        {children}
        <BottomNav />
        <ServiceWorker />
      </body>
    </html>
  );
}
