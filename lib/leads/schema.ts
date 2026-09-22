import { z } from "zod";
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

/** Master prompt §23, question 3. */
export const REQUIREMENT_TYPES = [
  "Football Turf",
  "Cricket Turf",
  "Sports Flooring",
  "Landscape",
  "Playground",
  "Stadium",
  "Multi-Sport",
  "Other",
] as const;
export type RequirementType = (typeof REQUIREMENT_TYPES)[number];

/** Where an enquiry came from. The chatbot, configurator and fallback form share ONE schema (§32). */
export const LEAD_SOURCES = ["chatbot", "configurator", "form-fallback"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

/** Text shown to the SLORA team (§26 says "Website AI Chatbot"). */
export const SOURCE_LABELS: Record<LeadSource, string> = {
  chatbot: "Website AI Chatbot",
  configurator: "Website Project Configurator",
  "form-fallback": "Website Enquiry Form",
};

/** Numbers typed without a country code are read as Indian numbers. */
export const DEFAULT_PHONE_COUNTRY: CountryCode = "IN";

/**
 * Sensible bounds for "approximate project area". These are placeholders chosen
 * to reject typos/abuse, not business rules — confirm real limits with SLORA.
 */
export const AREA_LIMITS = { min: 50, max: 10_000_000 } as const;

const CONTROL_CHARS = /[\u0000-\u001f\u007f-\u009f]/;

/** Collapse whitespace, trim, bound the length, refuse control characters. */
const cleanText = (label: string, min: number, max: number) =>
  z
    .string({ error: `${label} is required` })
    .transform((v) => v.replace(/\s+/g, " ").trim())
    .pipe(
      z
        .string()
        .min(min, { error: `${label} is too short` })
        .max(max, { error: `${label} is too long` })
        .refine((v) => !CONTROL_CHARS.test(v), { error: `${label} contains invalid characters` }),
    );

/**
 * "10,000 sq ft" | "10000" | 10000 → 10000. Anything else → null.
 * Deliberately strict (no "10k") so the chatbot re-asks instead of guessing.
 */
export function parseSquareFeet(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? Math.round(value) : null;
  if (typeof value !== "string") return null;
  const cleaned = value
    .toLowerCase()
    .replace(/sq\.?\s*(ft|feet|foot)\.?|sqft|square\s*(feet|foot|ft)/g, "")
    .replace(/[,\s]/g, "");
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned));
}

/** http(s) only, has a real-looking host, carries no embedded credentials. */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.includes(".") &&
      url.username === "" &&
      url.password === ""
    );
  } catch {
    return false;
  }
}

const projectLink = z.preprocess(
  (v) => {
    if (v === undefined || v === null) return null;
    if (typeof v !== "string") return v;
    const t = v.trim();
    if (t === "") return null;
    // "maps.app.goo.gl/abc" → add https://. Real schemes (incl. javascript:) are kept and then rejected below.
    return /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t}`;
  },
  z
    .string()
    .max(500, { error: "Link is too long" })
    .refine(isSafeHttpUrl, { error: "Enter a valid link starting with http:// or https://" })
    .nullable(),
);

const phoneNumber = z
  .string({ error: "Contact number is required" })
  .trim()
  .max(30, { error: "Contact number is too long" })
  .transform((raw, ctx) => {
    const parsed = parsePhoneNumberFromString(raw, DEFAULT_PHONE_COUNTRY);
    if (!parsed || !parsed.isValid()) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid phone number (add the country code if it is outside India)",
      });
      return z.NEVER;
    }
    return parsed.number; // normalised E.164
  });

export const leadInputSchema = z.object({
  name: cleanText("Name", 2, 80),
  city: cleanText("City", 2, 80),
  requirementType: z.enum(REQUIREMENT_TYPES, { error: "Choose one of the listed options" }),
  projectLink,
  squareFeet: z.preprocess(
    parseSquareFeet,
    z
      .number({ error: "Enter the area as a number, e.g. 10,000 sq ft" })
      .int()
      .min(AREA_LIMITS.min, { error: `Area must be at least ${AREA_LIMITS.min} sq ft` })
      .max(AREA_LIMITS.max, { error: "Area looks too large — please check the number" }),
  ),
  phoneNumber,
  source: z.enum(LEAD_SOURCES).default("chatbot"),
  idempotencyKey: z
    .string()
    .regex(/^[A-Za-z0-9_-]{8,100}$/, { error: "Invalid idempotency key" })
    .optional(),
});

export type LeadInput = z.output<typeof leadInputSchema>;
export type LeadFieldErrors = Record<string, string[]>;
