/**
 * The maths behind scroll-driven footage made of still frames (see frameSequence.ts).
 * Kept as small pure functions so the tricky decisions (which frame to show, which to load
 * next, which to keep in memory) can be tested without a browser.
 *
 * "position" is always 0 → 1 along the footage; "f" is the same thing as a frame number
 * (0 → count - 1, fractional).
 */

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** Frame number (fractional) for a 0 → 1 position. */
export function frameAt(position: number, count: number): number {
  return clamp(position, 0, 1) * (count - 1);
}

/**
 * A spread-out subset of frames (every `step`th, always including the first and last) that is
 * loaded FIRST and kept in memory, so there is always something reasonable to show, whatever
 * the scroll speed and however much of the rest has arrived.
 */
export function coarseIndices(count: number, step = 10): number[] {
  const indices: number[] = [];
  for (let i = 0; i < count; i += step) indices.push(i);
  if (indices[indices.length - 1] !== count - 1) indices.push(count - 1);
  return indices;
}

export interface FramePick {
  /** The frame to draw first (fully opaque). */
  a: number;
  /** A second frame to blend on top, or null. */
  b: number | null;
  /** How much of `b` to blend in (0 → 1). */
  t: number;
}

/**
 * Choose what to paint for position `f`, given which frames are available.
 *
 * - Two available frames close together (≤ `maxBlendGap` apart) around `f` are BLENDED, so
 *   slow scrolling glides between frames instead of stepping.
 * - If the nearest available frames are far apart (they have not loaded yet, or you are
 *   scrolling very fast) blending them would look like a ghostly dissolve, so the single
 *   nearest frame is shown instead.
 * - Returns null when nothing is available yet.
 */
export function pickFrames(
  has: (index: number) => boolean,
  f: number,
  count: number,
  maxBlendGap = 2,
): FramePick | null {
  const last = count - 1;
  const clamped = clamp(f, 0, last);
  let lo: number | null = null;
  for (let i = Math.floor(clamped); i >= 0; i--) {
    if (has(i)) {
      lo = i;
      break;
    }
  }
  let hi: number | null = null;
  for (let i = Math.ceil(clamped); i <= last; i++) {
    if (has(i)) {
      hi = i;
      break;
    }
  }
  if (lo === null && hi === null) return null;
  if (lo === null) return { a: hi as number, b: null, t: 0 };
  if (hi === null || hi === lo) return { a: lo, b: null, t: 0 };
  if (hi - lo <= maxBlendGap) return { a: lo, b: hi, t: (clamped - lo) / (hi - lo) };
  // too far apart to blend: show whichever is nearer
  return { a: clamped - lo <= hi - clamped ? lo : hi, b: null, t: 0 };
}

export interface PaintPlan {
  /** Drawn first, fully opaque. */
  first: number;
  /** Drawn on top at `alpha`, or null when one frame is enough. */
  second: number | null;
  alpha: number;
}

/**
 * Turn a pick into what is actually drawn. Every full-screen draw costs the graphics card real
 * work (and a card that falls behind makes the browser freeze the page until it catches up), so:
 *   - very close to a frame, that frame alone is drawn (one draw instead of two);
 *   - between frames the blend moves in `steps` small steps, so two scroll positions that
 *     would look the same produce the same plan and the canvas is not redrawn for nothing.
 */
export function paintPlan(pick: FramePick, steps = 12): PaintPlan {
  if (pick.b === null) return { first: pick.a, second: null, alpha: 0 };
  const t = Math.round(pick.t * steps) / steps;
  if (t <= 0) return { first: pick.a, second: null, alpha: 0 };
  if (t >= 1) return { first: pick.b, second: null, alpha: 0 };
  return { first: pick.a, second: pick.b, alpha: t };
}

/**
 * The frames worth having decoded and ready right now: a few behind `f` and more ahead in the
 * direction of travel (`direction` +1 = forward, -1 = backward, 0 = unknown), nearest first.
 */
export function windowIndices(
  f: number,
  count: number,
  direction: -1 | 0 | 1,
  behind = 3,
  ahead = 8,
): number[] {
  const centre = Math.round(clamp(f, 0, count - 1));
  const before = direction < 0 ? ahead : behind;
  const after = direction < 0 ? behind : ahead;
  const indices: number[] = [];
  for (let i = centre - before; i <= centre + after; i++) {
    if (i >= 0 && i < count) indices.push(i);
  }
  return indices.sort((x, y) => Math.abs(x - f) - Math.abs(y - f));
}

/**
 * Which frame to download next: first any of the spread-out "coarse" frames (so scrubbing works
 * within moments), then whichever missing frame is nearest to where the visitor is.
 */
export function nextToFetch(
  isLoaded: (index: number) => boolean,
  isFetching: (index: number) => boolean,
  f: number,
  count: number,
  coarse: readonly number[],
): number | null {
  for (const i of coarse) if (!isLoaded(i) && !isFetching(i)) return i;
  let best: number | null = null;
  let bestDistance = Infinity;
  for (let i = 0; i < count; i++) {
    if (isLoaded(i) || isFetching(i)) continue;
    const distance = Math.abs(i - f);
    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  }
  return best;
}
