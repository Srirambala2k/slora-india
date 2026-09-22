import { formatArea, formatProjectLink, sourceLabel } from "@/lib/leads/format";
import type { Lead, NotificationResult } from "@/lib/leads/types";
import { redactSecrets } from "@/lib/security/escape";

type EnvLike = Record<string, string | undefined>;

export interface TelegramOptions {
  env?: EnvLike;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

const RULE = "━━━━━━━━━━━━━━━━━━━━";

/**
 * The team notification (master prompt §26). Sent as PLAIN TEXT — no parse_mode —
 * so nothing a visitor types can be interpreted as Telegram markup.
 */
export function formatTelegramMessage(lead: Lead): string {
  return [
    RULE,
    "SLORA NEW ENQUIRY",
    RULE,
    "",
    "Name:",
    lead.name,
    "",
    "City:",
    lead.city,
    "",
    "Requirement:",
    lead.requirementType,
    "",
    "Project Link:",
    formatProjectLink(lead),
    "",
    "Approx Area:",
    `${formatArea(lead.squareFeet)} sq ft`,
    "",
    "Contact:",
    lead.phoneNumber,
    "",
    "Source:",
    sourceLabel(lead),
    "",
    RULE,
  ].join("\n");
}

/**
 * Sends the enquiry to the SLORA Telegram chat. Never throws: every outcome is
 * reported as a NotificationResult so a Telegram outage cannot lose a lead.
 * Server-side only — the bot token must never reach the browser.
 */
export async function sendTelegram(
  lead: Lead,
  options: TelegramOptions = {},
): Promise<NotificationResult> {
  const env = options.env ?? process.env;
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    return { status: "skipped", detail: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not configured" };
  }

  const doFetch = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);

  try {
    const response = await doFetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatTelegramMessage(lead),
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      return { status: "failed", detail: `Telegram responded HTTP ${response.status}` };
    }
    return { status: "sent" };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    const reason = aborted ? "timeout" : error instanceof Error ? error.message : "unknown error";
    // Error text can echo the request URL, which contains the token.
    return { status: "failed", detail: redactSecrets(reason, [token, chatId]).slice(0, 200) };
  } finally {
    clearTimeout(timer);
  }
}
