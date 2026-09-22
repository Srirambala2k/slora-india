import { describe, expect, it } from "vitest";
import {
  activePanel,
  parallaxShift,
  progressForPanel,
  railDistance,
  railLayout,
  sectionHeight,
  skewFromVelocity,
  trackOffset,
} from "@/lib/sports/rail";
import { isSoftwareRenderer } from "@/lib/device/capability";
import { SPORT_PANELS } from "@/data/sports";
import { REQUIREMENT_TYPES } from "@/lib/leads/schema";

describe("rail travel", () => {
  it("the row travels its width minus what already fits on screen, never negative", () => {
    expect(railDistance(6000, 1440)).toBe(4560);
    expect(railDistance(1000, 1440)).toBe(0);
  });

  it("the tall section is one screen plus the distance, so a pixel of scroll is a pixel sideways", () => {
    expect(sectionHeight(4560, 810)).toBe(5370);
    expect(sectionHeight(0, 810)).toBe(810);
  });

  it("the row starts at rest, ends at its full distance, and clamps outside 0 → 1", () => {
    expect(trackOffset(0, 4560)).toBeCloseTo(0, 6);
    expect(trackOffset(1, 4560)).toBe(-4560);
    expect(trackOffset(0.5, 4560)).toBe(-2280);
    expect(trackOffset(-1, 4560)).toBeCloseTo(0, 6);
    expect(trackOffset(2, 4560)).toBe(-4560);
  });
});

describe("which panel is named in the counter", () => {
  // seven panels, each 900 wide with a 24 gap, starting 48 in
  const widths = Array.from({ length: 7 }, () => 900);
  const lefts = widths.map((_, i) => 48 + i * 924);
  const distance = railDistance(48 + 7 * 924, 1440);

  it("starts on the first panel and ends on the last", () => {
    expect(activePanel(lefts, widths, trackOffset(0, distance), 1440)).toBe(0);
    expect(activePanel(lefts, widths, trackOffset(1, distance), 1440)).toBe(6);
  });

  it("only ever moves forward as you scroll forward, one panel at a time or fewer", () => {
    let last = 0;
    for (let p = 0; p <= 1.0001; p += 0.005) {
      const now = activePanel(lefts, widths, trackOffset(p, distance), 1440);
      expect(now).toBeGreaterThanOrEqual(last);
      expect(now - last).toBeLessThanOrEqual(1);
      last = now;
    }
  });
});

describe("keyboard focus on an off-screen panel", () => {
  it("brings the panel to the left edge, and stops at the end of the row", () => {
    expect(progressForPanel(48, 4560, 48)).toBe(0);
    expect(progressForPanel(48 + 924 * 2, 4560, 48)).toBeCloseTo((924 * 2) / 4560, 6);
    // the last panels cannot reach the edge: they get the end of the scroll
    expect(progressForPanel(48 + 924 * 6, 4560, 48)).toBe(1);
    expect(progressForPanel(500, 0, 48)).toBe(0);
  });
});

describe("skew and parallax", () => {
  it("leans with the scroll speed, in either direction, but never more than the limit", () => {
    expect(skewFromVelocity(0)).toBe(0);
    expect(skewFromVelocity(450)).toBeCloseTo(1, 6);
    expect(skewFromVelocity(-450)).toBeCloseTo(-1, 6);
    expect(skewFromVelocity(50_000)).toBe(4);
    expect(skewFromVelocity(-50_000)).toBe(-4);
    expect(skewFromVelocity(50_000, 2)).toBe(2);
  });

  it("drifts the picture against the panel, and never shows an edge", () => {
    expect(parallaxShift(0, 70)).toBeCloseTo(0, 6);
    expect(parallaxShift(400, 70)).toBeLessThan(0);
    expect(parallaxShift(-400, 70)).toBeGreaterThan(0);
    expect(parallaxShift(100_000, 70)).toBe(-70);
    expect(parallaxShift(-100_000, 70)).toBe(70);
  });
});

describe("the sports panels", () => {
  it("are the seven categories from the brief, in order", () => {
    expect(SPORT_PANELS.map((panel) => panel.name)).toEqual([
      "Football",
      "Cricket",
      "Hockey",
      "Tennis",
      "Padel",
      "Multi-sport",
      "Athletics",
    ]);
    expect(SPORT_PANELS.map((panel) => panel.n)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
    ]);
    expect(new Set(SPORT_PANELS.map((panel) => panel.id)).size).toBe(7);
  });

  it("invent no applications or technical information: none are set until SLORA supplies verified ones", () => {
    for (const panel of SPORT_PANELS) {
      expect(panel.applications).toBeUndefined();
      expect(panel.technical).toBeUndefined();
    }
  });

  it("pre-fill the chat only where a panel matches an enquiry type exactly (never a guess)", () => {
    const prefilled = SPORT_PANELS.filter((panel) => panel.requirement).map((panel) => [
      panel.id,
      panel.requirement,
    ]);
    expect(prefilled).toEqual([
      ["football", "Football Turf"],
      ["cricket", "Cricket Turf"],
      ["multi-sport", "Multi-Sport"],
    ]);
    for (const panel of SPORT_PANELS) {
      if (panel.requirement) expect(REQUIREMENT_TYPES).toContain(panel.requirement);
    }
  });

  it("give every panel a picture and a giant word of one or two lines", () => {
    for (const panel of SPORT_PANELS) {
      expect(panel.image.src).toMatch(/^\/videos\/.+\.webp$/);
      expect([1, 2]).toContain(panel.word.length);
    }
  });
});

describe("which version of the section to show", () => {
  const base = { reduced: false, wide: true, tier: "full" as const };

  it("a wide screen with a graphics card gets the pinned sideways rail", () => {
    expect(railLayout(base)).toBe("pinned");
  });

  it("a computer without a graphics card gets the native swipe row (the pinned rail stalls there)", () => {
    expect(railLayout({ ...base, tier: "video" })).toBe("swipe");
    expect(railLayout({ ...base, tier: "simple" })).toBe("swipe");
  });

  it("reduced motion and narrow screens always get the swipe row", () => {
    expect(railLayout({ ...base, reduced: true })).toBe("swipe");
    expect(railLayout({ ...base, wide: false })).toBe("swipe");
  });

  it("the review override can pick either version, but never beats reduced motion or a narrow screen", () => {
    expect(railLayout({ ...base, tier: "video", override: "pinned" })).toBe("pinned");
    expect(railLayout({ ...base, override: "swipe" })).toBe("swipe");
    expect(railLayout({ ...base, reduced: true, override: "pinned" })).toBe("swipe");
    expect(railLayout({ ...base, wide: false, override: "pinned" })).toBe("swipe");
  });
});

describe("recognising a computer with no graphics card", () => {
  it("knows the names software renderers give themselves", () => {
    expect(
      isSoftwareRenderer("ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device), SwiftShader driver)"),
    ).toBe(true);
    expect(isSoftwareRenderer("llvmpipe (LLVM 15.0.7, 256 bits)")).toBe(true);
    expect(isSoftwareRenderer("Microsoft Basic Render Driver")).toBe(true);
  });

  it("does not mistake real graphics cards for software", () => {
    expect(
      isSoftwareRenderer("ANGLE (Qualcomm, Qualcomm(R) Adreno(TM) X1-45 GPU Direct3D11)"),
    ).toBe(false);
    expect(isSoftwareRenderer("ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11)")).toBe(false);
    expect(isSoftwareRenderer("Apple M2")).toBe(false);
    expect(isSoftwareRenderer("")).toBe(false);
  });
});
