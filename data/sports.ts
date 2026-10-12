import { stills, type StillId } from "@/data/media";
import type { RequirementType } from "@/lib/leads/schema";

/**
 * The Sports rail (master prompt P§14): the brief's seven categories (Hockey since removed at the client's request, 2026-10-01), in its order, plus three
 * more added 2026-09-24 (CR-1) so every new material surface card has a sport to link to —
 * Badminton, Basketball and Pickleball (Basketball and Pickleball existed only as surface-card
 * names before; Badminton is new).
 *
 * `applications` and `technical` are shown ONLY when SLORA supplies verified values (and they
 * must say where they came from). Nothing is invented: until then a panel simply omits them.
 *
 * The pictures are stand-ins cut from the supplied footage (see data/media.ts). They are
 * generic courts and grounds, NOT the sport named on the panel, and the section says so.
 * The one-line taglines are placeholder wording for SLORA to confirm.
 */
export type SportId =
  | "football"
  | "cricket"
  | "tennis"
  | "padel"
  | "multi-sport"
  | "athletics"
  | "badminton"
  | "basketball"
  | "pickleball";

export interface SportPanel {
  id: SportId;
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
    image: still("sport-football"),
  },
  {
    id: "cricket",
    n: "02",
    name: "Cricket",
    word: ["Cricket"],
    line: "where every over begins.",
    requirement: "Cricket Turf",
    image: still("sport-cricket"),
  },
  {
    id: "tennis",
    n: "03",
    name: "Tennis",
    word: ["Tennis"],
    line: "every serve starts here.",
    image: still("sport-tennis"),
  },
  {
    id: "padel",
    n: "04",
    name: "Padel",
    word: ["Padel"],
    line: "fast rallies, tight spaces.",
    image: still("sport-padel"),
  },
  {
    id: "multi-sport",
    n: "05",
    name: "Multi-sport",
    word: ["Multi-sport"],
    line: "one court, many games.",
    requirement: "Multi-Sport",
    image: still("sport-multi-sport"),
  },
  {
    id: "athletics",
    n: "06",
    name: "Athletics",
    word: ["Athletics"],
    line: "lanes, lines, records.",
    image: still("sport-athletics"),
  },
  {
    id: "badminton",
    n: "07",
    name: "Badminton",
    word: ["Badminton"],
    line: "quick feet, quicker hands.",
    image: still("sport-badminton"),
  },
  {
    id: "basketball",
    n: "08",
    name: "Basketball",
    word: ["Basketball"],
    line: "built for the bounce.",
    image: still("sport-basketball"),
  },
  {
    id: "pickleball",
    n: "09",
    name: "Pickleball",
    word: ["Pickleball"],
    line: "made for the rally.",
    image: still("sport-pickleball"),
  },
];
