import type { Activity } from "@/lib/types";

/** Slowing down — quiet reflection and settling attention back into the room. */
export const mindfulness: Activity[] = [
  {
    id: "gratitude-round",
    title: "Gratitude Round",
    description: "Go around the room — each person names one thing they're grateful for today.",
    instructions: [
      "Sit in a circle or at desks.",
      "Go around the room one by one.",
      "Each person shares one thing they're grateful for.",
      "No commenting on others' answers — just listen.",
    ],
    duration: 120,
    energy: "calm",
    noise: "quiet",
    format: "whole-class",
    movement: "seated",
    equipment: ["none"],
    ageRange: { min: 6, max: 16 },
    timerless: true,
    categories: ["mindfulness", "calm-down"],
    tags: ["reflection", "quiet", "no-prep", "settling"],
    modifications: [
      { label: "Gratitude Chain", description: "Each new item must connect to the previous person's answer somehow." },
      { label: "Secret Gratitude", description: "Write it on a slip of paper, mix up the slips, and read them out anonymously." },
    ],
  },
  {
    id: "cloud-watching",
    title: "Cloud Watching",
    description: "Close your eyes and imagine clouds drifting by — each thought is just another cloud passing through.",
    instructions: [
      "Heads down or eyes closed.",
      "Narrate slowly — imagine lying on grass watching clouds drift past.",
      "Each thought that pops up is a cloud drifting past — don't chase it, just watch it go.",
      "After a minute, bring attention back to the room.",
    ],
    duration: 120,
    energy: "calm",
    noise: "quiet",
    format: "whole-class",
    movement: "seated",
    equipment: ["none"],
    ageRange: { min: 5, max: 12 },
    categories: ["mindfulness", "calm-down", "creative"],
    tags: ["visualisation", "quiet", "settling", "no-prep"],
    modifications: [
      { label: "Colour Clouds", description: "Imagine each emotion as a differently coloured cloud drifting past." },
      { label: "Sketch After", description: "Draw what your sky looked like once the minute is up." },
    ],
  },
];
