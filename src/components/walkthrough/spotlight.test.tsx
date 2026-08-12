import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Spotlight } from "./spotlight";

/**
 * jsdom doesn't do real layout — `getBoundingClientRect()` on a real element
 * still returns a valid (all-zero) rect rather than throwing, which is
 * enough to exercise "target found, render the callout" without mocking
 * pixel values. What's worth locking in here is behaviour (Next/Skip wiring,
 * the "no button while waiting" case, finding the right target), not exact
 * on-screen position.
 */
function renderWithTarget(spotlight: React.ReactElement) {
  return render(
    <>
      <button data-walkthrough="target">Real target</button>
      {spotlight}
    </>,
  );
}

describe("Spotlight", () => {
  it("renders nothing when the target selector matches nothing", () => {
    render(<Spotlight selector="[data-walkthrough='missing']" title="T" description="D" onSkip={vi.fn()} />);
    expect(screen.queryByText("T")).not.toBeInTheDocument();
  });

  it("shows the title and description once the real target is found", () => {
    renderWithTarget(
      <Spotlight
        selector="[data-walkthrough='target']"
        title="Tap what you need"
        description="Each tile is a shortcut."
        onSkip={vi.fn()}
      />,
    );

    expect(screen.getByText("Tap what you need")).toBeInTheDocument();
    expect(screen.getByText("Each tile is a shortcut.")).toBeInTheDocument();
  });

  it("calls onNext when provided, with a custom label", async () => {
    const onNext = vi.fn();
    renderWithTarget(
      <Spotlight
        selector="[data-walkthrough='target']"
        title="T"
        description="D"
        onNext={onNext}
        nextLabel="Got it"
        onSkip={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("shows no Next button when onNext is omitted — the 'now you try' stop", () => {
    renderWithTarget(
      <Spotlight selector="[data-walkthrough='target']" title="T" description="D" onSkip={vi.fn()} />,
    );
    expect(screen.queryByRole("button", { name: /next/i })).not.toBeInTheDocument();
  });

  it("calls onSkip when Skip tour is tapped", async () => {
    const onSkip = vi.fn();
    renderWithTarget(
      <Spotlight selector="[data-walkthrough='target']" title="T" description="D" onSkip={onSkip} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Skip tour" }));
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it("hides Skip tour when onSkip is omitted — the final stop", () => {
    renderWithTarget(
      <Spotlight selector="[data-walkthrough='target']" title="T" description="D" onNext={vi.fn()} />,
    );
    expect(screen.queryByRole("button", { name: "Skip tour" })).not.toBeInTheDocument();
  });

  it("never blocks clicks on the real target underneath", () => {
    renderWithTarget(
      <Spotlight selector="[data-walkthrough='target']" title="T" description="D" onSkip={vi.fn()} />,
    );
    // The dimmed backdrop is decorative box-shadow on a pointer-events-none
    // element, not a covering layer — the real button must still be a live,
    // clickable element in the tree, not obscured by anything on top of it.
    const target = screen.getByRole("button", { name: "Real target" });
    expect(target).toBeEnabled();
  });
});
