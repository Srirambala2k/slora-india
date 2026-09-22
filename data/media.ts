/**
 * Media manifest — the ONLY place video/still file paths live.
 *
 * Components ask for media by id (`<VideoSlot id="hero-loop" />`), so swapping the
 * current stand-in footage for real SLORA drone/installation clips is a change to
 * this file, not to any component.
 *
 * `provenance`:
 *   "illustrative" — stand-in footage that looks AI-generated (it carries a small ✦ mark).
 *                    Must NOT be presented as a specific SLORA project.
 *   "real"         — genuine SLORA footage.
 */
export type MediaProvenance = "illustrative" | "real";

export interface MediaSource {
  src: string;
  type: "video/mp4";
  /** Optional media query; the first matching <source> wins, so list smaller files first. */
  media?: string;
}

export interface VideoMedia {
  label: string;
  /** Still shown until the first frame plays (and forever under reduced-motion). */
  poster: string;
  sources: MediaSource[];
  width: number;
  height: number;
  durationSeconds: number;
  provenance: MediaProvenance;
}

export interface StillMedia {
  label: string;
  src: string;
  width: number;
  height: number;
  provenance: MediaProvenance;
}

const MOBILE = "(max-width: 767px)";

export const videos = {
  /** Night floodlit wide shot, 2 s SEAMLESS loop (cross-faded at the seam). Hero background. */
  "hero-loop": {
    label: "Floodlit multi-pitch sports facility at night",
    poster: "/videos/slora-hero-poster.webp",
    sources: [
      { src: "/videos/slora-hero-loop-720.mp4", type: "video/mp4", media: MOBILE },
      { src: "/videos/slora-hero-loop-1080.mp4", type: "video/mp4" },
    ],
    width: 1920,
    height: 1080,
    durationSeconds: 2,
    provenance: "illustrative",
  },
  /** Installation sequence: base compaction → levelling → roll-out → cutting → fixing → infill → finished. */
  "how-we-build": {
    label: "Artificial turf installation, from base preparation to finished pitch",
    poster: "/videos/how-we-build-poster.webp",
    sources: [
      { src: "/videos/how-we-build-scrub-540.mp4", type: "video/mp4", media: MOBILE },
      { src: "/videos/how-we-build-1080.mp4", type: "video/mp4" },
    ],
    width: 1920,
    height: 1080,
    durationSeconds: 10,
    provenance: "illustrative",
  },
} as const satisfies Record<string, VideoMedia>;

export const stills = {
  /** Founder portrait, supplied by SLORA (2026-09-22) — a real photo, not a stand-in. */
  "lohith-raghuraman": {
    label: "Lohith Raghuraman, founder of SLORA",
    src: "/images/team/lohith-raghuraman.webp",
    width: 640,
    height: 640,
    provenance: "real",
  },
  /** Low-angle football pitch, centre circle and goal (cut from the hero footage). */
  "football-pitch": {
    label: "Artificial football pitch, low angle, centre circle and goal",
    src: "/videos/slora-football-still.webp",
    width: 1280,
    height: 720,
    provenance: "illustrative",
  },
  /** Macro close-up of grass fibres (the first shot of the hero footage). */
  "macro-grass": {
    label: "Close-up of artificial grass fibres",
    src: "/videos/slora-macro-still.webp",
    width: 1280,
    height: 720,
    provenance: "illustrative",
  },
  /*
   * Stand-ins for the other surface cards, cut from the same footage. They are generic
   * multi-line courts and grounds, NOT the actual sport named on the card, so they stay
   * "illustrative" until SLORA supplies real photographs.
   */
  "court-pickleball": {
    label: "Blue and green multi-line indoor court surface",
    src: "/videos/slora-court-pickleball-still.webp",
    width: 1280,
    height: 720,
    provenance: "illustrative",
  },
  "court-shuttle": {
    label: "Blue and green multi-line indoor court surface, wider angle",
    src: "/videos/slora-court-shuttle-still.webp",
    width: 1280,
    height: 720,
    provenance: "illustrative",
  },
  "court-basketball": {
    label: "Floodlit fenced outdoor court at night",
    src: "/videos/slora-court-basketball-still.webp",
    width: 1280,
    height: 720,
    provenance: "illustrative",
  },
  "park-setup": {
    label: "Tree-lined open-air artificial turf ground under a daytime sky",
    src: "/videos/slora-park-still.webp",
    width: 1280,
    height: 720,
    provenance: "illustrative",
  },
  "athletics-track": {
    label: "Red running-track surface close-up with white lane lines",
    src: "/videos/slora-athletics-still.webp",
    width: 1280,
    height: 720,
    provenance: "illustrative",
  },
  "dusk-court": {
    label: "Fenced artificial turf court at dusk with goals and floodlights",
    src: "/videos/slora-dusk-court-still.webp",
    width: 1280,
    height: 720,
    provenance: "illustrative",
  },
} as const satisfies Record<string, StillMedia>;

export type VideoId = keyof typeof videos;
export type StillId = keyof typeof stills;
