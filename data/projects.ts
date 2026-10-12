import { projectClip, type ProjectClipMedia } from "@/data/media";

/**
 * The Projects section (2026-10-12): SLORA's own footage, one card per project.
 *
 * Never-invent rule: SLORA has not yet supplied names, places, areas or dates, so the names
 * below come from the folders the footage was delivered in, and `summary` only describes what the
 * clips visibly show. `facts` is empty until SLORA supplies verified values (each needs a
 * `source`); the section says on screen that details are to be confirmed. Tests
 * (`projects.test.ts`) fail if a fact has no source or a clip id has no encoded file.
 */
export interface ProjectFact {
  label: string;
  value: string;
  /** Where the value came from (a person at SLORA, a document). Required. */
  source: string;
}

export interface Project {
  id: string;
  n: string;
  /** From the delivery folder's name, until SLORA gives the real one. */
  name: string;
  /** A short plain label for the kind of work shown. */
  kind: string;
  /** What the clips show, in plain words. Not a claim about specs, size or client. */
  summary: string;
  facts: readonly ProjectFact[];
  /** The first clip is the card's picture. */
  clips: readonly ProjectClipMedia[];
}

export const PROJECTS: readonly Project[] = [
  {
    id: "vellore-turf",
    n: "01",
    name: "Vellore Turf",
    kind: "FOOTBALL PITCH · AERIAL",
    summary:
      "A drone flight over a striped artificial-turf football pitch, from the centre circle to the goal area.",
    facts: [],
    clips: [
      projectClip("vellore-turf", 1),
      projectClip("vellore-turf", 2),
      projectClip("vellore-turf", 3),
    ],
  },
  {
    id: "tbm-pickleball",
    n: "02",
    name: "TBM Pickleball",
    kind: "PICKLEBALL COURTS · SURFACE COATING",
    summary:
      "Pickleball courts marked out on a green surface, with the blue playing areas coated by hand and roller, ending on the finished courts.",
    facts: [],
    clips: [
      projectClip("tbm-pickleball", 1),
      projectClip("tbm-pickleball", 2),
      projectClip("tbm-pickleball", 3, true),
      projectClip("tbm-pickleball", 4, true),
      projectClip("tbm-pickleball", 5),
      projectClip("tbm-pickleball", 6, true),
      projectClip("tbm-pickleball", 7, true),
    ],
  },
  {
    id: "pickleball",
    n: "03",
    name: "Pickleball Court",
    kind: "PICKLEBALL COURT · FINISHED",
    summary: "A finished blue-and-green pickleball court with its net, lines and fencing, in use.",
    facts: [],
    clips: [
      projectClip("pickleball", 1, true),
      projectClip("pickleball", 2, true),
      projectClip("pickleball", 3, true),
      projectClip("pickleball", 4, true),
    ],
  },
  {
    id: "flooring",
    n: "04",
    name: "Flooring",
    kind: "ROOFTOP TURF · CRICKET NET",
    summary:
      "Artificial turf laid on a rooftop terrace, with a netted cricket area and stumps, filmed from a drone.",
    facts: [],
    clips: [
      projectClip("flooring", 1),
      projectClip("flooring", 2, true),
      projectClip("flooring", 3, true),
    ],
  },
  {
    id: "site-preparation",
    n: "05",
    name: "Behind the Scenes",
    kind: "SITE PREPARATION",
    summary:
      "Work before the surface goes down: clearing and levelling the ground, laying the stone base and edge walls.",
    facts: [],
    clips: [
      projectClip("site-preparation", 1, true),
      projectClip("site-preparation", 2, true),
      projectClip("site-preparation", 3, true),
      projectClip("site-preparation", 4, true),
      projectClip("site-preparation", 5, true),
      projectClip("site-preparation", 6, true),
    ],
  },
] as const;

export const PROJECTS_NOTE = "PROJECT NAMES AND DETAILS TO BE CONFIRMED BY SLORA";

export const projectById = (id: string): Project | undefined => PROJECTS.find((p) => p.id === id);
