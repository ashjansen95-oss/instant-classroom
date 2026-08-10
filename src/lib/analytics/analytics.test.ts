import { beforeEach, describe, expect, it, vi } from "vitest";
import { EVENT_NAMES } from "./events";
import { clearEvents, localSink, readEvents, setSink, summariseEvents, track } from "./index";

describe("analytics", () => {
  beforeEach(() => {
    setSink(localSink);
    clearEvents();
  });

  it("records an event locally", () => {
    track("shake_triggered", { need: "calm" });

    const events = readEvents();
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe("shake_triggered");
    expect(events[0].props).toEqual({ need: "calm" });
    expect(events[0].at).toBeTypeOf("number");
  });

  it("keeps the newest events first", () => {
    track("page_view", { path: "/" });
    track("surprise_me_clicked");

    expect(readEvents().map((event) => event.name)).toEqual(["surprise_me_clicked", "page_view"]);
  });

  it("caps the buffer so it can't grow forever", () => {
    for (let i = 0; i < 250; i++) track("activity_viewed", { i });
    expect(readEvents()).toHaveLength(200);
  });

  it("summarises counts by event name", () => {
    track("activity_viewed", { id: "a" });
    track("activity_viewed", { id: "b" });
    track("timer_started", { id: "a" });

    expect(summariseEvents()).toEqual([
      { name: "activity_viewed", count: 2 },
      { name: "timer_started", count: 1 },
    ]);
  });

  it("routes through a swappable sink", () => {
    const custom = { track: vi.fn() };
    setSink(custom);

    track("filter_used", { group: "energy" });

    expect(custom.track).toHaveBeenCalledOnce();
    expect(custom.track.mock.calls[0][0]).toMatchObject({
      name: "filter_used",
      props: { group: "energy" },
    });
    // Nothing should reach the local buffer once the sink is replaced.
    expect(readEvents()).toHaveLength(0);
  });

  it("never lets a broken sink break the app", () => {
    setSink({
      track() {
        throw new Error("provider is down");
      },
    });

    expect(() => track("page_view")).not.toThrow();
  });

  it("covers every event the brief asks for", () => {
    expect(EVENT_NAMES).toEqual([
      "page_view",
      "first_activity",
      "activity_viewed",
      "activity_started",
      "activity_completed",
      "activity_skipped",
      "activity_favourited",
      "activity_feedback_positive",
      "activity_feedback_negative",
      "activity_feedback_neutral",
      "filter_used",
      "shake_triggered",
      "surprise_me_clicked",
      "timer_started",
    ]);
  });
});
