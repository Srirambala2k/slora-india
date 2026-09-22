import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  FileLeadStore,
  LeadStorageNotConfiguredError,
  MemoryLeadStore,
  getLeadStore,
  resetLeadStore,
  type LeadStore,
} from "@/lib/leads/store";
import { createRateLimiter } from "@/lib/security/rateLimit";
import { makeLead } from "./helpers";

function contract(name: string, make: () => Promise<LeadStore>) {
  describe(`${name} — LeadStore contract`, () => {
    it("creates, gets and updates a lead", async () => {
      const store = await make();
      await store.create(makeLead({ idempotencyKey: "key-12345678" }));
      expect((await store.get("lead-1"))?.name).toBe("Asha Raman");
      expect((await store.findByIdempotencyKey("key-12345678"))?.id).toBe("lead-1");
      expect(await store.findByIdempotencyKey("nope-nope-nope")).toBeNull();

      const updated = await store.update("lead-1", {
        telegramStatus: "sent",
        whatsappClicked: true,
      });
      expect(updated).toMatchObject({
        telegramStatus: "sent",
        whatsappClicked: true,
        emailStatus: "pending",
      });
      expect((await store.get("lead-1"))?.telegramStatus).toBe("sent");
    });

    it("create is idempotent by id (safe to retry)", async () => {
      const store = await make();
      await store.create(makeLead());
      await store.create(makeLead({ name: "Someone Else" }));
      expect((await store.get("lead-1"))?.name).toBe("Asha Raman");
    });

    it("returns null for unknown ids", async () => {
      const store = await make();
      expect(await store.get("missing")).toBeNull();
      expect(await store.update("missing", { emailStatus: "sent" })).toBeNull();
    });
  });
}

contract("MemoryLeadStore", async () => new MemoryLeadStore());

describe("FileLeadStore", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "slora-leads-"));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  contract(
    "FileLeadStore",
    async () => new FileLeadStore(join(await mkdtemp(join(tmpdir(), "slora-c-")), "l.json")),
  );

  it("persists to disk and survives a 'restart' (new instance, same file)", async () => {
    const file = join(dir, "nested", "leads.json");
    await new FileLeadStore(file).create(makeLead());
    expect((await new FileLeadStore(file).get("lead-1"))?.city).toBe("Chennai");
    expect(JSON.parse(await readFile(file, "utf8"))).toHaveLength(1);
  });

  it("does not lose leads when many are written at once", async () => {
    const store = new FileLeadStore(join(dir, "leads.json"));
    await Promise.all(
      Array.from({ length: 25 }, (_, i) => store.create(makeLead({ id: `lead-${i}` }))),
    );
    expect(JSON.parse(await readFile(join(dir, "leads.json"), "utf8"))).toHaveLength(25);
  });
});

describe("getLeadStore", () => {
  it("uses memory under test", () => {
    expect(getLeadStore({ NODE_ENV: "test" })).toBeInstanceOf(MemoryLeadStore);
  });

  it("uses the local file store in development", () => {
    expect(getLeadStore({ NODE_ENV: "development" })).toBeInstanceOf(FileLeadStore);
  });

  it("REFUSES to run in production with no durable store, rather than silently losing leads", () => {
    resetLeadStore();
    expect(() => getLeadStore({ NODE_ENV: "production" })).toThrow(LeadStorageNotConfiguredError);
  });

  it("allows production only with an explicit opt-in", () => {
    resetLeadStore();
    expect(getLeadStore({ NODE_ENV: "production", LEAD_STORE: "file" })).toBeInstanceOf(
      FileLeadStore,
    );
  });
});

describe("createRateLimiter", () => {
  it("allows up to the limit, then blocks until the window passes", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 });
    expect(limiter.check("a", 0).allowed).toBe(true);
    expect(limiter.check("a", 100).allowed).toBe(true);
    expect(limiter.check("a", 200).allowed).toBe(true);
    const blocked = limiter.check("a", 300);
    expect(blocked).toEqual({ allowed: false, retryAfterSeconds: 1 });
    expect(limiter.check("a", 1001).allowed).toBe(true); // first hit has aged out
  });

  it("keeps clients separate", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(limiter.check("a", 0).allowed).toBe(true);
    expect(limiter.check("b", 0).allowed).toBe(true);
    expect(limiter.check("a", 1).allowed).toBe(false);
  });
});
