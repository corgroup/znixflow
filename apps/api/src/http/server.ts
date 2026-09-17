import Fastify from "fastify";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { randomUUID } from "node:crypto";
export async function createServer(checkReady: () => Promise<void>) {
  const app = Fastify({
    genReqId: () => randomUUID(),
    bodyLimit: 65536,
    requestTimeout: 10000,
    logger: {
      level: "info",
      redact: ["req.headers.authorization", "req.headers.cookie"],
      serializers: {
        req: (req) => ({ method: req.method }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    },
  });
  await app.register(helmet);
  await app.register(rateLimit, { max: 120, timeWindow: "1 minute" });
  app.addHook("onRequest", async (request, reply) => {
    reply.header("x-correlation-id", request.id);
  });
  app.setErrorHandler((error, request, reply) => {
    const status =
      typeof error === "object" && error !== null && "statusCode" in error
        ? Number(error.statusCode)
        : 500;
    reply.code(status >= 400 && status <= 599 ? status : 500).send({
      error: {
        code: "REQUEST_FAILED",
        message: "Request could not be processed.",
        retryable: status >= 500,
        correlationId: request.id,
      },
    });
  });
  app.setNotFoundHandler((request, reply) =>
    reply.code(404).send({
      error: {
        code: "NOT_FOUND",
        message: "Endpoint is not available in this foundation release.",
        retryable: false,
        correlationId: request.id,
      },
    }),
  );
  app.get("/health/live", async (request) => ({
    status: "ok",
    correlationId: request.id,
  }));
  app.get("/health/ready", async (request, reply) => {
    try {
      await checkReady();
      return { status: "ready", correlationId: request.id };
    } catch {
      return reply
        .code(503)
        .send({ status: "unavailable", correlationId: request.id });
    }
  });
  return app;
}
