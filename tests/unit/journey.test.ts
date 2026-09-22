import { describe, expect, it } from "vitest";
import { cameraPose } from "@/lib/journey/camera";
import {
  PHASES,
  descentProgress,
  gaugeOpacity,
  groundLineOpacity,
  headlineExit,
  labelReveal,
  layerOpacities,
  statementOpacity,
  turfProgress,
} from "@/lib/journey/phases";
import { frameAt } from "@/lib/media/frameMath";

describe("journey timing", () => {
  it("starts on the looping hero, with the headline showing", () => {
    expect(layerOpacities(0)).toEqual({ loop: 1, scrub: 0, turf: 0 });
    expect(headlineExit(0)).toBe(0);
  });

  it("is on the scroll-driven video mid-descent, and only that", () => {
    const mid = layerOpacities(0.3);
    expect(mid.loop).toBe(0);
    expect(mid.scrub).toBe(1);
    expect(mid.turf).toBe(0);
  });

  it("ends on the 3D turf only", () => {
    expect(layerOpacities(1)).toEqual({ loop: 0, scrub: 0, turf: 1 });
  });

  it("the headline has fully left before the video descent begins to matter", () => {
    expect(headlineExit(0.1)).toBe(1);
    expect(headlineExit(0.3)).toBe(1);
  });

  it("never shows a dark gap: something opaque is on screen at every moment (no dip when the 3D fades in)", () => {
    for (const mode of ["full", "video"] as const) {
      for (let p = 0; p <= 1.0001; p += 0.005) {
        const o = layerOpacities(p, mode);
        expect(o.loop + o.scrub).toBeLessThanOrEqual(1.0001); // the videos only ever swap places
        // how much of the screen is covered once the 3D (on top) is counted in
        const covered = 1 - (1 - o.turf) * (1 - (o.loop + o.scrub));
        expect(covered, `${mode} at p=${p.toFixed(3)}`).toBeGreaterThanOrEqual(0.9999);
      }
    }
  });

  it("keeps the scroll-driven video fully visible UNDER the 3D until the 3D has finished fading in", () => {
    const [a, b] = PHASES.full.toTurf;
    for (let p = a; p < b - 0.001; p += 0.005) {
      const o = layerOpacities(p);
      expect(o.scrub).toBe(1);
      expect(o.turf).toBeLessThan(1);
    }
    expect(layerOpacities(b).scrub).toBe(0);
    expect(layerOpacities(b).turf).toBe(1);
  });

  it("the video-only mode (no graphics card) never shows any 3D", () => {
    for (let p = 0; p <= 1; p += 0.01) {
      expect(layerOpacities(p, "video").turf).toBe(0);
      expect(turfProgress(p, "video")).toBe(0);
    }
    expect(layerOpacities(1, "video")).toEqual({ loop: 0, scrub: 1, turf: 0 });
    expect(PHASES.video.screens).toBeLessThan(PHASES.full.screens);
  });

  it("the video-only mode plays the whole descent, ends on the last frame, and shows its own gauge and statement", () => {
    expect(frameAt(descentProgress(0, "video"), 120)).toBe(0);
    expect(frameAt(descentProgress(1, "video"), 120)).toBe(119);
    expect(descentProgress(1, "video")).toBe(1);
    expect(gaugeOpacity(0.5, "video")).toBe(1);
    expect(statementOpacity(0.6, "video")).toBe(1);
    expect(gaugeOpacity(1, "video")).toBe(0);
  });

  it("paints the whole descent, first frame to last, and never asks for a frame past the end", () => {
    expect(frameAt(descentProgress(0), 120)).toBe(0);
    expect(frameAt(descentProgress(0.075), 120)).toBe(0);
    expect(frameAt(descentProgress(0.5), 120)).toBe(119);
    expect(frameAt(descentProgress(1), 120)).toBe(119);
  });

  it("the frame only ever moves forward as you scroll down", () => {
    let last = -1;
    for (let p = 0; p <= 1; p += 0.005) {
      const f = frameAt(descentProgress(p), 120);
      expect(f).toBeGreaterThanOrEqual(last);
      last = f;
    }
  });

  it("reports descent and turf progress as 0→1 over their own ranges", () => {
    expect(descentProgress(0.075)).toBe(0);
    expect(descentProgress(0.5)).toBe(1);
    expect(turfProgress(0.5)).toBe(0);
    expect(turfProgress(1)).toBe(1);
    expect(turfProgress(0.75)).toBeCloseTo(0.5, 5);
  });

  it("the gauge and statement appear during the descent and are gone at the ends", () => {
    for (const fn of [gaugeOpacity, statementOpacity]) {
      expect(fn(0)).toBe(0);
      expect(fn(1)).toBe(0);
    }
    expect(gaugeOpacity(0.3)).toBe(1);
    expect(statementOpacity(0.33)).toBe(1);
  });

  it('the "Every Game Begins with the Ground" line appears early, between the arena and the surface, and is gone well before the statement takes its turn', () => {
    for (const mode of ["full", "video"] as const) {
      expect(groundLineOpacity(0, mode)).toBe(0);
      expect(groundLineOpacity(1, mode)).toBe(0);

      // fully visible partway through its own window
      const [a, b] = PHASES[mode].groundLine;
      expect(groundLineOpacity((a + b) / 2, mode)).toBe(1);

      // it belongs to the first half of the descent — well short of "the surface" (50%)
      const midpoint = (a + b) / 2;
      expect(descentProgress(midpoint, mode)).toBeLessThan(0.5);

      // gone (or all but gone) before the brand statement starts fading in
      const [statementStart] = PHASES[mode].statement;
      expect(groundLineOpacity(statementStart, mode)).toBeLessThan(0.6);
    }
  });

  it("the cross-section labels appear one after another and all end up visible", () => {
    const count = 5;
    expect(labelReveal(0.5, 0, count)).toBe(0);
    let previousStart = -1;
    for (let i = 0; i < count; i++) {
      // find the first q at which label i shows
      let q = 0;
      while (labelReveal(q, i, count) === 0 && q < 1) q += 0.005;
      expect(q).toBeGreaterThan(previousStart);
      previousStart = q;
      expect(labelReveal(1, i, count)).toBe(1);
    }
  });
});

