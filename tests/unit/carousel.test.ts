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

  it("fits every CR-1 material card's giant word too (checked individually: these are new, easy to get wrong)", () => {
    expect(wordScale(["Artificial", "turf"])).toBeCloseTo(0.46, 2);
    expect(wordScale(["Acrylic", "court"])).toBeCloseTo(0.66, 2);
    expect(wordScale(["Vinyl", "court"])).toBeCloseTo(0.84, 2);
    expect(wordScale(["Rubber", "track"])).toBeCloseTo(0.77, 2);
    expect(wordScale(["Wood", "court"])).toBeCloseTo(0.84, 2);
    expect(wordScale(["PU", "court"])).toBeCloseTo(0.84, 2);
    expect(wordScale(["Resur", "face"])).toBeCloseTo(0.92, 2);
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
        // a readability floor: the longest word ("ARTIFICIAL", chosen by the client 2026-10-22) is about 0.38 on a phone
        expect(scale).toBeGreaterThan(0.35);
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

describe("the surface cards (CR-1, 2026-09-24: rebuilt as materials, not sports)", () => {
  it("has the seven materials, artificial turf first, maintenance & resurfacing last", () => {
    expect(SURFACE_CARDS.map((card) => card.id)).toEqual([
      "artificial-turf",
      "acrylic",
      "sports-vinyl",
      "rubber-epdm",
      "wooden",
      "synthetic-pu",
      "maintenance-resurfacing",
    ]);
  });

  it("numbers the cards 01…07 in order with unique ids and readable labels", () => {
    expect(SURFACE_CARDS.map((card) => card.n)).toEqual(["01", "02", "03", "04", "05", "06", "07"]);
    expect(new Set(SURFACE_CARDS.map((card) => card.id)).size).toBe(SURFACE_CARDS.length);
    for (const card of SURFACE_CARDS) expect(card.label.length).toBeGreaterThan(3);
  });

  it("invents no specs or areas: none are set until SLORA supplies verified ones", () => {
    for (const card of SURFACE_CARDS) {
      expect(card.spec).toBeUndefined();
      expect(card.area).toBeUndefined();
    }
  });

  it("only the turf card shows the turf layer names; every other card is a plain tinted court, no claimed build-up", () => {
    const kinds = Object.fromEntries(SURFACE_CARDS.map((card) => [card.id, card.slab.kind]));
    expect(kinds).toEqual({
      "artificial-turf": "turf",
      acrylic: "court",
      "sports-vinyl": "court",
      "rubber-epdm": "court",
      wooden: "court",
      "synthetic-pu": "court",
      "maintenance-resurfacing": "court",
    });
  });

  it("only artificial turf has real matching video footage; the rest stay stills", () => {
    const withVideo = SURFACE_CARDS.filter((card) => card.video).map((card) => card.id);
    expect(withVideo).toEqual(["artificial-turf"]);
  });

  it("pre-fills 'Sports Flooring' for every flooring card, and nothing for turf (ambiguous) or the maintenance service", () => {
    const prefilled = SURFACE_CARDS.filter((card) => card.requirement).map((card) => [
      card.id,
      card.requirement,
    ]);
    expect(prefilled).toEqual([
      ["acrylic", "Sports Flooring"],
      ["sports-vinyl", "Sports Flooring"],
      ["rubber-epdm", "Sports Flooring"],
      ["wooden", "Sports Flooring"],
      ["synthetic-pu", "Sports Flooring"],
    ]);
    expect(SURFACE_CARDS.find((c) => c.id === "artificial-turf")?.requirement).toBeUndefined();
    expect(
      SURFACE_CARDS.find((c) => c.id === "maintenance-resurfacing")?.requirement,
    ).toBeUndefined();
  });

  it("the maintenance service's whole-card link goes to Contact, not Sports (it has no sports row)", () => {
    const maintenance = SURFACE_CARDS.find((c) => c.id === "maintenance-resurfacing")!;
    expect(maintenance.href).toBe("#contact");
    for (const card of SURFACE_CARDS) {
      if (card.id !== "maintenance-resurfacing") expect(card.href).toBe("#sports");
    }
  });
});
