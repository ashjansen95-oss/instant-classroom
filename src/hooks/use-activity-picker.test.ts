import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readEvents, clearEvents } from "@/lib/analytics";
import { EMPTY_FILTERS } from "@/lib/types";

const push = vi.fn();
const prefetch = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, prefetch }),
}));

const reducedMotion = vi.hoisted(() => ({ value: false }));
vi.mock("./use-reduced-motion", () => ({
  useReducedMotion: () => reducedMotion.value,
}));

const { useActivityPicker } = await import("./use-activity-picker");

describe("useActivityPicker", () => {
  beforeEach(() => {
    push.mockClear();
    prefetch.mockClear();
    reducedMotion.value = false;
    clearEvents();
  });

  it("holds the result in a pending state so the reel can play it", () => {
    const { result } = renderHook(() => useActivityPicker());

    act(() => result.current.pick("calm", "button"));

    expect(result.current.pending).not.toBeNull();
    expect(result.current.busy).toBe(true);
    // Nothing navigates until the reel lands.
    expect(push).not.toHaveBeenCalled();
  });

  it("navigates when the reel lands, carrying the need", async () => {
    const { result } = renderHook(() => useActivityPicker());

    act(() => result.current.pick("calm", "button"));
    const chosen = result.current.pending!.activity;
    act(() => result.current.complete());

    expect(push).toHaveBeenCalledWith(`/activity/${chosen.id}?need=calm`);
    // pending clears after a rAF so the reel overlay covers the home screen
    // until the router transition has committed.
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });
    expect(result.current.pending).toBeNull();
  });

  it("skips the reel entirely under prefers-reduced-motion", () => {
    reducedMotion.value = true;
    const { result } = renderHook(() => useActivityPicker());

    act(() => result.current.pick("wake", "button"));

    expect(result.current.pending).toBeNull();
    expect(push).toHaveBeenCalledOnce();
    expect(push.mock.calls[0][0]).toContain("?need=wake");
  });

  it("ignores a second trigger while one is already in flight", () => {
    const { result } = renderHook(() => useActivityPicker());

    act(() => result.current.pick("fun", "button"));
    const first = result.current.pending!.activity.id;
    act(() => result.current.pick("fun", "shake"));

    expect(result.current.pending!.activity.id).toBe(first);
  });

  it("reports no match rather than navigating nowhere", () => {
    const { result } = renderHook(() => useActivityPicker());

    act(() =>
      result.current.pick("calm", "button", {
        ...EMPTY_FILTERS,
        energy: ["high"],
        noise: ["quiet"],
        movement: ["seated"],
        durations: ["5-10-min"],
        equipment: ["whiteboard"],
      }),
    );

    expect(result.current.noMatch).toBe(true);
    expect(result.current.pending).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it("tracks a shake as a shake", () => {
    const { result } = renderHook(() => useActivityPicker());
    act(() => result.current.pick("reset", "shake"));

    expect(readEvents().map((e) => e.name)).toContain("shake_triggered");
  });

  it("tracks surprise me only when that's what was asked for", () => {
    const { result } = renderHook(() => useActivityPicker());

    act(() => result.current.pick("surprise", "button"));
    expect(readEvents().map((e) => e.name)).toContain("surprise_me_clicked");

    clearEvents();
    act(() => result.current.complete());
    act(() => result.current.pick("calm", "button"));
    expect(readEvents().map((e) => e.name)).not.toContain("surprise_me_clicked");
  });

  it("records first_activity exactly once, ever", () => {
    const { result } = renderHook(() => useActivityPicker());

    act(() => result.current.pick("fun", "button"));
    act(() => result.current.complete());
    act(() => result.current.pick("fun", "button"));

    const firsts = readEvents().filter((e) => e.name === "first_activity");
    expect(firsts).toHaveLength(1);
  });

  it("prefetches the routes a pick could land on", () => {
    const { result } = renderHook(() => useActivityPicker());

    act(() => result.current.prefetch("calm"));

    expect(prefetch).toHaveBeenCalled();
    for (const [url] of prefetch.mock.calls) {
      expect(url).toMatch(/^\/activity\/[a-z0-9-]+\?need=calm$/);
    }
  });

  it("remembers what it showed, so the next pick differs", async () => {
    const { result } = renderHook(() => useActivityPicker());

    act(() => result.current.pick("surprise", "button"));
    const first = result.current.pending!.activity.id;
    act(() => result.current.complete());
    // Wait for rAF to clear pending so the next pick isn't guarded.
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });
    act(() => result.current.pick("surprise", "button"));

    expect(result.current.pending!.activity.id).not.toBe(first);
  });
});
