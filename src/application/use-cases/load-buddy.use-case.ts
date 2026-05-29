import type { Buddy } from "@/domain/entities/buddy.js";
import type { BuddyRepository } from "@/domain/ports/buddy-repository.js";
import type { TemplateRegistry } from "@/domain/ports/template-registry.js";
import type { BuddyTemplate } from "@/domain/value-objects/buddy-template.js";

export interface LoadBuddyResult {
  buddy: Buddy;
  template: BuddyTemplate;
}

export class LoadBuddyUseCase {
  constructor(
    private readonly buddyRepository: BuddyRepository,
    private readonly templateRegistry: TemplateRegistry,
  ) {}

  async execute(): Promise<LoadBuddyResult | null> {
    const buddy = await this.buddyRepository.getActive();
    if (!buddy) return null;

    const template = await this.templateRegistry.getTemplate(buddy.species);
    return { buddy, template };
  }
}
