import type { BuddyRepository } from "@/domain/ports/buddy-repository.js";
import type { Buddy } from "@/domain/entities/buddy.js";

export interface DeleteBuddyResult {
  wasActive: boolean;
  newActiveBuddy: Buddy | null;
}

export class DeleteBuddyUseCase {
  constructor(private readonly buddyRepository: BuddyRepository) {}

  async execute(id: string): Promise<DeleteBuddyResult> {
    const activeBuddy = await this.buddyRepository.getActive();
    const wasActive = activeBuddy?.id === id;

    await this.buddyRepository.delete(id);

    // Storage adapter already promotes the next buddy as active when the
    // active one is deleted — re-read to get the post-delete state.
    const newActiveBuddy = wasActive ? await this.buddyRepository.getActive() : (activeBuddy ?? null);
    return { wasActive, newActiveBuddy };
  }
}
