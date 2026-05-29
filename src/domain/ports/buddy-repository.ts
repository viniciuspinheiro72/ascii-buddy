import type { Buddy } from "@/domain/entities/buddy.js";

/** Contract for Buddy persistence. Implement to add a new storage backend. */
export interface BuddyRepository {
  save(buddy: Buddy): Promise<void>;
  findById(id: string): Promise<Buddy | null>;
  findAll(): Promise<Buddy[]>;
  setActive(id: string): Promise<void>;
  getActive(): Promise<Buddy | null>;
  delete(id: string): Promise<void>;
}
