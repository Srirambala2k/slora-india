import { describe, expect, it, vi } from "vitest";
import { createLeadsPostHandler } from "@/lib/leads/handler";
import { submitLead, type LeadServiceDeps } from "@/lib/leads/leadService";
import { LeadStorageError, MemoryLeadStore } from "@/lib/leads/store";
import { createRateLimiter } from "@/lib/security/rateLimit";
import { validInput } from "./helpers";

function post(body: unknown, headers: Record<string, string> = {}, raw?: string): Request {
  return new Request("http://localhost/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7", ...headers },
    body: raw ?? JSON.stringify(body),
  });
}

/** A handler wired to a real pipeline with in-memory store and stub notifiers. */
function realHandler(overrides: Partial<LeadServiceDeps> = {}) {
  const store = new MemoryLeadStore();
  const deps: LeadServiceDeps = {
    store,
    notifyTelegram: async () => ({ status: "failed", detail: "HTTP 500" }),
    notifyEmail: async () => ({ status: "sent" }),
    whatsappNumber: "910000000000",
    retryDelayMs: 1,
    ...overrides,
  };
  return { store, handler: createLeadsPostHandler({ submit: (input) => submitLead(input, deps) }) };
}

describe("POST /api/leads", () => {
  it("creates a lead (201) even while Telegram is down, and returns only what the visitor needs", async () => {
    const { store, handler } = realHandler();
    const res = await handler(post(validInput()));
    expect(res.status).toBe(201);
    expect(res.headers.get("cache-control")).toBe("no-store");

    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual(["duplicate", "id", "ok", "whatsappUrl"]);
    expect(body.whatsappUrl).toContain("wa.me/910000000000");
    // The WhatsApp link is the visitor's OWN prefilled message. Everything else in the response
    // must carry no personal data and no per-channel delivery status.
    const rest: Record<string, unknown> = { ...body };
    delete rest.whatsappUrl;
    expect(JSON.stringify(rest)).not.toMatch(/Asha|9876543210|Chennai|telegram|email|status/i);
    expect(store.all()).toHaveLength(1);
  });

  it("answers 400 with field messages (never the submitted values) for invalid input", async () => {
    const { store, handler } = realHandler();
    const res = await handler(post(validInput({ phoneNumber: "12345", name: "" })));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid");
    expect(Object.keys(body.fields)).toEqual(expect.arrayContaining(["phoneNumber", "name"]));
    expect(store.all()).toHaveLength(0);
  });

  it("silently discards honeypot submissions: looks like success, stores and sends nothing", async () => {
    const telegram = vi.fn(async () => ({ status: "sent" as const }));
    const { store, handler } = realHandler({ notifyTelegram: telegram });
    const res = await handler(post(validInput({ website: "http://spam.example" })));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(store.all()).toHaveLength(0);
    expect(telegram).not.toHaveBeenCalled();
  });

  it("rejects non-JSON, malformed JSON and non-object bodies", async () => {
    const { handler } = realHandler();
    expect((await handler(post(null, { "content-type": "text/plain" }, "hello"))).status).toBe(415);
    expect((await handler(post(null, {}, "{not json"))).status).toBe(400);
    expect((await handler(post(null, {}, "[1,2,3]"))).status).toBe(400);
    expect((await handler(post(null, {}, "null"))).status).toBe(400);
  });

  it("rejects oversized bodies (413)", async () => {
    const { handler } = realHandler();
    const huge = JSON.stringify(validInput({ name: "x".repeat(20_000) }));
    expect((await handler(post(null, {}, huge))).status).toBe(413);
    expect((await handler(post(null, { "content-length": "99999" }, "{}"))).status).toBe(413);
  });

  it("rate-limits one client (429 + Retry-After) but not others", async () => {
    const handler = createLeadsPostHandler({
      limiter: createRateLimiter({ limit: 2, windowMs: 60_000 }),
      submit: async () => ({ ok: false, error: "invalid", fieldErrors: {} }),
    });
    const attempt = (ip: string) => handler(post({}, { "x-forwarded-for": ip }));
    expect((await attempt("198.51.100.1")).status).toBe(400);
    expect((await attempt("198.51.100.1")).status).toBe(400);
    const limited = await attempt("198.51.100.1");
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0);
    expect((await attempt("198.51.100.2")).status).toBe(400); // a different visitor is unaffected
  });

  it("answers 503 (retryable) when the store is down, not a generic crash", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = createLeadsPostHandler({
      submit: async () => {
        throw new LeadStorageError("db down");
      },
    });
    const res = await handler(post(validInput()));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false, error: "storage_unavailable", retryable: true });
  });

  it("answers 500 without leaking internals for unexpected errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = createLeadsPostHandler({
      submit: async () => {
        throw new Error("secret stack detail /etc/passwd");
      },
    });
    const res = await handler(post(validInput()));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("passwd");
  });
});
