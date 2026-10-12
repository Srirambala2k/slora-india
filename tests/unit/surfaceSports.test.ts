import { describe, expect, it } from "vitest";
import {
  SERVICE_SURFACES,
  SPORTS_BY_SURFACE,
  SURFACES_BY_SPORT,
  sportsFor,
  surfacesFor,
} from "@/data/surfaceSports";
import { SPORT_PANELS, type SportId } from "@/data/sports";
import { SURFACE_CARDS, type SurfaceCardId } from "@/data/surfaces";

const surfaceIds = new Set(SURFACE_CARDS.map((c) => c.id));
const sportIds = new Set(SPORT_PANELS.map((p) => p.id));

describe("CR-1: the surface ↔ sport relation table (one source of truth, both directions)", () => {
  it("only uses ids that really exist in data/surfaces.ts and data/sports.ts", () => {
    for (const [surfaceId, sports] of Object.entries(SPORTS_BY_SURFACE) as Array<
      [SurfaceCardId, readonly SportId[]]
    >) {
      expect(surfaceIds.has(surfaceId), `unknown surface id: ${surfaceId}`).toBe(true);
      for (const sportId of sports) {
        expect(sportIds.has(sportId), `unknown sport id: ${sportId} (on ${surfaceId})`).toBe(true);
      }
    }
  });

  it("every surface is listed (a service surface may list no sport; every other one must list at least one)", () => {
    for (const card of SURFACE_CARDS) {
      const sports = sportsFor(card.id);
      if (SERVICE_SURFACES.includes(card.id)) {
        expect(sports, `${card.id} is a service surface`).toEqual([]);
      } else {
        expect(sports.length, `${card.id} lists no sport`).toBeGreaterThan(0);
      }
    }
  });

  it("every sport is played on at least one surface", () => {
    for (const panel of SPORT_PANELS) {
      expect(surfacesFor(panel.id).length, `${panel.id} has no surface`).toBeGreaterThan(0);
    }
  });

  it("the reverse table (surfaces per sport) is exactly derived from the forward one (they can never disagree)", () => {
    for (const [surfaceId, sports] of Object.entries(SPORTS_BY_SURFACE) as Array<
      [SurfaceCardId, readonly SportId[]]
    >) {
      for (const sportId of sports) {
        expect(SURFACES_BY_SPORT[sportId], `${sportId} should list ${surfaceId}`).toContain(
          surfaceId,
        );
      }
    }
    for (const [sportId, surfaces] of Object.entries(SURFACES_BY_SPORT) as Array<
      [SportId, readonly SurfaceCardId[]]
    >) {
      for (const surfaceId of surfaces) {
        expect(SPORTS_BY_SURFACE[surfaceId], `${surfaceId} should list ${sportId} back`).toContain(
          sportId,
        );
      }
    }
  });

  it("an unknown id gets an empty list, not an error", () => {
    expect(sportsFor("not-a-real-surface" as SurfaceCardId)).toEqual([]);
    expect(surfacesFor("not-a-real-sport" as SportId)).toEqual([]);
  });

  it("multi-sport, the one word that means 'more than one', is played on every non-service surface", () => {
    for (const card of SURFACE_CARDS) {
      if (SERVICE_SURFACES.includes(card.id)) continue;
      expect(sportsFor(card.id), card.id).toContain("multi-sport");
    }
  });
});
