import { describe, it, expect, vi } from "vitest";
import { DeleteBuddyUseCase } from "@/application/use-cases/delete-buddy.use-case.js";
import { Buddy } from "@/domain/entities/buddy.js";
import type { BuddyRepository } from "@/domain/ports/buddy-repository.js";

const META = { name: "Segfault", description: "C++ vet.", talent: "manual memory management" };
const OTHER_META = { name: "Nullref", description: "Java exile.", talent: "NPE avoidance" };

function makeRepo(active: Buddy | null, postDeleteActive: Buddy | null): BuddyRepository {
  const getActive = vi
    .fn()
    .mockResolvedValueOnce(active)       // first call (pre-delete check)
    .mockResolvedValueOnce(postDeleteActive); // second call (post-delete read)

  return {
    getActive,
    delete: vi.fn().mockResolvedValue(undefined),
    save: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    setActive: vi.fn(),
  };
}

describe("DeleteBuddyUseCase", () => {
  it("deletes the specified buddy", async () => {
    const buddy = Buddy.create(META, "crash");
    const repo = makeRepo(buddy, null);
    const uc = new DeleteBuddyUseCase(repo);

    await uc.execute(buddy.id);

    expect(repo.delete).toHaveBeenCalledWith(buddy.id);
  });

  it("reports wasActive=true when the active buddy is deleted", async () => {
    const buddy = Buddy.create(META, "crash");
    const repo = makeRepo(buddy, null);
    const uc = new DeleteBuddyUseCase(repo);

    const result = await uc.execute(buddy.id);

    expect(result.wasActive).toBe(true);
  });

  it("reports wasActive=false when a non-active buddy is deleted", async () => {
    const active = Buddy.create(META, "crash");
    const other = Buddy.create(OTHER_META, "generic-dev");
    const repo = makeRepo(active, active);
    const uc = new DeleteBuddyUseCase(repo);

    const result = await uc.execute(other.id);

    expect(result.wasActive).toBe(false);
  });

  it("returns the new active buddy after deleting the active one", async () => {
    const active = Buddy.create(META, "crash");
    const next = Buddy.create(OTHER_META, "generic-dev");
    const repo = makeRepo(active, next);
    const uc = new DeleteBuddyUseCase(repo);

    const result = await uc.execute(active.id);

    expect(result.newActiveBuddy?.id).toBe(next.id);
  });

  it("returns null newActiveBuddy when no buddies remain", async () => {
    const buddy = Buddy.create(META, "crash");
    const repo = makeRepo(buddy, null);
    const uc = new DeleteBuddyUseCase(repo);

    const result = await uc.execute(buddy.id);

    expect(result.newActiveBuddy).toBeNull();
  });
});
