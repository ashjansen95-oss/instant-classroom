import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getActivity } from "@/data/activities";
import { KEYS } from "@/lib/storage";
import { writeKey } from "@/lib/storage/store";
import type { CountryCode } from "@/lib/i18n";
import { ActivityMeta } from "./activity-meta";

/**
 * The wiring test: proves the country layer actually reaches rendered UI, not
 * just that the pure functions return the right strings.
 */

// Goes through the app's own write path so the shared store stays consistent —
// poking localStorage directly would leave the cached snapshot stale.
function withCountry(code: CountryCode) {
  writeKey(KEYS.country, code);
}

// Six-Word Story is classified for ages 11–18 — the same underlying range
// reads differently in every market, and lands a year later in the UK because
// British students start school a year earlier.
const activity = getActivity("six-word-story")!;

describe("ActivityMeta level display", () => {
  it("uses Australian terminology", () => {
    withCountry("AU");
    render(<ActivityMeta activity={activity} />);
    expect(screen.getByText("Year 6–Year 12")).toBeInTheDocument();
  });

  it("uses US terminology for the same activity", () => {
    withCountry("US");
    render(<ActivityMeta activity={activity} />);
    expect(screen.getByText("Grade 6–Grade 12")).toBeInTheDocument();
  });

  it("uses Irish terminology for the same activity", () => {
    withCountry("IE");
    render(<ActivityMeta activity={activity} />);
    expect(screen.getByText("6th Class–6th Year")).toBeInTheDocument();
  });

  it("shifts a year in the UK, where the same ages sit in later year groups", () => {
    withCountry("GB");
    render(<ActivityMeta activity={activity} />);
    expect(screen.getByText("Year 7–Year 13")).toBeInTheDocument();
  });

  it("uses South African terminology", () => {
    withCountry("ZA");
    render(<ActivityMeta activity={activity} />);
    expect(screen.getByText("Grade 6–Grade 12")).toBeInTheDocument();
  });

  it("says 'any' in the local word when an activity really does suit everyone", () => {
    // Synthetic activity covering the full age range (4–18) — no real activity
    // is classified this broadly, but the label path still needs testing.
    const everyone = {
      ...activity,
      id: "test-everyone",
      ageRange: { min: 4, max: 18 },
    };

    withCountry("AU");
    const { unmount } = render(<ActivityMeta activity={everyone} />);
    expect(screen.getByText("Any year level")).toBeInTheDocument();
    unmount();

    withCountry("US");
    render(<ActivityMeta activity={everyone} />);
    expect(screen.getByText("Any grade")).toBeInTheDocument();
  });

  it("never renders another market's words", () => {
    withCountry("US");
    const { container } = render(<ActivityMeta activity={activity} />);
    expect(container.textContent).not.toMatch(/Year \d/);
  });

  it("leaves the level out of the compact strip, which has no room for it", () => {
    withCountry("AU");
    const { container } = render(<ActivityMeta activity={activity} compact />);
    expect(container.textContent).not.toContain("Year 6");
  });
});
