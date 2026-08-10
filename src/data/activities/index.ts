import type { Activity } from "@/lib/types";
import { brainBreaks } from "./brain-breaks";
import { calmDown } from "./calm-down";
import { creative } from "./creative";
import { pairsAndCurriculum } from "./pairs-and-curriculum";
import { quickFillers } from "./quick-fillers";
import { thinkFast } from "./think-fast";
import { wakeThemUp } from "./wake-them-up";

/**
 * The whole library, shipped in the bundle. That's the point: no fetch, no
 * loading state, and it keeps working when the school wifi doesn't.
 */
export const ACTIVITIES: Activity[] = [
  ...brainBreaks,
  ...wakeThemUp,
  ...calmDown,
  ...quickFillers,
  ...thinkFast,
  ...creative,
  ...pairsAndCurriculum,
];

const BY_ID = new Map(ACTIVITIES.map((activity) => [activity.id, activity]));

export function getActivity(id: string): Activity | undefined {
  return BY_ID.get(id);
}

export function getActivities(ids: string[]): Activity[] {
  return ids.map((id) => BY_ID.get(id)).filter((activity) => activity !== undefined);
}
