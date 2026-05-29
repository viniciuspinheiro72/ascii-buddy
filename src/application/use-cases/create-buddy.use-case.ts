import type { AIProvider } from "@/domain/ports/ai-provider.js";
import type { BuddyRepository } from "@/domain/ports/buddy-repository.js";
import type { TemplateRegistry } from "@/domain/ports/template-registry.js";
import { Buddy } from "@/domain/entities/buddy.js";
import type { BuddyTemplate } from "@/domain/value-objects/buddy-template.js";

export interface CreateBuddyResult {
  buddy: Buddy;
  template: BuddyTemplate;
}

export class CreateBuddyUseCase {
  constructor(
    private readonly aiProvider: AIProvider,
    private readonly buddyRepository: BuddyRepository,
    private readonly templateRegistry: TemplateRegistry,
  ) {}

  async execute(species?: string): Promise<CreateBuddyResult> {
    const metadata = await this.aiProvider.generateBuddyMetadata();
    const buddy = Buddy.create(metadata, species);
    await this.buddyRepository.save(buddy);
    await this.buddyRepository.setActive(buddy.id);
    const template = await this.templateRegistry.getTemplate(buddy.species);
    return { buddy, template };
  }
}
