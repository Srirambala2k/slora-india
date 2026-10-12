import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl, type EnquiryDetails } from "@/lib/whatsapp/whatsapp";

const details: EnquiryDetails = {
  name: "Asha Raman",
  city: "Chennai",
  requirementType: "Football Turf",
  projectLink: null,
  squareFeet: 10000,
  phoneNumber: "+919876543210",
};

describe("the chat's closing WhatsApp message", () => {
  it("is built from the six answers alone (no stored lead needed) and goes to SLORA's number", () => {
    const url = buildWhatsAppUrl(details, "919384746930");
    expect(url?.startsWith("https://wa.me/919384746930?text=")).toBe(true);
    const text = decodeURIComponent(url!.split("?text=")[1]);
    for (const line of [
      "Name: Asha Raman",
      "City: Chennai",
      "Requirement: Football Turf",
      "Project Link: Not provided",
      "Approx. Area: 10,000 sq ft",
      "Contact Number: +919876543210",
    ]) {
      expect(text).toContain(line);
    }
  });

  it("is absent when no WhatsApp number is configured, so the chat falls back instead of linking nowhere", () => {
    expect(buildWhatsAppUrl(details, null)).toBeNull();
  });
});
