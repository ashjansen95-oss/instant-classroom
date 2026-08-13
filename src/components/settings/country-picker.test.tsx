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

    const select = screen.getByRole("combobox", { name: "Country" });
    const options = Array.from((select as HTMLSelectElement).options).map(
      (o) => o.text,
    );

    for (const name of [
      "Australia",
      "United Kingdom",
      "United States",
      "Canada",
      "New Zealand",
      "Ireland",
      "South Africa",
    ]) {
      expect(options.some((o) => o.includes(name))).toBe(true);
    }
  });

  it("persists the choice so it survives closing the app", async () => {
    render(<CountryPicker />);

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Country" }),
      "NZ",
    );

    expect(window.localStorage.getItem(`${STORAGE_PREFIX}country`)).toBe('"NZ"');
  });

  it("shows the current selection", () => {
    render(<CountryPicker />);

    const select = screen.getByRole("combobox", { name: "Country" }) as HTMLSelectElement;
    expect(select.value).toBe("AU");
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

    expect(screen.getByText("Year 6–Year 12")).toBeInTheDocument();

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Country" }),
      "US",
    );

    expect(screen.getByText("Grade 6–Grade 12")).toBeInTheDocument();
    expect(screen.queryByText("Year 6–Year 12")).not.toBeInTheDocument();

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Country" }),
      "IE",
    );

    expect(screen.getByText("6th Class–6th Year")).toBeInTheDocument();
  });
});
