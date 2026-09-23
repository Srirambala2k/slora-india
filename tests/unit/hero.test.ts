import { describe, expect, it, vi } from "vitest";
import { cuePosition, watermarkOnScreen } from "@/lib/media/watermark";
import { getStage, setStage, subscribeStage } from "@/lib/stage";

describe("watermark position (where the round SCROLL button must sit)", () => {
  it("on a 16:9 screen it is exactly the fraction of the frame", () => {
    const { x, y } = watermarkOnScreen(1440, 810);
    expect(x).toBeCloseTo(0.906 * 1440, 5);
    expect(y).toBeCloseTo(0.833 * 810, 5);
  });

  it("on a wider screen the top/bottom of the video are cropped, so the mark moves up", () => {
    const wide = watermarkOnScreen(1920, 800); // wider than 16:9
    const exact = watermarkOnScreen(1920, 1080);
    expect(wide.x).toBeCloseTo(exact.x, 5);
    expect(wide.y).toBeLessThan(exact.y); // 800-px tall crop of a 1080-px frame
    expect(wide.y).toBeCloseTo(0.833 * 1080 - (1080 - 800) / 2, 5);
  });

  it("on a tall phone screen the sides are cropped away and the mark leaves the screen", () => {
    const { x } = watermarkOnScreen(390, 844);
    expect(x).toBeGreaterThan(390);
  });

  it("the button covers the mark on desktop…", () => {
    const cue = cuePosition(1440, 810);
    expect(cue.overMark).toBe(true);
    expect(cue.x).toBeCloseTo(0.906 * 1440, 5);
  });

  it("shrinks with the video (so it stays clear of the chat button) but never below a size that hides the mark", () => {
    const big = cuePosition(3840, 2160); // wide enough to hit the cap
    const medium = cuePosition(1231, 597);
    const small = cuePosition(1000, 450);
    expect(big.radius).toBeLessThanOrEqual(90);
    expect(medium.radius).toBeLessThan(big.radius);
    expect(small.radius).toBeGreaterThanOrEqual(32);
    // a small round button for a small mark: 2.8 % of the frame width, within limits
    expect(medium.radius).toBeCloseTo(Math.max(32, 0.028 * 1231), 5);
  });

  it("always covers more than the mark's own measured size, even on a big monitor where the button stops growing", () => {
    // Measured directly from the footage: the ✦ mark's points reach ~2 % of the frame's width
    // from its centre (see the comment in lib/media/watermark.ts). Below this, a point peeks out.
    const MARK_RADIUS_FRACTION = 0.02;
    for (const [w, h] of [
      [1024, 576],
      [1440, 810],
      [1920, 1080],
      [2560, 1440],
      [3440, 1440],
      [3840, 2160],
    ] as const) {
      const cue = cuePosition(w, h);
      const frameWidth = watermarkOnScreen(w, h).frameWidth;
      expect(cue.radius, `${w}×${h}`).toBeGreaterThan(frameWidth * MARK_RADIUS_FRACTION);
    }
  });

  it("stays clear of the chat button (bottom-right, 52 px, 24 px from the edges) on common window shapes", () => {
    for (const [w, h] of [
      [1920, 1080],
      [1440, 810],
      [1536, 730],
      [1846, 895],
      [1366, 650],
    ] as const) {
      const cue = cuePosition(w, h);
      const chat = { x: w - 24 - 26, y: h - 24 - 26, r: 26 * 1.3 }; // including its pulse ring
      const gap = Math.hypot(cue.x - chat.x, cue.y - chat.y) - cue.radius - chat.r;
      expect(gap, `${w}×${h}`).toBeGreaterThan(0);
    }
  });

  it("…and falls back to the bottom-right corner on phones, always inside the screen", () => {
    for (const [w, h] of [
      [390, 844],
      [360, 640],
      [768, 1024],
    ] as const) {
      const cue = cuePosition(w, h);
      expect(cue.overMark).toBe(false);
      expect(cue.x).toBeGreaterThan(44);
      expect(cue.x).toBeLessThan(w);
      expect(cue.y).toBeGreaterThan(44);
      expect(cue.y).toBeLessThan(h);
    }
  });

  it("the fallback button is sized to the phone screen, not to the (desktop-sized) maxRadius — it was once 90 px on a 390 px-wide phone, wide enough to sit over the headline", () => {
    for (const [w, h] of [
      [390, 844],
      [360, 640],
      [320, 568],
    ] as const) {
      const cue = cuePosition(w, h);
      expect(cue.overMark).toBe(false);
      // well under half the screen's narrower side (it was 90 px — nearly half of 390 px wide)
      expect(cue.radius).toBeLessThan(Math.min(w, h) * 0.15);
      expect(cue.radius).toBeGreaterThanOrEqual(32); // still a comfortably tappable target
    }
  });
});

describe("stage store (entrance → menu → hero coordination)", () => {
  it("starts at 'entering' and moves forward", () => {
    expect(getStage()).toBe("entering");
    setStage("revealing");
    expect(getStage()).toBe("revealing");
    setStage("ready");
    expect(getStage()).toBe("ready");
  });

  it("tells listeners once per real change, never on repeats, and stops after unsubscribe", () => {
    setStage("entering");
    const listener = vi.fn();
    const unsubscribe = subscribeStage(listener);

    setStage("revealing");
    setStage("revealing"); // repeat: nothing happens
    setStage("ready");
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    setStage("entering");
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
