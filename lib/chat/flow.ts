import { leadInputSchema, REQUIREMENT_TYPES } from "@/lib/leads/schema";
import type { Draft } from "@/lib/leads/draft";

/**
 * The enquiry conversation (master prompt P§23): six questions, asked one at a time.
 * This is the deterministic backbone; the AI (Phase 3) only interprets free-text answers,
 * it never decides what is asked next or when the enquiry is complete.
 */
export type StepId =
  "name" | "city" | "requirementType" | "projectLink" | "squareFeet" | "phoneNumber";

export interface Step {
  id: StepId;
  prompt: string;
  kind: "text" | "choice" | "link" | "number" | "phone";
  placeholder: string;
  inputMode: "text" | "url" | "numeric" | "tel";
  options?: readonly string[];
  /** Can be skipped ("Skip") without losing the enquiry. */
  optional?: boolean;
  /** Short label for the summary (P§24). */
  label: string;
}

export const GREETING = "Hi. Let's build something with SLORA.";

export const STEPS: readonly Step[] = [
  {
    id: "name",
    prompt: "What is your name?",
    kind: "text",
    placeholder: "Your name",
    inputMode: "text",
    label: "NAME",
  },
  {
    id: "city",
    prompt: "Which city is your project in?",
    kind: "text",
    placeholder: "City",
    inputMode: "text",
    label: "CITY",
  },
  {
    id: "requirementType",
    prompt: "What are you looking to build?",
    kind: "choice",
    placeholder: "Choose an option",
    inputMode: "text",
    options: REQUIREMENT_TYPES,
    label: "REQUIREMENT",
  },
  {
    id: "projectLink",
    prompt: "Do you have a site or project link? A Google Maps link is perfect. You can skip this.",
    kind: "link",
    placeholder: "https://…",
    inputMode: "url",
    optional: true,
    label: "PROJECT LINK",
  },
  {
    id: "squareFeet",
    prompt: "Approximate project area?",
    kind: "number",
    placeholder: "e.g. 10,000 sq ft",
    inputMode: "numeric",
    label: "AREA",
  },
  {
    id: "phoneNumber",
    prompt: "What is your contact number?",
    kind: "phone",
    placeholder: "+91 …",
    inputMode: "tel",
    label: "CONTACT NUMBER",
  },
];

/** The first question that has not been answered yet (answered ones are skipped — P§32). */
export function nextStep(draft: Draft): Step | null {
  return STEPS.find((step) => draft[step.id] === undefined) ?? null;
}

export function answeredCount(draft: Draft): number {
  return STEPS.filter((step) => draft[step.id] !== undefined).length;
}

export type AnswerResult =
  { ok: true; value: string | number | null; display: string } | { ok: false; message: string };

/**
 * Check one answer with the SAME rules the server will apply (the lead schema), so an
 * answer accepted here is never rejected later. Returns a friendly message otherwise.
 */
export function checkAnswer(id: StepId, raw: string): AnswerResult {
  const text = raw.trim();
  if (id === "projectLink" && (text === "" || /^skip$/i.test(text))) {
    return { ok: true, value: null, display: "Skipped" };
  }
  if (text === "")
    return { ok: false, message: "Please type an answer, or pick one of the options." };

  const parsed = leadInputSchema.shape[id].safeParse(text);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "That doesn't look right." };
  }
  const value = parsed.data as string | number | null;
  const display =
    id === "squareFeet" && typeof value === "number"
      ? `${value.toLocaleString("en-IN")} sq ft`
      : String(value ?? "Skipped");
  return { ok: true, value, display };
}

/** Human-readable line for the summary (P§24). */
export function summaryLine(step: Step, draft: Draft): string {
  const value = draft[step.id];
  if (value === null) return "Not provided";
  if (step.id === "squareFeet" && typeof value === "number")
    return `${value.toLocaleString("en-IN")} sq ft`;
  return String(value ?? "");
}
