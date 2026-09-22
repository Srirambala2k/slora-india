import { describe, expect, it, vi } from "vitest";
import {
  defaultLeadDeps,
  submitLead,
  type LeadServiceDeps,
  type Notifier,
} from "@/lib/leads/leadService";
import {
  LeadStorageError,
  LeadStorageNotConfiguredError,
  MemoryLeadStore,
  type LeadStore,
} from "@/lib/leads/store";
import { makeLead, validInput } from "./helpers";

const sent: Notifier = async () => ({ status: "sent" });
const down: Notifier = async () => ({ status: "failed", detail: "HTTP 500" });
const explodes: Notifier = async () => {
  throw new Error("provider SDK crashed");
};

function setup(overrides: Partial<LeadServiceDeps> = {}) {
  const store = new MemoryLeadStore();
  const deps: LeadServiceDeps = {
    store,
    notifyTelegram: sent,
    notifyEmail: sent,
    whatsappNumber: "910000000000",
    now: () => new Date("2026-09-21T08:00:00.000Z"),
    newId: () => "lead-abc",
    retryDelayMs: 1,
    ...overrides,
  };
  return { store, deps };
}

describe("submitLead — the happy path", () => {
  it("stores the lead, notifies both channels and returns the WhatsApp link", async () => {
    const telegram = vi.fn(sent);
    const email = vi.fn(sent);
    const { store, deps } = setup({ notifyTelegram: telegram, notifyEmail: email });

    const outcome = await submitLead(validInput(), deps);

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.duplicate).toBe(false);
    expect(outcome.whatsappUrl).toContain("https://wa.me/910000000000?text=");
    expect(telegram).toHaveBeenCalledOnce();
    expect(email).toHaveBeenCalledOnce();

    const [saved] = store.all();
    expect(saved).toMatchObject({
      id: "lead-abc",
      name: "Asha Raman",
      requirementType: "Football Turf",
      squareFeet: 10000,
      phoneNumber: "+919876543210",
      source: "chatbot",
      createdAt: "2026-09-21T08:00:00.000Z",
      whatsappClicked: false,
      telegramStatus: "sent",
      emailStatus: "sent",
    });
  });
});

describe("submitLead — never lose a lead (master prompt §28, §49)", () => {
  it("Telegram down → lead still stored, email still sent, WhatsApp still offered", async () => {
    const { store, deps } = setup({ notifyTelegram: down });
    const outcome = await submitLead(validInput(), deps);

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.whatsappUrl).not.toBeNull();
    const [saved] = store.all();
    expect(saved.telegramStatus).toBe("failed");
    expect(saved.emailStatus).toBe("sent");
  });

  it("Email down → lead still stored, Telegram still sent", async () => {
    const { store, deps } = setup({ notifyEmail: down });
    expect((await submitLead(validInput(), deps)).ok).toBe(true);
    const [saved] = store.all();
    expect(saved.telegramStatus).toBe("sent");
    expect(saved.emailStatus).toBe("failed");
  });

  it("both down → lead still stored and the visitor is still told it succeeded", async () => {
    const { store, deps } = setup({ notifyTelegram: down, notifyEmail: down });
    const outcome = await submitLead(validInput(), deps);
    expect(outcome.ok).toBe(true);
    expect(store.all()).toHaveLength(1);
    expect(store.all()[0]).toMatchObject({ telegramStatus: "failed", emailStatus: "failed" });
  });

  it("a notifier that THROWS cannot break the flow", async () => {
    const { store, deps } = setup({ notifyTelegram: explodes });
    const outcome = await submitLead(validInput(), deps);
    expect(outcome.ok).toBe(true);
    expect(store.all()[0]).toMatchObject({ telegramStatus: "failed", emailStatus: "sent" });
  });

  it("stores the lead BEFORE any notification is attempted", async () => {
    const { store, deps } = setup();
    let storedWhenTelegramRan = -1;
    let storedWhenEmailRan = -1;
    deps.notifyTelegram = async () => {
      storedWhenTelegramRan = store.all().length;
      return { status: "sent" };
    };
    deps.notifyEmail = async () => {
      storedWhenEmailRan = store.all().length;
      return { status: "sent" };
    };
    await submitLead(validInput(), deps);
    expect(storedWhenTelegramRan).toBe(1);
    expect(storedWhenEmailRan).toBe(1);
  });

  it("runs the two channels independently — a slow Telegram does not delay email", async () => {
    const order: string[] = [];
    const { deps } = setup({
      notifyTelegram: async () => {
        await new Promise((r) => setTimeout(r, 30));
        order.push("telegram");
        return { status: "sent" };
      },
      notifyEmail: async () => {
        order.push("email");
        return { status: "sent" };
      },
    });
    await submitLead(validInput(), deps);
    expect(order).toEqual(["email", "telegram"]);
  });

  it("still succeeds if recording the notification statuses fails (the lead is already safe)", async () => {
    const memory = new MemoryLeadStore();
    const store: LeadStore = {
      create: (l) => memory.create(l),
      get: (id) => memory.get(id),
      findByIdempotencyKey: (k) => memory.findByIdempotencyKey(k),
      update: async () => {
        throw new Error("disk full");
      },
    };
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { deps } = setup({ store });
    const outcome = await submitLead(validInput(), deps);
    expect(outcome.ok).toBe(true);
    expect(memory.all()).toHaveLength(1);
  });

  it("works with no WhatsApp number configured (returns null, not a broken link)", async () => {
    const { deps } = setup({ whatsappNumber: null });
    const outcome = await submitLead(validInput(), deps);
    expect(outcome.ok && outcome.whatsappUrl).toBeNull();
  });
});

