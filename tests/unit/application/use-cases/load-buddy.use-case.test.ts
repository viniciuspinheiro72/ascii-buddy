import { describe, it, expect, vi } from "vitest";
import { LoadBuddyUseCase } from "@/application/use-cases/load-buddy.use-case.js";
import { Buddy } from "@/domain/entities/buddy.js";
import { crash } from "@/assets/buddies/crash.js";
import type { BuddyRepository } from "@/domain/ports/buddy-repository.js";
import type { TemplateRegistry } from "@/domain/ports/template-registry.js";

const META = { name: "Segfault", description: "C++ vet.", talent: "manual memory management" };

function makeRepo(active: Buddy | null): BuddyRepository {
  return {
    getActive: vi.fn().mockResolvedValue(active),
    save: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    setActive: vi.fn(),
    delete: vi.fn(),
  };
}

function makeRegistry(): TemplateRegistry {
  return {
    getTemplate: vi.fn().mockResolvedValue(crash),
    listAvailable: vi.fn().mockResolvedValue([]),
    prefetch: vi.fn(),
  };
}

describe("LoadBuddyUseCase", () => {
  it("should return null when no active buddy exists", async () => {
    const uc = new LoadBuddyUseCase(makeRepo(null), makeRegistry());
    expect(await uc.execute()).toBeNull();
  });

  it("should return buddy and template when active buddy exists", async () => {
    const buddy = Buddy.create(META, "crash");
    const registry = makeRegistry();
    const uc = new LoadBuddyUseCase(makeRepo(buddy), registry);

    const result = await uc.execute();

    expect(result).not.toBeNull();
    expect(result?.buddy.id).toBe(buddy.id);
    expect(result?.template.id).toBe("crash");
    expect(registry.getTemplate).toHaveBeenCalledWith("crash");
  });

  it("should not call getTemplate when there is no active buddy", async () => {
    const registry = makeRegistry();
    const uc = new LoadBuddyUseCase(makeRepo(null), registry);

    await uc.execute();

    expect(registry.getTemplate).not.toHaveBeenCalled();
  });
});
