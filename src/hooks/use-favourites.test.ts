import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { STORAGE_PREFIX } from "@/lib/storage";
import { FEEDBACK_OPTIONS } from "@/lib/types";
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
  it("records a rating", () => {
    const { result } = renderHook(() => useFeedback());
    act(() => result.current.submit("would-you-rather", "loved"));

    expect(result.current.feedback["would-you-rather"]).toBe("loved");
  });

  it("switches between ratings", () => {
    const { result } = renderHook(() => useFeedback());
    act(() => result.current.submit("would-you-rather", "worked"));
    act(() => result.current.submit("would-you-rather", "never-again"));

    expect(result.current.feedback["would-you-rather"]).toBe("never-again");
  });

  it("clears when the same rating is tapped twice, for the inevitable misfire", () => {
    const { result } = renderHook(() => useFeedback());
    act(() => result.current.submit("would-you-rather", "fine"));
    act(() => result.current.submit("would-you-rather", "fine"));

    expect(result.current.feedback["would-you-rather"]).toBeUndefined();
  });

  it("offers five distinct ratings, not a thumb", () => {
    expect(FEEDBACK_OPTIONS.map((option) => option.rating)).toEqual([
      "fine",
      "worked",
      "flopped",
      "loved",
      "never-again",
    ]);

    // "Worked" and "they loved it" must stay separable — the second is the
    // only signal that tells us an activity is worth keeping.
    const positives = FEEDBACK_OPTIONS.filter((o) => o.tone === "positive");
    expect(positives.map((o) => o.rating)).toEqual(["worked", "loved"]);
  });
});
