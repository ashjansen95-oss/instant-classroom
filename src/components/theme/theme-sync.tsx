"use client";

import { useEffect } from "react";
import { usePreferences } from "@/hooks/use-preferences";

/**
 * Keeps <html data-theme> in sync with the stored preference after the app
 * is live. First paint is handled separately by an inline script in
 * layout.tsx — that one has to run before React even loads, or a teacher
 * with "light" chosen on a dark-mode phone would see a flash of dark before
 * this component ever got a chance to mount.
 */
export function ThemeSync() {
  const { preferences } = usePreferences();

  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", preferences.theme);
  }, [preferences.theme]);

  return null;
}
