import { describe, expect, it } from "vitest";
import { ACTIVITIES, getActivity } from "./index";
import {
  CATEGORIES,
  ENERGY_LEVELS,
  EQUIPMENT,
  FORMATS,
  MOVEMENTS,
  NOISE_LEVELS,
  DURATION_BUCKETS,
  type DurationBucket,
} from "@/lib/types";
import { COUNTRY_CODES, MAX_AGE, MIN_AGE, levelsIn, suitsLevel } from "@/lib/i18n";

/**
 * The data contract. These aren't stylistic preferences — every rule here maps
 * to something that breaks the product if it's violated: a teacher who can't
 * read the card in ten seconds, a filter that returns nothing, a duplicate ID
 * that makes favourites point at the wrong activity.
 */
describe("activity library", () => {
  it("has at least 100 activities", () => {
    expect(ACTIVITIES.length).toBeGreaterThanOrEqual(100);
  });

  it("has unique ids", () => {
    const ids = ACTIVITIES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique titles", () => {
    const titles = ACTIVITIES.map((a) => a.title.toLowerCase());
    expect(new Set(titles).size).toBe(titles.length);
  });

  it.each(ACTIVITIES)("$id is well formed", (activity) => {
    expect(activity.id).toMatch(/^[a-z0-9-]+$/);
    expect(activity.title.length).toBeGreaterThan(2);
    expect(activity.title.length).toBeLessThanOrEqual(40);

    // One sentence, readable at a glance.
    expect(activity.description.length).toBeLessThanOrEqual(140);
    expect(activity.description.endsWith(".")).toBe(true);
    expect(activity.description.slice(0, -1)).not.toContain(". ");

    // Six steps is the limit — beyond that it isn't a fill-the-gap activity.
    expect(activity.instructions.length).toBeGreaterThanOrEqual(2);
    expect(activity.instructions.length).toBeLessThanOrEqual(6);
    for (const step of activity.instructions) {
      expect(step.trim()).toBe(step);
      expect(step.length).toBeGreaterThan(5);
      expect(step.length).toBeLessThanOrEqual(150);
    }

    expect(ENERGY_LEVELS).toContain(activity.energy);
    expect(NOISE_LEVELS).toContain(activity.noise);
    expect(FORMATS).toContain(activity.format);
    expect(MOVEMENTS).toContain(activity.movement);

    expect(activity.equipment.length).toBeGreaterThan(0);
    for (const item of activity.equipment) expect(EQUIPMENT).toContain(item);
    // "none" is a statement about the whole activity, so it can't be combined.
    if (activity.equipment.includes("none")) expect(activity.equipment).toHaveLength(1);

    const { min, max } = activity.ageRange;
    expect(min).toBeGreaterThanOrEqual(MIN_AGE);
    expect(max).toBeLessThanOrEqual(MAX_AGE);
    // At least a year wide, or it can't cover a single school year.
    expect(max - min).toBeGreaterThanOrEqual(1);

    expect(activity.categories.length).toBeGreaterThan(0);
    for (const category of activity.categories) expect(CATEGORIES).toContain(category);

    expect(activity.tags.length).toBeGreaterThan(0);
  });

  it.each(ACTIVITIES)("$id has a duration that lands in a filter bucket", (activity) => {
    expect(activity.duration).toBeGreaterThan(0);
    const buckets = Object.values(DURATION_BUCKETS);
    const fits = buckets.some((b) => activity.duration >= b.min && activity.duration <= b.max);
    expect(fits).toBe(true);
  });

  it("covers every category with a usable number of activities", () => {
    for (const category of CATEGORIES) {
      const matches = ACTIVITIES.filter((a) => a.categories.includes(category));
      expect(
        matches.length,
        `category "${category}" only has ${matches.length} activities`,
      ).toBeGreaterThanOrEqual(8);
    }
  });

  it("covers every energy level", () => {
    for (const energy of ENERGY_LEVELS) {
      const matches = ACTIVITIES.filter((a) => a.energy === energy);
      expect(matches.length, `energy "${energy}" is empty`).toBeGreaterThanOrEqual(5);
    }
  });

  it("covers every duration bucket", () => {
    for (const [key, bucket] of Object.entries(DURATION_BUCKETS) as [
      DurationBucket,
      { min: number; max: number },
    ][]) {
      const matches = ACTIVITIES.filter(
        (a) => a.duration >= bucket.min && a.duration <= bucket.max,
      );
      expect(matches.length, `duration bucket "${key}" is empty`).toBeGreaterThanOrEqual(3);
    }
  });

  it("gives every level in every market something to run", () => {
    // A teacher who picks "Junior Infants" in Ireland or "Grade 12" in the US
    // must not hit an empty library.
    for (const code of COUNTRY_CODES) {
      for (const level of levelsIn(code)) {
        const matches = ACTIVITIES.filter((a) => suitsLevel(a.ageRange, code, level));
        expect(
          matches.length,
          `${code} level ${level} only has ${matches.length} activities`,
        ).toBeGreaterThanOrEqual(15);
      }
    }
  });

  it("stores ages, never a country's words for a year level", () => {
    const source = JSON.stringify(ACTIVITIES);
    for (const term of ["Year 8", "Grade 8", "Kindergarten", "Reception", "Junior Infants"]) {
      expect(source, `"${term}" must not be baked into activity data`).not.toContain(term);
    }
  });

  it("classifies deliberately rather than marking everything all-ages", () => {
    const allAges = ACTIVITIES.filter((a) => a.ageRange.min <= 5 && a.ageRange.max >= 17);
    expect(
      allAges.length / ACTIVITIES.length,
      `${allAges.length} activities claim to suit everyone from 5 to 17`,
    ).toBeLessThan(0.1);
  });

  it("keeps the youngest and oldest classes genuinely different", () => {
    // The point of the whole feature: a Prep teacher and a Year 12 teacher
    // should not be looking at the same library.
    const prep = ACTIVITIES.filter((a) => suitsLevel(a.ageRange, "AU", 0)).map((a) => a.id);
    const year12 = ACTIVITIES.filter((a) => suitsLevel(a.ageRange, "AU", 12)).map((a) => a.id);

    const shared = prep.filter((id) => year12.includes(id));
    expect(shared.length / Math.min(prep.length, year12.length)).toBeLessThan(0.3);
  });

  it("keeps abstract reasoning away from the youngest classes", () => {
    // Spot-check the specific failure mode the brief calls out.
    for (const id of ["silent-debate", "what-if-history", "justify-the-absurd", "six-word-story"]) {
      const activity = getActivity(id)!;
      expect(activity.ageRange.min, `${id} should not suit a Prep class`).toBeGreaterThanOrEqual(11);
    }
  });

  it("keeps obviously childish activities away from senior classes", () => {
    for (const id of ["animal-moves", "body-alphabet", "simon-says", "freeze-dance"]) {
      const activity = getActivity(id)!;
      expect(activity.ageRange.max, `${id} should not suit Year 12`).toBeLessThanOrEqual(12);
    }
  });

  it("only marks activities selfEnding when they end on a game condition, not a clock", () => {
    // The known set. If this list drifts, someone added or removed the flag —
    // worth a second look either way, since it decides which button leads.
    const flagged = ACTIVITIES.filter((a) => a.selfEnding).map((a) => a.id).sort();
    expect(flagged).toEqual(
      [
        "beat-the-teacher",
        "count-to-twenty",
        "guess-my-number",
        "last-one-standing-quiz",
        "one-two-three-look",
        "rock-paper-scissors-champion",
        "statue-contest",
        "twenty-questions",
        "what-did-we-move",
        "warmer-warmer",
      ].sort(),
    );
  });

  it("keeps selfEnding rare — most activities genuinely benefit from a timer", () => {
    const flagged = ACTIVITIES.filter((a) => a.selfEnding);
    expect(flagged.length / ACTIVITIES.length).toBeLessThan(0.1);
  });

  it("is mostly equipment-free, because that's the whole point", () => {
    const noEquipment = ACTIVITIES.filter((a) => a.equipment.includes("none"));
    expect(noEquipment.length / ACTIVITIES.length).toBeGreaterThan(0.5);
  });

  it("looks activities up by id", () => {
    expect(getActivity(ACTIVITIES[0].id)).toBe(ACTIVITIES[0]);
    expect(getActivity("does-not-exist")).toBeUndefined();
  });
});