describe("3D camera path", () => {
  it("starts right up against the grass and ends straight-on to the block", () => {
    const start = cameraPose(0);
    const end = cameraPose(1);
    expect(start.position[2]).toBeLessThan(2.5); // close to the front of the block (macro)
    expect(start.position[1]).toBeGreaterThan(0.28); // at grass height, above the infill
    expect(end.position[0]).toBeCloseTo(end.target[0], 5); // looking straight ahead, not sideways
    expect(end.position[2]).toBeGreaterThan(6);
  });

  it("clamps outside 0→1", () => {
    expect(cameraPose(-3)).toEqual(cameraPose(0));
    expect(cameraPose(9)).toEqual(cameraPose(1));
  });

  it("moves without jumps: each small step changes the position only a little", () => {
    let prev = cameraPose(0).position;
    for (let q = 0.01; q <= 1; q += 0.01) {
      const now = cameraPose(q).position;
      const step = Math.hypot(now[0] - prev[0], now[1] - prev[1], now[2] - prev[2]);
      expect(step).toBeLessThan(0.5);
      prev = now;
    }
  });

  it("eases to a stop on the three-quarter view", () => {
    const before = cameraPose(0.41).position;
    const at = cameraPose(0.42).position;
    const after = cameraPose(0.43).position;
    const dBefore = Math.hypot(at[0] - before[0], at[2] - before[2]);
    const dAfter = Math.hypot(after[0] - at[0], after[2] - at[2]);
    const dMid = Math.hypot(
      cameraPose(0.25).position[0] - cameraPose(0.24).position[0],
      cameraPose(0.25).position[2] - cameraPose(0.24).position[2],
    );
    expect(dBefore).toBeLessThan(dMid);
    expect(dAfter).toBeLessThan(dMid * 2);
  });
});
