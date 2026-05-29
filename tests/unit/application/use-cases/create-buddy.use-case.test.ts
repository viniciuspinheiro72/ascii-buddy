import { describe, it, expect, vi } from "vitest";
import { CreateBuddyUseCase } from "@/application/use-cases/create-buddy.use-case.js";
import { Buddy } from "@/domain/entities/buddy.js";
import { crash } from "@/assets/buddies/crash.js";
import type { AIProvider } from "@/domain/ports/ai-provider.js";
import type { BuddyRepository } from "@/domain/ports/buddy-repository.js";
import type { TemplateRegistry } from "@/domain/ports/template-registry.js";

const META = { name: "Segfault", description: "C++ vet.", talent: "manual memory management" };

function makeAI(): AIProvider {
  return {
    generatePhrase: vi.fn(),
    generateBuddyMetadata: vi.fn().mockResolvedValue(META),
  };
}

function makeRepo(): BuddyRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    setActive: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn(),
    findAll: vi.fn(),
    getActive: vi.fn(),
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

describe("CreateBuddyUseCase", () => {
  it("generates metadata and creates a buddy", async () => {
    const ai = makeAI();
    const uc = new CreateBuddyUseCase(ai, makeRepo(), makeRegistry());

    const { buddy } = await uc.execute();

    expect(ai.generateBuddyMetadata).toHaveBeenCalledOnce();
    expect(buddy.name).toBe("Segfault");
    expect(buddy.talent).toBe("manual memory management");
  });

  it("saves the buddy and sets it as active", async () => {
    const repo = makeRepo();
    const uc = new CreateBuddyUseCase(makeAI(), repo, makeRegistry());

    const { buddy } = await uc.execute();

    expect(repo.save).toHaveBeenCalledWith(buddy);
    expect(repo.setActive).toHaveBeenCalledWith(buddy.id);
  });

  it("resolves the species template", async () => {
    const registry = makeRegistry();
    const uc = new CreateBuddyUseCase(makeAI(), makeRepo(), registry);

    const { buddy, template } = await uc.execute();

    expect(registry.getTemplate).toHaveBeenCalledWith(buddy.species);
    expect(template.id).toBe("crash");
  });

  it("uses the provided species when given", async () => {
    const uc = new CreateBuddyUseCase(makeAI(), makeRepo(), makeRegistry());

    const { buddy } = await uc.execute("crash");

    expect(buddy.species).toBe("crash");
  });

  it("returns a valid Buddy instance", async () => {
    const uc = new CreateBuddyUseCase(makeAI(), makeRepo(), makeRegistry());

    const { buddy } = await uc.execute();

    expect(buddy).toBeInstanceOf(Buddy);
    expect(buddy.id).toBeTruthy();
  });
});
