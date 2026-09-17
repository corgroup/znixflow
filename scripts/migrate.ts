import { readFile, readdir } from "node:fs/promises";
import { loadEnvFile } from "node:process";
import { loadConfig } from "../packages/config/src/index.js";
import { createDatabase } from "../packages/persistence-mysql/src/index.js";
try {
  loadEnvFile(".env");
} catch {
  /* CI injects configuration. */
}
const action = process.argv[2];
if (!["up", "down", "status"].includes(action ?? ""))
  throw new Error("Expected up, down or status");
const db = createDatabase(loadConfig(process.env));
const connection = await db.getConnection();
try {
  const [rows] = await connection.query(
    "SELECT GET_LOCK('znixflow_migrations', 10) AS acquired",
  );
  if ((rows as { acquired: number }[])[0]?.acquired !== 1)
    throw new Error("Migration lock unavailable");
  await connection.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(100) PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
  );
  const [applied] = await connection.query(
    "SELECT version FROM schema_migrations ORDER BY version",
  );
  const versions = (applied as { version: string }[]).map((row) => row.version);
  if (action === "status") console.info(versions);
  else if (action === "down")
    throw new Error(
      "Foundation migration is forward-only: restore a verified backup in an isolated environment. See docs/runbooks/migrations.md.",
    );
  else {
    for (const file of (await readdir("database/migrations"))
      .filter((f) => f.endsWith(".sql"))
      .sort()) {
      if (versions.includes(file)) continue;
      const sql = await readFile(`database/migrations/${file}`, "utf8");
      for (const statement of sql
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean))
        await connection.query(statement);
      await connection.execute(
        "INSERT INTO schema_migrations (version) VALUES (?)",
        [file],
      );
      console.info(`Applied ${file}`);
    }
  }
} finally {
  await connection.query("SELECT RELEASE_LOCK('znixflow_migrations')");
  connection.release();
  await db.end();
}
