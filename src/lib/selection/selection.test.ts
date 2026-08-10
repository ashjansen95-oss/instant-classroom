import { describe, expect, it } from "vitest";
import { ACTIVITIES } from "@/data/activities";
import { EMPTY_FILTERS, type FilterState, type HistoryEntry, type Need } from "@/lib/types";
import { applyFilters, durationBucketOf, matchesFilters } from "./filter";
import { pushHistory, HISTORY_LIMIT } from "./history";
import { pickActivity, similarActivities } from "./pick";
import { scoreForNeed } from "./score";

const filters = (overrides: Partial<FilterState> = {}): FilterState => ({
  ...EMPTY_FILTERS,
  ...overrides,
});

/** Deterministic rng so "random" behaviour can actually be asserted. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Draw `count` activities in sequence, feeding each result back into history. */
function drawSequence(need: Need, count: number, seed = 42) {
  const rng = seeded(seed);
  let history: HistoryEntry[] = [];
  const drawn = [];

  for (let i = 0; i < count; i++) {
    const activity = pickActivity({ need, history, rng });
    if (!activity) break;
    drawn.push(activity);
    history = pushHistory(history, activity, i);
  }

  return drawn;
}

describe("filters", () => {
  it("treats an empty filter group as no opinion", () => {
    expect(applyFilters(ACTIVITIES, EMPTY_FILTERS)).toHaveLength(ACTIVITIES.length);
  });

  it("filters by energy", () => {
    const result = applyFilters(ACTIVITIES, filters({ energy: ["calm"] }));
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((a) => a.energy === "calm")).toBe(true);
  });

  it("filters by duration bucket", () => {
    const result = applyFilters(ACTIVITIES, filters({ durations: ["2-min"] }));
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((a) => a.duration >= 91 && a.duration <= 150)).toBe(true);
  });

  it("combines duration buckets as OR, and groups as AND", () => {
    const result = applyFilters(
      ACTIVITIES,
      filters({ durations: ["30-sec", "1-min"], noise: ["quiet"] }),
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((a) => a.duration <= 90 && a.noise === "quiet")).toBe(true);
  });

  it("matches an activity when it has any of the selected equipment", () => {
    const result = applyFilters(ACTIVITIES, filters({ equipment: ["none"] }));
    expect(result.every((a) => a.equipment.includes("none"))).toBe(true);
  });

  it("matches an activity when it covers any of the selected year levels", () => {
    const result = applyFilters(ACTIVITIES, filters({ yearLevels: ["years-10-12"] }));
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((a) => a.yearLevels.includes("years-10-12"))).toBe(true);
  });

  it("can produce an empty result for an over-specified class", () => {
    const impossible = filters({
      energy: ["high"],
      noise: ["quiet"],
      movement: ["seated"],
      durations: ["5-10-min"],
      equipment: ["whiteboard"],
    });
    expect(applyFilters(ACTIVITIES, impossible)).toHaveLength(0);
  });

  it("maps durations to the right bucket", () => {
    expect(durationBucketOf(30)).toBe("30-sec");
    expect(durationBucketOf(60)).toBe("1-min");
    expect(durationBucketOf(120)).toBe("2-min");
    expect(durationBucketOf(300)).toBe("3-5-min");
    expect(durationBucketOf(600)).toBe("5-10-min");
    expect(durationBucketOf(99999)).toBeNull();
  });

  it("agrees between matchesFilters and applyFilters", () => {
    const f = filters({ energy: ["high"], movement: ["movement"] });
    const applied = applyFilters(ACTIVITIES, f);
    for (const activity of ACTIVITIES) {
      expect(matchesFilters(activity, f)).toBe(applied.includes(activity));
    }
  });
});

