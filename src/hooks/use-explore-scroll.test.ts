import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { KEYS } from "@/lib/storage";
import { sessionStore } from "@/lib/storage/store";
import { useExploreScroll } from "./use-explore-scroll";

/**
 * The real scroll container lives in the root layout, outside anything a
 * hook test renders — stood up here by hand, the same `data-*` + querySelector
 * targeting the Spotlight component uses for exactly the same reason: no ref
 * to thread through unrelated layers.
 */
function addScrollContainer() {
  const el = document.createElement("div");
  el.setAttribute("data-scroll-container", "");
  document.body.appendChild(el);
  return el;
}

describe("useExploreScroll", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = addScrollContainer();
  });

  afterEach(() => {
    container.remove();
  });

  it("restores a previously saved offset on mount", () => {
    sessionStore.writeKey(KEYS.exploreScroll, 240);

    renderHook(() => useExploreScroll());

    expect(container.scrollTop).toBe(240);
  });

  it("leaves the container alone when nothing was saved", () => {
    renderHook(() => useExploreScroll());

    expect(container.scrollTop).toBe(0);
  });

  it("saves the offset on unmount, ready for next time", () => {
    const { unmount } = renderHook(() => useExploreScroll());
    container.scrollTop = 500;

    unmount();

    expect(sessionStore.readKey(KEYS.exploreScroll, null)).toBe(500);
  });

  it("never throws if the scroll container isn't in the DOM", () => {
    container.remove();

    expect(() => {
      const { unmount } = renderHook(() => useExploreScroll());
      unmount();
    }).not.toThrow();
  });
});
