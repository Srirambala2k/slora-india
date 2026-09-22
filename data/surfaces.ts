import { stills, type VideoId } from "@/data/media";
import type { RequirementType } from "@/lib/leads/schema";

/**
 * Surface / service cards (master prompt P§13).
 *
 * `spec` and `area` are shown ONLY when SLORA supplies verified values (and they must say
 * where they came from). Nothing is invented: until then the card simply omits them.
 *
 * The pictures are stand-ins cut from the supplied footage (see data/media.ts): they are
 * generic courts and grounds, not SLORA projects, and the section says so on screen.
 */

/**
 * The little slab laid across the giant word. A turf card shows the three layers of an
 * artificial-turf surface; a court card shows a plain tinted court surface (no layer names,
 * because SLORA's court build-ups are not known and must not be made up).
 */
export type SlabStyle = { kind: "turf" } | { kind: "court"; tone: "blue" | "teal" | "clay" };

export interface SurfaceCard {
  id: string;
  n: string;
  /** What the card is about, in plain words (used by screen readers and the pager). */
  label: string;
  /** The giant word, split over two lines, e.g. ["Foot", "ball"]. */
  word: readonly [string, string];
  /** The thin supporting line, split over two lines. */
  line: readonly [string, string];
  /** Plain category label revealed on hover (a name, not a claim). */
  info: string;
  href: string;
  image: { src: string; label: string };
  /** A looping background video instead of the still, where real matching footage exists. */
  video?: VideoId;
  slab: SlabStyle;
  /** Verified technical metadata, or undefined until supplied. */
  spec?: { value: string; source: string };
  area?: { value: string; source: string };
  /**
   * The enquiry type this card's "Connect with us" button pre-fills in the chat. Set ONLY
   * where it matches an enquiry type exactly (never a guess); otherwise the chat simply asks.
   */
  requirement?: RequirementType;
}

export const SURFACE_CARDS: readonly SurfaceCard[] = [
  {
    id: "football",
    n: "01",
    label: "Football turf",
    word: ["Foot", "ball"],
    line: ["built for", "the game."],
    info: "FOOTBALL TURF · SPORTS SURFACES",
    href: "#sports",
    image: { src: stills["football-pitch"].src, label: stills["football-pitch"].label },
    video: "hero-loop",
    slab: { kind: "turf" },
    requirement: "Football Turf",
  },
  {
    id: "pickleball",
    n: "02",
    label: "Pickleball court",
    word: ["Pickle", "ball"],
    line: ["made for", "the rally."],
    info: "PICKLEBALL COURTS · SPORTS SURFACES",
    href: "#sports",
    image: { src: stills["court-pickleball"].src, label: stills["court-pickleball"].label },
    slab: { kind: "court", tone: "blue" },
  },
  {
    id: "shuttle",
    n: "03",
    label: "Shuttle court",
    word: ["Shuttle", "court"],
    line: ["made for", "the smash."],
    info: "SHUTTLE COURTS · SPORTS SURFACES",
    href: "#sports",
    image: { src: stills["court-shuttle"].src, label: stills["court-shuttle"].label },
    slab: { kind: "court", tone: "teal" },
  },
  {
    id: "park",
    n: "04",
    label: "Park setup",
    word: ["Park", "setup"],
    line: ["made for", "open play."],
    info: "PARK SETUPS · LANDSCAPE SURFACES",
    href: "#landscape",
    image: { src: stills["park-setup"].src, label: stills["park-setup"].label },
    slab: { kind: "turf" },
  },
  {
    id: "basketball",
    n: "05",
    label: "Basketball court",
    word: ["Basket", "ball"],
    line: ["built for", "the bounce."],
    info: "BASKETBALL COURTS · SPORTS SURFACES",
    href: "#sports",
    image: { src: stills["court-basketball"].src, label: stills["court-basketball"].label },
    slab: { kind: "court", tone: "clay" },
  },
];
