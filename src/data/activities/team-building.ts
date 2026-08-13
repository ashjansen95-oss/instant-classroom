import type { Activity } from "@/lib/types";

/** Working together, literally — linked arms, shared machines, group builds. */
export const teamBuilding: Activity[] = [
  {
    id: "back-to-back-stand",
    title: "Back-to-Back Stand",
    description: "Sit back-to-back on the floor, link arms, and try to stand up together — harder than it sounds.",
    instructions: [
      "Pairs sit back-to-back on the floor and link arms.",
      "On your signal, they try to stand up together without unlinking.",
      "Once they manage it, join another pair and try with four.",
      "Keep adding — how many can stand at once?",
    ],
    duration: 120,
    energy: "medium",
    noise: "moderate",
    format: "pairs",
    movement: "standing",
    equipment: ["none"],
    ageRange: { min: 7, max: 16 },
    categories: ["team-building", "challenges", "pair-activities"],
    tags: ["teamwork", "physical", "no-prep", "classic"],
    modifications: [
      { label: "Groups of Four", description: "Start with four people linked together instead of two." },
      { label: "Chain", description: "Keep adding people after each successful stand — find the class record." },
    ],
  },
  {
    id: "team-machine",
    title: "Team Machine",
    description: "Each person is one moving part of a 'human machine' — connect together with sounds and actions.",
    instructions: [
      "Name a machine — a washing machine, a popcorn maker, a car.",
      "Groups of 4-6, one person starts with a repeating action and sound.",
      "Each person adds a connected moving part, one at a time.",
      "The whole machine runs together once everyone's joined in.",
    ],
    duration: 120,
    energy: "medium",
    noise: "moderate",
    format: "small-groups",
    movement: "standing",
    equipment: ["none"],
    ageRange: { min: 6, max: 14 },
    categories: ["team-building", "drama", "creative"],
    tags: ["performance", "teamwork", "physical", "no-prep"],
    modifications: [
      { label: "Mystery Machine", description: "The rest of the class watches and guesses what machine is being performed." },
      { label: "Add Parts", description: "Start with one person and add a new part every ten seconds." },
    ],
  },
];
