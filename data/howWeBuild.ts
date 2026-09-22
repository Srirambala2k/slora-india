/**
 * The "How we build" chapters (master prompt P§10–12).
 *
 * These follow what the supplied installation footage ACTUALLY shows (seven stages).
 * Stages the footage does not show (site survey, drainage, line marking, quality check,
 * handover) are deliberately absent: the prompt says to display only what is supported by
 * real SLORA content and never to invent claims.
 *
 * `provisional`: the names are descriptions of the footage, not SLORA's own process wording,
 * and need SLORA's approval (plan §8 #7). The footage itself is AI-made stand-in material.
 */
export interface BuildChapter {
  id: string;
  n: string;
  label: string;
  /** Seconds into the footage where this stage starts and ends. */
  start: number;
  end: number;
}

export const BUILD_CHAPTERS: readonly BuildChapter[] = [
  { id: "compaction", n: "01", label: "BASE COMPACTION", start: 0, end: 1.5 },
  { id: "levelling", n: "02", label: "BASE LEVELLING", start: 1.5, end: 3 },
  { id: "roll-out", n: "03", label: "TURF ROLL-OUT", start: 3, end: 4.5 },
  { id: "cutting", n: "04", label: "CUTTING & FITTING", start: 4.5, end: 6 },
  { id: "edge-fixing", n: "05", label: "EDGE FIXING", start: 6, end: 7.5 },
  { id: "infill", n: "06", label: "INFILL & BRUSHING", start: 7.5, end: 8.5 },
  { id: "completed", n: "07", label: "COMPLETED SURFACE", start: 8.5, end: 10 },
] as const;

export const BUILD_FOOTAGE_SECONDS = 10;

export const BUILD_NOTE = "ILLUSTRATIVE FOOTAGE · STAGE NAMES TO BE CONFIRMED BY SLORA";