describe("need scoring", () => {
  it("scores a calm activity higher than a high-energy one for the calm need", () => {
    const calm = ACTIVITIES.find((a) => a.id === "box-breathing")!;
    const loud = ACTIVITIES.find((a) => a.id === "shake-it-out")!;
    expect(scoreForNeed(calm, "calm")).toBeGreaterThan(scoreForNeed(loud, "calm"));
  });

  it("scores a high-energy activity higher for the wake need", () => {
    const calm = ACTIVITIES.find((a) => a.id === "box-breathing")!;
    const loud = ACTIVITIES.find((a) => a.id === "shake-it-out")!;
    expect(scoreForNeed(loud, "wake")).toBeGreaterThan(scoreForNeed(calm, "wake"));
  });

  it("is flat for surprise me, so variety alone decides", () => {
    const scores = new Set(ACTIVITIES.map((a) => scoreForNeed(a, "surprise")));
    expect(scores.size).toBe(1);
  });

  it("keeps every score between 0 and 1", () => {
    const needs: Need[] = ["reset", "wake", "calm", "kill-time", "fun", "surprise"];
    for (const need of needs) {
      for (const activity of ACTIVITIES) {
        const score = scoreForNeed(activity, need);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("picking", () => {
  it("returns null when no activity matches the filters", () => {
    const impossible = filters({
      energy: ["high"],
      noise: ["quiet"],
      movement: ["seated"],
      durations: ["5-10-min"],
      equipment: ["whiteboard"],
    });
    expect(pickActivity({ need: "surprise", filters: impossible })).toBeNull();
  });

  it("never returns an activity that fails a hard filter", () => {
    const rng = seeded(7);
    const f = filters({ energy: ["calm"], movement: ["seated"] });
    for (let i = 0; i < 50; i++) {
      const activity = pickActivity({ need: "wake", filters: f, rng })!;
      expect(activity.energy).toBe("calm");
      expect(activity.movement).toBe("seated");
    }
  });

  it("actually returns calm activities when the teacher asks for calm", () => {
    const drawn = drawSequence("calm", 20);
    const calmish = drawn.filter((a) => a.energy === "calm" || a.energy === "low");
    expect(calmish.length).toBe(drawn.length);
    expect(drawn.every((a) => a.noise === "quiet")).toBe(true);
  });

  it("returns high-energy activities when the teacher asks to wake them up", () => {
    const drawn = drawSequence("wake", 20);
    expect(drawn.every((a) => a.energy === "high" || a.energy === "medium")).toBe(true);
    expect(drawn.every((a) => a.movement !== "seated" || a.noise !== "quiet")).toBe(true);
  });

  it("respects a 2-minute request", () => {
    const rng = seeded(11);
    for (let i = 0; i < 30; i++) {
      const activity = pickActivity({
        need: "kill-time",
        filters: filters({ durations: ["2-min"] }),
        rng,
      })!;
      expect(activity.duration).toBeGreaterThanOrEqual(91);
      expect(activity.duration).toBeLessThanOrEqual(150);
    }
  });

  it("never immediately repeats an activity", () => {
    const drawn = drawSequence("surprise", 50);
    expect(drawn.length).toBe(50);
    for (let i = 1; i < drawn.length; i++) {
      expect(drawn[i].id).not.toBe(drawn[i - 1].id);
    }
  });

  it("avoids repeating anything from the last several draws", () => {
    const drawn = drawSequence("surprise", 40);
    for (let i = 0; i < drawn.length; i++) {
      const window = drawn.slice(Math.max(0, i - 8), i);
      expect(window.map((a) => a.id)).not.toContain(drawn[i].id);
    }
  });

  it("does not serve five high-energy activities in a row on surprise me", () => {
    for (const seed of [1, 2, 3, 99, 12345]) {
      const drawn = drawSequence("surprise", 40, seed);
      for (let i = 4; i < drawn.length; i++) {
        const run = drawn.slice(i - 4, i + 1);
        const allSame = run.every((a) => a.energy === run[0].energy);
        expect(allSame, `energy run at index ${i} with seed ${seed}`).toBe(false);
      }
    }
  });

  it("does not repeat the same category five times in a row on surprise me", () => {
    const drawn = drawSequence("surprise", 40, 2024);
    for (let i = 4; i < drawn.length; i++) {
      const run = drawn.slice(i - 4, i + 1);
      const shared = run[0].categories.filter((category) =>
        run.every((a) => a.categories.includes(category)),
      );
      expect(shared).toHaveLength(0);
    }
  });

  it("produces genuine variety on surprise me", () => {
    const drawn = drawSequence("surprise", 30);
    expect(new Set(drawn.map((a) => a.id)).size).toBe(30);
    expect(new Set(drawn.map((a) => a.energy)).size).toBeGreaterThan(2);
  });

  it("still returns something when history covers most of a narrow pool", () => {
    const narrow = filters({ durations: ["5-10-min"] });
    const pool = applyFilters(ACTIVITIES, narrow);
    const history = pool.map((activity, index) => ({
      id: activity.id,
      categories: activity.categories,
      energy: activity.energy,
      duration: activity.duration,
      at: index,
    }));

    const result = pickActivity({ need: "surprise", filters: narrow, history });
    expect(result).not.toBeNull();
    expect(pool.map((a) => a.id)).toContain(result!.id);
  });

  it("is deterministic for a given seed", () => {
    expect(drawSequence("fun", 10, 5).map((a) => a.id)).toEqual(
      drawSequence("fun", 10, 5).map((a) => a.id),
    );
  });
});

describe("history", () => {
  it("adds newest first", () => {
    const history = pushHistory(pushHistory([], ACTIVITIES[0], 1), ACTIVITIES[1], 2);
    expect(history[0].id).toBe(ACTIVITIES[1].id);
    expect(history[1].id).toBe(ACTIVITIES[0].id);
  });

  it("caps at the limit", () => {
    let history: ReturnType<typeof pushHistory> = [];
    for (let i = 0; i < HISTORY_LIMIT + 10; i++) {
      history = pushHistory(history, ACTIVITIES[i % ACTIVITIES.length], i);
    }
    expect(history).toHaveLength(HISTORY_LIMIT);
  });
});

describe("similar activities", () => {
  it("returns other activities that share categories", () => {
    const activity = ACTIVITIES.find((a) => a.id === "box-breathing")!;
    const similar = similarActivities(activity, 3);

    expect(similar).toHaveLength(3);
    expect(similar.map((a) => a.id)).not.toContain(activity.id);
    expect(
      similar.every((a) => a.categories.some((c) => activity.categories.includes(c))),
    ).toBe(true);
  });
});
