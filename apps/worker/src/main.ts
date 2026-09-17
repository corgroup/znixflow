import { Redis } from "ioredis";
import { loadConfig } from "../../../packages/config/src/index.js";
const config = loadConfig(process.env);
const redis = new Redis(config.REDIS_URL, { maxRetriesPerRequest: 1 });
redis.on("error", () => {});
await redis.ping();
console.info(
  "Worker infrastructure connected. Provider dispatch is disabled; no consumers registered.",
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.once(signal, () => redis.disconnect());
