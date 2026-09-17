# Znixflow Platform

Local foundation scaffold. Phase 1 is not complete; no provider sends or CORCOTTON changes are implemented.

## Start

Use Node 24.21.0 (.nvmrc) and pnpm 11.19.0. Host verification used Node 24.19.0.

1. `pnpm install --frozen-lockfile`
2. Copy `.env.example` to `.env`; set unique local MYSQL_PASSWORD (12+ characters) and MYSQL_ROOT_PASSWORD.
3. Install/start Docker Desktop and run `docker compose up -d --wait`.
4. `pnpm db:migrate`
5. `pnpm dev`

Console: http://localhost:5173. API: http://localhost:3000/health/live and /health/ready.

Checks: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:security`, `pnpm test:integration`, `pnpm build`.
Integration tests require migrated MySQL and Redis. They fail if dependencies are absent.

## Scope

Available: Fastify health API, correlation IDs and safe errors, rate/payload limits, React console scaffold, strict TypeScript, pnpm lockfile, MySQL tenancy migration, Redis connection shell, provider-neutral contracts, tests and CI.

Pending: authentication/RBAC, tenant-scoped repositories, KMS, full models, durable audit/idempotency/outbox, consumers/recovery, Meta/webhooks, operational Console, campaigns, automation, deployment and CORCOTTON integration. Business routes return 404; no consumers or dispatchers run. Staging/production startup is blocked pending security review.

Fastify is the local setup choice. Hosting/region, managed services, admin identity, retention and billing decisions remain open. Infyntra stays unchanged.

Local observability substitute: structured Fastify health/request logs with request IDs. Request serializers omit URLs, headers and bodies. OpenTelemetry/metrics/alerts remain pending.

The supplied setup note is preserved in docs/setup-reference.md as reference, not evidence of approval. See docs/setup-status.md for verification and external blockers.

## Branch workflow

See [development and release flow](docs/development-flow.md).
