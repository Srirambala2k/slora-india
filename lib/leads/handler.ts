import { createRateLimiter, type RateLimiter } from "@/lib/security/rateLimit";
import { defaultLeadDeps, submitLead, type SubmitOutcome } from "./leadService";
import { LeadStorageError } from "./store";

const MAX_BODY_BYTES = 8 * 1024;

export interface LeadsHandlerOptions {
  submit?: (input: unknown) => Promise<SubmitOutcome>;
  limiter?: RateLimiter;
  maxBodyBytes?: number;
}

const NO_STORE = { "Cache-Control": "no-store" };

function json(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { ...NO_STORE, ...extra } });
}

/**
 * Best-effort client address for rate limiting. `x-forwarded-for` is only
 * trustworthy behind a proxy that overwrites it (Vercel does); revisit for other hosts.
 */
function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

/**
 * POST /api/leads. There is deliberately no GET: lead records are never
 * readable through the public API (Next.js answers other verbs with 405).
 *
 * Responses never echo submitted values back and never reveal which
 * notification channels succeeded.
 */
export function createLeadsPostHandler(options: LeadsHandlerOptions = {}) {
  const limiter = options.limiter ?? createRateLimiter({ limit: 10, windowMs: 10 * 60 * 1000 });
  const maxBytes = options.maxBodyBytes ?? MAX_BODY_BYTES;
  const submit = options.submit ?? ((input: unknown) => submitLead(input, defaultLeadDeps()));

  return async function POST(request: Request): Promise<Response> {
    const decision = limiter.check(clientKey(request));
    if (!decision.allowed) {
      return json({ ok: false, error: "rate_limited" }, 429, {
        "Retry-After": String(decision.retryAfterSeconds),
      });
    }

    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      return json({ ok: false, error: "unsupported_media_type" }, 415);
    }
    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > maxBytes) return json({ ok: false, error: "payload_too_large" }, 413);

    let raw: string;
    try {
      raw = await request.text();
    } catch {
      return json({ ok: false, error: "invalid_json" }, 400);
    }
    if (raw.length > maxBytes) return json({ ok: false, error: "payload_too_large" }, 413);

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ ok: false, error: "invalid_json" }, 400);
    }
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return json({ ok: false, error: "invalid_json" }, 400);
    }

    // Honeypot: a hidden field real visitors never fill in. Bots get a silent fake success
    // (nothing stored, nothing sent) so they learn nothing.
    const trap = (body as Record<string, unknown>).website;
    if (typeof trap === "string" && trap.trim() !== "") {
      return json({ ok: true }, 200);
    }

    try {
      const outcome = await submit(body);
      if (!outcome.ok) {
        return json({ ok: false, error: "invalid", fields: outcome.fieldErrors }, 400);
      }
      return json(
        {
          ok: true,
          id: outcome.lead.id,
          whatsappUrl: outcome.whatsappUrl,
          duplicate: outcome.duplicate,
        },
        outcome.duplicate ? 200 : 201,
      );
    } catch (error) {
      if (error instanceof LeadStorageError) {
        console.error("[leads] storage unavailable:", error.message);
        return json({ ok: false, error: "storage_unavailable", retryable: true }, 503);
      }
      console.error("[leads] unexpected error", error instanceof Error ? error.name : "unknown");
      return json({ ok: false, error: "server_error" }, 500);
    }
  };
}
