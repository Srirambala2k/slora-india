import { describe, expect, it } from "vitest";
import { z } from "zod";
import { isSafeHttpUrl, leadInputSchema, parseSquareFeet } from "@/lib/leads/schema";
import { validInput } from "./helpers";

const errorsFor = (input: unknown) => {
  const result = leadInputSchema.safeParse(input);
  return result.success ? null : z.flattenError(result.error).fieldErrors;
};

describe("leadInputSchema — valid enquiries", () => {
  it("accepts a complete enquiry and normalises it", () => {
    const parsed = leadInputSchema.parse(validInput());
    expect(parsed).toMatchObject({
      name: "Asha Raman",
      city: "Chennai",
      requirementType: "Football Turf",
      squareFeet: 10000,
      phoneNumber: "+919876543210",
      source: "chatbot",
    });
  });

  it("treats a missing / blank project link as null (it is optional)", () => {
    expect(leadInputSchema.parse(validInput({ projectLink: undefined })).projectLink).toBeNull();
    expect(leadInputSchema.parse(validInput({ projectLink: "" })).projectLink).toBeNull();
    expect(leadInputSchema.parse(validInput({ projectLink: "   " })).projectLink).toBeNull();
  });

  it("adds https:// to a link typed without a scheme", () => {
    expect(
      leadInputSchema.parse(validInput({ projectLink: "maps.app.goo.gl/abc" })).projectLink,
    ).toBe("https://maps.app.goo.gl/abc");
  });

  it("collapses whitespace in names", () => {
    expect(leadInputSchema.parse(validInput({ name: "  Asha \n  Raman  " })).name).toBe(
      "Asha Raman",
    );
  });

  it("accepts every requirement type the chatbot offers", () => {
    for (const requirementType of [
      "Football Turf",
      "Cricket Turf",
      "Sports Flooring",
      "Landscape",
      "Playground",
      "Stadium",
      "Multi-Sport",
      "Other",
    ]) {
      expect(errorsFor(validInput({ requirementType }))).toBeNull();
    }
  });
});

describe("leadInputSchema — phone validation (§23 Q6)", () => {
  it("reads a bare 10-digit number as Indian and normalises to E.164", () => {
    expect(leadInputSchema.parse(validInput({ phoneNumber: "9876543210" })).phoneNumber).toBe(
      "+919876543210",
    );
  });

  it("accepts a foreign number that includes its country code", () => {
    expect(leadInputSchema.parse(validInput({ phoneNumber: "+1 415 555 2671" })).phoneNumber).toBe(
      "+14155552671",
    );
  });

  it.each(["12345", "abcdefghij", "0000000000", "+91 12345", "", "9".repeat(31)])(
    "rejects obviously invalid input %j",
    (phoneNumber) => {
      expect(errorsFor(validInput({ phoneNumber }))?.phoneNumber?.length).toBeGreaterThan(0);
    },
  );
});

describe("leadInputSchema — area (§23 Q5)", () => {
  it.each([
    ["10,000 sq ft", 10000],
    ["10000", 10000],
    ["1,00,000 sqft", 100000],
    [2500, 2500],
    ["2500.6", 2501],
  ])("reads %j as %d", (input, expected) => {
    expect(parseSquareFeet(input)).toBe(expected);
  });

  it.each(["", "ten thousand", "10k", "abc", null, undefined, {}])(
    "does not guess at %j",
    (input) => {
      expect(parseSquareFeet(input)).toBeNull();
    },
  );

  it("rejects absurdly small or large areas", () => {
    expect(errorsFor(validInput({ squareFeet: "5" }))?.squareFeet).toBeDefined();
    expect(errorsFor(validInput({ squareFeet: "999999999999" }))?.squareFeet).toBeDefined();
  });
});

describe("leadInputSchema — hostile or malformed input", () => {
  it.each([
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "ftp://example.com/file",
    "file:///etc/passwd",
    "https://user:pass@example.com",
    "http://localhost",
    "https://" + "a".repeat(600) + ".com",
  ])("refuses the project link %j", (projectLink) => {
    expect(errorsFor(validInput({ projectLink }))?.projectLink?.length).toBeGreaterThan(0);
  });

  it("refuses control characters in text fields", () => {
    expect(errorsFor(validInput({ name: "Asha\u0000Raman" }))?.name).toBeDefined();
  });

  it("refuses a name/city that is too short or too long", () => {
    expect(errorsFor(validInput({ name: "A" }))?.name).toBeDefined();
    expect(errorsFor(validInput({ city: "C".repeat(81) }))?.city).toBeDefined();
  });

  it("refuses an unknown requirement type", () => {
    expect(
      errorsFor(validInput({ requirementType: "Swimming pool" }))?.requirementType,
    ).toBeDefined();
  });

  it("reports every missing field", () => {
    const fields = Object.keys(errorsFor({}) ?? {});
    expect(fields).toEqual(
      expect.arrayContaining(["name", "city", "requirementType", "squareFeet", "phoneNumber"]),
    );
  });

  it("does not echo the submitted value inside error messages", () => {
    const secret = "SUPER-SECRET-VALUE-123";
    const messages = Object.values(
      errorsFor(validInput({ projectLink: `javascript:${secret}` })) ?? {},
    ).flat();
    expect(messages.join(" ")).not.toContain(secret);
  });

  it("refuses a malformed idempotency key", () => {
    expect(errorsFor(validInput({ idempotencyKey: "short" }))?.idempotencyKey).toBeDefined();
  });
});

describe("isSafeHttpUrl", () => {
  it("allows normal http(s) links", () => {
    expect(isSafeHttpUrl("https://www.google.com/maps/place/Chennai")).toBe(true);
    expect(isSafeHttpUrl("http://example.co.in/page")).toBe(true);
  });
  it("blocks everything else", () => {
    expect(isSafeHttpUrl("not a url")).toBe(false);
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
  });
});
