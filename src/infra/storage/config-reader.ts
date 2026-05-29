import { promises as fs } from "fs";
import { join } from "path";
import { homedir } from "os";
import { DEFAULT_CONFIG, type ConfigSchema } from "@/infra/storage/schema.js";
import { logger } from "@/infra/logger.js";

function configPath(): string {
  const dir = process.env["ASCII_BUDDY_DATA_DIR"] ?? join(homedir(), ".ascii-buddy");
  return join(dir, "config.json");
}

export async function resolveConfig(): Promise<ConfigSchema> {
  try {
    const raw = await fs.readFile(configPath(), "utf-8");
    const parsed = JSON.parse(raw) as Partial<ConfigSchema>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    logger.debug("No config.json found — using defaults");
    return { ...DEFAULT_CONFIG };
  }
}

export async function resolveApiKey(): Promise<string | null> {
  const envKey = process.env["GEMINI_API_KEY"];
  if (envKey) return envKey;

  const config = await resolveConfig();
  if (!config.apiKey) {
    logger.debug("No apiKey in config.json — running in offline mode");
  }
  return config.apiKey ?? null;
}
