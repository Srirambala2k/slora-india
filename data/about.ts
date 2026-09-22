import { stills } from "@/data/media";

/**
 * ABOUT: SLORA's founder story, supplied directly by SLORA (2026-09-22) — real, not
 * illustrative. The wording is used exactly as given; `strong` marks the phrases SLORA
 * itself emphasised.
 */
export const FOUNDER_PHOTO = stills["lohith-raghuraman"];
export const FOUNDER_NAME = "Lohith Raghuraman";
export const FOUNDED_YEAR = "2026";
export const SINCE = `Since ${FOUNDED_YEAR}`;
export const LEAD_LINE = "Every great space begins with a vision.";
/** The one other real number SLORA gave: "100+ previously executed projects". */
export const PROJECTS_STAT = "100+";

export interface TextRun {
  text: string;
  /** Generic emphasis (bold), for the phrases SLORA itself emphasised. */
  strong?: boolean;
  /** The brand name itself: highlighted in gold, distinct from generic emphasis. */
  brand?: boolean;
}

export const ABOUT_PARAGRAPHS: readonly (readonly TextRun[])[] = [
  [
    { text: "Lohith Raghuraman", strong: true },
    { text: " founded " },
    { text: "SLORA", brand: true },
    {
      text: " to bring a fresh perspective to sports surfaces, artificial turf and outdoor environments — with a focus on ",
    },
    { text: "quality, craftsmanship and performance", strong: true },
    { text: "." },
  ],
  [
    { text: "While " },
    { text: "SLORA", brand: true },
    {
      text: " is a new brand, its foundation is built on years of hands-on industry experience and involvement in ",
    },
    { text: "100+ previously executed projects", strong: true },
    { text: "." },
  ],
  [
    {
      text: "Now, that experience is being shaped into something new — a dedicated brand creating spaces that are ",
    },
    { text: "built to perform, designed to last and made to be experienced.", strong: true },
  ],
];
