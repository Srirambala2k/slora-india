import { describe, expect, it } from "vitest";
import { parseCrossLinkHash, sportHash, surfaceHash } from "@/lib/links/crossLink";

describe("CR-1 cross-link hashes (surface ↔ sport deep links)", () => {
  it("builds a hash for each direction", () => {
    expect(sportHash("badminton")).toBe("#sports/badminton");
    expect(surfaceHash("acrylic")).toBe("#surfaces/acrylic");
  });

  it("parses a built hash straight back into its section and id", () => {
    expect(parseCrossLinkHash(sportHash("multi-sport"))).toEqual({
      section: "sports",
      id: "multi-sport",
    });
    expect(parseCrossLinkHash(surfaceHash("rubber-epdm"))).toEqual({
      section: "surfaces",
      id: "rubber-epdm",
    });
  });

  it("does not mistake a plain nav anchor (no id) for a cross-link", () => {
    expect(parseCrossLinkHash("#sports")).toBeNull();
    expect(parseCrossLinkHash("#surfaces")).toBeNull();
  });

  it("rejects anything else: no hash, an unrelated anchor, a malformed id", () => {
    expect(parseCrossLinkHash("")).toBeNull();
    expect(parseCrossLinkHash("#contact")).toBeNull();
    expect(parseCrossLinkHash("#sports/")).toBeNull();
    expect(parseCrossLinkHash("#sports/Has Spaces")).toBeNull();
    expect(parseCrossLinkHash("sports/badminton")).toBeNull(); // missing the leading #
  });
});
