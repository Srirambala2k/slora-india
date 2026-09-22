import type { LeadSource, RequirementType } from "./schema";

/** Delivery state of one notification channel (Telegram / email). */
export type NotificationStatus = "pending" | "sent" | "failed" | "skipped";

/** What a notification provider reports back. Never contains secrets. */
export interface NotificationResult {
  status: Exclude<NotificationStatus, "pending">;
  /** Short, secret-free reason for `failed` / `skipped`. */
  detail?: string;
}

/**
 * The stored enquiry (master prompt §29). Personal data: never expose these
 * records publicly and never send them back to the browser except the visitor's
 * own confirmation.
 */
export interface Lead {
  id: string;
  name: string;
  city: string;
  requirementType: RequirementType;
  projectLink: string | null;
  squareFeet: number;
  /** E.164, e.g. +919876543210 */
  phoneNumber: string;
  source: LeadSource;
  /** ISO-8601 UTC */
  createdAt: string;
  whatsappClicked: boolean;
  telegramStatus: NotificationStatus;
  emailStatus: NotificationStatus;
  /** Lets a retried submit return the same lead instead of creating a duplicate. */
  idempotencyKey?: string;
}

export type LeadStatusPatch = Partial<
  Pick<Lead, "telegramStatus" | "emailStatus" | "whatsappClicked">
>;
