import type { SportId } from "@/data/sports";
import type { SurfaceCardId } from "@/data/surfaces";

/**
 * CR-1 (client feedback, 2026-09-24): which sports are played on which surface, and (derived
 * below) which surfaces a sport is played on. ONE table, so the two directions can never
 * disagree — see `sportsFor`/`surfacesFor`, used by the surface cards and the Sports panels.
 *
 * **These are proposed, industry-standard pairings, not SLORA claims yet.** The UI shows them
 * with an on-screen "to be confirmed by SLORA" note (the same pattern already used for the
 * Sports section's stand-in pictures and placeholder taglines) until the client ticks or
 * corrects this table — see IMPLEMENTATION_PLAN.md's CR-1 §8 #18. Treating an unconfirmed
 * technical pairing as fact would break this project's own never-invent rule; showing it
 * clearly marked "to be confirmed" does not.
 *
 * `maintenance-resurfacing` is deliberately `[]`: it is a service, not a playable surface, so
 * it has no sports row (its card shows "Enquire" instead — see `components/cards/EditorialCard.tsx`).
 * `tests/unit/surfaceSports.test.ts` enforces that every OTHER surface has at least one sport,
 * every sport has at least one surface, and every id used here really exists.
 */
export const SPORTS_BY_SURFACE: Record<SurfaceCardId, readonly SportId[]> = {
  "artificial-turf": ["football", "cricket", "padel", "multi-sport"],
  acrylic: ["tennis", "basketball", "pickleball", "multi-sport"],
  "sports-vinyl": ["badminton", "basketball", "multi-sport"],
  "rubber-epdm": ["athletics", "multi-sport"],
  wooden: ["basketball", "badminton", "multi-sport"],
  "synthetic-pu": ["badminton", "tennis", "basketball", "multi-sport"],
  "maintenance-resurfacing": [],
};

/** Surface ids that are services, not playable surfaces — allowed to list no sport. */
export const SERVICE_SURFACES: readonly SurfaceCardId[] = ["maintenance-resurfacing"];

function buildSurfacesBySport(): Record<SportId, readonly SurfaceCardId[]> {
  const bySport = {} as Record<SportId, SurfaceCardId[]>;
  for (const [surfaceId, sportIds] of Object.entries(SPORTS_BY_SURFACE) as Array<
    [SurfaceCardId, readonly SportId[]]
  >) {
    for (const sportId of sportIds) {
      (bySport[sportId] ??= []).push(surfaceId);
    }
  }
  return bySport;
}

/** The reverse of `SPORTS_BY_SURFACE`, derived once so the two can never drift apart. */
export const SURFACES_BY_SPORT: Record<SportId, readonly SurfaceCardId[]> = buildSurfacesBySport();

/** Which sports a surface card is played on (`[]` for a service surface, or an unknown id). */
export function sportsFor(surfaceId: SurfaceCardId): readonly SportId[] {
  return SPORTS_BY_SURFACE[surfaceId] ?? [];
}

/** Which surfaces a sport panel is played on (`[]` for an unknown id). */
export function surfacesFor(sportId: SportId): readonly SurfaceCardId[] {
  return SURFACES_BY_SPORT[sportId] ?? [];
}
