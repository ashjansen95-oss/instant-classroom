import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { isHomeStep, useWalkthrough } from "./use-walkthrough";

describe("useWalkthrough", () => {
  it("starts inactive for a returning teacher", () => {
    const { result } = renderHook(() => useWalkthrough());
    expect(result.current.step).toBeNull();
  });

  it("start() begins at the first home-screen stop", () => {
    const { result } = renderHook(() => useWalkthrough());
    act(() => result.current.start());
    expect(result.current.step).toBe("tile");
  });

  it("next() walks through every stop in order, then finishes", () => {
    const { result } = renderHook(() => useWalkthrough());
    act(() => result.current.start());

    const expected = ["more", "surprise", "card", "another", "feedback", "save", null];
    for (const step of expected) {
      act(() => result.current.next());
      expect(result.current.step).toBe(step);
    }
  });

  it("next() is a no-op once the tour has already finished", () => {
    const { result } = renderHook(() => useWalkthrough());
    act(() => result.current.next());
    expect(result.current.step).toBeNull();
  });

  it("finish() ends the tour from anywhere", () => {
    const { result } = renderHook(() => useWalkthrough());
    act(() => result.current.start());
    act(() => result.current.next());
    act(() => result.current.finish());
    expect(result.current.step).toBeNull();
  });

  it("persists across a remount, so an interrupted tour resumes rather than restarting", () => {
    const first = renderHook(() => useWalkthrough());
    act(() => first.result.current.start());
    act(() => first.result.current.next());
    first.unmount();

    const second = renderHook(() => useWalkthrough());
    expect(second.result.current.step).toBe("more");
  });
});

describe("isHomeStep", () => {
  it("is true for the three home-screen stops", () => {
    expect(isHomeStep("tile")).toBe(true);
    expect(isHomeStep("more")).toBe(true);
    expect(isHomeStep("surprise")).toBe(true);
  });

  it("is false for the activity-screen stops and for null", () => {
    expect(isHomeStep("card")).toBe(false);
    expect(isHomeStep("another")).toBe(false);
    expect(isHomeStep("feedback")).toBe(false);
    expect(isHomeStep("save")).toBe(false);
    expect(isHomeStep(null)).toBe(false);
  });
});
