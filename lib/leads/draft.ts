import { useSyncExternalStore } from "react";
import type { StepId } from "@/lib/chat/flow";

/**
 * The enquiry being put together. The chatbot, the project configurator and the fallback
 * form all share THIS draft and the one lead schema (master prompt P§32), so a choice made
 * in one place (e.g. "Football" in the configurator) is never asked again in another.
 *
 *   undefined → not answered yet
 *   null      → skipped (only the optional project link can be skipped)
 */
export type Draft = Partial<{
  name: string;
  city: string;
  requirementType: string;
  projectLink: string | null;
  squareFeet: number;
  phoneNumber: string;
}>;

let draft: Draft = {};
const listeners = new Set<() => void>();

export function getDraft(): Draft {
  return draft;
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

/** Record one answer (already validated). */
export function setAnswer<K extends StepId>(id: K, value: Draft[K]): void {
  draft = { ...draft, [id]: value };
  emit();
}

/** Pre-fill from another part of the site, e.g. the configurator. */
export function prefill(values: Draft): void {
  draft = { ...draft, ...values };
  emit();
}

export function resetDraft(): void {
  draft = {};
  emit();
}

export function subscribeDraft(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDraft(): Draft {
  return useSyncExternalStore(subscribeDraft, getDraft, () => ({}));
}
