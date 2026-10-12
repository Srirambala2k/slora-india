import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PROJECTS, projectById } from "@/data/projects";
import { parseCrossLinkHash, projectHash } from "@/lib/links/crossLink";

describe("the projects", () => {
  it("have unique ids, numbered in order, each with at least one clip", () => {
    expect(new Set(PROJECTS.map((p) => p.id)).size).toBe(PROJECTS.length);
    expect(PROJECTS.map((p) => p.n)).toEqual(
      PROJECTS.map((_, i) => String(i + 1).padStart(2, "0")),
    );
    for (const project of PROJECTS) expect(project.clips.length).toBeGreaterThan(0);
  });

  it("only point at video and poster files that exist (run npm run assets:encode:projects)", () => {
    for (const project of PROJECTS) {
      for (const clip of project.clips) {
        for (const path of [clip.src, clip.poster]) {
          expect(existsSync(join(process.cwd(), "public", path)), path).toBe(true);
        }
      }
    }
  });

  it("invent nothing: every fact shown carries where it came from", () => {
    for (const project of PROJECTS) {
      for (const fact of project.facts) expect(fact.source.trim()).not.toBe("");
    }
  });

  it("are found by id, and each has its own shareable link", () => {
    expect(projectById("vellore-turf")?.name).toBe("Vellore Turf");
    expect(projectById("nope")).toBeUndefined();
    for (const project of PROJECTS) {
      expect(parseCrossLinkHash(projectHash(project.id))).toEqual({
        section: "projects",
        id: project.id,
      });
    }
  });
});
