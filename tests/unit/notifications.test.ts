import { describe, expect, it } from "vitest";
import { parseRecipients, renderEnquiryEmail, sendEmail } from "@/lib/email/emailService";
import { formatTelegramMessage, sendTelegram } from "@/lib/telegram/telegramService";
import { buildWhatsAppMessage, buildWhatsAppUrl, getWhatsAppNumber } from "@/lib/whatsapp/whatsapp";
import { fakeFetch, makeLead } from "./helpers";

const TG_ENV = { TELEGRAM_BOT_TOKEN: "123456:SECRET-TOKEN", TELEGRAM_CHAT_ID: "-100987" };
const EMAIL_ENV = {
  EMAIL_PROVIDER_API_KEY: "re_SECRET_KEY",
  EMAIL_FROM: "SLORA Website <enquiries@example.test>",
  LEAD_NOTIFICATION_EMAIL: "sales@example.test, ops@example.test",
};

describe("Telegram", () => {
  it("formats the message exactly as in master prompt §26", () => {
    const text = formatTelegramMessage(makeLead());
    expect(text).toBe(
      [
        "━━━━━━━━━━━━━━━━━━━━",
        "SLORA NEW ENQUIRY",
        "━━━━━━━━━━━━━━━━━━━━",
        "",
        "Name:",
        "Asha Raman",
        "",
        "City:",
        "Chennai",
        "",
        "Requirement:",
        "Football Turf",
        "",
        "Project Link:",
        "https://maps.app.goo.gl/abc123",
        "",
        "Approx Area:",
        "10,000 sq ft",
        "",
        "Contact:",
        "+919876543210",
        "",
        "Source:",
        "Website AI Chatbot",
        "",
        "━━━━━━━━━━━━━━━━━━━━",
      ].join("\n"),
    );
  });

  it("says 'Not provided' when there is no project link", () => {
    expect(formatTelegramMessage(makeLead({ projectLink: null }))).toContain(
      "Project Link:\nNot provided",
    );
  });

  it("is skipped (not failed) when credentials are absent", async () => {
    const { impl, calls } = fakeFetch();
    const result = await sendTelegram(makeLead(), { env: {}, fetchImpl: impl });
    expect(result.status).toBe("skipped");
    expect(calls).toHaveLength(0);
  });

  it("posts plain text (no parse_mode) to the bot API and reports sent", async () => {
    const { impl, calls } = fakeFetch(200);
    const result = await sendTelegram(makeLead({ name: "<b>*bold*</b> [x](y)" }), {
      env: TG_ENV,
      fetchImpl: impl,
    });
    expect(result.status).toBe("sent");
    expect(calls[0].url).toBe("https://api.telegram.org/bot123456:SECRET-TOKEN/sendMessage");
    const body = JSON.parse(String(calls[0].init?.body));
    expect(body.chat_id).toBe("-100987");
    expect(body).not.toHaveProperty("parse_mode");
    expect(body.text).toContain("<b>*bold*</b> [x](y)"); // literal text, never interpreted
  });

  it("reports failed on an HTTP error", async () => {
    const { impl } = fakeFetch(500);
    expect(await sendTelegram(makeLead(), { env: TG_ENV, fetchImpl: impl })).toEqual({
      status: "failed",
      detail: "Telegram responded HTTP 500",
    });
  });

  it("never throws and never leaks the bot token when the network fails", async () => {
    const boom = (async () => {
      throw new Error(
        "connect ECONNREFUSED https://api.telegram.org/bot123456:SECRET-TOKEN/sendMessage",
      );
    }) as typeof fetch;
    const result = await sendTelegram(makeLead(), { env: TG_ENV, fetchImpl: boom });
    expect(result.status).toBe("failed");
    expect(JSON.stringify(result)).not.toContain("SECRET-TOKEN");
  });

  it("gives up after the timeout instead of hanging", async () => {
    const hang = ((_url: string, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(Object.assign(new Error("aborted"), { name: "AbortError" })),
        );
      })) as unknown as typeof fetch;
    const result = await sendTelegram(makeLead(), { env: TG_ENV, fetchImpl: hang, timeoutMs: 20 });
    expect(result).toEqual({ status: "failed", detail: "timeout" });
  });
});

