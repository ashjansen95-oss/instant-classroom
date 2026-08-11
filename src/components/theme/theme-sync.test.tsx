import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { writeKey } from "@/lib/storage/store";
import { KEYS } from "@/lib/storage";
import { ThemeSync } from "./theme-sync";

describe("ThemeSync", () => {
  it("leaves data-theme unset for the default 'system' preference", () => {
    render(<ThemeSync />);
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("stamps an explicit choice onto <html>", () => {
    writeKey(KEYS.preferences, { theme: "dark" });
    render(<ThemeSync />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("removes the attribute when switched back to system", () => {
    writeKey(KEYS.preferences, { theme: "light" });
    render(<ThemeSync />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    act(() => {
      writeKey(KEYS.preferences, { theme: "system" });
    });
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });
});
