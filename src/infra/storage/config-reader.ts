import { promises as fs } from "fs";
import { join } from "path";
import { homedir } from "os";
import type { ConfigSchema } from "@/infra/storage/schema.js";
import { logger } from "@/infra/logger.js";

export async function resolveApiKey(): Promise<string | null> {
  const envKey = process.env["GEMINI_API_KEY"];
  if (envKey) return envKey;

  try {
    const configPath = join(homedir(), ".ascii-buddy", "config.json");
    const raw = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(raw) as ConfigSchema;
    return config.apiKey ?? null;
  } catch {
    logger.debug("No config.json found or missing apiKey — running in offline mode");
    return null;
  }
}
