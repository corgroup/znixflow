import { expect, test } from "vitest";
import { loadConfig } from "../packages/config/src/index.js";
import { createServer } from "../apps/api/src/http/server.js";
test("configuration errors never echo secret values", () => {
  expect(() => loadConfig({ MYSQL_PASSWORD: "secret" })).toThrow(
    "Invalid configuration fields",
  );
  try {
    loadConfig({ MYSQL_PASSWORD: "secret" });
  } catch (error) {
    expect(String(error)).not.toContain("secret");
  }
});
test("business mutations are not exposed before authentication is implemented", async () => {
  const app = await createServer(async () => {});
  try {
    const result = await app.inject({
      method: "POST",
      url: "/v1/messages",
      payload: { organizationId: "attacker" },
    });
    expect(result.statusCode).toBe(404);
    expect(result.json().error.correlationId).toBeTruthy();
    expect(result.headers["x-content-type-options"]).toBe("nosniff");
  } finally {
    await app.close();
  }
});
