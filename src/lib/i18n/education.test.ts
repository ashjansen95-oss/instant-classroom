import { describe, expect, it } from "vitest";
import {
  COUNTRIES,
  COUNTRY_CODES,
  DEFAULT_COUNTRY,
  ageRangeLabel,
  levelsForAges,
  startAgeForLevel,
  suitsLevel,
  countryFromLocale,
  detectCountry,
  isCountryCode,
  levelLabel,
  levelRangeLabel,
  levelShortLabel,
  levelsIn,
  rangeIncludes,
  terminologyFor,
  type CountryCode,
} from "./education";

describe("the seven markets", () => {
  it("covers exactly the markets we support", () => {
    expect(COUNTRY_CODES).toEqual(["AU", "GB", "US", "CA", "NZ", "IE", "ZA"]);
  });

  it("gives every country a name, a flag and a word for the concept", () => {
    for (const code of COUNTRY_CODES) {
      expect(COUNTRIES[code].name.length).toBeGreaterThan(2);
      expect(COUNTRIES[code].flag.length).toBeGreaterThan(0);
      expect(COUNTRIES[code].levelNoun.length).toBeGreaterThan(2);
    }
  });

  it("uses each market's own word for the concept, not just for the levels", () => {
    expect(COUNTRIES.AU.levelNoun).toBe("year level");
    expect(COUNTRIES.GB.levelNoun).toBe("year group");
    expect(COUNTRIES.US.levelNoun).toBe("grade");
    expect(COUNTRIES.ZA.levelNoun).toBe("grade");
  });

  it("names every level it claims to have, with no gaps", () => {
    for (const code of COUNTRY_CODES) {
      const { levels, names } = COUNTRIES[code];
      expect(levels.length).toBeGreaterThan(0);

      for (const level of levels) {
        expect(names[level]?.label, `${code} level ${level}`).toBeTruthy();
        expect(names[level]?.short, `${code} level ${level} short`).toBeTruthy();
      }
      // Ascending and contiguous — a country can't skip a year of school.
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i]).toBe(levels[i - 1] + 1);
      }
    }
  });
});

describe("the canonical scale", () => {
  // The anchor case from the spec: one internal level, seven sets of words.
  it("renders level 8 correctly in every market", () => {
    expect(levelLabel("AU", 8)).toBe("Year 8");
    expect(levelLabel("GB", 8)).toBe("Year 8");
    expect(levelLabel("US", 8)).toBe("Grade 8");
    expect(levelLabel("CA", 8)).toBe("Grade 8");
    expect(levelLabel("NZ", 8)).toBe("Year 8");
    expect(levelLabel("IE", 8)).toBe("2nd Year");
    expect(levelLabel("ZA", 8)).toBe("Grade 8");
  });

  it("renders the first year of school in every market", () => {
    expect(levelLabel("AU", 0)).toBe("Prep");
    expect(levelLabel("GB", 0)).toBe("Reception");
    expect(levelLabel("US", 0)).toBe("Kindergarten");
    expect(levelLabel("CA", 0)).toBe("Kindergarten");
    expect(levelLabel("IE", 0)).toBe("Senior Infants");
    expect(levelLabel("ZA", 0)).toBe("Grade R");
  });

  it("matches the Australian sequence", () => {
    expect(COUNTRIES.AU.levels.map((l) => levelLabel("AU", l))).toEqual([
      "Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6",
      "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12",
    ]);
  });

  it("matches the UK sequence, which runs a year longer", () => {
    expect(COUNTRIES.GB.levels.map((l) => levelLabel("GB", l))).toEqual([
      "Reception", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6",
      "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12", "Year 13",
    ]);
  });

  it("matches the US sequence", () => {
    expect(COUNTRIES.US.levels.map((l) => levelLabel("US", l))).toEqual([
      "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
      "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
    ]);
  });

  it("matches the Irish sequence, infants through to 6th Year", () => {
    expect(COUNTRIES.IE.levels.map((l) => levelLabel("IE", l))).toEqual([
      "Junior Infants", "Senior Infants",
      "1st Class", "2nd Class", "3rd Class", "4th Class", "5th Class", "6th Class",
      "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "6th Year",
    ]);
  });

  it("matches the South African sequence", () => {
    expect(levelLabel("ZA", 0)).toBe("Grade R");
    expect(COUNTRIES.ZA.levels.filter((l) => l > 0).map((l) => levelLabel("ZA", l))).toEqual(
      Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
    );
  });

  it("starts New Zealand at Year 1, with no reception year", () => {
    expect(COUNTRIES.NZ.levels[0]).toBe(1);
    expect(levelLabel("NZ", 1)).toBe("Year 1");
    expect(levelLabel("NZ", 13)).toBe("Year 13");
    expect(levelLabel("NZ", 0)).toBe("");
  });

  it("gives Ireland the only level below the shared anchor", () => {
    expect(levelLabel("IE", -1)).toBe("Junior Infants");
    for (const code of COUNTRY_CODES.filter((c) => c !== "IE")) {
      expect(levelLabel(code, -1), `${code} should have no level -1`).toBe("");
    }
  });

  it("stops Australia at 12 and the UK at 13", () => {
    expect(levelLabel("AU", 12)).toBe("Year 12");
    expect(levelLabel("AU", 13)).toBe("");
    expect(levelLabel("GB", 13)).toBe("Year 13");
  });

  it("has a short form for every level", () => {
    expect(levelShortLabel("AU", 8)).toBe("Y8");
    expect(levelShortLabel("US", 8)).toBe("G8");
    expect(levelShortLabel("IE", 8)).toBe("2Yr");
    expect(levelShortLabel("IE", 3)).toBe("3C");
    expect(levelShortLabel("ZA", 0)).toBe("GR");
    expect(levelShortLabel("GB", 0)).toBe("Rec");
  });
});

