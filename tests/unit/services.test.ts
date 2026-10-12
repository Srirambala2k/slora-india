import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SERVICES } from "@/data/services";
import { servicePositions } from "@/lib/services/scroll";

describe("the services slides", () => {
  it("are four, numbered in order, each with a title, wording and an existing picture", () => {
    expect(SERVICES.map((s) => s.n)).toEqual(["01", "02", "03", "04"]);
    for (const service of SERVICES) {
      expect(service.title.trim()).not.toBe("");
      expect(service.text.trim()).not.toBe("");
      expect(existsSync(join(process.cwd(), "public", service.image.src)), service.image.src).toBe(
        true,
      );
    }
  });
});

describe("the pinned services scroll", () => {
  const count = 4;

  it("starts on the first slide: its picture and words fully shown, the rest hidden", () => {
    const at = servicePositions(0, count);
    expect(at.pictures[0].opacity).toBe(1);
    expect(at.words[0].opacity).toBe(1);
    for (let i = 1; i < count; i += 1) {
      expect(at.pictures[i].opacity).toBe(0);
      expect(at.words[i].opacity).toBe(0);
    }
  });

  it("rests on each slide exactly: only its words are shown there", () => {
    for (let i = 0; i < count; i += 1) {
      const at = servicePositions(i / (count - 1), count);
      expect(at.x).toBeCloseTo(i);
      at.words.forEach((word, j) => expect(word.opacity).toBe(j === i ? 1 : 0));
      expect(at.pictures[i].opacity).toBe(1); // its picture is fully in
    }
  });

  it("never dips to black between pictures: the earlier picture stays solid underneath", () => {
    for (let step = 0; step <= 100; step += 1) {
      const at = servicePositions(step / 100, count);
      expect(at.pictures[0].opacity).toBe(1);
    }
  });

  it("moves smoothly: no value jumps by much between neighbouring scroll positions", () => {
    let previous = servicePositions(0, count);
    for (let step = 1; step <= 1000; step += 1) {
      const now = servicePositions(step / 1000, count);
      now.pictures.forEach((pic, i) => {
        expect(Math.abs(pic.opacity - previous.pictures[i].opacity)).toBeLessThan(0.02);
        expect(Math.abs(pic.scale - previous.pictures[i].scale)).toBeLessThan(0.01);
      });
      now.words.forEach((word, i) => {
        expect(Math.abs(word.opacity - previous.words[i].opacity)).toBeLessThan(0.02);
      });
      previous = now;
    }
  });

  it("clamps outside 0–1", () => {
    expect(servicePositions(-1, count).x).toBe(0);
    expect(servicePositions(2, count).x).toBe(count - 1);
  });
});
