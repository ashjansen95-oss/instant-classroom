/**
 * Ready-to-read content for activities that would otherwise hand the thinking
 * back to the teacher.
 *
 * "Would You Rather" without a list of would-you-rathers isn't an activity,
 * it's homework. These banks exist so a teacher with three minutes and no plan
 * can read straight off the phone.
 *
 * Deliberately *not* added to curriculum frames (Exit Question, Quiz Your
 * Partner, Muddiest Point). There the teacher supplying the content is the
 * whole point — it's their lesson, and we'd only get in the way.
 */
export interface PromptBank {
  /** Read aloud before the items, e.g. "Would you rather…". */
  label: string;
  /** Each one is a complete, readable prompt. No half-finished stubs. */
  items: string[];
}

export type PromptBanks = Record<string, PromptBank>;
