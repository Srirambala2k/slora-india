import { describe, expect, it } from "vitest";
import { BUILD_CHAPTERS, BUILD_FOOTAGE_SECONDS, BUILD_NOTE } from "@/data/howWeBuild";
import { chapterIndexAt, chapterProgress } from "@/lib/journey/chapters";

describe("How we build chapters", () => {
  it("cover the whole footage with no gaps or overlaps", () => {
    expect(BUILD_CHAPTERS[0].start).toBe(0);
    expect(BUILD_CHAPTERS[BUILD_CHAPTERS.length - 1].end).toBe(BUILD_FOOTAGE_SECONDS);
    for (let i = 1; i < BUILD_CHAPTERS.length; i++) {
      expect(BUILD_CHAPTERS[i].start).toBe(BUILD_CHAPTERS[i - 1].end);
    }
  });

  it("shows only the seven stages the footage supports — none it does not", () => {
    expect(BUILD_CHAPTERS).toHaveLength(7);
    const text = BUILD_CHAPTERS.map((c) => c.label).join(" ");
    for (const unsupported of ["SURVEY", "DRAINAGE", "LINE MARKING", "QUALITY", "HANDOVER"]) {
      expect(text).not.toContain(unsupported);
    }
  });

  it("is numbered 01 to 07 in order", () => {
    expect(BUILD_CHAPTERS.map((c) => c.n)).toEqual(["01", "02", "03", "04", "05", "06", "07"]);
  });

  it("says out loud that the names still need SLORA's confirmation", () => {
    expect(BUILD_NOTE).toMatch(/CONFIRMED BY SLORA/);
  });

  it("finds the chapter for any time, including the edges", () => {
    expect(chapterIndexAt(BUILD_CHAPTERS, -1)).toBe(0);
    expect(chapterIndexAt(BUILD_CHAPTERS, 0)).toBe(0);
    expect(chapterIndexAt(BUILD_CHAPTERS, 1.49)).toBe(0);
    expect(chapterIndexAt(BUILD_CHAPTERS, 1.5)).toBe(1);
    expect(chapterIndexAt(BUILD_CHAPTERS, 5)).toBe(3);
    expect(chapterIndexAt(BUILD_CHAPTERS, 9.99)).toBe(6);
    expect(chapterIndexAt(BUILD_CHAPTERS, 50)).toBe(6);
  });

  it("reports progress inside a chapter from 0 to 1", () => {
    expect(chapterProgress(BUILD_CHAPTERS, 3)).toBe(0);
    expect(chapterProgress(BUILD_CHAPTERS, 3.75)).toBeCloseTo(0.5, 5);
    expect(chapterProgress(BUILD_CHAPTERS, 10)).toBe(1);
  });
});
