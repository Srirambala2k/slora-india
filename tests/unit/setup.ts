import { afterEach, vi } from "vitest";
import { resetLeadStore } from "@/lib/leads/store";

afterEach(() => {
  resetLeadStore();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
