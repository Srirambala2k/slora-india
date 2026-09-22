/**
 * Small pure helpers for the surface-card carousel (kept apart from the component so the
 * fiddly bits can be tested without a browser).
 */

/** On wide screens the giant word is sized so about four letters fill a line ("FOOT" / "BALL")… */
const LETTERS_THAT_FIT = 4.6;
/** …and the LOWER line counts as this much longer, because it sits down where the slab is. */
const LOWER_LINE_EXTRA = 0.5;
/** On a phone the word spans the whole width of the card and there is no room to spare. */
const LETTERS_THAT_FIT_NARROW = 3.8;

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * How much to shrink the giant word (on wide screens) so it still reads beside the slab.
 * 1 = full size ("FOOT" / "BALL"); "SHUTTLE" is scaled to about 0.66, "SETUP" to about 0.84.
 */
export function wordScale(word: readonly [string, string]): number {
  const longest = Math.max(word[0].length, word[1].length + LOWER_LINE_EXTRA, 1);
  return Math.min(1, round2(LETTERS_THAT_FIT / longest));
}

/** The same, for phones: the longest line must fit across the card. */
export function wordScaleNarrow(word: readonly [string, string]): number {
  const longest = Math.max(word[0].length, word[1].length, 1);
  return Math.min(1, round2(LETTERS_THAT_FIT_NARROW / longest));
}

/** The next card; after the last one it goes back to the first. */
export function nextIndex(index: number, count: number): number {
  return count <= 0 ? 0 : (index + 1) % count;
}

/** The previous card; it stops at the first one (the back arrow is hidden there). */
export function prevIndex(index: number, count: number): number {
  return count <= 0 ? 0 : Math.max(0, Math.min(index, count - 1) - 1);
}

/** Which way the deck moves when going from one card to another (+1 = forward). */
export function directionBetween(from: number, to: number, count: number): 1 | -1 {
  if (from === to) return 1;
  // stepping from the last card back round to the first still counts as "forward"
  if (from === count - 1 && to === 0) return 1;
  return to > from ? 1 : -1;
}
