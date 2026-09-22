import { createLeadsPostHandler } from "@/lib/leads/handler";

// Only POST is exported on purpose: lead records are never readable via the public API.
export const POST = createLeadsPostHandler();
