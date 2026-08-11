import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getActivity } from "@/data/activities";
import { ActivityScreen } from "./activity-screen";

/**
 * The two behaviours from the "give me another" merge:
 *   - button order flips for self-ending activities, where a countdown fights
 *     the mechanic instead of supporting it
 *   - the single button reads "Give me another" and carries no similarity
 *     bias until the teacher has actually started the timer, at which point
 *     it becomes "…like this" and steers towards the activity's shape
 */

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

// The timer's own behaviour (ticking, wake lock, chime) is covered in
// use-timer.test.ts — stubbed here so this file only exercises the button.
vi.mock("@/components/timer/timer-overlay", () => ({
  TimerOverlay: () => <div data-testid="timer-overlay" />,
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

  it("reads plainly before the activity has been run", () => {
    render(<ActivityScreen activity={timed} />);
    expect(screen.getByRole("button", { name: "Give me another" })).toBeInTheDocument();
  });

  it("carries no similarity bias when rejected on sight", async () => {
    render(<ActivityScreen activity={timed} />);

    await userEvent.click(screen.getByRole("button", { name: "Give me another" }));

    expect(pick).toHaveBeenCalledWith("surprise", "button", undefined, undefined);
  });

  it("relabels once the timer has actually been started", async () => {
    render(<ActivityScreen activity={timed} />);

    await userEvent.click(screen.getByRole("button", { name: "Start timer" }));

    expect(screen.getByRole("button", { name: "Give me another like this" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Give me another" })).not.toBeInTheDocument();
  });

  it("steers towards the activity's shape once it's been run", async () => {
    render(<ActivityScreen activity={timed} />);

    await userEvent.click(screen.getByRole("button", { name: "Start timer" }));
    await userEvent.click(screen.getByRole("button", { name: "Give me another like this" }));

    expect(pick).toHaveBeenCalledWith("surprise", "button", undefined, timed);
  });

  it("resets when a new activity loads, even without unmounting", async () => {
    const { rerender } = render(<ActivityScreen activity={timed} />);
    await userEvent.click(screen.getByRole("button", { name: "Start timer" }));
    expect(screen.getByRole("button", { name: "Give me another like this" })).toBeInTheDocument();

    rerender(<ActivityScreen activity={selfEnding} />);

    expect(screen.getByRole("button", { name: "Give me another" })).toBeInTheDocument();
  });
});
