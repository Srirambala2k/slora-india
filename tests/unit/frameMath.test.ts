import { describe, expect, it } from "vitest";
import {
  coarseIndices,
  frameAt,
  nextToFetch,
  paintPlan,
  pickFrames,
  windowIndices,
} from "@/lib/media/frameMath";

const have = (...indices: number[]) => {
  const set = new Set(indices);
  return (i: number) => set.has(i);
};

describe("frame position", () => {
  it("maps 0 → 1 onto the first and last frame, and clamps", () => {
    expect(frameAt(0, 120)).toBe(0);
    expect(frameAt(1, 120)).toBe(119);
    expect(frameAt(0.5, 121)).toBe(60);
    expect(frameAt(-3, 120)).toBe(0);
    expect(frameAt(7, 120)).toBe(119);
  });
});

describe("coarse frames (loaded first, kept in memory)", () => {
  it("are spread out and always include the first and last frame", () => {
    const c = coarseIndices(120, 10);
    expect(c[0]).toBe(0);
    expect(c[c.length - 1]).toBe(119);
    expect(c.length).toBe(13);
    expect([...c].sort((a, b) => a - b)).toEqual(c);
  });
  it("handles counts that do not divide evenly, and tiny sequences", () => {
    expect(coarseIndices(25, 10)).toEqual([0, 10, 20, 24]);
    expect(coarseIndices(1, 10)).toEqual([0]);
    expect(coarseIndices(2, 10)).toEqual([0, 1]);
  });
});

describe("which frame(s) to paint", () => {
  it("shows exactly the frame when it is available", () => {
    expect(pickFrames(have(5, 6, 7), 6, 100)).toEqual({ a: 6, b: null, t: 0 });
  });

  it("BLENDS the two neighbouring frames between them (so slow scrolling glides, not steps)", () => {
    const pick = pickFrames(have(5, 6), 5.25, 100)!;
    expect(pick).toEqual({ a: 5, b: 6, t: 0.25 });
    expect(pickFrames(have(5, 6), 5.75, 100)!.t).toBeCloseTo(0.75, 5);
  });

  it("blends across a small gap (one frame not loaded yet)", () => {
    expect(pickFrames(have(4, 6), 5, 100)).toEqual({ a: 4, b: 6, t: 0.5 });
  });

  it("does NOT blend frames that are far apart (that would look like a ghostly dissolve): shows the nearer one", () => {
    const pick = pickFrames(have(0, 10), 3, 100)!;
    expect(pick.b).toBeNull();
    expect(pick.a).toBe(0);
    expect(pickFrames(have(0, 10), 8, 100)!.a).toBe(10);
  });

  it("works at the very ends and when only one side has frames", () => {
    expect(pickFrames(have(0, 1), 0, 10)).toEqual({ a: 0, b: null, t: 0 });
    expect(pickFrames(have(8, 9), 9, 10)).toEqual({ a: 9, b: null, t: 0 });
    expect(pickFrames(have(9), 2, 10)).toEqual({ a: 9, b: null, t: 0 });
    expect(pickFrames(have(0), 8, 10)).toEqual({ a: 0, b: null, t: 0 });
  });

  it("returns null when nothing has loaded yet", () => {
    expect(pickFrames(have(), 4, 10)).toBeNull();
  });

  it("never picks a frame outside the sequence", () => {
    for (let f = -2; f <= 12; f += 0.37) {
      const pick = pickFrames(have(0, 3, 6, 9), f, 10);
      expect(pick).not.toBeNull();
      for (const i of [pick!.a, pick!.b]) if (i !== null) expect(i >= 0 && i <= 9).toBe(true);
      expect(pick!.t).toBeGreaterThanOrEqual(0);
      expect(pick!.t).toBeLessThanOrEqual(1);
    }
  });
});

