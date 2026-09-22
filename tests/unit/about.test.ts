import { describe, expect, it } from "vitest";
import {
  ABOUT_PARAGRAPHS,
  FOUNDED_YEAR,
  FOUNDER_NAME,
  FOUNDER_PHOTO,
  LEAD_LINE,
  PROJECTS_STAT,
  SINCE,
} from "@/data/about";

const flatten = (runs: readonly { text: string }[]) => runs.map((r) => r.text).join("");

describe("the founder story SLORA supplied", () => {
  it("uses the name, tagline and year exactly as given", () => {
    expect(FOUNDER_NAME).toBe("Lohith Raghuraman");
    expect(FOUNDED_YEAR).toBe("2026");
    expect(SINCE).toBe("Since 2026");
    expect(PROJECTS_STAT).toBe("100+");
    expect(LEAD_LINE).toBe("Every great space begins with a vision.");
  });

  it("the three paragraphs read exactly as supplied once the emphasised runs are joined back together", () => {
    expect(ABOUT_PARAGRAPHS.map(flatten)).toEqual([
      "Lohith Raghuraman founded SLORA to bring a fresh perspective to sports surfaces, artificial turf and outdoor environments — with a focus on quality, craftsmanship and performance.",
      "While SLORA is a new brand, its foundation is built on years of hands-on industry experience and involvement in 100+ previously executed projects.",
      "Now, that experience is being shaped into something new — a dedicated brand creating spaces that are built to perform, designed to last and made to be experienced.",
    ]);
  });

  it("emphasises the founder's name and the same phrases SLORA itself emphasised", () => {
    const strongText = (i: number) =>
      ABOUT_PARAGRAPHS[i]
        .filter((r) => r.strong)
        .map((r) => r.text)
        .join(" / ");
    expect(strongText(0)).toBe("Lohith Raghuraman / quality, craftsmanship and performance");
    expect(strongText(1)).toBe("100+ previously executed projects");
    expect(strongText(2)).toBe("built to perform, designed to last and made to be experienced.");
  });

  it("highlights the brand name itself wherever it appears in the story, separately from generic emphasis", () => {
    const brandText = (i: number) =>
      ABOUT_PARAGRAPHS[i]
        .filter((r) => r.brand)
        .map((r) => r.text)
        .join(" / ");
    expect(brandText(0)).toBe("SLORA");
    expect(brandText(1)).toBe("SLORA");
    expect(brandText(2)).toBe(""); // this paragraph never names the brand
    // never both strong and brand on the same run — they render differently
    for (const paragraph of ABOUT_PARAGRAPHS) {
      for (const run of paragraph) expect(run.strong && run.brand).toBeFalsy();
    }
  });

  it("the founder's photo is marked real, not illustrative, and points at the supplied portrait", () => {
    expect(FOUNDER_PHOTO.provenance).toBe("real");
    expect(FOUNDER_PHOTO.src).toBe("/images/team/lohith-raghuraman.webp");
  });
});
