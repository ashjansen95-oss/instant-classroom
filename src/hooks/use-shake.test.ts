import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useShake } from "./use-shake";

/**
 * Synthetic DeviceMotion events. The real hardware fires roughly every 16ms;
 * what matters here is that a deliberate shake triggers, a gentle wobble
 * doesn't, and a held shake doesn't fire ten times.
 */
function motion(x: number, y = 0, z = 0) {
  const event = new Event("devicemotion") as DeviceMotionEvent & {
    accelerationIncludingGravity: { x: number; y: number; z: number };
  };
  Object.defineProperty(event, "accelerationIncludingGravity", {
    value: { x, y, z },
    writable: false,
  });
  return event;
}

function shakeHard(times = 4) {
  for (let i = 0; i < times; i++) {
    act(() => {
      window.dispatchEvent(motion(i % 2 === 0 ? -30 : 30));
      vi.advanceTimersByTime(50);
    });
  }
}

describe("useShake", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom has no DeviceMotionEvent; stand one in without requestPermission,
    // which is the Android Chrome case.
    Object.defineProperty(window, "DeviceMotionEvent", {
      value: class {},
      configurable: true,
      writable: true,
    });
    // The hook also requires a touch device, so desktop never gets told to shake.
    Object.defineProperty(navigator, "maxTouchPoints", { value: 5, configurable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(window, "DeviceMotionEvent");
    Object.defineProperty(navigator, "maxTouchPoints", { value: 0, configurable: true });
  });

  it("listens straight away where no permission is required", () => {
    const { result } = renderHook(() => useShake({ onShake: vi.fn() }));
    expect(result.current.status).toBe("listening");
  });

  it("reports unsupported when there is no DeviceMotion", () => {
    Reflect.deleteProperty(window, "DeviceMotionEvent");
    const { result } = renderHook(() => useShake({ onShake: vi.fn() }));
    expect(result.current.status).toBe("unsupported");
  });

  it("reports unsupported on a desktop, which has DeviceMotion but no accelerometer", () => {
    Object.defineProperty(navigator, "maxTouchPoints", { value: 0, configurable: true });
    const { result } = renderHook(() => useShake({ onShake: vi.fn() }));
    expect(result.current.status).toBe("unsupported");
  });

  it("fires on a deliberate shake", () => {
    const onShake = vi.fn();
    renderHook(() => useShake({ onShake }));

    shakeHard();

    expect(onShake).toHaveBeenCalledOnce();
  });

  it("ignores small movements", () => {
    const onShake = vi.fn();
    renderHook(() => useShake({ onShake }));

    for (let i = 0; i < 20; i++) {
      act(() => {
        window.dispatchEvent(motion(i % 2 === 0 ? -2 : 2));
        vi.advanceTimersByTime(50);
      });
    }

    expect(onShake).not.toHaveBeenCalled();
  });

  it("needs several sharp movements, not one jolt", () => {
    const onShake = vi.fn();
    renderHook(() => useShake({ onShake }));

    act(() => {
      window.dispatchEvent(motion(0));
      vi.advanceTimersByTime(50);
      window.dispatchEvent(motion(40));
      vi.advanceTimersByTime(50);
    });

    expect(onShake).not.toHaveBeenCalled();
  });

  it("debounces a continuous shake", () => {
    const onShake = vi.fn();
    renderHook(() => useShake({ onShake }));

    shakeHard(20);

    expect(onShake).toHaveBeenCalledOnce();
  });

  it("fires again once the cooldown has passed", () => {
    const onShake = vi.fn();
    renderHook(() => useShake({ onShake }));

    shakeHard();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    shakeHard();

    expect(onShake).toHaveBeenCalledTimes(2);
  });

  it("does not fire when shake is disabled", () => {
    const onShake = vi.fn();
    renderHook(() => useShake({ onShake, enabled: false }));

    shakeHard();

    expect(onShake).not.toHaveBeenCalled();
  });

  it("takes more force at low sensitivity than at high", () => {
    const low = vi.fn();
    const high = vi.fn();

    renderHook(() => useShake({ onShake: low, sensitivity: "low" }));
    renderHook(() => useShake({ onShake: high, sensitivity: "high" }));

    // ~15 m/s² of change: over the "high" threshold, under the "low" one.
    for (let i = 0; i < 6; i++) {
      act(() => {
        window.dispatchEvent(motion(i % 2 === 0 ? 0 : 15));
        vi.advanceTimersByTime(50);
      });
    }

    expect(high).toHaveBeenCalled();
    expect(low).not.toHaveBeenCalled();
  });

  it("exposes a shaking flag for visual feedback", () => {
    const { result } = renderHook(() => useShake({ onShake: vi.fn() }));

    shakeHard(2);
    expect(result.current.shaking).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.shaking).toBe(false);
  });

  describe("on iOS, where permission is required", () => {
    it("waits for permission before listening", () => {
      Object.defineProperty(window, "DeviceMotionEvent", {
        value: class {
          static requestPermission = vi.fn().mockResolvedValue("granted");
        },
        configurable: true,
        writable: true,
      });

      const { result } = renderHook(() => useShake({ onShake: vi.fn() }));
      expect(result.current.status).toBe("needs-permission");
    });

    it("listens once permission is granted", async () => {
      Object.defineProperty(window, "DeviceMotionEvent", {
        value: class {
          static requestPermission = vi.fn().mockResolvedValue("granted");
        },
        configurable: true,
        writable: true,
      });

      const { result } = renderHook(() => useShake({ onShake: vi.fn() }));
      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.status).toBe("listening");
    });

    it("degrades to denied when the teacher says no", async () => {
      Object.defineProperty(window, "DeviceMotionEvent", {
        value: class {
          static requestPermission = vi.fn().mockResolvedValue("denied");
        },
        configurable: true,
        writable: true,
      });

      const { result } = renderHook(() => useShake({ onShake: vi.fn() }));
      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.status).toBe("denied");
    });

    it("degrades to denied when the request throws", async () => {
      Object.defineProperty(window, "DeviceMotionEvent", {
        value: class {
          static requestPermission = vi.fn().mockRejectedValue(new Error("nope"));
        },
        configurable: true,
        writable: true,
      });

      const { result } = renderHook(() => useShake({ onShake: vi.fn() }));
      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.status).toBe("denied");
    });
  });
});
