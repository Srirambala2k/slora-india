import { stills, type VideoId } from "@/data/media";
import type { RequirementType } from "@/lib/leads/schema";

/**
 * Surface cards (master prompt P§13). **Rebuilt 2026-09-24 (CR-1, client feedback):** the deck
 * used to be five cards named after a SPORT (Football turf, Pickleball court, Shuttle court,
 * Park setup, Basketball court), which duplicated and muddled the separate Sports section. It
 * is now seven cards named after a MATERIAL — what SLORA actually builds a surface out of —
 * and each one (except the maintenance service) links to the sports it is played on, via
 * `data/surfaceSports.ts`. See IMPLEMENTATION_PLAN.md's "CR-1" for the full brief and the
 * client's confirmation status of this exact list.
 *
 * `spec` and `area` are shown ONLY when SLORA supplies verified values (and they must say
 * where they came from). Nothing is invented: until then the card simply omits them.
 *
 * The pictures are stand-ins: either cut from the supplied AI stand-in footage, or (for four of
 * the new material cards) real reference photos the client supplied — see `data/media.ts`'s
 * "illustrative" doc comment and `scripts/encode-surface-photos.mjs` for exactly which, and the
 * honest limitations (low resolution, rights unconfirmed) that come with them. The section says
 * on screen that every picture here is a stand-in.
 */

/** Every surface card, by id — also the key `data/surfaceSports.ts`'s relation table uses. */
export type SurfaceCardId =
  | "artificial-turf"
  | "acrylic"
  | "sports-vinyl"
  | "rubber-epdm"
  | "wooden"
  | "synthetic-pu"
  | "maintenance-resurfacing";

/**
 * The little slab laid across the giant word. A turf card shows the three layers of an
 * artificial-turf surface; a court card shows one tinted playing surface with lines, no layer
 * names (SLORA's exact build-ups for these are not known and must not be made up).
 */
export type SlabStyle =
  | { kind: "turf" }
  | { kind: "court"; tone: "blue" | "teal" | "clay" | "wood" | "synthetic" | "steel" };

export interface SurfaceCard {
  id: SurfaceCardId;
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
    id: "artificial-turf",
    n: "01",
    label: "Artificial turf",
    word: ["Astro", "turf"],
    line: ["built for", "the game."],
    info: "ARTIFICIAL TURF · SPORTS SURFACES",
    href: "#sports",
    image: { src: stills["football-pitch"].src, label: stills["football-pitch"].label },
    video: "hero-loop",
    slab: { kind: "turf" },
    // Ambiguous between Football Turf and Cricket Turf — the chat asks rather than guessing.
  },
  {
    id: "acrylic",
    n: "02",
    label: "Acrylic flooring",
    word: ["Acrylic", "court"],
    line: ["made for", "hard courts."],
    info: "ACRYLIC COURTS · SPORTS SURFACES",
    href: "#sports",
    image: { src: stills["acrylic-court"].src, label: stills["acrylic-court"].label },
    slab: { kind: "court", tone: "blue" },
    requirement: "Sports Flooring",
  },
  {
    id: "sports-vinyl",
    n: "03",
    label: "Sports vinyl",
    word: ["Vinyl", "court"],
    line: ["made for", "indoor play."],
    info: "SPORTS VINYL · INDOOR SURFACES",
    href: "#sports",
    image: { src: stills["vinyl-court"].src, label: stills["vinyl-court"].label },
    slab: { kind: "court", tone: "teal" },
    requirement: "Sports Flooring",
  },
  {
    id: "rubber-epdm",
    n: "04",
    label: "Rubber / EPDM",
    word: ["Rubber", "track"],
    line: ["built for", "every stride."],
    info: "RUBBER · EPDM SURFACES",
    href: "#sports",
    image: { src: stills["rubber-track"].src, label: stills["rubber-track"].label },
    slab: { kind: "court", tone: "clay" },
    requirement: "Sports Flooring",
  },
  {
    id: "wooden",
    n: "05",
    label: "Wooden flooring",
    word: ["Wood", "court"],
    line: ["crafted for", "the court."],
    info: "WOODEN FLOORING · INDOOR SURFACES",
    href: "#sports",
    image: { src: stills["wood-court"].src, label: stills["wood-court"].label },
    slab: { kind: "court", tone: "wood" },
    requirement: "Sports Flooring",
  },
  {
    id: "synthetic-pu",
    n: "06",
    label: "Synthetic (PU)",
    word: ["PU", "court"],
    line: ["engineered for", "performance."],
    info: "SYNTHETIC PU · INDOOR SURFACES",
    href: "#sports",
    // No usable client photo yet (CR-1: one supplied file was a manufacturer's own branded
    // diagram, the other a marketing composite) — reuses an existing illustrative court still.
    image: { src: stills["court-shuttle"].src, label: stills["court-shuttle"].label },
    slab: { kind: "court", tone: "synthetic" },
    requirement: "Sports Flooring",
  },
  {
    id: "maintenance-resurfacing",
    n: "07",
    label: "Maintenance & resurfacing",
    word: ["Resur", "face"],
    line: ["keeping surfaces", "game-ready."],
    info: "MAINTENANCE · RESURFACING",
    href: "#contact",
    // A service, not a surface: no sports row (data/surfaceSports.ts lists none for it), and
    // no usable client photo yet (CR-1: the two supplied files were a competitor's own tile
    // marketing render and an unrelated lawn-care advert) — reuses an existing illustrative still.
    image: { src: stills["macro-grass"].src, label: stills["macro-grass"].label },
    slab: { kind: "court", tone: "steel" },
    // Deliberately no `requirement`: this is a service call, not a build type — nothing to
    // pre-fill, and none of the listed enquiry types fit it.
  },
];
