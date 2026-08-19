import type { PromptBanks } from "./types";

/** Content banks for the classic games in data/activities/classic-games.ts. */
export const classicGamesPrompts: PromptBanks = {
  "sparkle-spelling": {
    label: "The word is:",
    items: [
      "cat", "jump", "happy", "purple", "garden", "because", "friend", "always",
      "together", "favourite", "different", "beautiful", "remember", "important", "especially",
    ],
  },
  "mystery-box-questions": {
    label: "Inside the box:",
    items: [
      "a pencil", "a small toy car", "a ball of string", "a key", "a wooden spoon",
      "a sock", "a small book", "a paperclip", "a rubber duck", "a marble",
      "a comb", "a torch", "a whistle", "a rubber band", "an apple",
    ],
  },
};