describe("levelsIn", () => {
  it("returns only the levels a country has within a range", () => {
    expect(levelsIn("AU", [10, 13])).toEqual([10, 11, 12]);
    expect(levelsIn("GB", [10, 13])).toEqual([10, 11, 12, 13]);
    expect(levelsIn("NZ", [-1, 2])).toEqual([1, 2]);
    expect(levelsIn("IE", [-1, 2])).toEqual([-1, 0, 1, 2]);
  });

  it("returns everything when no range is given", () => {
    expect(levelsIn("AU")).toHaveLength(13);
    expect(levelsIn("IE")).toHaveLength(14);
  });
});

describe("levelRangeLabel", () => {
  it("says 'any' when a range covers the whole of schooling, in local terms", () => {
    expect(levelRangeLabel("AU", [-1, 13])).toBe("Any year level");
    expect(levelRangeLabel("IE", [-1, 13])).toBe("Any year group");
    expect(levelRangeLabel("NZ", [-1, 13])).toBe("Any year level");
    expect(levelRangeLabel("US", [-1, 13])).toBe("Any grade");
    expect(levelRangeLabel("GB", [-1, 13])).toBe("Any year group");
  });

  it("renders a partial range in the country's own words", () => {
    expect(levelRangeLabel("AU", [7, 13])).toBe("Year 7–Year 12");
    expect(levelRangeLabel("US", [7, 13])).toBe("Grade 7–Grade 12");
    expect(levelRangeLabel("IE", [7, 13])).toBe("1st Year–6th Year");
    expect(levelRangeLabel("GB", [7, 13])).toBe("Year 7–Year 13");
  });

  it("clamps to what the country actually has", () => {
    // Level -1 exists only in Ireland, so everyone else starts at their level 0.
    expect(levelRangeLabel("AU", [-1, 6])).toBe("Prep–Year 6");
    expect(levelRangeLabel("NZ", [-1, 6])).toBe("Year 1–Year 6");
    expect(levelRangeLabel("IE", [-1, 6])).toBe("Junior Infants–6th Class");
  });

  it("renders a single level without a dash", () => {
    expect(levelRangeLabel("AU", [8, 8])).toBe("Year 8");
  });

  it("degrades gracefully when a range misses a country entirely", () => {
    expect(levelRangeLabel("NZ", [-1, -1])).toBe("Any year level");
  });
});

describe("rangeIncludes", () => {
  it("covers its endpoints", () => {
    expect(rangeIncludes([3, 9], 3)).toBe(true);
    expect(rangeIncludes([3, 9], 9)).toBe(true);
    expect(rangeIncludes([3, 9], 2)).toBe(false);
    expect(rangeIncludes([3, 9], 10)).toBe(false);
  });
});

