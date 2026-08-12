import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KEYS } from "@/lib/storage";
import { writeKey } from "@/lib/storage/store";
import { EMPTY_FILTERS } from "@/lib/types";
import { HomeScreen } from "./home-screen";

/**
 * The core interaction change: tapping an intent tile fires generation
 * immediately — no second "now press generate" step, and no selected-state
 * to get stuck in. Surprise Me and shake both funnel through the same
 * `pick()` call, same as before.
 */

const routerReplace = vi.fn();
const routerPrefetch = vi.fn();
let searchParam: string | null = null;
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace, prefetch: routerPrefetch }),
  useSearchParams: () => ({ get: () => searchParam }),
}));

const pick = vi.fn();
vi.mock("@/hooks/use-activity-picker", () => ({
  useActivityPicker: () => ({
    pick,
    prefetch: vi.fn(),
    complete: vi.fn(),
    pending: null,
    busy: false,
  }),
}));

// Country/teaching-level plumbing isn't the point of these tests, and pulling
// it in for real means seeding an onboarded profile for every test.
vi.mock("./level-switcher", () => ({ LevelSwitcher: () => null }));
vi.mock("./install-prompt", () => ({ InstallPrompt: () => null }));
vi.mock("./recommendations", () => ({ Recommendations: () => null }));

describe("HomeScreen", () => {
  beforeEach(() => {
    pick.mockClear();
    routerReplace.mockClear();
    routerPrefetch.mockClear();
    searchParam = null;
    // Already onboarded — these tests are about the main screen, not the
    // first-launch flow (that's covered in onboarding.test.tsx).
    writeKey(KEYS.onboarded, true);
  });

  it("fires generation the instant an intent tile is tapped — no second step", async () => {
    render(<HomeScreen />);

    await userEvent.click(screen.getByRole("button", { name: "Wake them up" }));

    expect(pick).toHaveBeenCalledExactlyOnceWith("wake", "button");
  });

  it("treats every intent tile as an immediate action, not a toggle", async () => {
    render(<HomeScreen />);

    await userEvent.click(screen.getByRole("button", { name: "Calm them down" }));
    await userEvent.click(screen.getByRole("button", { name: "Make them think" }));

    expect(pick).toHaveBeenNthCalledWith(1, "calm", "button");
    expect(pick).toHaveBeenNthCalledWith(2, "think", "button");
  });

  it("labels the big button Surprise Me, not the old Shake Me copy", () => {
    render(<HomeScreen />);
    expect(screen.getByText("🎲 SURPRISE ME")).toBeInTheDocument();
  });

  it("Surprise Me fires the same pick path with the surprise need", async () => {
    render(<HomeScreen />);

    await userEvent.click(screen.getByRole("button", { name: /Surprise me with an activity/i }));

    expect(pick).toHaveBeenCalledExactlyOnceWith("surprise", "button");
  });

  it("opens More and fires a category-filtered pick on selection", async () => {
    render(<HomeScreen />);

    await userEvent.click(screen.getByRole("button", { name: "More…" }));
    await userEvent.click(await screen.findByRole("button", { name: "Movement" }));

    expect(pick).toHaveBeenCalledExactlyOnceWith("surprise", "button", {
      ...EMPTY_FILTERS,
      categories: ["get-moving"],
    });
  });

  it("fires a PWA shortcut's ?need= exactly once and cleans up the URL", () => {
    searchParam = "calm";
    render(<HomeScreen />);

    expect(pick).toHaveBeenCalledExactlyOnceWith("calm", "button");
    expect(routerReplace).toHaveBeenCalledExactlyOnceWith("/");
  });

  it("ignores a garbage ?need= value rather than crashing", () => {
    searchParam = "not-a-real-need";
    render(<HomeScreen />);

    expect(pick).not.toHaveBeenCalled();
  });
});
