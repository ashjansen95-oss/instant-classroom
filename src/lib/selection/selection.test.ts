import { describe, expect, it } from "vitest";
import { ACTIVITIES } from "@/data/activities";
import { studentAgeForLevel, suitsLevel } from "@/lib/i18n";
import { EMPTY_FILTERS, type Activity, type FilterState, type HistoryEntry, type Need } from "@/lib/types";
import { applyFilters, durationBucketOf, matchesFilters } from "./filter";
import { pushHistory, HISTORY_LIMIT } from "./history";
import { pickActivity, pickSimilarActivities, similarActivities } from "./pick";
import { ageFit, scoreForNeed, similarityTo } from "./score";

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
function drawSequence(need: Need, count: number, seed = 42, level: number | null = null) {
  const rng = seeded(seed);
  let history: HistoryEntry[] = [];
  const drawn = [];

  for (let i = 0; i < count; i++) {
    const activity = pickActivity({ need, history, rng, country: "AU", level });
    if (!activity) break;
    drawn.push(activity);
    history = pushHistory(history, activity, i);
  }

  return drawn;
}

describe("filters", () => {
  it("treats an empty filter group as no opinion", () => {
    expect(applyFilters(ACTIVITIES, EMPTY_FILTERS, "AU")).toHaveLength(ACTIVITIES.length);
  });

  it("filters by energy", () => {
    const result = applyFilters(ACTIVITIES, filters({ energy: ["calm"] }), "AU");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((a) => a.energy === "calm")).toBe(true);
  });

  it("filters by duration bucket", () => {
    const result = applyFilters(ACTIVITIES, filters({ durations: ["2-min"] }), "AU");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((a) => a.duration >= 91 && a.duration <= 150)).toBe(true);
  });

  it("combines duration buckets as OR, and groups as AND", () => {
    const result = applyFilters(
      ACTIVITIES,
      filters({ durations: ["30-sec", "1-min"], noise: ["quiet"] }),
      "AU",
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((a) => a.duration <= 90 && a.noise === "quiet")).toBe(true);
  });

  it("matches an activity when it has any of the selected equipment", () => {
    const result = applyFilters(ACTIVITIES, filters({ equipment: ["none"] }), "AU");
    expect(result.every((a) => a.equipment.includes("none"))).toBe(true);
  });

  it("matches an activity whose age range suits a selected level", () => {
    const result = applyFilters(ACTIVITIES, filters({ levels: [11] }), "AU");
    expect(result.length).toBeGreaterThan(0);
    // AU Year 11 students are 16.5 mid-year.
    expect(result.every((a) => suitsLevel(a.ageRange, "AU", 11))).toBe(true);
  });

  it("treats several selected levels as OR", () => {
    const result = applyFilters(ACTIVITIES, filters({ levels: [0, 12] }), "AU");
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((a) => suitsLevel(a.ageRange, "AU", 0) || suitsLevel(a.ageRange, "AU", 12)),
    ).toBe(true);
  });

  it("resolves the same level differently by country", () => {
    // AU Year 8 is 13–14, GB Year 8 is 12–13, so the same filter selects
    // genuinely different activities.
    const au = applyFilters(ACTIVITIES, filters({ levels: [8] }), "AU").map((a) => a.id);
    const gb = applyFilters(ACTIVITIES, filters({ levels: [8] }), "GB").map((a) => a.id);

    expect(au).not.toEqual(gb);
  });

  it("filters to early years only", () => {
    const result = applyFilters(ACTIVITIES, filters({ levels: [0] }), "AU");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((a) => a.ageRange.min <= 5.5)).toBe(true);
  });

  it("can produce an empty result for an over-specified class", () => {
    const impossible = filters({
      energy: ["high"],
      noise: ["quiet"],
      movement: ["seated"],
      durations: ["5-10-min"],
      equipment: ["whiteboard"],
    });
    expect(applyFilters(ACTIVITIES, impossible, "AU")).toHaveLength(0);
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
    const applied = applyFilters(ACTIVITIES, f, "AU");
    for (const activity of ACTIVITIES) {
      expect(matchesFilters(activity, f, "AU")).toBe(applied.includes(activity));
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

    // Nothing recurs while it's still fresh; an eventual repeat is fine.
    for (let i = 0; i < drawn.length; i++) {
      const window = drawn.slice(Math.max(0, i - 10), i).map((a) => a.id);
      expect(window).not.toContain(drawn[i].id);
    }
    expect(new Set(drawn.map((a) => a.id)).size).toBeGreaterThanOrEqual(28);
    expect(new Set(drawn.map((a) => a.energy)).size).toBeGreaterThan(2);
  });

  it("still returns something when history covers most of a narrow pool", () => {
    const narrow = filters({ durations: ["5-10-min"] });
    const pool = applyFilters(ACTIVITIES, narrow, "AU");
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

describe("teaching level shapes recommendations", () => {
  it("never hands a Prep class something outside its age range", () => {
    const drawn = drawSequence("surprise", 40, 7, 0);
    const age = studentAgeForLevel("AU", 0);

    expect(drawn.length).toBeGreaterThan(20);
    for (const activity of drawn) {
      expect(
        activity.ageRange.min <= age && activity.ageRange.max >= age,
        `${activity.id} (${activity.ageRange.min}–${activity.ageRange.max}) is wrong for Prep`,
      ).toBe(true);
    }
  });

  it("never hands a Year 12 class something outside its age range", () => {
    const drawn = drawSequence("surprise", 40, 7, 12);
    const age = studentAgeForLevel("AU", 12);

    expect(drawn.length).toBeGreaterThan(20);
    for (const activity of drawn) {
      expect(
        activity.ageRange.min <= age && activity.ageRange.max >= age,
        `${activity.id} is wrong for Year 12`,
      ).toBe(true);
    }
  });

  it("gives a Year 1 and a Year 11 teacher substantially different activities", () => {
    // This is the whole feature: same button, different classes, different results.
    const young = new Set(drawSequence("surprise", 30, 3, 1).map((a) => a.id));
    const senior = new Set(drawSequence("surprise", 30, 3, 11).map((a) => a.id));

    const shared = [...young].filter((id) => senior.has(id));
    expect(shared.length / young.size).toBeLessThan(0.25);
  });

  it("keeps abstract reasoning away from the youngest classes", () => {
    const drawn = drawSequence("fun", 40, 5, 0).map((a) => a.id);

    for (const id of ["silent-debate", "what-if-history", "justify-the-absurd", "six-word-story"]) {
      expect(drawn, `Prep should never be offered ${id}`).not.toContain(id);
    }
  });

  it("keeps activities pitched at small children away from senior classes", () => {
    const drawn = drawSequence("wake", 40, 5, 11).map((a) => a.id);

    for (const id of ["animal-moves", "body-alphabet", "simon-says", "freeze-dance"]) {
      expect(drawn, `Year 11 should never be offered ${id}`).not.toContain(id);
    }
  });

  it("prefers activities squarely aimed at the class over ones that merely include it", () => {
    // ageFit rewards sitting in the middle of a band, not clinging to its edge.
    expect(ageFit({ min: 8, max: 12 }, 10)).toBeGreaterThan(ageFit({ min: 8, max: 12 }, 8));
    expect(ageFit({ min: 4, max: 18 }, 5)).toBeLessThan(ageFit({ min: 4, max: 7 }, 5.5));
    expect(ageFit({ min: 8, max: 12 }, 13)).toBe(0);
  });

  it("still gives variety within an age group", () => {
    const drawn = drawSequence("surprise", 25, 11, 4);

    // The pool is smaller once age is enforced, so an eventual repeat is fine —
    // what matters is that nothing recurs while it's still fresh.
    for (let i = 0; i < drawn.length; i++) {
      const window = drawn.slice(Math.max(0, i - 8), i).map((a) => a.id);
      expect(window).not.toContain(drawn[i].id);
    }
    expect(new Set(drawn.map((a) => a.id)).size).toBeGreaterThanOrEqual(18);
    expect(new Set(drawn.map((a) => a.energy)).size).toBeGreaterThan(2);
  });

  it("treats the same level differently in different countries", () => {
    const rng = () => 0.5;
    const au = pickActivity({ need: "surprise", country: "AU", level: 1, rng });
    const gb = pickActivity({ need: "surprise", country: "GB", level: 1, rng });

    // AU Year 1 is 6–7, GB Year 1 is 5–6. Both must be age-appropriate for
    // their own country, which is only possible if country is respected.
    expect(au && suitsLevel(au.ageRange, "AU", 1)).toBe(true);
    expect(gb && suitsLevel(gb.ageRange, "GB", 1)).toBe(true);
  });

  it("falls back to the whole library when no level is set", () => {
    const withLevel = drawSequence("surprise", 20, 9, 0).map((a) => a.id);
    const without = drawSequence("surprise", 20, 9, null).map((a) => a.id);

    expect(without).not.toEqual(withLevel);
    expect(without.length).toBe(20);
  });
});

describe("give me another like this", () => {
  const seed = ACTIVITIES.find((a) => a.id === "box-breathing")!;

  it("never returns the activity you were already looking at", () => {
    const rng = seeded(4);
    for (let i = 0; i < 30; i++) {
      const next = pickActivity({ need: "surprise", like: seed, rng })!;
      expect(next.id).not.toBe(seed.id);
    }
  });

  it("returns activities that actually resemble the one you asked about", () => {
    const rng = seeded(4);
    const drawn = Array.from(
      { length: 12 },
      () => pickActivity({ need: "surprise", like: seed, rng })!,
    );

    // Box Breathing is calm, quiet, seated, individual. Its neighbours should be too.
    const alike = drawn.filter(
      (a) => a.categories.some((c) => seed.categories.includes(c)) && a.noise === seed.noise,
    );
    expect(alike.length / drawn.length).toBeGreaterThan(0.7);
  });

  it("resembles the seed more closely than a plain surprise would", () => {
    // Drawn as a sequence with history, so both samples get real variety —
    // re-seeding per draw gives near-identical rng values and hides the effect.
    const draw = (like: typeof seed | null) => {
      const rng = seeded(21);
      let history: HistoryEntry[] = [];
      const out = [];
      for (let i = 0; i < 15; i++) {
        const activity = pickActivity({ need: "surprise", like, history, rng })!;
        out.push(activity);
        history = pushHistory(history, activity, i);
      }
      return out;
    };

    const average = (list: typeof ACTIVITIES) =>
      list.reduce((sum, a) => sum + similarityTo(a, seed), 0) / list.length;

    expect(average(draw(seed))).toBeGreaterThan(average(draw(null)) + 0.15);
  });

  it("still refuses anything the class is the wrong age for", () => {
    const childish = ACTIVITIES.find((a) => a.id === "animal-moves")!;
    const rng = seeded(9);

    for (let i = 0; i < 20; i++) {
      // Asking for "more like Animal Moves" as a Year 11 teacher must not
      // override the age constraint.
      const next = pickActivity({
        need: "surprise",
        like: childish,
        country: "AU",
        level: 11,
        rng,
      })!;
      expect(suitsLevel(next.ageRange, "AU", 11), `${next.id} is wrong for Year 11`).toBe(true);
    }
  });

  it("scores resemblance sensibly", () => {
    const calmQuiet = ACTIVITIES.find((a) => a.id === "body-scan")!;
    const loudActive = ACTIVITIES.find((a) => a.id === "shake-it-out")!;

    expect(similarityTo(calmQuiet, seed)).toBeGreaterThan(similarityTo(loudActive, seed));
    expect(similarityTo(seed, seed)).toBeCloseTo(1, 1);
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

describe("pickSimilarActivities — More Like This", () => {
  const seed = ACTIVITIES.find((a) => a.id === "box-breathing")!;

  it("returns the requested count, all distinct, none the seed itself", () => {
    const results = pickSimilarActivities(seed, 3, { rng: seeded(1) });

    expect(results).toHaveLength(3);
    expect(new Set(results.map((a) => a.id)).size).toBe(3);
    expect(results.map((a) => a.id)).not.toContain(seed.id);
  });

  it("resembles the seed more closely than a plain sample of the library", () => {
    const results = pickSimilarActivities(seed, 3, { rng: seeded(2) });
    const baseline = ACTIVITIES.slice(0, 3);

    const average = (list: Activity[]) =>
      list.reduce((sum, a) => sum + similarityTo(a, seed), 0) / list.length;

    expect(average(results)).toBeGreaterThan(average(baseline));
  });

  it("never suggests something the wrong age for the active class", () => {
    // Box Breathing suits everyone; pick a seed with a genuinely narrow band
    // so an age violation would be obvious if the hard constraint slipped.
    const narrow = ACTIVITIES.find((a) => a.id === "animal-moves")!; // ages 4–8

    for (const s of [3, 11, 27]) {
      const results = pickSimilarActivities(narrow, 3, {
        country: "AU",
        level: 11,
        rng: seeded(s),
      });
      for (const activity of results) {
        expect(
          suitsLevel(activity.ageRange, "AU", 11),
          `${activity.id} is wrong for a Year 11 class`,
        ).toBe(true);
      }
    }
  });

  it("still returns as many as it can when the library can't fill the count", () => {
    const results = pickSimilarActivities(seed, 3, {
      activities: [seed, ACTIVITIES[1]],
      rng: seeded(1),
    });
    expect(results.length).toBeLessThanOrEqual(1);
  });

  it("is deterministic for a given seed", () => {
    const a = pickSimilarActivities(seed, 3, { rng: seeded(5) }).map((x) => x.id);
    const b = pickSimilarActivities(seed, 3, { rng: seeded(5) }).map((x) => x.id);
    expect(a).toEqual(b);
  });
});
