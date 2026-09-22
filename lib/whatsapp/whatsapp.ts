import { formatArea, formatProjectLink } from "@/lib/leads/format";
import type { Lead } from "@/lib/leads/types";

/**
 * The ONLY place the WhatsApp number is read (master prompt §25). It must be
 * supplied by SLORA via NEXT_PUBLIC_WHATSAPP_NUMBER — never hardcode or invent one.
 *
 * Returns digits only (country code included), or null when unset/implausible so
 * callers can fall back to showing other contact options (§49).
 *
 * NOTE: the literal `process.env.NEXT_PUBLIC_WHATSAPP_NUMBER` reference below is
 * required — Next.js inlines NEXT_PUBLIC_ variables only when written this way.
 */
export function getWhatsAppNumber(
  raw: string | undefined = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

/** The pre-filled message (master prompt §25 structure). */
export function buildWhatsAppMessage(lead: Lead): string {
  return [
    "Hello SLORA,",
    "",
    "I would like to enquire about a project.",
    "",
    `Name: ${lead.name}`,
    `City: ${lead.city}`,
    `Requirement: ${lead.requirementType}`,
    `Project Link: ${formatProjectLink(lead)}`,
    `Approx. Area: ${formatArea(lead.squareFeet)} sq ft`,
    `Contact Number: ${lead.phoneNumber}`,
    "",
    "Please contact me regarding this project.",
  ].join("\n");
}

/** `https://wa.me/<number>?text=<encoded message>`, or null if no number is configured. */
export function buildWhatsAppUrl(
  lead: Lead,
  number: string | null = getWhatsAppNumber(),
): string | null {
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(buildWhatsAppMessage(lead))}`;
}
