/**
 * Scroll-driven footage, cut into still frames (see lib/media/frameSequence.ts for why).
 * Made by `npm run assets:encode` from the original clips, in `public/sequences/<id>/`.
 *
 * `provenance`: the footage is the AI-made stand-in, never a specific SLORA project.
 */
export interface FrameSequenceMeta {
  dir: string;
  /** Number of frames (12 per second of footage). */
  count: number;
  width: number;
  height: number;
  label: string;
  provenance: "illustrative" | "real";
}

export const sequences = {
  /** The hero footage played BACKWARDS: night stadium → track → court → pitch → macro grass. */
  "hero-descent": {
    dir: "/sequences/hero-descent",
    count: 120,
    width: 1440,
    height: 810,
    label: "Facility descending to macro artificial-grass fibres",
    provenance: "illustrative",
  },
  /** The installation footage, forwards: base compaction → … → finished pitch. */
  "how-we-build": {
    dir: "/sequences/how-we-build",
    count: 120,
    width: 1440,
    height: 810,
    label: "Artificial turf installation, from base preparation to finished pitch",
    provenance: "illustrative",
  },
} as const satisfies Record<string, FrameSequenceMeta>;

export type SequenceId = keyof typeof sequences;

/** File name of frame `index` (0-based); ffmpeg numbers them from 001. */
export function frameFile(index: number): string {
  return `f${String(index + 1).padStart(3, "0")}.webp`;
}

export function frameUrls(id: SequenceId): string[] {
  const { dir, count } = sequences[id];
  return Array.from({ length: count }, (_, i) => `${dir}/${frameFile(i)}`);
}
