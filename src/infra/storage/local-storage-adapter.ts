import { promises as fs } from "fs";
import { join } from "path";
import { homedir } from "os";
import { Buddy } from "@/domain/entities/buddy.js";
import { Mood } from "@/domain/value-objects/mood.js";
import type { BuddyRepository } from "@/domain/ports/buddy-repository.js";
import {
  SCHEMA_VERSION,
  type BuddyRecord,
  type StorageSchema,
} from "@/infra/storage/schema.js";

export class LocalStorageAdapter implements BuddyRepository {
  private readonly dataPath: string;
  private readonly backupPath: string;
  private readonly tmpPath: string;

  constructor(dataDir?: string) {
    const dir = dataDir ?? join(homedir(), ".ascii-buddy");
    this.dataPath = join(dir, "data.json");
    this.backupPath = join(dir, "data.json.bak");
    this.tmpPath = join(dir, "data.json.tmp");
  }

  async save(buddy: Buddy): Promise<void> {
    const storage = await this.read();
    const index = storage.buddies.findIndex((b) => b.id === buddy.id);
    const record = buddyToRecord(buddy);

    if (index >= 0) {
      storage.buddies[index] = record;
    } else {
      storage.buddies.push(record);
    }

    await this.write(storage);
  }

  async findById(id: string): Promise<Buddy | null> {
    const storage = await this.read();
    const record = storage.buddies.find((b) => b.id === id);
    return record ? recordToBuddy(record) : null;
  }

  async findAll(): Promise<Buddy[]> {
    const storage = await this.read();
    return storage.buddies.map(recordToBuddy);
  }

  async setActive(id: string): Promise<void> {
    const storage = await this.read();
    storage.activeBuddyId = id;
    await this.write(storage);
  }

  async getActive(): Promise<Buddy | null> {
    const storage = await this.read();
    if (!storage.activeBuddyId) return null;
    const record = storage.buddies.find((b) => b.id === storage.activeBuddyId);
    return record ? recordToBuddy(record) : null;
  }

  async delete(id: string): Promise<void> {
    const storage = await this.read();
    storage.buddies = storage.buddies.filter((b) => b.id !== id);
    if (storage.activeBuddyId === id) {
      storage.activeBuddyId = storage.buddies[0]?.id ?? null;
    }
    await this.write(storage);
  }

  private async read(): Promise<StorageSchema> {
    try {
      const raw = await fs.readFile(this.dataPath, "utf-8");
      const parsed = JSON.parse(raw) as StorageSchema;
      if (parsed.version !== SCHEMA_VERSION) {
        return emptyStorage();
      }
      return parsed;
    } catch {
      // Try backup before giving up
      try {
        const raw = await fs.readFile(this.backupPath, "utf-8");
        return JSON.parse(raw) as StorageSchema;
      } catch {
        return emptyStorage();
      }
    }
  }

  private async write(storage: StorageSchema): Promise<void> {
    const dir = join(this.dataPath, "..");
    await fs.mkdir(dir, { recursive: true });

    const json = JSON.stringify(storage, null, 2);

    // Backup current file before overwriting
    try {
      await fs.copyFile(this.dataPath, this.backupPath);
    } catch {
      // No existing file yet — skip backup
    }

    // Atomic write: tmp → rename
    await fs.writeFile(this.tmpPath, json, "utf-8");
    await fs.rename(this.tmpPath, this.dataPath);
  }
}

function emptyStorage(): StorageSchema {
  return { version: SCHEMA_VERSION, activeBuddyId: null, buddies: [] };
}

function buddyToRecord(buddy: Buddy): BuddyRecord {
  return {
    id: buddy.id,
    name: buddy.name,
    description: buddy.description,
    talent: buddy.talent,
    species: buddy.species,
    mood: buddy.mood,
    createdAt: buddy.createdAt.toISOString(),
    lastSeenAt: buddy.lastSeenAt.toISOString(),
    phraseHistory: [...buddy.phraseHistory],
  };
}

function recordToBuddy(record: BuddyRecord): Buddy {
  return Buddy.reconstitute({
    id: record.id,
    name: record.name,
    description: record.description,
    talent: record.talent,
    species: record.species,
    mood: record.mood as Mood,
    createdAt: new Date(record.createdAt),
    lastSeenAt: new Date(record.lastSeenAt),
    phraseHistory: record.phraseHistory,
  });
}
