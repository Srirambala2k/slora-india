import { SOURCE_LABELS } from "./schema";
import type { Lead } from "./types";

/** 100000 → "1,00,000" (Indian digit grouping, matching how SLORA's customers write areas). */
export function formatArea(squareFeet: number): string {
  return squareFeet.toLocaleString("en-IN");
}

export function formatProjectLink(lead: Pick<Lead, "projectLink">): string {
  return lead.projectLink ?? "Not provided";
}

export function sourceLabel(lead: Pick<Lead, "source">): string {
  return SOURCE_LABELS[lead.source];
}

/** "21 Sept 2026, 1:24:05 pm GMT+5:30" — the team works in IST. */
export function formatIst(isoTimestamp: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "long",
    timeZone: "Asia/Kolkata",
  }).format(new Date(isoTimestamp));
}
