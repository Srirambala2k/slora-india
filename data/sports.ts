import { stills, type StillId } from "@/data/media";
import type { RequirementType } from "@/lib/leads/schema";

/**
 * The Sports rail (master prompt P§14): seven categories, in the order the brief lists them.
 *
 * `applications` and `technical` are shown ONLY when SLORA supplies verified values (and they
 * must say where they came from). Nothing is invented: until then a panel simply omits them.
 *
 * The pictures are stand-ins cut from the supplied footage (see data/media.ts). They are
 * generic courts and grounds, NOT the sport named on the panel, and the section says so.
 * The one-line taglines are placeholder wording for SLORA to confirm.
 */
export interface SportPanel {
  id: string;
  n: string;
  /** Plain name, used by screen readers, the button and the counter. */
  name: string;
  /** The giant word: one or two lines. */
  word: readonly [string] | readonly [string, string];
  /** The thin supporting line (placeholder wording). */
  line: string;
  /**
   * The enquiry type this panel's button pre-fills in the chat. Set ONLY where it matches an
   * enquiry type exactly; otherwise the chat simply asks, which is better than guessing.
   */
  requirement?: RequirementType;
  image: {
    src: string;
    label: string;
    /** CSS object-position, to give the shared stand-in pictures a different crop. */
    position?: string;
    /** Extra zoom (1 = none), for the same reason. */
    zoom?: number;
  };
  /** Verified applications, or undefined until supplied. */
  applications?: { value: string; source: string };
  /** Verified technical information, or undefined until supplied. */
  technical?: { value: string; source: string };
}

const still = (id: StillId, position?: string, zoom?: number) => ({
  src: stills[id].src,
  label: stills[id].label,
  position,
  zoom,
});

export const SPORT_PANELS: readonly SportPanel[] = [
  {
    id: "football",
    n: "01",
    name: "Football",
    word: ["Foot", "ball"],
    line: "the beautiful game, underfoot.",
    requirement: "Football Turf",
    image: still("football-pitch"),
  },
  {
    id: "cricket",
    n: "02",
    name: "Cricket",
    word: ["Cricket"],
    line: "where every over begins.",
    requirement: "Cricket Turf",
    image: still("macro-grass"),
  },
  {
    id: "hockey",
    n: "03",
    name: "Hockey",
    word: ["Hockey"],
    line: "pace, precision, surface.",
    image: still("dusk-court"),
  },
  {
    id: "tennis",
    n: "04",
    name: "Tennis",
    word: ["Tennis"],
    line: "every serve starts here.",
    image: still("court-pickleball", "18% 72%", 1.35),
  },
  {
    id: "padel",
    n: "05",
    name: "Padel",
    word: ["Padel"],
    line: "fast rallies, tight spaces.",
    image: still("court-basketball", "80% 60%", 1.25),
  },
  {
    id: "multi-sport",
    n: "06",
    name: "Multi-sport",
    word: ["Multi", "sport"],
    line: "one court, many games.",
    requirement: "Multi-Sport",
    image: still("court-shuttle"),
  },
  {
    id: "athletics",
    n: "07",
    name: "Athletics",
    word: ["Athletics"],
    line: "lanes, lines, records.",
    image: still("athletics-track"),
  },
];
