import type { Activity } from "@/lib/types";
import { brainBreaks } from "./brain-breaks";
import { calmDown } from "./calm-down";
import { challenges } from "./challenges";
import { creative } from "./creative";
import { drama } from "./drama";
import { earlyYears } from "./early-years";
import { icebreakers } from "./icebreakers";
import { memoryGames } from "./memory-games";
import { mindfulness } from "./mindfulness";
import { pairsAndCurriculum } from "./pairs-and-curriculum";
import { partyGames } from "./party-games";
import { quickFillers } from "./quick-fillers";
import { riddles } from "./riddles";
import { senior } from "./senior";
import { silly } from "./silly";
import { storytelling } from "./storytelling";
import { teamBuilding } from "./team-building";
import { thinkFast } from "./think-fast";
import { wakeThemUp } from "./wake-them-up";
import { writing } from "./writing";

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
  ...earlyYears,
  ...senior,
  ...partyGames,
  ...writing,
  ...drama,
  ...riddles,
  ...storytelling,
  ...challenges,
  ...memoryGames,
  ...silly,
  ...teamBuilding,
  ...icebreakers,
  ...mindfulness,
];

const BY_ID = new Map(ACTIVITIES.map((activity) => [activity.id, activity]));

export function getActivity(id: string): Activity | undefined {
  return BY_ID.get(id);
}

export function getActivities(ids: string[]): Activity[] {
  return ids.map((id) => BY_ID.get(id)).filter((activity) => activity !== undefined);
}
