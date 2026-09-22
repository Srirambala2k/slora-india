/**
 * The scroll "journey" (master prompt P§8–9): hero → camera descends through the footage to
 * macro grass → (on machines with a graphics card) a 3D turf that opens into a cross-section.
 *
 * Everything is driven by ONE number, P, the scroll progress (0 → 1) through a tall section
 * whose contents stay pinned to the screen. These pure functions decide what is visible at each
 * P, so the timing lives in one place and is easy to test and tune.
 *
 * Two modes:
 *   "full"  – hero → descent video → 3D turf (needs hardware-accelerated WebGL)
 *   "video" – hero → descent video only (computers without a graphics card, where the 3D
 *             scene would stutter); the layers are then shown as a drawn illustration below.
 */
export type JourneyMode = "full" | "video";

export interface PhaseSet {
  /** How tall the pinned section is, in screen heights. */
  screens: number;
  /** The headline drifts away and fades. */
  headlineOut: readonly [number, number];
  /** The looping hero video hands over to the scroll-driven video. */
  toScrub: readonly [number, number];
  /** The scroll-driven video plays: stadium → … → macro grass. */
  scrub: readonly [number, number];
  /** The 3D turf fades in over the (still fully visible) video. */
  toTurf: readonly [number, number];
  /** The 3D camera path (dive → three-quarter view → front cross-section). */
  turf: readonly [number, number];
  /** The depth gauge on the left is visible while the video descends. */
  gauge: readonly [number, number];
  /** A short line fades in and out early in the descent, between "the arena" and "the surface". */
  groundLine: readonly [number, number];
  /** The brand statement fades in and out over the descent. */
  statement: readonly [number, number];
  /** The 3D scene only needs to draw from here on. */
  turfActiveFrom: number;
}

export const PHASES: Record<JourneyMode, PhaseSet> = {
  full: {
    screens: 8.5,
    headlineOut: [0, 0.1],
    toScrub: [0.025, 0.075],
    scrub: [0.075, 0.5],
    toTurf: [0.44, 0.54],
    turf: [0.5, 1],
    gauge: [0.085, 0.5],
    groundLine: [0.1, 0.22],
    statement: [0.2, 0.46],
    turfActiveFrom: 0.4,
  },
  video: {
    screens: 5.5,
    headlineOut: [0, 0.15],
    toScrub: [0.04, 0.11],
    scrub: [0.11, 1],
    toTurf: [2, 3], // never happens: there is no 3D in this mode
    turf: [2, 3],
    gauge: [0.15, 0.97],
    groundLine: [0.14, 0.3],
    statement: [0.42, 0.8],
    turfActiveFrom: Number.POSITIVE_INFINITY,
  },
};

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/** 0 before `a`, 1 after `b`, linear between. */
export const ramp = (p: number, a: number, b: number): number => clamp01((p - a) / (b - a));

/** Ease in/out (zero speed at both ends). */
export const smooth = (t: number): number => t * t * (3 - 2 * t);

export function headlineExit(p: number, mode: JourneyMode = "full"): number {
  const [a, b] = PHASES[mode].headlineOut;
  return smooth(ramp(p, a, b));
}

/**
 * How visible each background layer is at progress p.
 *
 * The 3D turf fades in ON TOP of the scroll-driven video, which stays fully visible until the
 * 3D is complete and only then disappears. So at every moment something opaque is on screen
 * and there is never a dark dip in the middle of the handover.
 */
export function layerOpacities(
  p: number,
  mode: JourneyMode = "full",
): { loop: number; scrub: number; turf: number } {
  const phases = PHASES[mode];
  const toScrub = smooth(ramp(p, phases.toScrub[0], phases.toScrub[1]));
  const toTurf = smooth(ramp(p, phases.toTurf[0], phases.toTurf[1]));
  return { loop: 1 - toScrub, scrub: toTurf >= 1 ? 0 : toScrub, turf: toTurf };
}

/** 0 → 1 progress of the descent itself: which frame is painted, and the depth gauge. */
export function descentProgress(p: number, mode: JourneyMode = "full"): number {
  const [a, b] = PHASES[mode].scrub;
  return ramp(p, a, b);
}

/** 0 → 1 progress of the 3D camera path. */
export function turfProgress(p: number, mode: JourneyMode = "full"): number {
  const [a, b] = PHASES[mode].turf;
  return ramp(p, a, b);
}

/** Depth gauge visibility: fades in after the headline is gone, out as the descent ends. */
export function gaugeOpacity(p: number, mode: JourneyMode = "full"): number {
  const [a, b] = PHASES[mode].gauge;
  return smooth(ramp(p, a, a + 0.04)) * (1 - smooth(ramp(p, b - 0.04, b)));
}

/** The brand statement fades in, holds, and fades out. */
export function statementOpacity(p: number, mode: JourneyMode = "full"): number {
  const [a, b] = PHASES[mode].statement;
  return smooth(ramp(p, a, a + 0.06)) * (1 - smooth(ramp(p, b - 0.04, b)));
}

/** The short "Every Game Begins with the Ground" line: fades in, holds briefly, fades out —
 *  gone again well before the brand statement takes its turn. */
export function groundLineOpacity(p: number, mode: JourneyMode = "full"): number {
  const [a, b] = PHASES[mode].groundLine;
  return smooth(ramp(p, a, a + 0.06)) * (1 - smooth(ramp(p, b - 0.04, b)));
}

/** When each of the `count` cross-section labels has fully appeared (turf progress q). */
export function labelReveal(q: number, index: number, count: number): number {
  const start = 0.7 + (index / count) * 0.24;
  return smooth(ramp(q, start, start + 0.07));
}

// Kept for callers that only care about the full journey.
export const JOURNEY_SCREENS = PHASES.full.screens;
export const PHASE = PHASES.full;
