import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTimer } from "./use-timer";

describe("useTimer", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const advance = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });

  it("starts idle with the full duration showing", () => {
    const { result } = renderHook(() => useTimer(120));

    expect(result.current.state).toBe("idle");
    expect(result.current.remainingSeconds).toBe(120);
    expect(result.current.progress).toBe(0);
  });

  it("counts down once started", () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => result.current.start());
    expect(result.current.state).toBe("running");

    advance(10_000);
    expect(result.current.remainingSeconds).toBe(50);
  });

  it("reports progress towards the end", () => {
    const { result } = renderHook(() => useTimer(100));

    act(() => result.current.start());
    advance(25_000);

    expect(result.current.progress).toBeCloseTo(0.25, 2);
  });

  it("pauses and holds the remaining time", () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => result.current.start());
    advance(20_000);
    act(() => result.current.pause());

    expect(result.current.state).toBe("paused");
    expect(result.current.remainingSeconds).toBe(40);

    // Time passing while paused must not consume the countdown.
    advance(30_000);
    expect(result.current.remainingSeconds).toBe(40);
  });

  it("resumes from where it paused", () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => result.current.start());
    advance(20_000);
    act(() => result.current.pause());
    advance(60_000);
    act(() => result.current.resume());
    advance(10_000);

    expect(result.current.state).toBe("running");
    expect(result.current.remainingSeconds).toBe(30);
  });

  it("resets back to the beginning", () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => result.current.start());
    advance(30_000);
    act(() => result.current.reset());

    expect(result.current.state).toBe("idle");
    expect(result.current.remainingSeconds).toBe(60);
    expect(result.current.progress).toBe(0);
  });

  it("finishes at zero and calls back exactly once", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTimer(5, onComplete));

    act(() => result.current.start());
    advance(6_000);

    expect(result.current.state).toBe("finished");
    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.progress).toBe(1);
    expect(onComplete).toHaveBeenCalledOnce();

    advance(5_000);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("stays accurate across a long gap, as when the phone sleeps", () => {
    const { result } = renderHook(() => useTimer(600));

    act(() => result.current.start());
    // One jump rather than many small ticks: this is what a locked screen does,
    // and a tick-counting timer would be badly wrong here.
    act(() => {
      vi.setSystemTime(Date.now() + 300_000);
      vi.advanceTimersByTime(200);
    });

    expect(result.current.remainingSeconds).toBe(300);
  });

  it("toggles through running, paused and back", () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => result.current.toggle());
    expect(result.current.state).toBe("running");

    act(() => result.current.toggle());
    expect(result.current.state).toBe("paused");

    act(() => result.current.toggle());
    expect(result.current.state).toBe("running");
  });

  it("resets when the activity changes", () => {
    const { result, rerender } = renderHook(({ duration }) => useTimer(duration), {
      initialProps: { duration: 60 },
    });

    act(() => result.current.start());
    advance(20_000);

    rerender({ duration: 120 });

    expect(result.current.state).toBe("idle");
    expect(result.current.remainingSeconds).toBe(120);
  });

  it("never counts below zero", () => {
    const { result } = renderHook(() => useTimer(3));

    act(() => result.current.start());
    advance(30_000);

    expect(result.current.remainingSeconds).toBe(0);
  });
});
