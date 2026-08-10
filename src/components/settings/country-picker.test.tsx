import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { getActivity } from "@/data/activities";
import { KEYS, STORAGE_PREFIX } from "@/lib/storage";
import { writeKey } from "@/lib/storage/store";
import { ActivityMeta } from "@/components/activity/activity-meta";
import { CountryPicker } from "./country-picker";

const activity = getActivity("six-word-story")!;

// jsdom reports en-US, so pin a known starting point rather than relying on
// whatever locale the test environment happens to have.
beforeEach(() => writeKey(KEYS.country, "AU"));

describe("CountryPicker", () => {
  it("offers all seven markets", () => {
    render(<CountryPicker />);

    for (const name of [
      "Australia",
      "United Kingdom",
      "United States",
      "Canada",
      "New Zealand",
      "Ireland",
      "South Africa",
    ]) {
      expect(screen.getByRole("button", { name: new RegExp(name) })).toBeInTheDocument();
    }
  });

  it("previews what each market will call things", () => {
    render(<CountryPicker />);

    expect(screen.getByRole("button", { name: /Ireland/ })).toHaveTextContent("2nd Year");
    expect(screen.getByRole("button", { name: /United States/ })).toHaveTextContent("Kindergarten");
    expect(screen.getByRole("button", { name: /South Africa/ })).toHaveTextContent("Grade R");
  });

  it("persists the choice so it survives closing the app", async () => {
    render(<CountryPicker />);

    await userEvent.click(screen.getByRole("button", { name: /New Zealand/ }));

    expect(window.localStorage.getItem(`${STORAGE_PREFIX}country`)).toBe('"NZ"');
  });

  it("marks the selection with more than colour", async () => {
    render(<CountryPicker />);
    const canada = screen.getByRole("button", { name: /Canada/ });

    await userEvent.click(canada);

    expect(canada).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Australia/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("changes terminology everywhere the moment it's switched", async () => {
    // Two independent components, one store: this is the whole point of the
    // central layer, and it's what stops a stale label somewhere in the app.
    render(
      <>
        <CountryPicker />
        <ActivityMeta activity={activity} />
      </>,
    );

    expect(screen.getByText("Year 3–Year 12")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /United States/ }));

    expect(screen.getByText("Grade 3–Grade 12")).toBeInTheDocument();
    expect(screen.queryByText("Year 3–Year 12")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Ireland/ }));

    expect(screen.getByText("3rd Class–6th Year")).toBeInTheDocument();
  });
});
