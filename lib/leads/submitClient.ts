import type { EnquiryDetails } from "@/lib/whatsapp/whatsapp";

/**
 * Browser side of "persist first": when the visitor taps "Send on WhatsApp" at the end of the
 * chat, the same details are also posted to /api/leads (stored, then Telegram/email where those
 * are configured). It is best-effort and never blocks or changes the WhatsApp step — if the
 * server cannot store it (no database configured yet, offline, rate-limited) the visitor still
 * has the WhatsApp message, and nothing is claimed about it. `keepalive` lets the request finish
 * even while the browser switches to WhatsApp. Returns whether the server accepted it.
 */
export async function saveLeadQuietly(details: EnquiryDetails): Promise<boolean> {
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        ...details,
        source: "chatbot",
        idempotencyKey: crypto.randomUUID(),
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
