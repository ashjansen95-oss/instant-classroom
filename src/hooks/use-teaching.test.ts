import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KEYS, STORAGE_PREFIX } from "@/lib/storage";
import { writeKey } from "@/lib/storage/store";
import { useActiveLevel, useTeaching } from "./use-teaching";

const setCountry = (code: string) => writeKey(KEYS.country, code);

describe("useTeaching", () => {
  it("starts unconfigured", () => {
    const { result } = renderHook(() => useTeaching());

    expect(result.current.teachingLevels).toEqual([]);
    expect(result.current.defaultTeachingLevel).toBeNull();
    expect(result.current.isConfigured).toBe(false);
  });

  it("records the levels a teacher teaches, in order", () => {
    const { result } = renderHook(() => useTeaching());

    act(() => result.current.setTeachingLevels([10, 7, 8]));

    expect(result.current.teachingLevels).toEqual([7, 8, 10]);
    expect(result.current.isConfigured).toBe(true);
  });

  it("persists so it is never asked for twice", () => {
    const first = renderHook(() => useTeaching());
    act(() => first.result.current.setTeachingLevels([8]));
    first.unmount();

    const second = renderHook(() => useTeaching());
    expect(second.result.current.teachingLevels).toEqual([8]);
    expect(window.localStorage.getItem(`${STORAGE_PREFIX}${KEYS.teaching}`)).toContain("8");
  });

  it("toggles a level on and off", () => {
    const { result } = renderHook(() => useTeaching());

    act(() => result.current.toggleTeachingLevel(5));
    expect(result.current.teachingLevels).toEqual([5]);

    act(() => result.current.toggleTeachingLevel(5));
    expect(result.current.teachingLevels).toEqual([]);
  });

  it("defaults to the first level until told otherwise", () => {
    const { result } = renderHook(() => useTeaching());
    act(() => result.current.setTeachingLevels([7, 8, 10]));

    expect(result.current.defaultTeachingLevel).toBe(7);

    act(() => result.current.setDefaultTeachingLevel(8));
    expect(result.current.defaultTeachingLevel).toBe(8);
  });

  it("never leaves the default pointing at a level they dropped", () => {
    const { result } = renderHook(() => useTeaching());
    act(() => result.current.setTeachingLevels([7, 8]));
    act(() => result.current.setDefaultTeachingLevel(8));

    act(() => result.current.toggleTeachingLevel(8));

    expect(result.current.teachingLevels).toEqual([7]);
    expect(result.current.defaultTeachingLevel).toBe(7);
  });

  it("drops levels a new country doesn't have", () => {
    setCountry("GB");
    const { result } = renderHook(() => useTeaching());
    act(() => result.current.setTeachingLevels([12, 13]));
    expect(result.current.teachingLevels).toEqual([12, 13]);

    // Australia has no Year 13.
    act(() => setCountry("AU"));
    expect(result.current.teachingLevels).toEqual([12]);
  });

  it("keeps the same classes when only the wording changes", () => {
    setCountry("AU");
    const { result } = renderHook(() => useTeaching());
    act(() => result.current.setTeachingLevels([8]));

    act(() => setCountry("US"));

    // Same canonical level; the app now just calls it Grade 8.
    expect(result.current.teachingLevels).toEqual([8]);
  });
});

describe("useActiveLevel", () => {
  it("starts on the default teaching level", () => {
    const teaching = renderHook(() => useTeaching());
    act(() => teaching.result.current.setTeachingLevels([7, 8, 10]));
    act(() => teaching.result.current.setDefaultTeachingLevel(8));

    const { result } = renderHook(() => useActiveLevel());
    expect(result.current.activeLevel).toBe(8);
  });

  it("switches for the session without changing the default", () => {
    const teaching = renderHook(() => useTeaching());
    act(() => teaching.result.current.setTeachingLevels([7, 8, 10]));
    act(() => teaching.result.current.setDefaultTeachingLevel(8));

    const { result } = renderHook(() => useActiveLevel());
    act(() => result.current.setActiveLevel(10));

    expect(result.current.activeLevel).toBe(10);
    expect(teaching.result.current.defaultTeachingLevel).toBe(8);
  });

  it("does not persist the session choice to local storage", () => {
    const teaching = renderHook(() => useTeaching());
    act(() => teaching.result.current.setTeachingLevels([7, 8]));

    const { result } = renderHook(() => useActiveLevel());
    act(() => result.current.setActiveLevel(7));

    // Next launch starts from the default again, not from this.
    expect(window.localStorage.getItem(`${STORAGE_PREFIX}${KEYS.activeLevel}`)).toBeNull();
    expect(window.sessionStorage.getItem(`${STORAGE_PREFIX}${KEYS.activeLevel}`)).toBe("7");
  });

  it("ignores a session level they no longer teach", () => {
    const teaching = renderHook(() => useTeaching());
    act(() => teaching.result.current.setTeachingLevels([7, 8]));

    const { result } = renderHook(() => useActiveLevel());
    act(() => result.current.setActiveLevel(8));
    act(() => teaching.result.current.setTeachingLevels([7]));

    expect(result.current.activeLevel).toBe(7);
  });

  it("is null before setup, so nothing is filtered by accident", () => {
    const { result } = renderHook(() => useActiveLevel());
    expect(result.current.activeLevel).toBeNull();
  });
});