describe("Email", () => {
  it("parses several recipients and drops invalid ones", () => {
    expect(parseRecipients("a@x.co, not-an-email, b@y.in ,")).toEqual(["a@x.co", "b@y.in"]);
    expect(parseRecipients(undefined)).toEqual([]);
  });

  it("contains every §27 field and the required heading", () => {
    const { subject, html, text } = renderEnquiryEmail(makeLead());
    expect(subject).toContain("SLORA — NEW WEBSITE ENQUIRY");
    for (const label of [
      "Name",
      "City",
      "Requirement",
      "Project Link",
      "Approximate Area",
      "Contact Number",
      "Source",
      "Timestamp",
    ]) {
      expect(html).toContain(label);
      expect(text).toContain(`${label}:`);
    }
    expect(html).toContain("10,000 sq ft");
    expect(html).toContain("+919876543210");
  });

  it("escapes HTML so a visitor cannot inject markup into the team's inbox", () => {
    const { html, subject } = renderEnquiryEmail(
      makeLead({ name: `<script>alert(1)</script>`, city: `"><img src=x onerror=alert(1)>` }),
    );
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;");
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it("is skipped when the key, sender or recipient is missing", async () => {
    const { impl, calls } = fakeFetch();
    expect((await sendEmail(makeLead(), { env: {}, fetchImpl: impl })).status).toBe("skipped");
    expect(
      (
        await sendEmail(makeLead(), {
          env: { ...EMAIL_ENV, LEAD_NOTIFICATION_EMAIL: "nonsense" },
          fetchImpl: impl,
        })
      ).status,
    ).toBe("skipped");
    expect(calls).toHaveLength(0);
  });

  it("sends to all recipients with the bearer key and reports sent", async () => {
    const { impl, calls } = fakeFetch(200);
    const result = await sendEmail(makeLead(), { env: EMAIL_ENV, fetchImpl: impl });
    expect(result.status).toBe("sent");
    expect((calls[0].init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer re_SECRET_KEY",
    );
    expect(JSON.parse(String(calls[0].init?.body)).to).toEqual([
      "sales@example.test",
      "ops@example.test",
    ]);
  });

  it("reports failed on HTTP errors and never leaks the API key", async () => {
    expect(
      (await sendEmail(makeLead(), { env: EMAIL_ENV, fetchImpl: fakeFetch(403).impl })).status,
    ).toBe("failed");
    const boom = (async () => {
      throw new Error("auth failed for key re_SECRET_KEY");
    }) as typeof fetch;
    const result = await sendEmail(makeLead(), { env: EMAIL_ENV, fetchImpl: boom });
    expect(result.status).toBe("failed");
    expect(JSON.stringify(result)).not.toContain("re_SECRET_KEY");
  });
});

describe("WhatsApp", () => {
  it("returns no number (and no link) when the number is not configured", () => {
    expect(getWhatsAppNumber("")).toBeNull();
    expect(getWhatsAppNumber(undefined)).toBeNull();
    expect(getWhatsAppNumber("12")).toBeNull();
    expect(buildWhatsAppUrl(makeLead(), null)).toBeNull();
  });

  it("keeps digits only", () => {
    expect(getWhatsAppNumber("+91 98765-43210")).toBe("919876543210");
  });

  it("builds the pre-filled message in the §25 structure", () => {
    expect(buildWhatsAppMessage(makeLead())).toBe(
      [
        "Hello SLORA,",
        "",
        "I would like to enquire about a project.",
        "",
        "Name: Asha Raman",
        "City: Chennai",
        "Requirement: Football Turf",
        "Project Link: https://maps.app.goo.gl/abc123",
        "Approx. Area: 10,000 sq ft",
        "Contact Number: +919876543210",
        "",
        "Please contact me regarding this project.",
      ].join("\n"),
    );
  });

  it("builds a wa.me link with the encoded message", () => {
    const url = buildWhatsAppUrl(makeLead(), "910000000000");
    expect(url?.startsWith("https://wa.me/910000000000?text=")).toBe(true);
    expect(decodeURIComponent(url!.split("?text=")[1])).toContain("Name: Asha Raman");
  });
});
