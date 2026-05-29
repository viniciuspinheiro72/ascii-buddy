import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { LocalStorageAdapter } from "@/infra/storage/local-storage-adapter.js";
import { Buddy } from "@/domain/entities/buddy.js";
import { Mood } from "@/domain/value-objects/mood.js";

const META = {
  name: "Nullref",
  description: "Survives garbage collectors.",
  talent: "GC survivor",
};

let tmpDir: string;
let adapter: LocalStorageAdapter;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "ascii-buddy-test-"));
  adapter = new LocalStorageAdapter(tmpDir);
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe("LocalStorageAdapter", () => {
  it("should return null when no active buddy exists", async () => {
    const result = await adapter.getActive();
    expect(result).toBeNull();
  });

  it("should return empty list when no buddies saved", async () => {
    const all = await adapter.findAll();
    expect(all).toHaveLength(0);
  });

  it("should save and retrieve a buddy by id", async () => {
    const buddy = Buddy.create(META, "crash");
    await adapter.save(buddy);

    const found = await adapter.findById(buddy.id);
    expect(found).not.toBeNull();
    expect(found?.name).toBe("Nullref");
    expect(found?.species).toBe("crash");
  });

  it("should set and retrieve the active buddy", async () => {
    const buddy = Buddy.create(META, "crash");
    await adapter.save(buddy);
    await adapter.setActive(buddy.id);

    const active = await adapter.getActive();
    expect(active?.id).toBe(buddy.id);
  });

  it("should update a buddy on second save", async () => {
    const buddy = Buddy.create(META, "crash");
    await adapter.save(buddy);

    const updated = buddy.withMood(Mood.HAPPY);
    await adapter.save(updated);

    const all = await adapter.findAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.mood).toBe(Mood.HAPPY);
  });

  it("should delete a buddy and clear active if it was active", async () => {
    const buddy = Buddy.create(META, "generic-dev");
    await adapter.save(buddy);
    await adapter.setActive(buddy.id);

    await adapter.delete(buddy.id);

    expect(await adapter.findAll()).toHaveLength(0);
    expect(await adapter.getActive()).toBeNull();
  });

  it("should persist phrase history correctly", async () => {
    const buddy = Buddy.create(META, "crash").withPhrase("type errors at runtime are just surprises");
    await adapter.save(buddy);

    const found = await adapter.findById(buddy.id);
    expect(found?.phraseHistory[0]).toBe("type errors at runtime are just surprises");
  });

  it("should survive a corrupt data file by returning empty storage", async () => {
    const { writeFile } = await import("fs/promises");
    await writeFile(join(tmpDir, "data.json"), "{ this is not valid json }", "utf-8");

    const adapter2 = new LocalStorageAdapter(tmpDir);
    const all = await adapter2.findAll();
    expect(all).toHaveLength(0);
  });
});
