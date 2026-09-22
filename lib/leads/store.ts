import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { Lead, LeadStatusPatch } from "./types";

/** The lead could not be persisted. The one failure with no safety net — see plan §5.5. */
export class LeadStorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "LeadStorageError";
  }
}

/**
 * Persistence boundary. The production adapter (managed Postgres) is an open
 * decision (plan §8 #12) and plugs in here without touching callers.
 * `create` MUST be idempotent by `id` (it can be retried after a partial write).
 */
export interface LeadStore {
  create(lead: Lead): Promise<void>;
  get(id: string): Promise<Lead | null>;
  findByIdempotencyKey(key: string): Promise<Lead | null>;
  update(id: string, patch: LeadStatusPatch): Promise<Lead | null>;
}

/** Tests and CI. Loses everything on restart. */
export class MemoryLeadStore implements LeadStore {
  private readonly leads = new Map<string, Lead>();

  async create(lead: Lead): Promise<void> {
    if (!this.leads.has(lead.id)) this.leads.set(lead.id, { ...lead });
  }
  async get(id: string): Promise<Lead | null> {
    const found = this.leads.get(id);
    return found ? { ...found } : null;
  }
  async findByIdempotencyKey(key: string): Promise<Lead | null> {
    for (const lead of this.leads.values()) {
      if (lead.idempotencyKey === key) return { ...lead };
    }
    return null;
  }
  async update(id: string, patch: LeadStatusPatch): Promise<Lead | null> {
    const found = this.leads.get(id);
    if (!found) return null;
    const next = { ...found, ...patch };
    this.leads.set(id, next);
    return { ...next };
  }
  /** Test helper. */
  all(): Lead[] {
    return [...this.leads.values()].map((l) => ({ ...l }));
  }
}

/**
 * Local development only: a JSON file so leads survive a dev-server restart.
 * Serialises access within one process; NOT safe across processes or servers.
 * Contains personal data, so `.data/` is git-ignored.
 */
export class FileLeadStore implements LeadStore {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly filePath: string) {}

  private run<T>(task: () => Promise<T>): Promise<T> {
    const next = this.queue.then(task, task);
    this.queue = next.catch(() => undefined);
    return next;
  }

  private async read(): Promise<Lead[]> {
    try {
      return JSON.parse(await readFile(this.filePath, "utf8")) as Lead[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  private async write(leads: Lead[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const tmp = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(leads, null, 2), "utf8");
    await rename(tmp, this.filePath);
  }

  create(lead: Lead): Promise<void> {
    return this.run(async () => {
      const leads = await this.read();
      if (leads.some((l) => l.id === lead.id)) return;
      leads.push(lead);
      await this.write(leads);
    });
  }
  get(id: string): Promise<Lead | null> {
    return this.run(async () => (await this.read()).find((l) => l.id === id) ?? null);
  }
  findByIdempotencyKey(key: string): Promise<Lead | null> {
    return this.run(async () => (await this.read()).find((l) => l.idempotencyKey === key) ?? null);
  }
  update(id: string, patch: LeadStatusPatch): Promise<Lead | null> {
    return this.run(async () => {
      const leads = await this.read();
      const index = leads.findIndex((l) => l.id === id);
      if (index === -1) return null;
      leads[index] = { ...leads[index], ...patch };
      await this.write(leads);
      return leads[index];
    });
  }
}

export class LeadStorageNotConfiguredError extends LeadStorageError {
  constructor() {
    super(
      "No durable lead store is configured for production. Set up the database adapter " +
        "(plan §8 #12) or explicitly opt in with LEAD_STORE=file on a single persistent server.",
    );
    this.name = "LeadStorageNotConfiguredError";
  }
}

type EnvLike = Record<string, string | undefined>;
const holder = globalThis as unknown as { __sloraLeadStore?: LeadStore };

/**
 * Picks the store for this process (kept on globalThis so dev hot-reload reuses it).
 *   test                → memory
 *   LEAD_STORE=memory   → memory
 *   dev / LEAD_STORE=file → ./.data/leads.json
 *   production, nothing configured → refuse (fail loudly rather than lose leads)
 */
export function getLeadStore(env: EnvLike = process.env): LeadStore {
  if (holder.__sloraLeadStore) return holder.__sloraLeadStore;
  let store: LeadStore;
  if (env.LEAD_STORE === "memory" || env.NODE_ENV === "test") {
    store = new MemoryLeadStore();
  } else if (env.LEAD_STORE === "file" || env.NODE_ENV !== "production") {
    store = new FileLeadStore(join(process.cwd(), ".data", "leads.json"));
  } else {
    throw new LeadStorageNotConfiguredError();
  }
  holder.__sloraLeadStore = store;
  return store;
}

/** Test helper: forget the cached store. */
export function resetLeadStore(): void {
  delete holder.__sloraLeadStore;
}
