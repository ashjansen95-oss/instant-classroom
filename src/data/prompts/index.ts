import { categoryPrompts } from "./categories";
import { challengesPrompts } from "./challenges";
import { choicePrompts } from "./choices";
import { creativePrompts } from "./creative";
import { dramaPrompts } from "./drama";
import { icebreakersPrompts } from "./icebreakers-prompts";
import { memoryPrompts } from "./memory";
import { partyPrompts } from "./party";
import { riddlesPrompts } from "./riddles-prompts";
import { sillyPrompts } from "./silly";
import { storytellingPrompts } from "./storytelling-prompts";
import { thinkingPrompts } from "./thinking";
import { writingPrompts } from "./writing";
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
  ...partyPrompts,
  ...writingPrompts,
  ...dramaPrompts,
  ...riddlesPrompts,
  ...storytellingPrompts,
  ...challengesPrompts,
  ...memoryPrompts,
  ...sillyPrompts,
  ...icebreakersPrompts,
};

export function getPrompts(activityId: string): PromptBank | undefined {
  return PROMPTS[activityId];
}
