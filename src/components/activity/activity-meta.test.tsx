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

// Six-Word Story suits levels 3–13, so it reads differently in every market.
const activity = getActivity("six-word-story")!;

describe("ActivityMeta level display", () => {
  it("uses Australian terminology", () => {
    withCountry("AU");
    render(<ActivityMeta activity={activity} />);
    expect(screen.getByText("Year 3–Year 12")).toBeInTheDocument();
  });

  it("uses US terminology for the same activity", () => {
    withCountry("US");
    render(<ActivityMeta activity={activity} />);
    expect(screen.getByText("Grade 3–Grade 12")).toBeInTheDocument();
  });

  it("uses Irish terminology for the same activity", () => {
    withCountry("IE");
    render(<ActivityMeta activity={activity} />);
    expect(screen.getByText("3rd Class–6th Year")).toBeInTheDocument();
  });

  it("extends to Year 13 in the UK", () => {
    withCountry("GB");
    render(<ActivityMeta activity={activity} />);
    expect(screen.getByText("Year 3–Year 13")).toBeInTheDocument();
  });

  it("uses South African terminology", () => {
    withCountry("ZA");
    render(<ActivityMeta activity={activity} />);
    expect(screen.getByText("Grade 3–Grade 12")).toBeInTheDocument();
  });

  it("says 'any' in the local word when an activity suits everyone", () => {
    const everyone = getActivity("odd-one-out")!;

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

  it("leaves the country out of the compact strip, which has no room for it", () => {
    withCountry("AU");
    const { container } = render(<ActivityMeta activity={activity} compact />);
    expect(container.textContent).not.toContain("Year 3");
  });
});
