type LogLevel = "silent" | "error" | "debug";

const LEVEL_RANK: Record<LogLevel, number> = { silent: 0, error: 1, debug: 2 };

function currentLevel(): LogLevel {
  const raw = process.env["ASCII_BUDDY_LOG_LEVEL"] ?? "error";
  return (raw in LEVEL_RANK ? raw : "error") as LogLevel;
}

function write(prefix: string, message: string): void {
  process.stderr.write(`[ascii-buddy] ${prefix}: ${message}\n`);
}

export const logger = {
  error(message: string): void {
    if (LEVEL_RANK[currentLevel()] >= LEVEL_RANK.error) write("ERROR", message);
  },
  debug(message: string): void {
    if (LEVEL_RANK[currentLevel()] >= LEVEL_RANK.debug) write("DEBUG", message);
  },
};
