import type { PromptBanks } from "./types";

/** Content banks for the Geography-subject activities in data/activities/subject-geography.ts. */
export const subjectGeographyPrompts: PromptBanks = {
  "ocean-or-land-actions": {
    label: "Water or land?",
    items: [
      "The Pacific Ocean. (water)", "The Sahara Desert. (land)", "The Mediterranean Sea. (water)",
      "Mount Everest. (land)", "The River Nile. (water)", "The Amazon Rainforest. (land)",
      "The Atlantic Ocean. (water)", "Lake Victoria. (water)", "The Rocky Mountains. (land)",
      "The Gobi Desert. (land)", "The Arctic Ocean. (water)", "The Caribbean Sea. (water)",
      "The Alps. (land)", "Australia. (land)",
    ],
  },
  "capital-volley-pairs": {
    label: "Country, then capital",
    items: [
      "Kenya — Nairobi.", "Peru — Lima.", "Vietnam — Hanoi.", "Japan — Tokyo.",
      "Egypt — Cairo.", "Canada — Ottawa.", "Brazil — Brasília.", "Norway — Oslo.",
      "India — New Delhi.", "Mexico — Mexico City.", "Australia — Canberra.",
      "Nigeria — Abuja.", "Thailand — Bangkok.", "Argentina — Buenos Aires.",
      "Turkey — Ankara.", "Morocco — Rabat.",
    ],
  },
  "physical-or-human-ripple": {
    label: "Physical or human?",
    items: [
      "Glacier. (physical)", "Motorway. (human)",
      "Reservoir. (arguable — a real lake, dug and dammed by people)",
      "Waterfall. (physical)", "Railway station. (human)", "Cliff. (physical)",
      "Canal. (human)", "Volcano. (physical)",
      "Harbour. (arguable — a natural bay, usually rebuilt by people)",
      "Farmer's field. (human)", "Sand dune. (physical)",
      "Forest. (arguable — some grew, some were planted in rows)",
      "River. (physical)", "Park. (arguable — real grass and trees, placed there on purpose)",
      "Beach. (arguable — natural, but some sand is trucked in)",
    ],
  },
  "landmark-clue-ladder": {
    label: "Landmark, three clues hardest to easiest:",
    items: [
      "Clue 1: It changes colour through the day, from grey to deep red. Clue 2: It's sacred to the Anangu people, who ask visitors not to climb it. Clue 3: It's a giant rock in the middle of the Australian desert. (Uluru)",
      "Clue 1: It has a flat top and it makes its own cloud, nicknamed the tablecloth. Clue 2: A cable car runs to the top of it. Clue 3: It stands right behind Cape Town. (Table Mountain)",
      "Clue 1: It was built as a Hindu temple, then became Buddhist. Clue 2: Trees have grown straight through parts of it. Clue 3: It's the largest religious monument on Earth, in Cambodia. (Angkor Wat)",
      "Clue 1: It sits on a ridge nearly 2,500 metres up, between two peaks. Clue 2: The stones are cut so precisely there's no mortar holding them. Clue 3: The Inca built it in Peru. (Machu Picchu)",
      "Clue 1: It's not one thing but thousands of sections, built over centuries. Clue 2: It was meant to keep northern armies out. Clue 3: You cannot, despite the myth, see it from space. (The Great Wall of China)",
      "Clue 1: It's carved directly into a pink sandstone cliff. Clue 2: You reach it through a narrow gorge called the Siq. Clue 3: It's the lost city of Jordan. (Petra)",
      "Clue 1: It's 30 metres tall with its arms outstretched, and it gets struck by lightning most years. Clue 2: It stands on a mountain called Corcovado. Clue 3: It looks out over Rio de Janeiro. (Christ the Redeemer)",
      "Clue 1: It's a tomb, not a palace, and it took over twenty years to build. Clue 2: The marble seems to change colour depending on the light. Clue 3: An emperor built it in India for his wife. (The Taj Mahal)",
      "Clue 1: It's an active volcano that last erupted in 1707. Clue 2: It's almost perfectly symmetrical, which is why artists never stop painting it. Clue 3: It's Japan's highest mountain. (Mount Fuji)",
      "Clue 1: It could hold 50,000 people and they had a system for flooding it. Clue 2: Much of its stone was later robbed to build churches. Clue 3: It's the great oval arena in Rome. (The Colosseum)",
      "Clue 1: The largest is made of over two million blocks and it's around 4,500 years old. Clue 2: They line up almost exactly with the points of the compass. Clue 3: They stand on the edge of Cairo, in Egypt. (The Pyramids of Giza)",
      "Clue 1: It's actually three falls, and it's slowly moving upstream as it erodes. Clue 2: The border between two countries runs straight through it. Clue 3: It's between the USA and Canada, and people have gone over it in barrels. (Niagara Falls)",
    ],
  },
  "site-it-right-station": {
    label: "The brief",
    items: [
      "A growing town needs a new bus station.",
      "The council has money for exactly one new skate park.",
      "A supermarket chain wants to open a large store.",
      "A wind turbine has been approved. It has to go somewhere.",
      "The town needs a new recycling centre.",
      "A new secondary school for 900 students.",
      "A footbridge over the river.",
      "A solar farm needs a field.",
      "200 new homes have to be built.",
      "A retail park wants a car park with 400 spaces.",
      "The ambulance service needs a new station.",
      "A phone mast, and nobody wants it near them.",
    ],
  },
  "scale-jump-three-levels": {
    label: "The issue",
    items: [
      "Flooding.", "Food supply.", "Air quality.", "Water shortage.", "Plastic waste.",
      "Where energy comes from.", "Not enough housing.", "Traffic congestion.", "Heatwaves.",
      "Coastal erosion.", "Insects and wildlife disappearing.", "Wildfire risk.",
    ],
  },
};
