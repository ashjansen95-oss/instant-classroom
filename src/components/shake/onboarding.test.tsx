import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Onboarding } from "./onboarding";

/**
 * Step 4's finish button no longer fires an activity itself — it hands off
 * to `onComplete`, which the home screen wires to starting the guided tour.
 * The tour's own content (spotlighting the real tiles) is covered in
 * home-screen.test.tsx and activity-screen.test.tsx; this file only covers
 * the handoff and the four-step wizard itself.
 */
async function completeName() {
  await userEvent.type(screen.getByRole("textbox", { name: "First name" }), "Sarah");
  await userEvent.click(screen.getByRole("button", { name: "Continue →" }));
}

async function completeCountryAndLevels() {
  await userEvent.click(screen.getByRole("button", { name: /Australia/ }));
  await userEvent.click(screen.getByRole("button", { name: "Prep" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue →" }));
}

async function completeAllSteps() {
  await completeName();
  await completeCountryAndLevels();
}

describe("Onboarding", () => {
  it("starts with the name step", () => {
    render(<Onboarding />);

    expect(screen.getByText("What's your first name?")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "First name" })).toBeInTheDocument();
  });

  it("blocks Continue when the name is blank", () => {
    render(<Onboarding />);

    expect(screen.getByRole("button", { name: "Continue →" })).toBeDisabled();
  });

  it("advances to the country step after entering a name", async () => {
    render(<Onboarding />);
    await completeName();

    expect(screen.getByText("Where do you teach?")).toBeInTheDocument();
  });

  it("hands off to onComplete the moment the wizard finishes", async () => {
    const onComplete = vi.fn();
    render(<Onboarding onComplete={onComplete} />);

    await completeAllSteps();
    await userEvent.click(screen.getByRole("button", { name: /Show me around/ }));

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("closes itself on finish, same as before this existed", async () => {
    const onComplete = vi.fn();
    render(<Onboarding onComplete={onComplete} />);

    await completeAllSteps();
    await userEvent.click(screen.getByRole("button", { name: /Show me around/ }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("never throws when no onComplete is supplied", async () => {
    render(<Onboarding />);

    await completeAllSteps();
    await expect(
      userEvent.click(screen.getByRole("button", { name: /Show me around/ })),
    ).resolves.not.toThrow();
  });
});
