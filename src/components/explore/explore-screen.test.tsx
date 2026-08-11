import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { KEYS } from "@/lib/storage";
import { writeKey } from "@/lib/storage/store";
import { ExploreScreen } from "./explore-screen";

/**
 * The whole point: a Year 8/9 teacher should never land on Explore looking at
 * activities meant for Prep. The level filter pre-selects their own teaching
 * levels, and backs off the instant the teacher touches a filter themselves.
 */

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => null }),
}));

function seedTeacher(levels: number[], country = "AU") {
  writeKey(KEYS.country, country);
  writeKey(KEYS.teaching, { teachingLevels: levels, defaultTeachingLevel: levels[0] });
}

async function openFilters() {
  await userEvent.click(screen.getByRole("button", { name: /Filter/ }));
}

describe("ExploreScreen defaults to the teacher's own levels", () => {
  it("pre-selects Year 8 and Year 9 for a Year 8/9 teacher", async () => {
    seedTeacher([8, 9]);
    render(<ExploreScreen />);
    await openFilters();

    expect(screen.getByRole("button", { name: "Year 8" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Year 9" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Prep" })).toHaveAttribute("aria-pressed", "false");
  });

  it("shows the active filter count on the Filter button itself", () => {
    seedTeacher([8, 9]);
    render(<ExploreScreen />);

    expect(screen.getByRole("button", { name: /Filter/ })).toHaveTextContent("2");
  });

  it("narrows the results so Prep activities aren't shown to a secondary teacher", () => {
    seedTeacher([8, 9]);
    render(<ExploreScreen />);

    expect(screen.queryByText("Animal Moves")).not.toBeInTheDocument();
  });

  it("shows everything when the teacher's levels aren't known yet", () => {
    // No seeding at all — the pre-onboarding or misconfigured case.
    writeKey(KEYS.teaching, {});
    render(<ExploreScreen />);

    expect(screen.getByText(/of \d+ activities/)).toHaveTextContent(/^(\d+) of \1 activities$/);
  });

  it("respects a level the teacher deliberately unticks, and doesn't put it back", async () => {
    seedTeacher([8, 9]);
    render(<ExploreScreen />);
    await openFilters();

    await userEvent.click(screen.getByRole("button", { name: "Year 9" }));
    expect(screen.getByRole("button", { name: "Year 9" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Year 8" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("stays cleared after Clear, even though the teacher's levels are still known", async () => {
    seedTeacher([8, 9]);
    render(<ExploreScreen />);
    await openFilters();

    await userEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.getByRole("button", { name: "Year 8" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: /Filter/ })).not.toHaveTextContent(/[1-9]/);
  });

  it("lets the teacher add a level beyond their own, on top of the default", async () => {
    seedTeacher([8]);
    render(<ExploreScreen />);
    await openFilters();

    await userEvent.click(screen.getByRole("button", { name: "Year 7" }));

    expect(screen.getByRole("button", { name: "Year 7" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Year 8" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
