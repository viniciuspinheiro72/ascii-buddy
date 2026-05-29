import type { BuddyRepository } from "@/domain/ports/buddy-repository.js";
import type { Buddy } from "@/domain/entities/buddy.js";

export interface ListBuddiesResult {
  buddies: Buddy[];
  activeBuddyId: string | null;
}

export class ListBuddiesUseCase {
  constructor(private readonly buddyRepository: BuddyRepository) {}

  async execute(): Promise<ListBuddiesResult> {
    const [buddies, activeBuddy] = await Promise.all([
      this.buddyRepository.findAll(),
      this.buddyRepository.getActive(),
    ]);
    return { buddies, activeBuddyId: activeBuddy?.id ?? null };
  }
}
