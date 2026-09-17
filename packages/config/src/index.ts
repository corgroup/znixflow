import { z } from "zod";
const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_ENV: z.enum(["local", "development", "staging", "production"]),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().default("127.0.0.1"),
  MYSQL_HOST: z.string().min(1),
  MYSQL_PORT: z.coerce.number().int().positive().default(3306),
  MYSQL_DATABASE: z.string().min(1),
  MYSQL_USER: z.string().min(1),
  MYSQL_PASSWORD: z.string().min(12),
  MYSQL_SSL_MODE: z.enum(["disabled", "required"]).default("disabled"),
  REDIS_URL: z.url().refine((v) => /^rediss?:/.test(v)),
  QUEUE_PREFIX: z.string().regex(/^[a-z0-9-]+$/),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});
export type Config = z.infer<typeof schema>;
export function loadConfig(env: Record<string, string | undefined>): Config {
  const result = schema.safeParse(env);
  if (!result.success)
    throw new Error(
      "Invalid configuration fields: " +
        result.error.issues.map((i) => i.path.join(".")).join(", "),
    );
  if (["staging", "production"].includes(result.data.APP_ENV))
    throw new Error(
      "Deployment blocked: Phase 1 security and provider readiness review is pending",
    );
  return result.data;
}
