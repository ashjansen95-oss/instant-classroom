import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { STORAGE_PREFIX } from "@/lib/storage";
import { useFavourites } from "./use-favourites";
import { usePreferences } from "./use-preferences";
import { useFeedback } from "./use-activity-history";

describe("useFavourites", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useFavourites());
    expect(result.current.ids).toEqual([]);
  });

  it("adds and removes a favourite", () => {
    const { result } = renderHook(() => useFavourites());

    act(() => void result.current.toggle("would-you-rather"));
    expect(result.current.isFavourite("would-you-rather")).toBe(true);

    act(() => void result.current.toggle("would-you-rather"));
    expect(result.current.isFavourite("would-you-rather")).toBe(false);
  });

  it("puts the newest favourite first", () => {
    const { result } = renderHook(() => useFavourites());

    act(() => void result.current.toggle("a"));
    act(() => void result.current.toggle("b"));

    expect(result.current.ids).toEqual(["b", "a"]);
  });

  it("persists to storage", () => {
    const { result } = renderHook(() => useFavourites());
    act(() => void result.current.toggle("silent-line-up"));

    expect(window.localStorage.getItem(`${STORAGE_PREFIX}favourites`)).toBe('["silent-line-up"]');
  });

  it("survives a remount", () => {
    const first = renderHook(() => useFavourites());
    act(() => void first.result.current.toggle("box-breathing"));
    first.unmount();

    const second = renderHook(() => useFavourites());
    expect(second.result.current.ids).toEqual(["box-breathing"]);
  });

  it("keeps every component in sync", () => {
    // The bug this guards against: favouriting on the activity screen not
    // showing up on the Favourites tab until a reload.
    const a = renderHook(() => useFavourites());
    const b = renderHook(() => useFavourites());

    act(() => void a.result.current.toggle("simon-says"));

    expect(b.result.current.ids).toEqual(["simon-says"]);
  });

  it("removes directly by id", () => {
    const { result } = renderHook(() => useFavourites());
    act(() => void result.current.toggle("four-corners"));
    act(() => result.current.remove("four-corners"));

    expect(result.current.ids).toEqual([]);
  });
});

describe("usePreferences", () => {
  it("falls back to sensible defaults", () => {
    const { result } = renderHook(() => usePreferences());

    expect(result.current.preferences.sound).toBe(true);
    expect(result.current.preferences.shakeEnabled).toBe(true);
    expect(result.current.preferences.shakeSensitivity).toBe("medium");
  });

  it("stores a changed preference", () => {
    const { result } = renderHook(() => usePreferences());
    act(() => result.current.setPreference("sound", false));

    expect(result.current.preferences.sound).toBe(false);
  });

  it("merges defaults over a partial stored value", () => {
    // Simulates a preference added in a later version than the stored data.
    window.localStorage.setItem(`${STORAGE_PREFIX}preferences`, '{"sound":false}');

    const { result } = renderHook(() => usePreferences());

    expect(result.current.preferences.sound).toBe(false);
    expect(result.current.preferences.haptics).toBe(true);
  });
});

describe("useFeedback", () => {
  it("records a thumbs up", () => {
    const { result } = renderHook(() => useFeedback());
    act(() => result.current.submit("would-you-rather", "worked"));

    expect(result.current.feedback["would-you-rather"]).toBe("worked");
  });

  it("switches from up to down", () => {
    const { result } = renderHook(() => useFeedback());
    act(() => result.current.submit("would-you-rather", "worked"));
    act(() => result.current.submit("would-you-rather", "flopped"));

    expect(result.current.feedback["would-you-rather"]).toBe("flopped");
  });

  it("clears when the same thumb is tapped twice, for the inevitable misfire", () => {
    const { result } = renderHook(() => useFeedback());
    act(() => result.current.submit("would-you-rather", "worked"));
    act(() => result.current.submit("would-you-rather", "worked"));

    expect(result.current.feedback["would-you-rather"]).toBeUndefined();
  });
});
