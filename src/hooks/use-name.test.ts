import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useName } from "./use-name";

describe("useName", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useName());
    expect(result.current.name).toBe("");
  });

  it("stores a name and trims whitespace", () => {
    const { result } = renderHook(() => useName());

    act(() => result.current.setName("  Sarah  "));

    expect(result.current.name).toBe("Sarah");
  });
});
