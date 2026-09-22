import { z } from "zod";
import { sendEmail } from "@/lib/email/emailService";
import { sendTelegram } from "@/lib/telegram/telegramService";
import { buildWhatsAppUrl } from "@/lib/whatsapp/whatsapp";
import { leadInputSchema, type LeadFieldErrors } from "./schema";
import { getLeadStore, LeadStorageError, type LeadStore } from "./store";
import type { Lead, NotificationResult } from "./types";

export type Notifier = (lead: Lead) => Promise<NotificationResult>;

export interface LeadServiceDeps {
  store: LeadStore;
  notifyTelegram: Notifier;
  notifyEmail: Notifier;
  /** Overrides NEXT_PUBLIC_WHATSAPP_NUMBER (tests). `null` = "not configured". */
  whatsappNumber?: string | null;
  now?: () => Date;
  newId?: () => string;
  retryDelayMs?: number;
}

export type SubmitOutcome =
  | { ok: true; lead: Lead; whatsappUrl: string | null; duplicate: boolean }
  | { ok: false; error: "invalid"; fieldErrors: LeadFieldErrors };

/**
 * The store is resolved on first USE, not when the deps are built, so invalid input is
 * answered with a validation error (400) even if no durable store is configured yet.
 */
function lazyStore(resolve: () => LeadStore): LeadStore {
  return {
    create: async (lead) => resolve().create(lead),
    get: async (id) => resolve().get(id),
    findByIdempotencyKey: async (key) => resolve().findByIdempotencyKey(key),
    update: async (id, patch) => resolve().update(id, patch),
  };
}

/** Real providers, real store — used by the API route. */
export function defaultLeadDeps(): LeadServiceDeps {
  return {
    store: lazyStore(() => getLeadStore()),
    notifyTelegram: (lead) => sendTelegram(lead),
    notifyEmail: (lead) => sendEmail(lead),
  };
}

/** A notifier must never be able to break the flow, even by throwing. */
async function safely(notify: Notifier, lead: Lead): Promise<NotificationResult> {
  try {
    return await notify(lead);
  } catch (error) {
    return { status: "failed", detail: error instanceof Error ? error.name : "unknown error" };
  }
}

async function createWithRetry(store: LeadStore, lead: Lead, delayMs: number): Promise<void> {
  try {
    await store.create(lead);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    try {
      await store.create(lead);
    } catch (second) {
      throw new LeadStorageError("Lead could not be stored after a retry", { cause: second });
    }
  }
}

/**
 * The whole enquiry pipeline (master prompt §28, §49):
 *
 *   validate → (duplicate? return the original) → STORE → Telegram ∥ Email → record statuses
 *
 * The lead is durable BEFORE any notification is attempted, and the two channels
 * are independent, so an outage on either never loses the enquiry. The only
 * thing that can fail the call is the store itself (throws LeadStorageError).
 */
export async function submitLead(input: unknown, deps: LeadServiceDeps): Promise<SubmitOutcome> {
  const parsed = leadInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const data = parsed.data;
  const whatsapp = (lead: Lead) => buildWhatsAppUrl(lead, deps.whatsappNumber);

  if (data.idempotencyKey) {
    const existing = await deps.store.findByIdempotencyKey(data.idempotencyKey);
    if (existing) {
      return { ok: true, lead: existing, whatsappUrl: whatsapp(existing), duplicate: true };
    }
  }

  const lead: Lead = {
    id: (deps.newId ?? (() => crypto.randomUUID()))(),
    name: data.name,
    city: data.city,
    requirementType: data.requirementType,
    projectLink: data.projectLink,
    squareFeet: data.squareFeet,
    phoneNumber: data.phoneNumber,
    source: data.source,
    createdAt: (deps.now ?? (() => new Date()))().toISOString(),
    whatsappClicked: false,
    telegramStatus: "pending",
    emailStatus: "pending",
    ...(data.idempotencyKey ? { idempotencyKey: data.idempotencyKey } : {}),
  };

  // 1) STORE FIRST. If this fails there is no safety net, so let the caller know.
  await createWithRetry(deps.store, lead, deps.retryDelayMs ?? 50);

  // 2) Notify both channels independently.
  const [telegram, email] = await Promise.all([
    safely(deps.notifyTelegram, lead),
    safely(deps.notifyEmail, lead),
  ]);

  // Never log personal data — ids and statuses only.
  if (telegram.status === "failed")
    console.warn("[leads] telegram failed", { id: lead.id, detail: telegram.detail });
  if (email.status === "failed")
    console.warn("[leads] email failed", { id: lead.id, detail: email.detail });

  // 3) Record what happened. The lead is already safe, so a failure here is only logged.
  let final: Lead = { ...lead, telegramStatus: telegram.status, emailStatus: email.status };
  try {
    const updated = await deps.store.update(lead.id, {
      telegramStatus: telegram.status,
      emailStatus: email.status,
    });
    if (updated) final = updated;
  } catch {
    console.error("[leads] could not record notification statuses", { id: lead.id });
  }

  return { ok: true, lead: final, whatsappUrl: whatsapp(final), duplicate: false };
}