describe("age mapping", () => {
  it("knows the real age of each country's first school year", () => {
    expect(startAgeForLevel("AU", 0)).toBe(5); // Prep
    expect(startAgeForLevel("GB", 0)).toBe(4); // Reception
    expect(startAgeForLevel("US", 0)).toBe(5); // Kindergarten
    expect(startAgeForLevel("NZ", 1)).toBe(5); // Year 1
    expect(startAgeForLevel("IE", -1)).toBe(4); // Junior Infants
    expect(startAgeForLevel("ZA", 0)).toBe(5); // Grade R
  });

  it("finishes every market's schooling at 17–18", () => {
    expect(startAgeForLevel("AU", 12)).toBe(17);
    expect(startAgeForLevel("GB", 13)).toBe(17);
    expect(startAgeForLevel("US", 12)).toBe(17);
    expect(startAgeForLevel("NZ", 13)).toBe(17);
    expect(startAgeForLevel("IE", 12)).toBe(17);
  });

  it("does not pretend the same year number is the same age everywhere", () => {
    // The point of the whole age model: a British Year 8 class is a year
    // younger than an Australian Year 8 class.
    expect(startAgeForLevel("AU", 8)).toBe(13);
    expect(startAgeForLevel("GB", 8)).toBe(12);
    expect(startAgeForLevel("NZ", 8)).toBe(12);
  });

  it("maps ages 12–15 to each market's own levels", () => {
    const range = { min: 12, max: 15 };

    expect(levelsForAges("AU", range)).toEqual([7, 8, 9]);
    expect(levelsForAges("US", range)).toEqual([7, 8, 9]);
    expect(levelsForAges("CA", range)).toEqual([7, 8, 9]);
    expect(levelsForAges("ZA", range)).toEqual([7, 8, 9]);
    expect(levelsForAges("IE", range)).toEqual([7, 8, 9]);
    // A year earlier in the numbering, because school starts a year earlier.
    expect(levelsForAges("GB", range)).toEqual([8, 9, 10]);
    expect(levelsForAges("NZ", range)).toEqual([8, 9, 10]);
  });

  it("labels that same range in each market's words", () => {
    const range = { min: 12, max: 15 };

    expect(ageRangeLabel("AU", range)).toBe("Year 7–Year 9");
    expect(ageRangeLabel("US", range)).toBe("Grade 7–Grade 9");
    expect(ageRangeLabel("GB", range)).toBe("Year 8–Year 10");
    expect(ageRangeLabel("NZ", range)).toBe("Year 8–Year 10");
    expect(ageRangeLabel("IE", range)).toBe("1st Year–3rd Year");
    expect(ageRangeLabel("ZA", range)).toBe("Grade 7–Grade 9");
  });

  it("maps an early-years range to the right levels", () => {
    const range = { min: 4, max: 7 };

    expect(levelsForAges("AU", range)).toEqual([0, 1]);
    expect(levelsForAges("GB", range)).toEqual([0, 1, 2]);
    expect(levelsForAges("NZ", range)).toEqual([1, 2]);
    expect(levelsForAges("IE", range)).toEqual([-1, 0, 1]);
    expect(ageRangeLabel("AU", range)).toBe("Prep–Year 1");
    expect(ageRangeLabel("IE", range)).toBe("Junior Infants–1st Class");
  });

  it("maps a senior range to the right levels", () => {
    const range = { min: 14, max: 18 };

    expect(levelsForAges("AU", range)).toEqual([9, 10, 11, 12]);
    expect(levelsForAges("GB", range)).toEqual([10, 11, 12, 13]);
    expect(ageRangeLabel("US", range)).toBe("Grade 9–Grade 12");
    expect(ageRangeLabel("GB", range)).toBe("Year 10–Year 13");
  });

  it("answers whether a class is the right age for an activity", () => {
    const teens = { min: 12, max: 15 };

    expect(suitsLevel(teens, "AU", 8)).toBe(true);
    expect(suitsLevel(teens, "AU", 0)).toBe(false);
    expect(suitsLevel(teens, "AU", 12)).toBe(false);
    // Same activity, same level number, different answer by country.
    expect(suitsLevel(teens, "GB", 7)).toBe(false);
    expect(suitsLevel(teens, "AU", 7)).toBe(true);
  });

  it("falls back to plain ages when no level fits", () => {
    expect(ageRangeLabel("NZ", { min: 4, max: 4.4 })).toBe("Ages 4–4.4");
  });
});

describe("locale detection", () => {
  it("reads the region out of a locale", () => {
    expect(countryFromLocale("en-AU")).toBe("AU");
    expect(countryFromLocale("en-GB")).toBe("GB");
    expect(countryFromLocale("en-US")).toBe("US");
    expect(countryFromLocale("en-CA")).toBe("CA");
    expect(countryFromLocale("en-NZ")).toBe("NZ");
    expect(countryFromLocale("en-IE")).toBe("IE");
    expect(countryFromLocale("en-Latn-ZA")).toBe("ZA");
  });

  it("ignores markets we don't support", () => {
    expect(countryFromLocale("fr-FR")).toBeNull();
    expect(countryFromLocale("en")).toBeNull();
    expect(countryFromLocale("")).toBeNull();
    expect(countryFromLocale(undefined)).toBeNull();
    expect(countryFromLocale("!!not a locale!!")).toBeNull();
  });

  it("takes the first supported locale the browser offers", () => {
    expect(detectCountry(["fr-FR", "en-IE", "en-US"])).toBe("IE");
  });

  it("falls back to the default when nothing matches", () => {
    expect(detectCountry([])).toBe(DEFAULT_COUNTRY);
    expect(detectCountry(["de-DE"])).toBe(DEFAULT_COUNTRY);
    expect(detectCountry()).toBe(DEFAULT_COUNTRY);
  });
});

describe("guards", () => {
  it("recognises valid codes only", () => {
    expect(isCountryCode("AU")).toBe(true);
    expect(isCountryCode("au")).toBe(false);
    expect(isCountryCode("FR")).toBe(false);
    expect(isCountryCode(null)).toBe(false);
  });

  it("falls back rather than throwing on an unknown code", () => {
    expect(terminologyFor("XX" as CountryCode).code).toBe(DEFAULT_COUNTRY);
  });
});
