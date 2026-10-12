/**
 * The maths for the pinned "services" section: where each picture and each block of words
 * should be for a scroll progress `p` (0 → 1 across the pinned stretch). Pure, so it is
 * unit-tested; the component only writes the numbers to the elements.
 *
 * `x` is the position in slides: 0 = the first slide centred, 1 = the second, and so on.
 * A picture fades in over the previous one as `x` approaches it (the earlier one stays solid
 * underneath, so there is never a dark dip) and keeps drifting from a little zoomed-in to rest;
 * words fade and slide through, the old block rising out as the new one rises in.
 */
export interface ServicePositions {
  x: number;
  pictures: { opacity: number; scale: number }[];
  words: { opacity: number; y: number }[];
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** Pixels the words travel per slide of distance. */
export const WORD_TRAVEL = 90;

export function servicePositions(p: number, count: number): ServicePositions {
  const x = clamp(p) * (count - 1);
  const pictures = Array.from({ length: count }, (_, i) => {
    // the first picture is always there; later ones fade in as x goes from i-0.8 to i-0.2
    const opacity = i === 0 ? 1 : clamp((x - (i - 0.8)) / 0.6);
    const scale = 1.14 - 0.1 * clamp((x - (i - 1)) / 1.6);
    return { opacity, scale };
  });
  const words = Array.from({ length: count }, (_, i) => {
    const d = x - i;
    const opacity = clamp(1 - (Math.abs(d) - 0.12) / 0.38);
    return { opacity, y: -d * WORD_TRAVEL };
  });
  return { x, pictures, words };
}
