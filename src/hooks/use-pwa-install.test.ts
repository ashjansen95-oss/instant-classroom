import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readEvents } from "@/lib/analytics";
import { usePwaInstall } from "./use-pwa-install";

function setUserAgent(ua: string) {
  vi.stubGlobal("navigator", { ...navigator, userAgent: ua, maxTouchPoints: 5 });
}

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
  return event;
}

describe("usePwaInstall", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("has nothing to offer a plain desktop browser", () => {
    const { result } = renderHook(() => usePwaInstall());

    expect(result.current.canPromptNatively).toBe(false);
    expect(result.current.needsManualIosSteps).toBe(false);
    expect(result.current.installable).toBe(false);
  });

  it("becomes promptable once the browser fires beforeinstallprompt", () => {
    const { result } = renderHook(() => usePwaInstall());

    fireBeforeInstallPrompt();

    expect(result.current.canPromptNatively).toBe(true);
    expect(result.current.installable).toBe(true);
  });

  it("prompts natively and tracks the real outcome", async () => {
    const { result } = renderHook(() => usePwaInstall());
    const event = fireBeforeInstallPrompt();

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(event.prompt).toHaveBeenCalledOnce();
    expect(result.current.canPromptNatively).toBe(false);

    const events = readEvents();
    expect(events[0]).toMatchObject({ name: "install_prompted", props: { outcome: "accepted" } });
  });

  it("recognises iOS Safari, which never fires beforeinstallprompt", () => {
    setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    );
    const { result } = renderHook(() => usePwaInstall());

    expect(result.current.needsManualIosSteps).toBe(true);
    expect(result.current.canPromptNatively).toBe(false);
    expect(result.current.installable).toBe(true);
  });

  it("doesn't guess at instructions for other iOS browsers", () => {
    // Chrome on iOS reports a "CriOS" token and doesn't get Safari's Share
    // sheet steps — better to show nothing than the wrong steps.
    setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1",
    );
    const { result } = renderHook(() => usePwaInstall());

    expect(result.current.needsManualIosSteps).toBe(false);
    expect(result.current.installable).toBe(false);
  });

  it("shows nothing once already installed", () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(display-mode: standalone)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => usePwaInstall());
    fireBeforeInstallPrompt();

    expect(result.current.installed).toBe(true);
    expect(result.current.installable).toBe(false);

    window.matchMedia = original;
  });

  it("dismiss persists across a remount and tracks it", () => {
    const first = renderHook(() => usePwaInstall());
    act(() => first.result.current.dismiss());
    expect(first.result.current.dismissed).toBe(true);

    const second = renderHook(() => usePwaInstall());
    expect(second.result.current.dismissed).toBe(true);

    const events = readEvents();
    expect(events[0].name).toBe("install_prompt_dismissed");
  });
});
