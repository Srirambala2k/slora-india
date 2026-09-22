/**
 * The maths behind the Sports rail (master prompt P§14, plan FX-10): on desktop the section is
 * pinned while scrolling slides a row of panels sideways. Kept as small pure functions so the
 * fiddly parts can be tested without a browser.
 */

import type { Capability } from "@/lib/device/capability";

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

export type RailLayout = "pinned" | "swipe";

/**
 * Which version of the Sports section to show.
 *
 * The pinned sideways rail has JavaScript move big pictures on every scroll frame. That is
 * smooth on a graphics card and very rough without one (measured: dozens of stalls up to a
 * second and a half), so only devices with a graphics card get it. Everyone else, and anyone who
 * asked for less motion, or is on a narrow screen, gets the row of cards that the browser scrolls
 * natively. `override` (?sports=pinned | swipe) is for review and testing only, and can never
 * force the pinned rail on someone who asked for reduced motion or on a narrow screen.
 */
export function railLayout(input: {
  reduced: boolean;
  wide: boolean;
  tier: Capability;
  override?: RailLayout | null;
}): RailLayout {
  if (input.reduced || !input.wide) return "swipe";
  if (input.override) return input.override;
  return input.tier === "full" ? "pinned" : "swipe";
}

/** How far the row must travel sideways: its full width minus what already fits on screen. */
export function railDistance(trackWidth: number, viewportWidth: number): number {
  return Math.max(0, trackWidth - viewportWidth);
}

/**
 * Height of the tall section: one screen (while pinned) plus the distance to travel, so one
 * pixel of scrolling moves the row one pixel sideways. It feels natural and never rushes.
 */
export function sectionHeight(distance: number, viewportHeight: number): number {
  return Math.max(viewportHeight, distance + viewportHeight);
}

/** Where the row sits (a negative number of pixels) for scroll progress 0 → 1. */
export function trackOffset(progress: number, distance: number): number {
  return -clamp(progress, 0, 1) * distance;
}

/**
 * The panel to name in the counter: whichever has its middle nearest the middle of the screen.
 * `lefts`/`widths` are the panels' positions inside the row; `offset` is the row's current shift.
 */
export function activePanel(
  lefts: readonly number[],
  widths: readonly number[],
  offset: number,
  viewportWidth: number,
): number {
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < lefts.length; i++) {
    const middle = lefts[i] + widths[i] / 2 + offset;
    const distance = Math.abs(middle - viewportWidth / 2);
    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  }
  return best;
}

/**
 * The scroll progress that brings a panel to the left of the screen (used when the keyboard
 * focuses a panel that is off screen). The last panels cannot reach the edge, so this stops at 1.
 */
export function progressForPanel(left: number, distance: number, leftGutter: number): number {
  if (distance <= 0) return 0;
  return clamp((left - leftGutter) / distance, 0, 1);
}

/** A slight lean that follows scroll speed (pixels per second), in degrees, never more than `max`. */
export function skewFromVelocity(velocity: number, max = 4): number {
  return clamp(velocity / 450, -max, max);
}

/**
 * How far a panel's picture drifts against the panel's own motion, for depth. `offCentre` is
 * how far the panel's middle is from the middle of the screen; `limit` is the spare picture
 * available on each side, so an edge is never shown.
 */
export function parallaxShift(offCentre: number, limit: number, strength = 0.07): number {
  return clamp(-offCentre * strength, -limit, limit);
}