describe("submitLead — storage failure (the one path with no safety net)", () => {
  it("retries once and succeeds if the store recovers", async () => {
    const memory = new MemoryLeadStore();
    let calls = 0;
    const flaky: LeadStore = {
      create: async (l) => {
        if (++calls === 1) throw new Error("transient");
        return memory.create(l);
      },
      get: (id) => memory.get(id),
      findByIdempotencyKey: (k) => memory.findByIdempotencyKey(k),
      update: (id, p) => memory.update(id, p),
    };
    const { deps } = setup({ store: flaky });
    expect((await submitLead(validInput(), deps)).ok).toBe(true);
    expect(calls).toBe(2);
    expect(memory.all()).toHaveLength(1);
  });

  it("throws LeadStorageError — and sends NO notifications — if the store stays down", async () => {
    const telegram = vi.fn(sent);
    const email = vi.fn(sent);
    const dead: LeadStore = {
      create: async () => {
        throw new Error("db down");
      },
      get: async () => null,
      findByIdempotencyKey: async () => null,
      update: async () => null,
    };
    const { deps } = setup({ store: dead, notifyTelegram: telegram, notifyEmail: email });
    await expect(submitLead(validInput(), deps)).rejects.toBeInstanceOf(LeadStorageError);
    expect(telegram).not.toHaveBeenCalled();
    expect(email).not.toHaveBeenCalled();
  });
});

describe("submitLead — validation and duplicates", () => {
  it("rejects invalid input without storing or notifying anything", async () => {
    const telegram = vi.fn(sent);
    const { store, deps } = setup({ notifyTelegram: telegram });
    const outcome = await submitLead(
      validInput({ phoneNumber: "12345", projectLink: "javascript:alert(1)" }),
      deps,
    );
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(Object.keys(outcome.fieldErrors)).toEqual(
      expect.arrayContaining(["phoneNumber", "projectLink"]),
    );
    expect(store.all()).toHaveLength(0);
    expect(telegram).not.toHaveBeenCalled();
  });

  it("a retried submit with the same idempotency key returns the ORIGINAL lead and does not re-notify", async () => {
    const telegram = vi.fn(sent);
    const email = vi.fn(sent);
    let n = 0;
    const { store, deps } = setup({
      notifyTelegram: telegram,
      notifyEmail: email,
      newId: () => `lead-${++n}`,
    });
    const input = validInput({ idempotencyKey: "retry-key-0001" });

    const first = await submitLead(input, deps);
    const second = await submitLead(input, deps);

    expect(first.ok && first.duplicate).toBe(false);
    expect(second.ok && second.duplicate).toBe(true);
    expect(second.ok && second.lead.id).toBe("lead-1");
    expect(store.all()).toHaveLength(1);
    expect(telegram).toHaveBeenCalledOnce();
    expect(email).toHaveBeenCalledOnce();
  });

  it("does not put personal details into the console log when a channel fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { deps } = setup({ notifyTelegram: down });
    await submitLead(validInput(), deps);
    const logged = JSON.stringify(warn.mock.calls);
    expect(logged).toContain("lead-abc");
    expect(logged).not.toContain("Asha");
    expect(logged).not.toContain("9876543210");
  });
});

describe("validation happens BEFORE storage is touched", () => {
  const explodingStore: LeadStore = {
    create: async () => {
      throw new Error("store must not be used");
    },
    get: async () => {
      throw new Error("store must not be used");
    },
    findByIdempotencyKey: async () => {
      throw new Error("store must not be used");
    },
    update: async () => {
      throw new Error("store must not be used");
    },
  };

  it("invalid input is answered as invalid even if the store is completely unavailable", async () => {
    const { deps } = setup({ store: explodingStore });
    const outcome = await submitLead(validInput({ phoneNumber: "12345" }), deps);
    expect(outcome.ok).toBe(false);
  });

  it("the default deps do not require a configured store until it is actually used", async () => {
    vi.stubEnv("NODE_ENV", "production"); // production with no durable store configured
    expect(() => defaultLeadDeps()).not.toThrow();

    const deps = defaultLeadDeps();
    const invalid = await submitLead(validInput({ phoneNumber: "12345" }), deps);
    expect(invalid.ok).toBe(false); // still a clean validation answer

    // Valid input DOES need storage: reported as a storage error (→ 503), with the real cause attached.
    const error = await submitLead(validInput(), { ...deps, retryDelayMs: 1 }).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(LeadStorageError);
    expect((error as Error).cause).toBeInstanceOf(LeadStorageNotConfiguredError);
  });

  it("(sanity) a lead built by the test helper is valid input for the store contract", () => {
    expect(makeLead().id).toBe("lead-1");
  });
});
