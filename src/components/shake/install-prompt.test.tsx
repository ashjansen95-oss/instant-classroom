import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { KEYS } from "@/lib/storage";
import { writeKey } from "@/lib/storage/store";
import { InstallPrompt } from "./install-prompt";

// The listener for this only exists once the component (and its hook) has
// mounted, so this must always be fired *after* render — firing first is a
// no-op, same as it would be in a real browser before the page finished
// loading.
function fireBeforeInstallPrompt() {
  const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome: "accepted" as const });
  act(() => {
    window.dispatchEvent(event);
  });
}

describe("InstallPrompt", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stays hidden before a teacher has gotten an activity", () => {
    render(<InstallPrompt />);
    fireBeforeInstallPrompt();

    expect(screen.queryByText("Put this on your home screen")).not.toBeInTheDocument();
  });

  it("offers the native prompt once installable and already used once", () => {
    writeKey(KEYS.stats, true);
    render(<InstallPrompt />);
    fireBeforeInstallPrompt();

    expect(screen.getByText("Put this on your home screen")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add to Home Screen/ })).toBeInTheDocument();
  });

  it("gives Safari-specific steps on iOS, with no button to press", () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      maxTouchPoints: 5,
    });
    writeKey(KEYS.stats, true);
    render(<InstallPrompt />);

    expect(screen.getByText(/Add to Home Screen/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Add to Home Screen/ })).not.toBeInTheDocument();
  });

  it("dismisses and stays gone", async () => {
    writeKey(KEYS.stats, true);
    render(<InstallPrompt />);
    fireBeforeInstallPrompt();

    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(screen.queryByText("Put this on your home screen")).not.toBeInTheDocument();
  });
});
