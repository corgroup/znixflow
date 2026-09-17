import { Redis } from "ioredis";
import { loadConfig } from "../../../../packages/config/src/index.js";
import { createDatabase } from "../../../../packages/persistence-mysql/src/index.js";
import { createServer } from "../http/server.js";
const config = loadConfig(process.env);
const db = createDatabase(config);
const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 1,
  connectTimeout: 3000,
  commandTimeout: 3000,
});
redis.on("error", () => {});
const app = await createServer(async () => {
  await Promise.all([db.query("SELECT 1"), redis.ping()]);
});
app.addHook("onClose", async () => {
  redis.disconnect();
  await db.end();
});
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.once(signal, () => {
    void app.close();
  });
await app.listen({ port: config.PORT, host: config.HOST });
