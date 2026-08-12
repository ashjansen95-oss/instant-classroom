import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Onboarding } from "./onboarding";

/**
 * Step 3's finish button is the walkthrough's actual demo, not just an
 * explanation: it dismisses the dialog and hands off to `onComplete`, which
 * the home screen wires straight to its own Surprise Me. Covering the wiring
 * here; the reel itself is exercised by home-screen.test.tsx and
 * activity-reel's own tests.
 */
async function completeSteps1And2() {
  await userEvent.click(screen.getByRole("button", { name: /Australia/ }));
  await userEvent.click(screen.getByRole("button", { name: "Prep" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue →" }));
}

describe("Onboarding", () => {
  it("hands off to onComplete the moment the walkthrough finishes", async () => {
    const onComplete = vi.fn();
    render(<Onboarding onComplete={onComplete} />);

    await completeSteps1And2();
    await userEvent.click(screen.getByRole("button", { name: /Give me my first activity/ }));

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("closes itself on finish, same as before this existed", async () => {
    const onComplete = vi.fn();
    render(<Onboarding onComplete={onComplete} />);

    await completeSteps1And2();
    await userEvent.click(screen.getByRole("button", { name: /Give me my first activity/ }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("never throws when no onComplete is supplied", async () => {
    render(<Onboarding />);

    await completeSteps1And2();
    await expect(
      userEvent.click(screen.getByRole("button", { name: /Give me my first activity/ })),
    ).resolves.not.toThrow();
  });

  it("teaches the new tap-to-generate model, not the old filter-then-press one", async () => {
    render(<Onboarding onComplete={vi.fn()} />);
    await completeSteps1And2();

    expect(screen.getByText(/instantly/i)).toBeInTheDocument();
  });
});
