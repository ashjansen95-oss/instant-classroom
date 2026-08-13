import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getActivity } from "@/data/activities";
import { TimerButton } from "./timer-button";

/**
 * The button IS the timer — no separate card. What matters here: the fill
 * actually drains as a visual proportion of remaining time, tapping toggles
 * pause without a dedicated button, and it shakes exactly once it finishes.
 */

const activity = getActivity("take-five-breathing")!; // 90 seconds

function fill(container: HTMLElement): HTMLElement {
  const button = container.querySelector("button")!;
  // Second aria-hidden span is the remaining-time fill; the first is the
  // drained base layer underneath it.
  return button.querySelectorAll('[aria-hidden="true"]')[1] as HTMLElement;
}

describe("TimerButton", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("autostarts on mount and shows the full duration", () => {
    render(<TimerButton activity={activity} size="xl" />);
    expect(screen.getByText("1:30")).toBeInTheDocument();
  });

  it("starts fully filled — 100% remaining", () => {
    const { container } = render(<TimerButton activity={activity} size="xl" />);
    expect(fill(container).style.width).toBe("100%");
  });

  it("drains the fill as time passes, proportional to what's left", () => {
    const { container } = render(<TimerButton activity={activity} size="xl" />);

    act(() => {
      vi.advanceTimersByTime(45_000); // half of 90 seconds
    });

    expect(fill(container).style.width).toBe("50%");
    expect(screen.getByText("0:45")).toBeInTheDocument();
  });

  it("is fully drained at zero", () => {
    const { container } = render(<TimerButton activity={activity} size="xl" />);

    act(() => {
      vi.advanceTimersByTime(90_000);
    });

    expect(fill(container).style.width).toBe("0%");
  });

  it("pauses and resumes on tap, with no separate control", () => {
    render(<TimerButton activity={activity} size="xl" />);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    act(() => {
      fireEvent.click(screen.getByRole("button"));
    });
    expect(screen.getByText("1:20")).toBeInTheDocument();

    // Paused: time passing must not move the clock.
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByText("1:20")).toBeInTheDocument();

    // Tap again resumes.
    act(() => {
      fireEvent.click(screen.getByRole("button"));
    });
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(screen.getByText("1:15")).toBeInTheDocument();
  });

  it("shakes exactly when it finishes, and not before", () => {
    const { container } = render(<TimerButton activity={activity} size="xl" />);
    const button = container.querySelector("button")!;

    expect(button.className).not.toContain("animate-wiggle");

    act(() => {
      vi.advanceTimersByTime(89_000);
    });
    expect(button.className).not.toContain("animate-wiggle");

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(button.className).toContain("animate-wiggle");
  });

  it("shows TIME! once finished", () => {
    render(<TimerButton activity={activity} size="xl" />);
    act(() => {
      vi.advanceTimersByTime(90_000);
    });
    expect(screen.getByText(/TIME!/)).toBeInTheDocument();
  });

  it("tapping a finished timer runs it again", () => {
    const { container } = render(<TimerButton activity={activity} size="xl" />);

    act(() => {
      vi.advanceTimersByTime(90_000);
    });
    expect(screen.getByText(/TIME!/)).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("button"));
    });

    expect(screen.getByText("1:30")).toBeInTheDocument();
    expect(fill(container).style.width).toBe("100%");
  });

  it("describes its state in the accessible name, for screen readers", () => {
    render(<TimerButton activity={activity} size="xl" />);
    expect(
      screen.getByRole("button", { name: /1:30 remaining.*tap to pause/i }),
    ).toBeInTheDocument();
  });

  it("respects the size prop", () => {
    const { container: xl } = render(<TimerButton activity={activity} size="xl" />);
    const { container: lg } = render(<TimerButton activity={activity} size="lg" />);

    expect(xl.querySelector("button")?.className).toContain("min-h-16");
    expect(lg.querySelector("button")?.className).toContain("min-h-14");
  });
});