describe("what is actually drawn (every full-screen draw costs the graphics card real work)", () => {
  it("draws ONE frame when a frame is all there is", () => {
    expect(paintPlan({ a: 6, b: null, t: 0 })).toEqual({ first: 6, second: null, alpha: 0 });
  });

  it("draws a lone frame when the position is very close to it (no second draw)", () => {
    expect(paintPlan({ a: 5, b: 6, t: 0.02 })).toEqual({ first: 5, second: null, alpha: 0 });
    expect(paintPlan({ a: 5, b: 6, t: 0.98 })).toEqual({ first: 6, second: null, alpha: 0 });
  });

  it("blends in small fixed steps between frames", () => {
    const plan = paintPlan({ a: 5, b: 6, t: 0.5 });
    expect(plan).toEqual({ first: 5, second: 6, alpha: 0.5 });
    expect(paintPlan({ a: 5, b: 6, t: 0.26 }).alpha).toBeCloseTo(0.25, 5);
  });

  it("gives the SAME plan for positions that look the same, so the canvas is not redrawn for nothing", () => {
    const one = paintPlan({ a: 5, b: 6, t: 0.5 });
    const two = paintPlan({ a: 5, b: 6, t: 0.52 });
    expect(two).toEqual(one);
    // …and only 13 distinct looks exist between two frames (12 steps), however finely you scroll
    const looks = new Set<string>();
    for (let t = 0; t <= 1; t += 0.001) looks.add(JSON.stringify(paintPlan({ a: 5, b: 6, t })));
    expect(looks.size).toBeLessThanOrEqual(13);
  });
});

describe("which frames to keep decoded", () => {
  it("is centred on where you are, nearest first", () => {
    const w = windowIndices(50, 120, 0);
    expect(w[0]).toBe(50);
    expect(w).toContain(47);
    expect(w).toContain(58);
    const distances = w.map((i) => Math.abs(i - 50));
    expect([...distances].sort((a, b) => a - b)).toEqual(distances);
  });

  it("looks further ahead in the direction you are scrolling", () => {
    const down = windowIndices(50, 120, 1);
    const up = windowIndices(50, 120, -1);
    expect(Math.max(...down)).toBeGreaterThan(Math.max(...up));
    expect(Math.min(...up)).toBeLessThan(Math.min(...down));
  });

  it("stays inside the sequence at both ends", () => {
    for (const f of [0, 1, 118, 119]) {
      for (const i of windowIndices(f, 120, 1)) expect(i >= 0 && i < 120).toBe(true);
    }
  });
});

describe("which frame to download next", () => {
  const coarse = coarseIndices(50, 10);

  it("gets the spread-out coarse frames first, so scrubbing works within moments", () => {
    const loaded = new Set<number>();
    const fetched: number[] = [];
    for (let n = 0; n < coarse.length; n++) {
      const i = nextToFetch(
        (x) => loaded.has(x),
        () => false,
        30,
        50,
        coarse,
      )!;
      fetched.push(i);
      loaded.add(i);
    }
    expect(new Set(fetched)).toEqual(new Set(coarse));
  });

  it("then fetches the missing frame nearest to the visitor, and moves with them", () => {
    const loaded = new Set(coarse);
    expect(
      nextToFetch(
        (x) => loaded.has(x),
        () => false,
        31,
        50,
        coarse,
      ),
    ).toBe(31);
    expect(
      nextToFetch(
        (x) => loaded.has(x),
        () => false,
        44,
        50,
        coarse,
      ),
    ).toBe(44);
  });

  it("does not ask twice for a frame that is already being fetched, and finishes with null", () => {
    const loaded = new Set(coarse);
    expect(
      nextToFetch(
        (x) => loaded.has(x),
        (x) => x === 31,
        31,
        50,
        coarse,
      ),
    ).not.toBe(31);
    const all = new Set(Array.from({ length: 50 }, (_, i) => i));
    expect(
      nextToFetch(
        (x) => all.has(x),
        () => false,
        10,
        50,
        coarse,
      ),
    ).toBeNull();
  });
});
