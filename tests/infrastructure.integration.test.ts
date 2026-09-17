import { test, expect } from "vitest";
import { loadEnvFile } from "node:process";
import { Redis } from "ioredis";
import { Queue } from "bullmq";
import { randomUUID } from "node:crypto";
import { loadConfig } from "../packages/config/src/index.js";
import { createDatabase } from "../packages/persistence-mysql/src/index.js";
try {
  loadEnvFile(".env");
} catch {
  /* CI provides variables. */
}
test("MySQL rejects a cross-organization brand reference", async () => {
  const db = createDatabase(loadConfig(process.env));
  const connection = await db.getConnection();
  const organization = randomUUID();
  const brand = randomUUID();
  try {
    await connection.beginTransaction();
    await connection.execute(
      "INSERT INTO organizations (id,name) VALUES (?,?)",
      [organization, "Integration test"],
    );
    await connection.execute(
      "INSERT INTO brands (organization_id,id,name) VALUES (?,?,?)",
      [organization, brand, "Test"],
    );
    await expect(
      connection.execute(
        "INSERT INTO environments (organization_id,brand_id,id,name) VALUES (?,?,?,?)",
        [randomUUID(), brand, randomUUID(), "local"],
      ),
    ).rejects.toThrow();
  } finally {
    await connection.rollback();
    connection.release();
    await db.end();
  }
});
test("BullMQ deduplicates opaque job identifiers", async () => {
  const config = loadConfig(process.env);
  const connection = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
  const queue = new Queue(`test-${randomUUID()}`, {
    connection,
    prefix: config.QUEUE_PREFIX,
  });
  try {
    const id = randomUUID();
    await queue.add("reference", { recordId: id }, { jobId: id });
    await queue.add("reference", { recordId: id }, { jobId: id });
    expect(await queue.getWaitingCount()).toBe(1);
  } finally {
    await queue.obliterate({ force: true });
    await queue.close();
    connection.disconnect();
  }
});
