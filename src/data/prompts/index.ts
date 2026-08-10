import { categoryPrompts } from "./categories";
import { choicePrompts } from "./choices";
import { creativePrompts } from "./creative";
import { thinkingPrompts } from "./thinking";
import type { PromptBank, PromptBanks } from "./types";

export type { PromptBank, PromptBanks } from "./types";

/**
 * Keyed by activity id. Kept out of the activity files so those stay scannable
 * — an activity is still a short, readable record, and its content bank lives
 * next to the other banks where it can be reviewed as a set.
 */
export const PROMPTS: PromptBanks = {
  ...choicePrompts,
  ...categoryPrompts,
  ...thinkingPrompts,
  ...creativePrompts,
};

export function getPrompts(activityId: string): PromptBank | undefined {
  return PROMPTS[activityId];
}
