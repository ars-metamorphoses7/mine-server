import "dotenv/config";

function requiredString(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function portFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be a valid TCP port`);
  }
  return port;
}

export const config = {
  host: requiredString("MC_HOST", "127.0.0.1"),
  port: portFromEnv("MC_PORT", 25565),
  version: requiredString("MC_VERSION", "1.20.4"),
  username: requiredString("MC_BOT_NAME", "LunaCompanion"),
  auth: requiredString("MC_AUTH", "offline") as "offline" | "microsoft",
  runtimeDir: requiredString("RUNTIME_DIR", "./runtime")
};
