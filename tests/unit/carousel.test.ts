import { describe, expect, it } from "vitest";
import {
  directionBetween,
  nextIndex,
  prevIndex,
  wordScale,
  wordScaleNarrow,
} from "@/lib/cards/carousel";
import { SURFACE_CARDS } from "@/data/surfaces";

describe("giant word sizing", () => {
  it("leaves four-letter lines at full size (FOOT / BALL)", () => {
    expect(wordScale(["Foot", "ball"])).toBe(1);
  });

  it("shrinks longer words so they still fit, the longest line deciding", () => {
    expect(wordScale(["Pickle", "ball"])).toBeCloseTo(0.77, 2);
    expect(wordScale(["Shuttle", "court"])).toBeCloseTo(0.66, 2);
    expect(wordScale(["Shuttle", "court"])).toBeLessThan(wordScale(["Pickle", "ball"]));
  });

  it("counts the lower line as longer, because it sits where the slab is (SETUP must not be hidden)", () => {
    // "PARK" alone would be full size, but "SETUP" underneath needs room
    expect(wordScale(["Park", "setup"])).toBeCloseTo(0.84, 2);
    expect(wordScale(["Park", "setup"])).toBeLessThan(1);
  });

  it("never grows a short word, and never returns zero", () => {
    expect(wordScale(["Go", "on"])).toBe(1);
    expect(wordScale(["", ""])).toBe(1);
    for (const card of SURFACE_CARDS) {
      for (const scale of [wordScale(card.word), wordScaleNarrow(card.word)]) {
        expect(scale).toBeGreaterThan(0.5);
        expect(scale).toBeLessThanOrEqual(1);
      }
    }
  });

  it("on a phone the longest line must fit across the whole card, so long words shrink more", () => {
    expect(wordScaleNarrow(["Foot", "ball"])).toBeCloseTo(0.95, 2);
    expect(wordScaleNarrow(["Shuttle", "court"])).toBeCloseTo(0.54, 2);
    for (const card of SURFACE_CARDS) {
      expect(wordScaleNarrow(card.word)).toBeLessThanOrEqual(wordScale(card.word));
    }
  });
});

describe("stepping through the cards", () => {
  it("the forward arrow goes on to the next card and wraps round after the last", () => {
    expect(nextIndex(0, 5)).toBe(1);
    expect(nextIndex(3, 5)).toBe(4);
    expect(nextIndex(4, 5)).toBe(0);
  });

  it("the back arrow stops at the first card", () => {
    expect(prevIndex(3, 5)).toBe(2);
    expect(prevIndex(1, 5)).toBe(0);
    expect(prevIndex(0, 5)).toBe(0);
  });

  it("copes with an empty list and an out-of-range index", () => {
    expect(nextIndex(0, 0)).toBe(0);
    expect(prevIndex(0, 0)).toBe(0);
    expect(prevIndex(9, 5)).toBe(3);
  });

  it("knows which way the deck moves, counting last → first as forward", () => {
    expect(directionBetween(0, 1, 5)).toBe(1);
    expect(directionBetween(3, 1, 5)).toBe(-1);
    expect(directionBetween(4, 0, 5)).toBe(1);
    expect(directionBetween(2, 2, 5)).toBe(1);
  });
});

describe("the surface cards", () => {
  it("has the football card first, then pickleball, shuttle court, park setup and basketball", () => {
    expect(SURFACE_CARDS.map((card) => card.id)).toEqual([
      "football",
      "pickleball",
      "shuttle",
      "park",
      "basketball",
    ]);
  });

  it("numbers the cards 01…05 in order with unique ids and readable labels", () => {
    expect(SURFACE_CARDS.map((card) => card.n)).toEqual(["01", "02", "03", "04", "05"]);
    expect(new Set(SURFACE_CARDS.map((card) => card.id)).size).toBe(SURFACE_CARDS.length);
    for (const card of SURFACE_CARDS) expect(card.label.length).toBeGreaterThan(3);
  });

  it("invents no specs or areas: none are set until SLORA supplies verified ones", () => {
    for (const card of SURFACE_CARDS) {
      expect(card.spec).toBeUndefined();
      expect(card.area).toBeUndefined();
    }
  });

  it("only turf cards show the turf layer names; court cards do not claim a build-up", () => {
    const kinds = Object.fromEntries(SURFACE_CARDS.map((card) => [card.id, card.slab.kind]));
    expect(kinds).toEqual({
      football: "turf",
      pickleball: "court",
      shuttle: "court",
      park: "turf",
      basketball: "court",
    });
  });

  it("only the football card has real matching video footage; the rest stay stills", () => {
    const withVideo = SURFACE_CARDS.filter((card) => card.video).map((card) => card.id);
    expect(withVideo).toEqual(["football"]);
  });

  it("pre-fills the enquiry only where a card matches a real enquiry type exactly", () => {
    const prefilled = SURFACE_CARDS.filter((card) => card.requirement).map((card) => [
      card.id,
      card.requirement,
    ]);
    expect(prefilled).toEqual([["football", "Football Turf"]]);
  });
});
