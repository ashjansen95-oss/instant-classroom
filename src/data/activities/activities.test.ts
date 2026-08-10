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
import { COUNTRY_CODES, MAX_LEVEL, MIN_LEVEL, levelsIn, rangeIncludes } from "@/lib/i18n";

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

    const [from, to] = activity.levels;
    expect(from).toBeGreaterThanOrEqual(MIN_LEVEL);
    expect(to).toBeLessThanOrEqual(MAX_LEVEL);
    expect(from).toBeLessThanOrEqual(to);

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
        const matches = ACTIVITIES.filter((a) => rangeIncludes(a.levels, level));
        expect(
          matches.length,
          `${code} level ${level} only has ${matches.length} activities`,
        ).toBeGreaterThanOrEqual(20);
      }
    }
  });

  it("stores levels as canonical numbers, never a country's words for them", () => {
    const source = JSON.stringify(ACTIVITIES);
    for (const term of ["Year 8", "Grade 8", "Kindergarten", "Reception", "Junior Infants"]) {
      expect(source, `"${term}" must not be baked into activity data`).not.toContain(term);
    }
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
