import type { Lead } from "@/lib/leads/types";

/** A complete, valid enquiry as the chatbot would submit it. */
export function validInput(overrides: Record<string, unknown> = {}) {
  return {
    name: "Asha Raman",
    city: "Chennai",
    requirementType: "Football Turf",
    projectLink: "https://maps.app.goo.gl/abc123",
    squareFeet: "10,000 sq ft",
    phoneNumber: "+91 98765 43210",
    ...overrides,
  };
}

/** A stored lead, for tests that start after validation. */
export function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "lead-1",
    name: "Asha Raman",
    city: "Chennai",
    requirementType: "Football Turf",
    projectLink: "https://maps.app.goo.gl/abc123",
    squareFeet: 10000,
    phoneNumber: "+919876543210",
    source: "chatbot",
    createdAt: "2026-09-21T08:00:00.000Z",
    whatsappClicked: false,
    telegramStatus: "pending",
    emailStatus: "pending",
    ...overrides,
  };
}

/** A fetch stand-in that records calls and returns the given status. */
export function fakeFetch(status = 200) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return new Response("{}", { status });
  }) as typeof fetch;
  return { impl, calls };
}
