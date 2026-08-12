import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Onboarding } from "./onboarding";

/**
 * Step 3's finish button no longer fires an activity itself — it hands off
 * to `onComplete`, which the home screen wires to starting the guided tour.
 * The tour's own content (spotlighting the real tiles) is covered in
 * home-screen.test.tsx and activity-screen.test.tsx; this file only covers
 * the handoff and the three-step wizard itself.
 */
async function completeSteps1And2() {
  await userEvent.click(screen.getByRole("button", { name: /Australia/ }));
  await userEvent.click(screen.getByRole("button", { name: "Prep" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue →" }));
}

describe("Onboarding", () => {
  it("hands off to onComplete the moment the wizard finishes", async () => {
    const onComplete = vi.fn();
    render(<Onboarding onComplete={onComplete} />);

    await completeSteps1And2();
    await userEvent.click(screen.getByRole("button", { name: /Show me around/ }));

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("closes itself on finish, same as before this existed", async () => {
    const onComplete = vi.fn();
    render(<Onboarding onComplete={onComplete} />);

    await completeSteps1And2();
    await userEvent.click(screen.getByRole("button", { name: /Show me around/ }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("never throws when no onComplete is supplied", async () => {
    render(<Onboarding />);

    await completeSteps1And2();
    await expect(
      userEvent.click(screen.getByRole("button", { name: /Show me around/ })),
    ).resolves.not.toThrow();
  });
});
