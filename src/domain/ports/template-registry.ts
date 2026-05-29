import type { BuddyTemplate } from "@/domain/value-objects/buddy-template.js";
import type { SpeciesMeta } from "@/domain/value-objects/species-meta.js";

/** Contract for resolving BuddyTemplates by species ID. Implement to add a new template source. */
export interface TemplateRegistry {
  getTemplate(speciesId: string): Promise<BuddyTemplate>;
  listAvailable(): Promise<SpeciesMeta[]>;
  prefetch(speciesId: string): Promise<void>;
}
