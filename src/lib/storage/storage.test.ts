import { describe, expect, it, vi, afterEach } from "vitest";
import { STORAGE_PREFIX } from "./adapter";
import { localStorageAdapter as storage } from "./local";

describe("local storage adapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("round-trips values", () => {
    storage.set("favourites", ["a", "b"]);
    expect(storage.get<string[]>("favourites", [])).toEqual(["a", "b"]);
  });

  it("returns the fallback for a missing key", () => {
    expect(storage.get("nothing-here", "default")).toBe("default");
  });

  it("namespaces its keys", () => {
    storage.set("favourites", ["a"]);
    expect(window.localStorage.getItem(`${STORAGE_PREFIX}favourites`)).toBe('["a"]');
  });

  it("recovers from corrupt JSON instead of throwing", () => {
    window.localStorage.setItem(`${STORAGE_PREFIX}favourites`, "{not json");
    expect(storage.get<string[]>("favourites", [])).toEqual([]);
  });

  it("returns the fallback when a stored value is null", () => {
    storage.set("preferences", null);
    expect(storage.get("preferences", { sound: true })).toEqual({ sound: true });
  });

  it("survives a write failing, as it does in Safari private mode", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => storage.set("favourites", ["a"])).not.toThrow();
  });

  it("survives a read failing", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(storage.get("favourites", ["fallback"])).toEqual(["fallback"]);
  });

  it("removes a single key", () => {
    storage.set("favourites", ["a"]);
    storage.remove("favourites");
    expect(storage.get<string[]>("favourites", [])).toEqual([]);
  });

  it("clears only its own keys", () => {
    storage.set("favourites", ["a"]);
    storage.set("history", [{ id: "x" }]);
    window.localStorage.setItem("someone-elses-key", "keep me");

    storage.clear();

    expect(storage.get<string[]>("favourites", [])).toEqual([]);
    expect(storage.get<unknown[]>("history", [])).toEqual([]);
    expect(window.localStorage.getItem("someone-elses-key")).toBe("keep me");
  });
});
