import type { PromptBanks } from "./types";

/** Puzzles, deduction and word games — the ones where a bad prompt kills the round. */
export const thinkingPrompts: PromptBanks = {
  "twenty-questions": {
    label: "Think of this (don't say it)",
    items: [
      "An object: a toothbrush.",
      "An object: a traffic light.",
      "An animal: a penguin.",
      "An animal: a giraffe.",
      "A place: the moon.",
      "A place: a library.",
      "An object: an umbrella.",
      "An object: a washing machine.",
      "An animal: an octopus.",
      "A place: a petrol station.",
    ],
  },

  "word-association": {
    label: "Starting word",
    items: [
      "Ocean.",
      "Winter.",
      "Bread.",
      "Thunder.",
      "Metal.",
      "Green.",
      "School.",
      "Machine.",
      "Shadow.",
      "Music.",
    ],
  },

  "one-word-story": {
    label: "Story opener — one word each from here",
    items: [
      "Yesterday, a…",
      "Nobody expected the…",
      "Deep in the…",
      "The last thing I remember was…",
      "It started when the…",
      "Everyone in town knew about the…",
      "At exactly midnight, the…",
      "She opened the door and saw a…",
      "The strangest thing about the island was…",
      "They warned us about the…",
    ],
  },

  "what-happens-next": {
    label: "What happens next?",
    items: [
      "A man walks into a supermarket carrying an empty fish tank.",
      "Every clock in the building stops at the same moment.",
      "A stranger hands you a key and walks away without a word.",
      "The lights go out and when they come back, one chair has moved.",
      "A dog runs onto a football pitch mid-match, carrying a shoe.",
      "You find a letter addressed to you, dated next year.",
      "Everyone in the street starts walking in the same direction.",
      "A parcel arrives with your name on it and no return address.",
      "The plane lands but nobody is waiting at the gate.",
      "You wake up and everything in your room is two centimetres to the left.",
    ],
  },

  "guess-the-rule": {
    label: "Secret rule — sort them without saying it",
    items: [
      "Wearing something blue.",
      "Name contains the letter E.",
      "Wearing shoes with laces.",
      "Birthday in the first half of the year.",
      "Name has exactly one syllable.",
      "Sitting on the left half of the room.",
      "Wearing a watch or a bracelet.",
      "Name starts with a letter in the first half of the alphabet.",
      "Has a jumper with them today.",
      "Hair tied back.",
    ],
  },

  "alternative-uses": {
    label: "How many uses can you find for…",
    items: [
      "A brick.",
      "A sock.",
      "A paperclip.",
      "An empty jar.",
      "A rubber band.",
      "A newspaper.",
      "A wooden spoon.",
      "A bicycle wheel.",
      "A shoelace.",
      "An ice cube tray.",
    ],
  },

  "connect-two": {
    label: "Find a genuine link between…",
    items: [
      "Volcano and toothbrush.",
      "Library and thunderstorm.",
      "Bicycle and honey.",
      "Mirror and river.",
      "Piano and spider.",
      "Clock and orange.",
      "Submarine and birthday.",
      "Mountain and pencil.",
      "Candle and telephone.",
      "Forest and factory.",
    ],
  },

  "justify-the-absurd": {
    label: "Argue for this, however you can",
    items: [
      "Homework should be done by parents.",
      "School should start at midday.",
      "Everyone should have to wear the same clothes.",
      "Winter is objectively better than summer.",
      "Chairs are unnecessary.",
      "Handwriting should be abolished.",
      "The weekend should be four days and the week three.",
      "Cats are more useful than dogs.",
      "All exams should be group exams.",
      "Silence should be banned in classrooms.",
    ],
  },

  "how-many-ways": {
    label: "How many ways can you make…",
    items: [
      "24 — any operation you like.",
      "100 — but you can't use a zero.",
      "36 — using multiplication only.",
      "60 — using exactly three numbers.",
      "12 — using subtraction in every one.",
      "144 — using two operations each time.",
      "1000 — no calculators, obviously.",
      "48 — using division at least once.",
      "81 — using the same number more than once.",
      "0 — and no, you can't just multiply by zero every time.",
    ],
  },

  "anagram-attack": {
    label: "Unscramble it",
    items: [
      "TAERW → water",
      "NLTPAE → planet",
      "CSOLOH → school",
      "IRENDF → friend",
      "GNAERO → orange",
      "TSAOMCH → stomach",
      "TNIWRE → winter",
      "RUSAEETR → treasure",
      "MTUNAINO → mountain",
      "GNRDAEIN → gardening",
    ],
  },

  "word-ladder": {
    label: "Change one letter at a time",
    items: [
      "COLD → WARM",
      "HEAD → TAIL",
      "CAT → DOG",
      "MILK → CORN",
      "FISH → BIRD",
      "HATE → LOVE",
      "SLOW → FAST",
      "RIVER → WATER",
      "HARD → EASY",
      "BOOK → PAGE",
    ],
  },

  "blockbuster-letters": {
    label: "What's the…",
    // The answer sits in brackets at the end — for the teacher's eyes, not to
    // read aloud. Without it there's no way to confirm a guess on the spot.
    items: [
      "P — a shape with many sides. (Polygon)",
      "G — the force that keeps you on the ground. (Gravity)",
      "V — a word that describes an action. (Verb)",
      "H — the organ that pumps blood. (Heart)",
      "C — the distance all the way around a circle. (Circumference)",
      "D — the bottom number in a fraction. (Denominator)",
      "M — the middle value when numbers are put in order. (Median)",
      "S — a group of words with a subject and a verb. (Sentence)",
      "A — the space inside a shape, measured in square units. (Area)",
      "E — the imaginary line around the middle of the Earth. (Equator)",
    ],
  },

  "lightning-spelling": {
    label: "Spell it, all together",
    items: [
      "Because, friend, people, beautiful.",
      "Necessary, separate, definitely, receive.",
      "Rhythm, island, February, Wednesday.",
      "Their, there, they're — and use each in a sentence.",
      "Accommodation, embarrass, occurrence, privilege.",
      "Weird, believe, achieve, science.",
      "Restaurant, business, muscle, tongue.",
      "Argument, calendar, grateful, height.",
      "Queue, colonel, yacht, knight.",
      "Conscience, mischievous, questionnaire, liaison.",
    ],
  },
};
