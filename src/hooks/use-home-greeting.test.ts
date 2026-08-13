import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { KEYS } from "@/lib/storage";
import { sessionStore } from "@/lib/storage/store";
import { writeKey } from "@/lib/storage/store";
import { useHomeGreeting } from "./use-home-greeting";

describe("useHomeGreeting", () => {
  afterEach(() => {
    sessionStore.reset();
  });

  it("returns a non-empty string", () => {
    writeKey(KEYS.name, "Sarah");
    const { result } = renderHook(() => useHomeGreeting());
    expect(result.current.length).toBeGreaterThan(0);
  });

  it("substitutes the stored name into personalised prompts", () => {
    writeKey(KEYS.name, "Sarah");
    // Force a name-containing prompt (index 0 is "What do you need, {{name}}?")
    sessionStore.writeKey(KEYS.homeGreeting, 0);

    const { result } = renderHook(() => useHomeGreeting());

    expect(result.current).toBe("What do you need, Sarah?");
    expect(result.current).not.toContain("{{name}}");
  });

  it("falls back to a generic greeting when the name is empty and a personalised prompt is picked", () => {
    // No name stored — default is ""
    sessionStore.writeKey(KEYS.homeGreeting, 0); // personalised prompt

    const { result } = renderHook(() => useHomeGreeting());

    expect(result.current).toBe("What do you need?");
    expect(result.current).not.toContain("{{name}}");
  });

  it("returns a generic prompt untouched when no name is needed", () => {
    sessionStore.writeKey(KEYS.homeGreeting, 1); // "What are you looking for?"

    const { result } = renderHook(() => useHomeGreeting());

    expect(result.current).toBe("What are you looking for?");
  });

  it("stays stable across re-renders within the same session", () => {
    writeKey(KEYS.name, "Sarah");

    const { result, rerender } = renderHook(() => useHomeGreeting());
    const first = result.current;

    rerender();
    rerender();

    expect(result.current).toBe(first);
  });
});
