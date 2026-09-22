import { parsePhoneNumberFromString } from "libphonenumber-js";
import { getWhatsAppNumber } from "@/lib/whatsapp/whatsapp";

/**
 * SLORA's general contact number — the same one configured for WhatsApp (master prompt §25),
 * which SLORA has confirmed is also their call number. Built on `getWhatsAppNumber()`, the ONE
 * place that number is read, so a "Call us" button and a "WhatsApp us" button never disagree.
 */
export interface ContactLinks {
  /** "+91 93847 46930", for display. Null when no number is configured. */
  display: string | null;
  telHref: string | null;
  whatsappHref: string | null;
}

const GREETING = "Hi SLORA, I'd like to know more about your services.";

export function contactLinks(number: string | null = getWhatsAppNumber()): ContactLinks {
  if (!number) return { display: null, telHref: null, whatsappHref: null };
  const parsed = parsePhoneNumberFromString(`+${number}`);
  return {
    display: parsed?.isValid() ? parsed.formatInternational() : `+${number}`,
    telHref: `tel:+${number}`,
    whatsappHref: `https://wa.me/${number}?text=${encodeURIComponent(GREETING)}`,
  };
}
