import { crash } from "@/assets/buddies/crash.js";
import { genericDev } from "@/assets/buddies/generic-dev.js";
import type { BuddyTemplate } from "@/domain/value-objects/buddy-template.js";
import type { SpeciesMeta } from "@/domain/value-objects/species-meta.js";
import type { TemplateRegistry } from "@/domain/ports/template-registry.js";

const REGISTRY: Record<string, BuddyTemplate> = {
  crash,
  "generic-dev": genericDev,
};

export class BundledTemplateRegistry implements TemplateRegistry {
  async getTemplate(speciesId: string): Promise<BuddyTemplate> {
    const template = REGISTRY[speciesId];
    if (!template) {
      throw new Error(`Unknown species: "${speciesId}". Available: ${Object.keys(REGISTRY).join(", ")}`);
    }
    return template;
  }

  async listAvailable(): Promise<SpeciesMeta[]> {
    return Object.values(REGISTRY).map((t) => ({
      id: t.id,
      displayName: t.displayName,
      description: t.description,
    }));
  }

  // Bundled templates are always available — nothing to prefetch.
  async prefetch(_speciesId: string): Promise<void> {}
}
