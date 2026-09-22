import { formatArea, formatIst, formatProjectLink, sourceLabel } from "@/lib/leads/format";
import type { Lead, NotificationResult } from "@/lib/leads/types";
import { escapeHtml, redactSecrets, stripControlChars } from "@/lib/security/escape";

type EnvLike = Record<string, string | undefined>;

export interface EmailOptions {
  env?: EnvLike;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const EMAIL_PATTERN = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

/** LEAD_NOTIFICATION_EMAIL may hold several comma-separated addresses. */
export function parseRecipients(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => EMAIL_PATTERN.test(s));
}

/** Master prompt §27 — "SLORA — NEW WEBSITE ENQUIRY" with every captured field. */
export function renderEnquiryEmail(lead: Lead): RenderedEmail {
  const rows: Array<[label: string, value: string, href?: string]> = [
    ["Name", lead.name],
    ["City", lead.city],
    ["Requirement", lead.requirementType],
    ["Project Link", formatProjectLink(lead), lead.projectLink ?? undefined],
    ["Approximate Area", `${formatArea(lead.squareFeet)} sq ft`],
    ["Contact Number", lead.phoneNumber, `tel:${lead.phoneNumber}`],
    ["Source", sourceLabel(lead)],
    ["Timestamp", `${formatIst(lead.createdAt)}  (${lead.createdAt})`],
  ];

  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f5f5f3;font-family:Arial,Helvetica,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f3;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:6px;overflow:hidden;">
        <tr><td style="background:#000000;padding:22px 28px;">
          <div style="color:#d9a441;font-size:11px;letter-spacing:2px;">SLORA</div>
          <div style="color:#ffffff;font-size:20px;letter-spacing:1px;margin-top:6px;">NEW WEBSITE ENQUIRY</div>
        </td></tr>
        <tr><td style="padding:8px 28px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${rows
  .map(
    ([label, value, href]) => `            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #eeeeea;width:38%;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#777;vertical-align:top;">${escapeHtml(label)}</td>
              <td style="padding:12px 0;border-bottom:1px solid #eeeeea;font-size:15px;color:#111;vertical-align:top;">${
                href
                  ? `<a href="${escapeHtml(href)}" style="color:#111;">${escapeHtml(value)}</a>`
                  : escapeHtml(value)
              }</td>
            </tr>`,
  )
  .join("\n")}
          </table>
        </td></tr>
        <tr><td style="padding:14px 28px;background:#fafaf8;font-size:11px;color:#888;">
          Sent automatically by the SLORA website. Reference: ${escapeHtml(lead.id)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    "SLORA — NEW WEBSITE ENQUIRY",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Reference: ${lead.id}`,
  ].join("\n");

  const subject = stripControlChars(
    `SLORA — NEW WEBSITE ENQUIRY · ${lead.requirementType} · ${lead.city}`,
  );

  return { subject, html, text };
}

/**
 * Emails the enquiry to the SLORA team through the provider's HTTP API
 * (Resend-style; the provider is swappable — see plan §5.4). Never throws.
 * Server-side only — the API key must never reach the browser.
 */
export async function sendEmail(
  lead: Lead,
  options: EmailOptions = {},
): Promise<NotificationResult> {
  const env = options.env ?? process.env;
  const apiKey = env.EMAIL_PROVIDER_API_KEY?.trim();
  const from = env.EMAIL_FROM?.trim();
  const recipients = parseRecipients(env.LEAD_NOTIFICATION_EMAIL);

  if (!apiKey || !from) {
    return { status: "skipped", detail: "EMAIL_PROVIDER_API_KEY / EMAIL_FROM not configured" };
  }
  if (recipients.length === 0) {
    return { status: "skipped", detail: "LEAD_NOTIFICATION_EMAIL missing or invalid" };
  }

  const { subject, html, text } = renderEnquiryEmail(lead);
  const doFetch = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 10_000);

  try {
    const response = await doFetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to: recipients, subject, html, text }),
      signal: controller.signal,
    });
    if (!response.ok) {
      return { status: "failed", detail: `Email provider responded HTTP ${response.status}` };
    }
    return { status: "sent" };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    const reason = aborted ? "timeout" : error instanceof Error ? error.message : "unknown error";
    return { status: "failed", detail: redactSecrets(reason, [apiKey]).slice(0, 200) };
  } finally {
    clearTimeout(timer);
  }
}
