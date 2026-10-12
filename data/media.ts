/**
 * Media manifest — the ONLY place video/still file paths live.
 *
 * Components ask for media by id (`<VideoSlot id="hero-loop" />`), so swapping the
 * current stand-in footage for real SLORA drone/installation clips is a change to
 * this file, not to any component.
 *
 * `provenance`:
 *   "illustrative" — a stand-in, not a specific SLORA project: either footage that looks
 *                    AI-generated (it carries a small ✦ mark), or a real third-party
 *                    reference photo (CR-1, 2026-09-25: `scripts/encode-surface-photos.mjs`)
 *                    whose usage rights are not yet confirmed — treat both the same way:
 *                    fine for development/client review, not for public launch, until
 *                    replaced by SLORA's own material or a properly licensed photo.
 *   "real"         — genuine SLORA footage, rights confirmed.
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
  /*
   * CR-1 (2026-09-25) surface reference photos, supplied by the client (`photo/photos_surface/`)
   * and converted by `scripts/encode-surface-photos.mjs` — see that script's header comment for
   * exactly which of the two supplied photos was used for each, and why. Real photos of real
   * (non-SLORA) courts, at a real company's usual reference-search resolution (736 px wide,
   * upscaled here) — good enough to build and review this feature against, not yet good enough,
   * or rights-cleared, to ship. No usable photo was supplied for "Synthetic (PU)" or
   * "Maintenance & resurfacing" (see the script comment); those two surfaces reuse an existing
   * illustrative court still below until SLORA supplies real ones.
   */
  "acrylic-court": {
    label: "Outdoor acrylic-surfaced multi-court, aerial view",
    src: "/images/surfaces/acrylic-court.webp",
    width: 1280,
    height: 1280,
    provenance: "illustrative",
  },
  "rubber-track": {
    label: "Outdoor red rubber running track, lane lines and stand",
    src: "/images/surfaces/rubber-track.webp",
    width: 1280,
    height: 1706,
    provenance: "illustrative",
  },
  "vinyl-court": {
    label: "Indoor multi-court badminton hall, vinyl flooring",
    src: "/images/surfaces/vinyl-court.webp",
    width: 1280,
    height: 1066,
    provenance: "illustrative",
  },
  "wood-court": {
    label: "Indoor wooden gymnasium floor, mid-resurfacing",
    src: "/images/surfaces/wood-court.webp",
    width: 1280,
    height: 1706,
    provenance: "illustrative",
  },
  /**
   * Sports panel backgrounds (2026-10-01): AI-generated pictures supplied by the client, one per
   * Sports panel, converted by `scripts/encode-sport-photos.mjs` (which paints out the generator's
   * corner watermark). Illustrative stand-ins, never a specific SLORA project.
   */
  "sport-football": {
    label: "Football on artificial turf, players in the distance",
    src: "/images/sports/football.webp",
    width: 1600,
    height: 893,
    provenance: "illustrative",
  },
  "sport-cricket": {
    label: "Cricket ball on artificial turf, players in the distance",
    src: "/images/sports/cricket.webp",
    width: 1600,
    height: 893,
    provenance: "illustrative",
  },
  "sport-tennis": {
    label: "Tennis ball on a blue hard court line",
    src: "/images/sports/tennis.webp",
    width: 1600,
    height: 893,
    provenance: "illustrative",
  },
  "sport-padel": {
    label: "Tennis ball on a blue padel court at dusk",
    src: "/images/sports/padel.webp",
    width: 1600,
    height: 893,
    provenance: "illustrative",
  },
  "sport-multi-sport": {
    label: "Tennis, football and cricket balls on a three-surface court",
    src: "/images/sports/multi-sport.webp",
    width: 1600,
    height: 893,
    provenance: "illustrative",
  },
  "sport-athletics": {
    label: "Relay baton and starting-block pin on a red athletics track",
    src: "/images/sports/athletics.webp",
    width: 1600,
    height: 893,
    provenance: "illustrative",
  },
  "sport-badminton": {
    label: "Shuttlecock on a green indoor badminton court",
    src: "/images/sports/badminton.webp",
    width: 1600,
    height: 893,
    provenance: "illustrative",
  },
  "sport-basketball": {
    label: "Basketball on a polished wooden court",
    src: "/images/sports/basketball.webp",
    width: 1600,
    height: 893,
    provenance: "illustrative",
  },
  "sport-pickleball": {
    label: "Pickleball and paddle on a blue and green court",
    src: "/images/sports/pickleball.webp",
    width: 1600,
    height: 893,
    provenance: "illustrative",
  },
  /**
   * "Services we provide" slides (2026-10-12): AI-generated pictures supplied by the client,
   * prepared by `scripts/encode-service-images.mjs`.
   */
  "service-planning": {
    label: "Top-down drawing of a multi-sport court layout on a blueprint sheet",
    src: "/images/services/planning.webp",
    width: 1920,
    height: 1047,
    provenance: "illustrative",
  },
  "service-construction": {
    label: "Crew rolling out and gluing blue and green sports flooring in an indoor hall",
    src: "/images/services/construction.webp",
    width: 1920,
    height: 1047,
    provenance: "illustrative",
  },
  "service-maintenance": {
    label: "Workers marking lines and repairing a sports floor in an indoor hall",
    src: "/images/services/maintenance.webp",
    width: 1920,
    height: 1047,
    provenance: "illustrative",
  },
} as const satisfies Record<string, StillMedia>;

export type VideoId = keyof typeof videos;
export type StillId = keyof typeof stills;

/**
 * Project footage (2026-10-12): SLORA's own clips, encoded by `scripts/encode-project-videos.mjs`
 * into `public/videos/projects/<project>/<NN>.mp4` + `<NN>.webp` (NN = 01, 02, …, in the order the
 * script lists them). These are real SLORA material, unlike the stand-ins above.
 */
export interface ProjectClipMedia {
  src: string;
  poster: string;
  /** Taller than wide (phone footage): the viewer shows it upright instead of cropping it. */
  portrait: boolean;
  provenance: "real";
}

export function projectClip(project: string, n: number, portrait = false): ProjectClipMedia {
  const base = `/videos/projects/${project}/${String(n).padStart(2, "0")}`;
  return { src: `${base}.mp4`, poster: `${base}.webp`, portrait, provenance: "real" };
}
