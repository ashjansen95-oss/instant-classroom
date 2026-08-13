import type { Activity } from "@/lib/types";

/** Getting a new or unfamiliar group talking to each other. */
export const icebreakers: Activity[] = [
  {
    id: "name-and-action",
    title: "Name and Action",
    description: "Say your name with a unique action — then everyone repeats every name and action so far.",
    instructions: [
      "Stand in a circle.",
      "First person says their name and does an action.",
      "Next person repeats it, then adds their own name and action.",
      "Keep going — by the end everyone's doing the whole sequence.",
    ],
    duration: 120,
    energy: "medium",
    noise: "moderate",
    format: "whole-class",
    movement: "standing",
    equipment: ["none"],
    ageRange: { min: 5, max: 12 },
    categories: ["icebreakers", "brain-break", "memory"],
    tags: ["names", "getting-to-know-you", "no-prep", "classic"],
    modifications: [
      { label: "Accumulate", description: "Each person performs all previous names and actions before adding their own." },
      { label: "Speed Replay", description: "Once everyone's gone, repeat the entire sequence as fast as possible." },
    ],
  },
  {
    id: "human-bingo",
    title: "Human Bingo",
    description: "A bingo grid of traits — mingle and find someone who matches each square — first full line wins.",
    instructions: [
      "Hand out bingo grids, or write the traits on the board for students to copy.",
      "Students mingle and find someone matching each trait.",
      "Write that person's name in the matching square.",
      "First to complete a full line calls bingo.",
    ],
    duration: 180,
    energy: "medium",
    noise: "moderate",
    format: "whole-class",
    movement: "movement",
    equipment: ["paper"],
    ageRange: { min: 7, max: 16 },
    selfEnding: true,
    categories: ["icebreakers", "get-moving", "pair-activities"],
    tags: ["mingling", "getting-to-know-you", "classic", "teams"],
    modifications: [
      { label: "Blackout", description: "Students must fill the entire card, not just one line, before calling bingo." },
      { label: "Interview Style", description: "Students must ask a follow-up question for each trait before writing the name down." },
    ],
  },
];
