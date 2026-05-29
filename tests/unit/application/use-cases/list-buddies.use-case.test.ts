import { describe, it, expect, vi } from "vitest";
import { ListBuddiesUseCase } from "@/application/use-cases/list-buddies.use-case.js";
import { Buddy } from "@/domain/entities/buddy.js";
import type { BuddyRepository } from "@/domain/ports/buddy-repository.js";

const META = { name: "Segfault", description: "C++ vet.", talent: "manual memory management" };

function makeRepo(all: Buddy[], active: Buddy | null): BuddyRepository {
  return {
    findAll: vi.fn().mockResolvedValue(all),
    getActive: vi.fn().mockResolvedValue(active),
    save: vi.fn(),
    findById: vi.fn(),
    setActive: vi.fn(),
    delete: vi.fn(),
  };
}

describe("ListBuddiesUseCase", () => {
  it("returns empty list and null activeBuddyId when there are no buddies", async () => {
    const uc = new ListBuddiesUseCase(makeRepo([], null));
    const result = await uc.execute();

    expect(result.buddies).toHaveLength(0);
    expect(result.activeBuddyId).toBeNull();
  });

  it("returns all buddies and the active buddy id", async () => {
    const buddy = Buddy.create(META, "crash");
    const uc = new ListBuddiesUseCase(makeRepo([buddy], buddy));

    const result = await uc.execute();

    expect(result.buddies).toHaveLength(1);
    expect(result.activeBuddyId).toBe(buddy.id);
  });

  it("returns null activeBuddyId when no buddy is active", async () => {
    const buddy = Buddy.create(META, "crash");
    const uc = new ListBuddiesUseCase(makeRepo([buddy], null));

    const result = await uc.execute();

    expect(result.buddies).toHaveLength(1);
    expect(result.activeBuddyId).toBeNull();
  });

  it("fetches buddies and active in parallel", async () => {
    const repo = makeRepo([], null);
    const uc = new ListBuddiesUseCase(repo);

    await uc.execute();

    expect(repo.findAll).toHaveBeenCalledOnce();
    expect(repo.getActive).toHaveBeenCalledOnce();
  });
});
