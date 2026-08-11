import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getActivity } from "@/data/activities";
import { ActivityScreen } from "./activity-screen";

/**
 * Two behaviours worth locking in:
 *   - button order flips for self-ending activities, where a countdown fights
 *     the mechanic instead of supporting it
 *   - "Give me another" is a plain fresh pick, always — no hidden state, no
 *     relabeling. Steering towards a specific shape lives in "More like this"
 *     instead, which is a deliberate, visible choice rather than a side effect
 *     of which button the teacher happened to press.
 */

const routerPush = vi.fn();
const routerBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush, back: routerBack, prefetch: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

// The timer's own behaviour (ticking, drain, wake lock, chime) is covered in
// timer-button.test.tsx — stubbed here so this file only exercises which
// element occupies the slot.
vi.mock("@/components/timer/timer-button", () => ({
  TimerButton: () => <div data-testid="timer-panel" />,
}));

// "More like this" pulls from the real activity library via useMemo — fine to
// let it run for real, but stubbed here so these tests aren't coupled to
// exactly which three activities the engine happens to suggest. A marker
// rather than null so page-order assertions still have something to find.
vi.mock("@/components/activity/more-like-this", () => ({
  MoreLikeThis: () => <div data-testid="more-like-this" />,
}));

const pick = vi.fn();
vi.mock("@/hooks/use-activity-picker", () => ({
  useActivityPicker: () => ({
    pick,
    prefetch: vi.fn(),
    complete: vi.fn(),
    pending: null,
    busy: false,
    noMatch: false,
  }),
}));

// box-breathing ends on the clock; statue-contest ends on its own condition
// (last statue standing) and carries selfEnding: true.
const timed = getActivity("box-breathing")!;
const selfEnding = getActivity("statue-contest")!;

describe("ActivityScreen back button", () => {
  beforeEach(() => {
    routerPush.mockClear();
    routerBack.mockClear();
  });

  it("goes back through history rather than a fixed href, so Explore's scroll position survives", async () => {
    vi.spyOn(window.history, "length", "get").mockReturnValue(3);
    render(<ActivityScreen activity={timed} />);

    await userEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(routerBack).toHaveBeenCalledOnce();
    expect(routerPush).not.toHaveBeenCalled();
  });

  it("falls back to Home only when there is genuinely nowhere to go back to", async () => {
    vi.spyOn(window.history, "length", "get").mockReturnValue(1);
    render(<ActivityScreen activity={timed} />);

    await userEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(routerPush).toHaveBeenCalledWith("/");
    expect(routerBack).not.toHaveBeenCalled();
  });
});

describe("ActivityScreen action buttons", () => {
  beforeEach(() => pick.mockClear());

  it("leads with Start timer for a normal, clock-driven activity", () => {
    render(<ActivityScreen activity={timed} />);
    const order = screen.getAllByRole("button").map((b) => b.textContent ?? "");

    const startIndex = order.findIndex((t) => t.includes("Start timer"));
    const anotherIndex = order.findIndex((t) => t.includes("Give me another"));
    expect(startIndex).toBeGreaterThanOrEqual(0);
    expect(startIndex).toBeLessThan(anotherIndex);
  });

  it("leads with Give me another for a self-ending activity", () => {
    render(<ActivityScreen activity={selfEnding} />);
    const order = screen.getAllByRole("button").map((b) => b.textContent ?? "");

    const startIndex = order.findIndex((t) => t.includes("Start timer"));
    const anotherIndex = order.findIndex((t) => t.includes("Give me another"));
    expect(anotherIndex).toBeGreaterThanOrEqual(0);
    expect(anotherIndex).toBeLessThan(startIndex);
  });

  it("always reads plainly — no dynamic relabeling", () => {
    render(<ActivityScreen activity={timed} />);
    expect(screen.getByRole("button", { name: "Give me another" })).toBeInTheDocument();
  });

  it("is a plain fresh pick, with no similarity bias, regardless of timer state", async () => {
    render(<ActivityScreen activity={timed} />);

    await userEvent.click(screen.getByRole("button", { name: "Start timer" }));
    expect(screen.getByTestId("timer-panel")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Give me another" }));

    expect(pick).toHaveBeenCalledWith("surprise", "button");
  });

  it("replaces the Start timer button with the timer panel in place, without navigating away", async () => {
    render(<ActivityScreen activity={timed} />);

    await userEvent.click(screen.getByRole("button", { name: "Start timer" }));

    expect(screen.getByTestId("timer-panel")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start timer" })).not.toBeInTheDocument();
    // The instructions stay on screen — the whole point of not using an overlay.
    expect(screen.getByText("How to run it")).toBeInTheDocument();
  });

  it("returns to the idle Start timer button once a fresh activity is picked", async () => {
    render(<ActivityScreen activity={timed} />);

    await userEvent.click(screen.getByRole("button", { name: "Start timer" }));
    expect(screen.getByTestId("timer-panel")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Give me another" }));

    expect(screen.getByRole("button", { name: "Start timer" })).toBeInTheDocument();
    expect(screen.queryByTestId("timer-panel")).not.toBeInTheDocument();
  });

  it("closes an open timer panel when a new activity loads, even without unmounting", async () => {
    const { rerender } = render(<ActivityScreen activity={timed} />);
    await userEvent.click(screen.getByRole("button", { name: "Start timer" }));
    expect(screen.getByTestId("timer-panel")).toBeInTheDocument();

    rerender(<ActivityScreen activity={selfEnding} />);

    expect(screen.queryByTestId("timer-panel")).not.toBeInTheDocument();
  });
});

describe("ActivityScreen page order", () => {
  it("puts More Like This at the very end, with nothing after it", () => {
    render(<ActivityScreen activity={timed} />);

    const main = screen.getByRole("main");
    expect(main.lastElementChild).toBe(screen.getByTestId("more-like-this"));
  });

  it("no longer shows category filter chips", () => {
    render(<ActivityScreen activity={timed} />);
    expect(screen.queryByRole("link", { name: /brain break|calm down|kill time/i })).not.toBeInTheDocument();
  });
});

describe("ActivityScreen feedback", () => {
  it("shows five options and no message before anything is picked", () => {
    render(<ActivityScreen activity={timed} />);

    expect(screen.getByRole("button", { name: /Worked/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /They loved it/ })).toBeInTheDocument();
    expect(screen.queryByText(/Noted/)).not.toBeInTheDocument();
  });

  it("collapses to just the acknowledgement once a rating is picked", async () => {
    render(<ActivityScreen activity={timed} />);

    await userEvent.click(screen.getByRole("button", { name: /They loved it/ }));

    expect(screen.queryByRole("button", { name: /Worked/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Didn.t work/ })).not.toBeInTheDocument();
    expect(screen.getByText("Noted — we'll send you more like this.")).toBeInTheDocument();
  });

  it("brings the options back if the acknowledgement itself is tapped, for a misfire", async () => {
    render(<ActivityScreen activity={timed} />);

    await userEvent.click(screen.getByRole("button", { name: /Fine/ }));
    expect(screen.getByText("Fair enough. Noted.")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Fair enough. Noted."));

    expect(screen.getByRole("button", { name: /Fine/ })).toBeInTheDocument();
    expect(screen.queryByText("Fair enough. Noted.")).not.toBeInTheDocument();
  });
});
