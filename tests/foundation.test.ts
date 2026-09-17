import { expect, test } from "vitest";
import { createServer } from "../apps/api/src/http/server.js";
import { eligible } from "../packages/domain/src/index.js";
test("health readiness reports dependency failures without leaking details", async () => {
  const app = await createServer(async () => {
    throw new Error("private connection details");
  });
  try {
    const live = await app.inject("/health/live");
    expect(live.statusCode).toBe(200);
    const ready = await app.inject("/health/ready");
    expect(ready.statusCode).toBe(503);
    expect(ready.body).not.toContain("private");
    expect(ready.json().correlationId).toBe(ready.headers["x-correlation-id"]);
  } finally {
    await app.close();
  }
});
test("marketing opt-out does not itself block transactional messages", () => {
  const input = {
    marketingConsent: true,
    marketingOptOut: true,
    suppressed: false,
    frequencyExceeded: false,
  };
  expect(eligible({ ...input, purpose: "marketing" })).toBe(false);
  expect(eligible({ ...input, purpose: "transactional" })).toBe(true);
  expect(
    eligible({ ...input, purpose: "transactional", suppressed: true }),
  ).toBe(false);
});
