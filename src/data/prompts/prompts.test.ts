import { describe, expect, it } from "vitest";
import { ACTIVITIES, getActivity } from "@/data/activities";
import { PROMPTS, getPrompts } from "./index";

/**
 * The cold-read gate from ACTIVITY-RUBRIC.md, as far as a machine can check it.
 *
 * The list below is the judgement call: these activities hand the teacher a
 * *format* and would otherwise leave them inventing the content on the spot.
 * Adding one of these without a prompt bank should fail the build.
 *
 * Curriculum frames are deliberately absent — there, the teacher supplying the
 * content is the activity.
 */
const NEEDS_CONTENT = [
  // Pick-a-side
  "would-you-rather",
  "this-or-that",
  "stand-if",
  "finish-the-sentence",
  "odd-one-out",
  "rank-these-three",
  // Categories
  "five-second-rule",
  "categories-elimination",
  "alphabet-race",
  "countdown-categories",
  "name-three-now",
  "thirty-second-ten",
  "memory-chain",
  "letters-only",
  "speed-sort",
  // Thinking
  "twenty-questions",
  "word-association",
  "one-word-story",
  "what-happens-next",
  "guess-the-rule",
  "alternative-uses",
  "connect-two",
  "justify-the-absurd",
  "how-many-ways",
  "anagram-attack",
  "word-ladder",
  "blockbuster-letters",
  "lightning-spelling",
  // Creative
  "one-minute-doodle",
  "design-the-worst",
  "sound-effects-story",
  "quick-draw-relay",
  "hum-that-tune",
];

/** A teacher will reach for these weekly, so they get a deeper bank. */
const HIGH_TRAFFIC = [
  "would-you-rather",
  "this-or-that",
  "stand-if",
  "finish-the-sentence",
  "odd-one-out",
  "rank-these-three",
  "five-second-rule",
  "categories-elimination",
];

describe("prompt banks", () => {
  it("covers every activity that would otherwise need the teacher to improvise", () => {
    const missing = NEEDS_CONTENT.filter((id) => !getPrompts(id));
    expect(missing, `these need a prompt bank: ${missing.join(", ")}`).toEqual([]);
  });

  it("only attaches banks to activities that exist", () => {
    for (const id of Object.keys(PROMPTS)) {
      expect(getActivity(id), `"${id}" has prompts but no activity`).toBeDefined();
    }
  });

  it("goes deeper on the activities teachers will use weekly", () => {
    for (const id of HIGH_TRAFFIC) {
      expect(getPrompts(id)!.items.length, `${id} is a high-traffic bank`).toBeGreaterThanOrEqual(
        20,
      );
    }
  });

  it("gives every other bank enough to get through a lesson", () => {
    for (const id of NEEDS_CONTENT) {
      expect(getPrompts(id)!.items.length, `${id} is thin`).toBeGreaterThanOrEqual(10);
    }
  });

  it("has no duplicate prompts inside a bank", () => {
    for (const [id, bank] of Object.entries(PROMPTS)) {
      const seen = new Set(bank.items.map((item) => item.toLowerCase().trim()));
      expect(seen.size, `${id} repeats itself`).toBe(bank.items.length);
    }
  });

  it("writes prompts that can be read straight off the screen", () => {
    for (const [id, bank] of Object.entries(PROMPTS)) {
      expect(bank.label.length, `${id} label`).toBeGreaterThan(2);
      expect(bank.label.length, `${id} label is too long to sit above a prompt`).toBeLessThan(60);

      for (const item of bank.items) {
        expect(item.trim(), `${id}: "${item}" has stray whitespace`).toBe(item);
        expect(item.length, `${id}: "${item}" is too short to be a real prompt`).toBeGreaterThan(3);
        // Long enough to be worth reading, short enough to say in one breath.
        expect(item.length, `${id}: "${item}" is too long to read aloud`).toBeLessThanOrEqual(120);
      }
    }
  });

  it("never leaves a prompt half-finished", () => {
    for (const [id, bank] of Object.entries(PROMPTS)) {
      for (const item of bank.items) {
        // A trailing "…" is fine on purpose-built openers, but a bare "and" or
        // "or" at the end means the prompt was never finished.
        expect(item, `${id}: "${item}" trails off`).not.toMatch(/\b(and|or|the|a|to)\s*$/i);
      }
    }
  });

  it("keeps banks off the curriculum frames, where teacher content is the point", () => {
    const frames = ["exit-question", "quiz-your-partner", "muddiest-point", "brain-dump"];
    for (const id of frames) {
      expect(getPrompts(id), `${id} should not have generic prompts`).toBeUndefined();
    }
  });

  it("attaches a bank to a reasonable share of the library", () => {
    // Sanity check on the judgement call: if this ever approached everything,
    // we'd be papering over activities rather than writing better ones.
    expect(Object.keys(PROMPTS).length / ACTIVITIES.length).toBeLessThan(0.4);
  });
});
