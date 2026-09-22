/**
 * SLORA's contact details, as supplied directly by SLORA (2026-09-22, address corrected/
 * completed 2026-09-22) — real, not illustrative.
 *
 * The phone/WhatsApp number is handled separately (`lib/contact.ts`, backed by the existing
 * `NEXT_PUBLIC_WHATSAPP_NUMBER`, master prompt §25): it is deploy-time configuration, like the
 * rest of that file. The address and social link are plain, permanent site copy, so they live
 * here alongside the rest of the data files.
 */

/**
 * The full address SLORA gave, grouped onto three lines for the address card. Joining the
 * lines back with ", " reconstructs SLORA's exact original text (each line only groups
 * together comma-separated parts that were already adjacent — nothing reordered or reworded).
 */
export const CONTACT_ADDRESS_LINES = [
  "3, Anna St, Ranga Colony",
  "Kamarajapuram, Sembakkam, Tambaram",
  "Tamil Nadu 600073",
] as const;

export const CONTACT_ADDRESS_TEXT = CONTACT_ADDRESS_LINES.join(", ");

/** Opens Google Maps with the address as a search query (no API key needed for this form). */
export const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  CONTACT_ADDRESS_TEXT,
)}`;

export const INSTAGRAM_URL = "https://www.instagram.com/sloraindia/";
export const INSTAGRAM_HANDLE = "@sloraindia";
