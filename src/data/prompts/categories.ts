import type { PromptBanks } from "./types";

/**
 * Category games. Several activities share this shape but not the same
 * difficulty, so the banks are tuned separately rather than pointing at one
 * shared list — Five Second Rule wants tight categories, Alphabet Race wants
 * ones with enough answers to survive 26 letters.
 */
export const categoryPrompts: PromptBanks = {
  "five-second-rule": {
    label: "Name three…",
    items: [
      "Types of bread.",
      "Things you'd find in a fridge.",
      "Animals with tails.",
      "Things that are cold.",
      "Sports played with a ball.",
      "Things in this classroom that are blue.",
      "Reasons to be late.",
      "Things you'd take to the beach.",
      "Jobs that involve a uniform.",
      "Things that make a noise.",
      "Countries you'd like to visit.",
      "Things that come in pairs.",
      "Breakfast foods.",
      "Things that fly.",
      "Ways to travel.",
      "Things you'd find in a park.",
      "Fruits that aren't apples.",
      "Things that are round.",
      "Musical instruments.",
      "Things you do before bed.",
    ],
  },

  "categories-elimination": {
    label: "Category",
    items: [
      "Australian animals.",
      "Things in a kitchen.",
      "Colours.",
      "Sports.",
      "Things that are hot.",
      "Countries.",
      "Types of transport.",
      "Things you wear.",
      "Fruits and vegetables.",
      "Things in space.",
      "Jobs.",
      "Things that live in water.",
      "Board games or card games.",
      "Things with wheels.",
      "Things you'd find in a hospital.",
      "Types of weather.",
      "Things made of wood.",
      "Musical instruments.",
      "Things you'd find at a supermarket.",
      "Things that are older than you.",
    ],
  },

  "alphabet-race": {
    label: "Category — get from A to Z",
    items: [
      "Animals.",
      "Foods.",
      "Countries.",
      "Boys' and girls' names.",
      "Things you'd find in a house.",
      "Jobs.",
      "Things that are alive.",
      "Sports and games.",
      "Things you can buy.",
      "Places you could go on holiday.",
    ],
  },

  "countdown-categories": {
    label: "Category — no repeats",
    items: [
      "Things you'd find in a kitchen.",
      "Animals with four legs.",
      "Things that are green.",
      "Words that rhyme with 'cat'.",
      "Things you'd pack for a trip.",
      "Things that make you happy.",
      "Things in this room.",
      "Sports.",
      "Foods you'd never eat.",
      "Things that need electricity.",
    ],
  },

  "name-three-now": {
    label: "Three of these, thirty seconds",
    items: [
      "Things that are yellow.",
      "Things you'd find in a bag.",
      "Animals that swim.",
      "Ways to get to school.",
      "Things that are noisy.",
      "Things you'd never lend someone.",
      "Foods that go crunch.",
      "Things you can do in one minute.",
      "Things that are older than this school.",
      "Reasons a dog might bark.",
    ],
  },

  "thirty-second-ten": {
    label: "Ten of these, thirty seconds",
    items: [
      "Things you'd find in a supermarket.",
      "Animals.",
      "Words with double letters.",
      "Things that are round.",
      "Countries in Europe.",
      "Things in this classroom.",
      "Jobs people do.",
      "Types of weather.",
      "Things you'd take camping.",
      "Things that cost under five dollars.",
    ],
  },

  "memory-chain": {
    label: "Category — repeat everything, then add yours",
    items: [
      "Things in a school bag.",
      "Animals at the zoo.",
      "Things you'd pack for a holiday.",
      "Foods at a party.",
      "Things you'd find in a car.",
      "Things that are red.",
      "Things you'd buy at a shop.",
      "Things you'd see on a farm.",
      "Things in a toolbox.",
      "Things you'd find at the beach.",
    ],
  },

  "letters-only": {
    label: "Every answer starts with…",
    items: [
      "B — name a food, a country, and something in this room.",
      "S — name an animal, a sport, and a job.",
      "M — name a colour, a food, and a place.",
      "T — name something you wear, something you eat, somewhere you'd go.",
      "P — name an animal, a hobby, and something in a kitchen.",
      "C — name a country, a fruit, and something with wheels.",
      "F — name a feeling, a food, and something that flies.",
      "D — name an animal, a day, and something in a garden.",
      "G — name a game, a place, and something green.",
      "R — name an animal, a colour, and something you'd find outside.",
    ],
  },

};
