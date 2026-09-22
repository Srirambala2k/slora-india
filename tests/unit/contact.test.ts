import { describe, expect, it } from "vitest";
import { contactLinks } from "@/lib/contact";
import { CONTACT_ADDRESS_TEXT, GOOGLE_MAPS_URL, INSTAGRAM_URL } from "@/data/contact";

describe("contact links", () => {
  it("formats the number for display, and builds tel:/wa.me links from the same digits", () => {
    const links = contactLinks("919384746930");
    expect(links.display).toBe("+91 93847 46930");
    expect(links.telHref).toBe("tel:+919384746930");
    expect(links.whatsappHref).toMatch(/^https:\/\/wa\.me\/919384746930\?text=/);
  });

  it("the WhatsApp link's message is readable text, not left url-unsafe", () => {
    const links = contactLinks("919384746930");
    const message = decodeURIComponent(links.whatsappHref!.split("?text=")[1]);
    expect(message).toMatch(/SLORA/);
  });

  it("returns nulls (never a fabricated number) when none is configured", () => {
    expect(contactLinks(null)).toEqual({ display: null, telHref: null, whatsappHref: null });
  });

  it("still returns usable links for a number libphonenumber can't validate (never blocks contact)", () => {
    const links = contactLinks("123");
    expect(links.display).toBe("+123");
    expect(links.telHref).toBe("tel:+123");
  });
});

describe("the address and social link SLORA supplied", () => {
  it("is written out as one line, comma-separated", () => {
    expect(CONTACT_ADDRESS_TEXT).toBe(
      "3, Anna St, Ranga Colony, Kamarajapuram, Sembakkam, Tambaram, Tamil Nadu 600073",
    );
  });

  it("the Google Maps link searches for exactly that address", () => {
    expect(GOOGLE_MAPS_URL).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_ADDRESS_TEXT)}`,
    );
    expect(GOOGLE_MAPS_URL).toMatch(/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
  });

  it("the Instagram link points at the real SLORA account", () => {
    expect(INSTAGRAM_URL).toBe("https://www.instagram.com/sloraindia/");
  });
});
